#!/usr/bin/env python3
"""Smoke-test the frontend image with production Nginx and disposable upstreams."""
import os
import json
import ssl
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGE = os.environ.get('FRONTEND_TEST_IMAGE', 'neuwflow/frontend:latest')

def docker(*args):
    return subprocess.check_output(['docker', *args], text=True).strip()

containers = []
network = None
with tempfile.TemporaryDirectory(prefix='uwflow-monorepo-smoke-') as directory:
    fixture = Path(directory)
    (fixture / 'upstream.conf').write_text('''server {
        listen 8081;
        location = /ping { return 200 'api-ok'; }
        location / { return 404; }
    }
    server {
        listen 8080;
        location = /v1/graphql { default_type application/json; return 200 '{"data":{"__typename":"query_root"}}'; }
        location / { return 404; }
    }
    ''')
    subprocess.run(['openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
                    '-keyout', str(fixture / 'key.pem'), '-out', str(fixture / 'crt.pem'),
                    '-days', '1', '-subj', '/CN=localhost'], check=True, capture_output=True)
    try:
        network = docker('network', 'create', fixture.name)
        upstream = docker('run', '-d', '--network', network, '--network-alias', 'api',
                          '--network-alias', 'hasura', '-v',
                          f'{fixture}/upstream.conf:/etc/nginx/conf.d/default.conf:ro',
                          '--entrypoint', 'nginx', IMAGE, '-g', 'daemon off;')
        containers.append(upstream)
        args = ['run', '-d', '--network', network, '-p', '127.0.0.1::8443',
                '-v', f'{ROOT}/nginx:/nginx:ro', '-v', f'{fixture}:/ssl:ro',
                '--entrypoint', '/nginx/run.sh']
        for pair in ['API_PORT=8081', 'HASURA_PORT=8080', 'DOMAIN=localhost',
                     'NGINX_HTTP_PORT=8080', 'NGINX_HTTPS_PORT=8443', 'FRONTEND_PORT=3000']:
            args.extend(['-e', pair])
        frontend = docker(*args, IMAGE)
        containers.append(frontend)
        port = docker('port', frontend, '8443/tcp').rsplit(':', 1)[1]
        base = f'https://127.0.0.1:{port}'
        context = ssl._create_unverified_context()
        # Disable host proxy configuration; all requests stay on loopback.
        client = urllib.request.build_opener(urllib.request.ProxyHandler({}),
                                             urllib.request.HTTPSHandler(context=context))
        def request(path, data=None):
            return client.open(urllib.request.Request(base + path, data=data,
                                headers={'Content-Type': 'application/json'}), timeout=5)
        for attempt in range(30):
            try:
                index = request('/').read()
                break
            except (OSError, urllib.error.URLError):
                time.sleep(0.5)
        else:
            raise RuntimeError(docker('logs', frontend))
        assert b'<html' in index
        assert request('/course/CS135').read() == index
        manifest = json.loads(request('/asset-manifest.json').read())
        javascript = manifest['files']['main.js']
        response = request(javascript)
        assert 'javascript' in response.headers['Content-Type']
        assert response.read(20) != index[:20]
        try:
            request('/static/js/missing-migration-test.js')
        except urllib.error.HTTPError as error:
            assert error.code == 404
        else:
            raise AssertionError('Missing static asset returned SPA HTML')
        assert request('/api/ping').read() == b'api-ok'
        assert json.loads(request('/graphql', b'{"query":"{__typename}"}').read())['data']['__typename'] == 'query_root'
        print('PASS: HTTPS index, SPA deep link, JS content type, missing asset 404, API prefix rewrite, GraphQL rewrite')
    finally:
        for container in reversed(containers):
            docker('rm', '-f', container)
        if network:
            docker('network', 'rm', network)
