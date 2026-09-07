#!/usr/bin/env python3
"""Root-owned preview control plane. No PR code is executed on the host."""
import concurrent.futures
import fcntl
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import secrets
import shutil
import signal
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile

ROOT = Path('/var/lib/uwflow-preview')
CONFIG = Path('/etc/uwflow-preview/config.json')
SHA = re.compile(r'[0-9a-f]{40}')


def api(url, token='', method='GET', body=None, headers=None):
    hdr = {'User-Agent': 'uwflow-preview', **(headers or {})}
    if token:
        hdr['Authorization'] = 'Bearer ' + token
    if body is not None and not isinstance(body, bytes):
        body = json.dumps(body).encode()
        hdr['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=body, headers=hdr, method=method)
    try:
        with urllib.request.urlopen(req, timeout=45) as response:
            data = response.read()
            return json.loads(data) if data else {}
    except urllib.error.HTTPError as error:
        if method == 'DELETE' and error.code == 404:
            return {}
        # Provider bodies, URLs and subprocess output may contain credentials.
        raise RuntimeError(f'Provider request failed: HTTP {error.code}') from None
    except (urllib.error.URLError, TimeoutError):
        raise RuntimeError('Provider request failed; retry reconciliation') from None


def write_json(path, value):
    temp = path.with_suffix('.tmp')
    with temp.open('w') as output:
        os.fchmod(output.fileno(), 0o600)
        output.write(json.dumps(value, indent=2) + '\n')
        output.flush()
        os.fsync(output.fileno())
    os.replace(temp, path)
    directory = os.open(path.parent, os.O_RDONLY)
    try:
        os.fsync(directory)
    finally:
        os.close(directory)


def validate(request, config):
    action = request.get('action')
    if action not in ('deploy', 'destroy', 'status', 'reconcile'):
        raise ValueError('Unknown action')
    if action in ('deploy', 'destroy'):
        pr = request.get('pr')
        if type(pr) is not int or not 1 <= pr <= 9999999:
            raise ValueError('PR must be a positive integer')
    if action == 'deploy':
        for key in ('frontend_sha', 'backend_sha'):
            if not SHA.fullmatch(request.get(key, '')):
                raise ValueError('Full commit SHAs are required')
        for service in ('api', 'hasura'):
            pattern = re.escape(config['image_prefix'] + '-' + service) + r'@sha256:[0-9a-f]{64}'
            if not re.fullmatch(pattern, request.get(service + '_image', '')):
                raise ValueError('Only configured immutable preview images are allowed')
        ttl = request.get('ttl_hours')
        if type(ttl) is not int or not 1 <= ttl <= config['max_ttl_hours']:
            raise ValueError('TTL exceeds host policy')
    return request


class Controller:
    def __init__(self, config, root=ROOT):
        self.c, self.root = config, root
        if not re.fullmatch(r'[a-z0-9.-]+', config['domain']):
            raise ValueError('Invalid preview domain')
        if not 1 <= config['max_previews'] <= 10:
            raise ValueError('Capacity must be 1–10')
        self.state_path = root / 'state.json'
        self.state = json.loads(self.state_path.read_text()) if self.state_path.exists() else {}

    def save(self):
        write_json(self.state_path, self.state)

    def neon(self, path, method='GET', body=None):
        base = 'https://console.neon.tech/api/v2/projects/' + self.c['neon_project']
        return api(base + path, self.c['neon_token'], method, body)

    def vercel(self, path, method='GET', body=None, headers=None):
        sep = '&' if '?' in path else '?'
        url = 'https://api.vercel.com' + path + sep + urllib.parse.urlencode({'teamId': self.c['vercel_team']})
        return api(url, self.c['vercel_token'], method, body, headers)

    def github_pr(self, pr):
        return api(f"https://api.github.com/repos/{self.c['frontend_repo']}/pulls/{pr}", self.c['github_token'])

    def wait_neon(self, result):
        for operation in result.get('operations', []):
            for _ in range(90):
                status = self.neon('/operations/' + operation['id'])['operation']['status']
                if status in ('finished', 'skipped'):
                    break
                if status in ('failed', 'cancelled'):
                    raise RuntimeError('Neon operation failed')
                time.sleep(2)
            else:
                raise RuntimeError('Neon operation timed out')

    def branches(self):
        result, cursor = [], None
        while True:
            query = urllib.parse.urlencode({'limit': 100, **({'cursor': cursor} if cursor else {})})
            page = self.neon('/branches?' + query)
            result.extend(page['branches'])
            cursor = page.get('pagination', {}).get('next')
            if not cursor:
                return result

    def run(self, *args, timeout=180):
        result = subprocess.run(args, capture_output=True, timeout=timeout)
        if result.returncode:
            raise RuntimeError(f'{args[0]} failed (output withheld; inspect locally as root)')
        return result.stdout.decode().strip()

    def compose(self, record, *args):
        return self.run('docker', 'compose', '-p', 'uwflow-preview-' + record['key'],
                        '-f', str(self.root / record['key'] / 'compose.json'), *args)

    def check_host_capacity(self):
        available = next(int(line.split()[1]) * 1024 for line in Path('/proc/meminfo').read_text().splitlines()
                         if line.startswith('MemAvailable:'))
        if available < self.c['min_available_memory_mb'] * 1024 * 1024:
            raise RuntimeError('Insufficient spare memory; resize EC2 or free a preview first')
        docker_root = self.run('docker', 'info', '--format', '{{.DockerRootDir}}')
        if shutil.disk_usage(docker_root).free < self.c['min_free_disk_mb'] * 1024 * 1024:
            raise RuntimeError('Insufficient Docker disk space')

    def reserve(self, req):
        key = 'pr-' + str(req['pr'])
        existing = self.state.get(key)
        if existing and existing['phase'] != 'ready':
            raise RuntimeError('Previous attempt needs cleanup before redeploying')
        if not existing and len(self.state) >= self.c['max_previews']:
            raise RuntimeError('Preview capacity full: ' + ', '.join(self.state))
        used = {r['port'] for r in self.state.values()}
        port = existing['port'] if existing else next(
            p for p in range(self.c['port_start'], self.c['port_start'] + self.c['max_previews']) if p not in used)
        record = existing or {'key': key, 'pr': req['pr'], 'port': port,
                              'branch_name': 'uwflow-' + key + '-' + secrets.token_hex(8),
                              'deployments': [], 'images': []}
        record.update({k: req[k] for k in ('frontend_sha', 'backend_sha')})
        record.update(phase='provisioning', expires_at=int(time.time()) + 1800)
        record['images'] = list(set(record['images'] + [req['api_image'], req['hasura_image']]))
        self.state[key] = record
        self.save()  # Journal capacity + unique branch name BEFORE any external mutation.
        return record

    def setup_neon(self, record):
        if not record.get('branch_id'):
            found = [b for b in self.branches() if b['name'] == record['branch_name']]
            if found:
                branch = found[0]
            else:
                created = self.neon('/branches', 'POST', {
                    'branch': {'name': record['branch_name'], 'parent_id': self.c['neon_parent']},
                    'endpoints': [{'type': 'read_write', 'autoscaling_limit_min_cu': 0.25,
                                   'autoscaling_limit_max_cu': 0.25, 'suspend_timeout_seconds': 300}]})
                branch = created['branch']
                record['branch_id'] = branch['id']
                self.save()
                self.wait_neon(created)
            if branch['id'] == self.c['neon_parent'] or branch['parent_id'] != self.c['neon_parent']:
                raise RuntimeError('Refusing non-preview Neon branch')
            record['branch_id'] = branch['id']
            self.save()
            # Child roles initially inherit parent passwords. Never give these to PR code.
            role = urllib.parse.quote(self.c['neon_role'], safe='')
            self.wait_neon(self.neon(f"/branches/{branch['id']}/roles/{role}/reset_password", 'POST', {}))
        query = urllib.parse.urlencode({'branch_id': record['branch_id'], 'database_name': self.c['neon_database'],
                                       'role_name': self.c['neon_role'], 'pooled': 'false'})
        uri = self.neon('/connection_uri?' + query)['uri']
        parsed = urllib.parse.urlsplit(uri)
        if parsed.scheme not in ('postgres', 'postgresql') or not parsed.hostname.endswith('.neon.tech'):
            raise RuntimeError('Expected a Neon Postgres connection')
        params = dict(urllib.parse.parse_qsl(parsed.query))
        params['sslmode'] = 'verify-full'
        params['sslrootcert'] = '/etc/ssl/certs/ca-certificates.crt'
        # pgx uses TLS verification; channel_binding is a libpq-only URL parameter.
        params.pop('channel_binding', None)
        return urllib.parse.urlunsplit(parsed._replace(query=urllib.parse.urlencode(params)))

    def config_stack(self, record, req, uri):
        directory = self.root / record['key']
        directory.mkdir(mode=0o700, exist_ok=True)
        jwt_path = directory / 'jwt'
        if not jwt_path.exists():
            jwt_path.write_text(secrets.token_hex(32))
            jwt_path.chmod(0o600)
        jwt = jwt_path.read_text()
        common = {'restart': 'unless-stopped', 'cpus': 0.5, 'pids_limit': 128,
                  'cap_drop': ['ALL'], 'security_opt': ['no-new-privileges:true'],
                  'logging': {'driver': 'json-file', 'options': {'max-size': '5m', 'max-file': '2'}}}
        admin = secrets.token_hex(32)
        gateway = '''worker_processes 1;
pid /var/run/nginx.pid;
events { worker_connections 256; }
http {
include /etc/nginx/mime.types;
server {
  listen 8080;
  client_max_body_size 10m;
  location = /healthz { proxy_pass http://hasura:8080/healthz; }
  location = /graphql { proxy_pass http://hasura:8080/v1/graphql; }
  location /api/ { proxy_pass http://api:8081/; }
  location / { return 404; }
}
}
'''
        (directory / 'gateway.conf').write_text(gateway)
        # The nginx worker is unprivileged; the config contains no secrets.
        (directory / 'gateway.conf').chmod(0o644)
        config = {'services': {
            'api': {**common, 'image': req['api_image'], 'mem_limit': '256m', 'read_only': True,
                    'user': '65534:65534', 'tmpfs': ['/tmp:size=32m'], 'environment': {
                        'DATABASE_URL': uri + '&pool_max_conns=5', 'API_PORT': '8081',
                        'HASURA_GRAPHQL_JWT_KEY': jwt, 'RUN_MODE': 'preview', 'UW_API_KEY_V3': '',
                        **{k: '' for k in ('POSTGRES_DB', 'POSTGRES_HOST', 'POSTGRES_PORT', 'POSTGRES_USER', 'POSTGRES_PASSWORD')}}},
            'hasura': {**common, 'image': req['hasura_image'], 'mem_limit': '768m',
                       'environment': {'HASURA_GRAPHQL_DATABASE_URL': uri,
                           'HASURA_GRAPHQL_ADMIN_SECRET': admin,
                           'HASURA_GRAPHQL_JWT_SECRET': json.dumps({'type': 'HS256', 'key': jwt}),
                           'HASURA_GRAPHQL_UNAUTHORIZED_ROLE': 'anonymous',
                           'HASURA_GRAPHQL_ENABLE_CONSOLE': 'false', 'HASURA_GRAPHQL_ENABLE_TELEMETRY': 'false',
                           'HASURA_GRAPHQL_CORS_DOMAIN': 'https://invalid.invalid',
                           'HASURA_GRAPHQL_PG_CONNECTIONS': '10', 'HASURA_GRAPHQL_LOG_LEVEL': 'warn'}},
            'gateway': {**common, 'image': 'nginx:1.28-alpine', 'mem_limit': '64m',
                        'user': '101:101', 'read_only': True,
                        'tmpfs': ['/var/cache/nginx:size=16m,uid=101,gid=101', '/var/run:size=1m,uid=101,gid=101', '/tmp:size=1m'],
                        'volumes': [str(directory / 'gateway.conf') + ':/etc/nginx/nginx.conf:ro'],
                        'ports': [f"127.0.0.1:{record['port']}:8080"],
                        'networks': {'default': {}, 'edge': {'aliases': ['preview-' + record['key']]}},
                        'depends_on': ['api', 'hasura']}},
            'networks': {'edge': {'external': True, 'name': 'uwflow-preview-edge'}}}
        # Compose interpolates dollars even inside JSON strings. Preserve literal credentials.
        for service in config['services'].values():
            if 'environment' in service:
                service['environment'] = {key: value.replace('$', '$$')
                                          for key, value in service['environment'].items()}
        write_json(directory / 'compose.json', config)

    def ready(self, record):
        base = f"http://127.0.0.1:{record['port']}"
        for _ in range(90):
            try:
                result = api(base + '/graphql', method='POST', body={'query': '{course(where:{code:{_eq:"cs135"}}){code}}'})
                if result.get('data', {}).get('course'):
                    # Empty search still exercises Go -> Neon SQL connectivity.
                    api(base + '/api/data/search')
                    return
            except RuntimeError:
                pass
            time.sleep(2)
        raise RuntimeError('API/Hasura readiness failed; verify baseline schema and seed')

    def frontend_files(self, record):
        # Read public source without executing it, extracting it, or following symlinks.
        url = f"https://codeload.github.com/{self.c['frontend_repo']}/zip/{record['frontend_sha']}"
        with urllib.request.urlopen(url, timeout=45) as response:
            archive = response.read(50 * 1024 * 1024 + 1)
        if len(archive) > 50 * 1024 * 1024:
            raise RuntimeError('Frontend archive too large')
        files, total = {}, 0
        with zipfile.ZipFile(io.BytesIO(archive)) as zipped:
            for item in zipped.infolist():
                path = PurePosixPath(item.filename)
                relative = PurePosixPath(*path.parts[1:])
                if item.is_dir():
                    continue
                if path.is_absolute() or '..' in path.parts or (item.external_attr >> 16) & 0o170000 == 0o120000:
                    raise ValueError('Unsafe archive member')
                if relative.parts[0] in ('.git', '.github', '.agents', '.circleci', '.vercel', 'e2e', 'node_modules') or relative.name.startswith('.env'):
                    continue
                total += item.file_size
                if total > 50 * 1024 * 1024 or len(files) >= 10000:
                    raise ValueError('Expanded source exceeds limit')
                files[str(relative)] = zipped.read(item)
        base = f"https://{record['key']}.{self.c['domain']}"
        # Replace production rewrites in the uploaded copy only. Same-origin auth/GraphQL.
        files['vercel.json'] = json.dumps({
            'buildCommand': 'REACT_APP_BACKEND_ENDPOINT=/api REACT_APP_GRAPHQL_ENDPOINT=/graphql bun run build:vercel',
            'installCommand': 'bun install --frozen-lockfile', 'outputDirectory': 'build',
            'rewrites': [{'source': '/graphql', 'destination': base + '/graphql'},
                         {'source': '/api/:path*', 'destination': base + '/api/:path*'},
                         {'source': '/(.*)', 'destination': '/index.html'}]}).encode()
        return files

    def deploy_frontend(self, record):
        files = self.frontend_files(record)
        def upload(item):
            name, data = item
            digest = hashlib.sha1(data).hexdigest()
            self.vercel('/v2/files', 'POST', data, {'Content-Type': 'application/octet-stream',
                                                  'x-vercel-digest': digest, 'Content-Length': str(len(data))})
            return {'file': name, 'sha': digest, 'size': len(data)}
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            uploaded = list(executor.map(upload, files.items()))
        deployment = self.vercel('/v13/deployments', 'POST', {
            'name': 'uwflow-preview', 'project': self.c['vercel_project'], 'files': uploaded,
            'meta': {'uwflowPreview': record['branch_name'], 'frontendSha': record['frontend_sha'],
                     'backendSha': record['backend_sha']}})
        record['deployments'].append(deployment['id'])
        self.save()
        for _ in range(180):
            result = self.vercel('/v13/deployments/' + deployment['id'])
            if result['readyState'] == 'READY':
                record['url'] = 'https://' + result['url']
                # Retire the previous frontend only after replacement is ready.
                for old in record['deployments'][:-1]:
                    self.vercel('/v13/deployments/' + old, 'DELETE')
                record['deployments'] = [deployment['id']]
                return
            if result['readyState'] in ('ERROR', 'CANCELED'):
                raise RuntimeError('Vercel build failed; inspect deployment in Vercel')
            time.sleep(5)
        raise RuntimeError('Vercel build timed out')

    def deploy(self, req):
        pr = self.github_pr(req['pr'])
        if pr['state'] != 'open' or pr['head']['sha'] != req['frontend_sha']:
            raise ValueError('PR closed or changed since approval; request a new deployment')
        if pr['head']['repo']['full_name'] != self.c['frontend_repo']:
            raise ValueError('Fork previews require a maintainer-owned branch')
        self.check_host_capacity()
        record = self.reserve(req)
        try:
            uri = self.setup_neon(record)
            directory = self.root / record['key']
            if (directory / 'compose.json').exists():
                self.compose(record, 'down', '--remove-orphans')
            self.config_stack(record, req, uri)
            self.compose(record, 'pull')
            self.compose(record, 'up', '-d')
            self.ready(record)
            self.deploy_frontend(record)
            if self.github_pr(req['pr'])['state'] != 'open':
                raise RuntimeError('PR closed during deployment')
            current_images = {req['api_image'], req['hasura_image']}
            for old in record['images'][:]:
                if old not in current_images:
                    try:
                        self.run('docker', 'image', 'rm', old)
                        record['images'].remove(old)
                    except RuntimeError:
                        pass
            record.update(phase='ready', expires_at=int(time.time()) + req['ttl_hours'] * 3600)
            self.save()
            return self.status()
        except Exception:
            record['phase'] = 'deleting'
            self.save()
            try:
                self.destroy(record['key'])
            except Exception:
                pass  # Journal remains; timer retries. Never hide the original error.
            raise

    def destroy(self, key):
        record = self.state.get(key)
        if not record:
            return
        record['phase'] = 'deleting'
        self.save()
        directory = self.root / key
        if (directory / 'compose.json').exists():
            self.compose(record, 'down', '--remove-orphans', '--volumes')
        # Stop EC2 compute FIRST, even when either cloud API is unavailable.
        # Recover successful cloud POSTs whose response was lost before journaling.
        for branch in self.branches():
            if branch['name'] == record['branch_name']:
                if branch['id'] == self.c['neon_parent'] or branch['parent_id'] != self.c['neon_parent']:
                    raise RuntimeError('Refusing to delete non-preview branch')
                self.wait_neon(self.neon('/branches/' + branch['id'], 'DELETE'))
        until = None
        while True:
            query = {'projectId': self.c['vercel_project'], 'limit': 100}
            if until:
                query['until'] = until
            page = self.vercel('/v6/deployments?' + urllib.parse.urlencode(query))
            for deployment in page['deployments']:
                if deployment.get('meta', {}).get('uwflowPreview') == record['branch_name']:
                    self.vercel('/v13/deployments/' + deployment['uid'], 'DELETE')
            until = page.get('pagination', {}).get('next')
            if not until:
                break
        for image in record['images']:
            # Never force/remove shared images or run a global Docker prune.
            if not any(image in other['images'] for other_key, other in self.state.items() if other_key != key):
                try:
                    self.run('docker', 'image', 'rm', image)
                except RuntimeError:
                    pass
        if directory.exists():
            shutil.rmtree(directory)
        del self.state[key]
        self.save()

    def reconcile(self):
        errors = []
        for key, record in list(self.state.items()):
            # TTL is independent of GitHub availability, including after host reboot.
            expired = record['expires_at'] <= time.time() or record['phase'] == 'deleting'
            try:
                closed = False if expired else self.github_pr(record['pr'])['state'] == 'closed'
                if expired or closed:
                    self.destroy(key)
            except Exception:
                errors.append(key)
        if errors:
            raise RuntimeError('Reconciliation pending for: ' + ', '.join(errors))
        return self.status()

    def status(self):
        return [{k: record.get(k) for k in ('key', 'phase', 'url', 'frontend_sha', 'backend_sha', 'expires_at')}
                for record in self.state.values()]


def main():
    # Hard bound prevents a hung deploy holding the lock indefinitely. Journal survives SIGALRM.
    signal.alarm(25 * 60)
    os.umask(0o077)
    ROOT.mkdir(mode=0o700, parents=True, exist_ok=True)
    config = json.loads(CONFIG.read_text())
    if sys.argv[1:] == ['request']:
        data = sys.stdin.buffer.read(8193)
        if len(data) > 8192:
            raise ValueError('Request too large')
        request = json.loads(data)
    elif sys.argv[1:] == ['reconcile']:
        request = {'action': 'reconcile'}
    else:
        raise ValueError('Use request (JSON on stdin) or reconcile')
    validate(request, config)
    with (ROOT / 'lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        controller = Controller(config)
        action = request['action']
        if action == 'deploy':
            result = controller.deploy(request)
        elif action == 'destroy':
            controller.destroy('pr-' + str(request['pr']))
            result = controller.status()
        else:
            result = getattr(controller, action)()
        print(json.dumps(result, indent=2))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # Suppress untrusted provider payloads, DB URIs and subprocess output.
        print('Preview operation failed: ' + (str(error) if isinstance(error, (ValueError, RuntimeError))
                                             else type(error).__name__), file=sys.stderr)
        sys.exit(1)
