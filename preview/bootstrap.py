#!/usr/bin/env python3
"""Initialize a separately created Neon baseline; run locally, never in PR jobs."""
import getpass
import json
from pathlib import Path
import secrets
import socket
import subprocess
import tempfile
import time
import urllib.parse

from controller import api, write_json

HERE = Path(__file__).resolve().parent


def main():
    uri = getpass.getpass('Direct Neon URI for the NEW flow_preview database: ')
    parsed = urllib.parse.urlsplit(uri)
    if parsed.scheme not in ('postgres', 'postgresql') or not (parsed.hostname or '').endswith('.neon.tech') or parsed.path != '/flow_preview':
        raise ValueError('Use a direct Neon connection to the separate flow_preview database')
    if '-pooler' in parsed.hostname:
        raise ValueError('Use the direct/unpooled connection')
    params = dict(urllib.parse.parse_qsl(parsed.query))
    params.update(sslmode='verify-full', sslrootcert='/etc/ssl/certs/ca-certificates.crt')
    uri = urllib.parse.urlunsplit(parsed._replace(query=urllib.parse.urlencode(params)))
    subprocess.run(['docker', 'build', '-f', str(HERE / 'Hasura.Dockerfile'), '-t', 'uwflow-preview-baseline', str(HERE.parent)], check=True)
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
    secret = secrets.token_hex(32)
    with tempfile.TemporaryDirectory(prefix='uwflow-preview-baseline-') as directory:
        config = Path(directory) / 'compose.json'
        write_json(config, {'services': {'hasura': {
            'image': 'uwflow-preview-baseline', 'ports': [f'127.0.0.1:{port}:8080'],
            'mem_limit': '768m', 'cpus': 0.5,
            'environment': {'HASURA_GRAPHQL_DATABASE_URL': uri.replace('$', '$$'), 'HASURA_GRAPHQL_ADMIN_SECRET': secret,
                            'HASURA_GRAPHQL_ENABLE_CONSOLE': 'false', 'HASURA_GRAPHQL_ENABLE_TELEMETRY': 'false'}}}})
        command = ['docker', 'compose', '-p', 'uwflow-baseline-' + secrets.token_hex(4), '-f', str(config)]
        headers = {'x-hasura-admin-secret': secret}
        base = f'http://127.0.0.1:{port}'
        try:
            subprocess.run(command + ['up', '-d'], check=True, capture_output=True)
            for _ in range(120):
                try:
                    result = api(base + '/v1/graphql', method='POST', headers=headers, body={'query': '{course{code}}'})
                    if 'data' in result:
                        break
                except RuntimeError:
                    pass
                time.sleep(2)
            else:
                raise RuntimeError('Baseline migration failed; inspect local Docker logs before retrying')
            sql = '\n'.join(line for line in (HERE / 'seed.sql').read_text().splitlines() if not line.startswith('\\'))
            api(base + '/v2/query', method='POST', headers=headers,
                body={'type': 'run_sql', 'args': {'source': 'default', 'sql': sql}})
            result = api(base + '/v1/graphql', method='POST', headers=headers, body={'query': '{course(where:{code:{_eq:"cs135"}}){code}}'})
            if not result.get('data', {}).get('course'):
                raise RuntimeError('Baseline seed validation failed')
            print('Baseline migrations and synthetic seed applied. Record this backend SHA with the baseline.')
        finally:
            subprocess.run(command + ['down', '--volumes', '--remove-orphans'], check=True, capture_output=True)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # Connection strings are deliberately absent from diagnostics.
        raise SystemExit('Baseline setup failed: ' + (str(error) if isinstance(error, (ValueError, RuntimeError)) else type(error).__name__))
