#!/usr/bin/env python3
"""Terminal-only integration test using disposable Postgres, no cloud credentials."""
import json
from pathlib import Path
import secrets
import socket
import subprocess
import tempfile
import time

from controller import Controller, api, write_json

HERE = Path(__file__).resolve().parent


def run(*args, data=None):
    result = subprocess.run(args, input=data, capture_output=True)
    if result.returncode:
        raise RuntimeError('Smoke test command failed: ' + ' '.join(args[:3]) + '\n' + result.stderr.decode())
    return result.stdout.decode()


def main():
    suffix = secrets.token_hex(5)
    edge = 'uwflow-preview-smoke-' + suffix
    config = json.loads((HERE / 'config.example.json').read_text())
    with tempfile.TemporaryDirectory(prefix='uwflow-preview-smoke-') as temp:
        controller = Controller(config, Path(temp))
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0))
            port = sock.getsockname()[1]
        record = {'key': 'smoke-' + suffix, 'port': port}
        request = {'api_image': 'uwflow-preview-api-validation', 'hasura_image': 'uwflow-preview-hasura-validation'}
        password = secrets.token_hex(20)
        uri = f'postgres://preview:{password}@postgres:5432/preview?sslmode=disable'
        controller.config_stack(record, request, uri)
        compose_path = Path(temp) / record['key'] / 'compose.json'
        stack = json.loads(compose_path.read_text())
        stack['networks']['edge']['name'] = edge
        stack['services']['postgres'] = {
            'image': 'postgres:15-alpine', 'environment': {'POSTGRES_USER': 'preview', 'POSTGRES_PASSWORD': password, 'POSTGRES_DB': 'preview'},
            'tmpfs': ['/var/lib/postgresql/data'], 'mem_limit': '256m', 'cpus': 0.5}
        write_json(compose_path, stack)
        project = 'uwflow-preview-' + record['key']
        command = ['docker', 'compose', '-p', project, '-f', str(compose_path)]
        run('docker', 'network', 'create', edge)
        try:
            run(*command, 'up', '-d', 'postgres')
            for _ in range(60):
                try:
                    run(*command, 'exec', '-T', 'postgres', 'pg_isready', '-U', 'preview')
                    break
                except RuntimeError:
                    time.sleep(1)
            else:
                raise RuntimeError('Postgres startup timed out')
            run(*command, 'up', '-d')
            base = f'http://127.0.0.1:{port}'
            for _ in range(120):
                try:
                    data = api(base + '/graphql', method='POST', body={'query': '{course{code}}'})
                    if 'data' in data:
                        break
                except RuntimeError:
                    pass
                time.sleep(2)
            else:
                raise RuntimeError('Hasura migrations/startup failed')
            run(*command, 'exec', '-T', 'postgres', 'psql', '-U', 'preview', '-d', 'preview', data=(HERE / 'seed.sql').read_bytes())
            controller.ready(record)
            body = {'first_name': 'Preview', 'last_name': 'Smoke', 'email': f'preview-{suffix}@example.test', 'password': password}
            registered = api(base + '/api/auth/email/register', method='POST', body=body)
            login = api(base + '/api/auth/email/login', method='POST', body=body)
            assert registered['user_id'] == login['user_id'] and login['token']
            def gql(query, variables=None, admin=False):
                headers = {'x-hasura-admin-secret': stack['services']['hasura']['environment']['HASURA_GRAPHQL_ADMIN_SECRET']} if admin else {}
                result = api(base + '/graphql', token='' if admin else login['token'], method='POST',
                             body={'query': query, 'variables': variables or {}}, headers=headers)
                if result.get('errors'):
                    raise RuntimeError('GraphQL smoke check failed: ' + json.dumps(result['errors']))
                return result['data']
            course = gql('{course(where:{code:{_eq:"cs135"}}){id}}')['course'][0]['id']
            gql('mutation($u:Int!,$c:Int!){insert_user_course_taken_one(object:{user_id:$u,course_id:$c,term_id:1261}){user_id}}',
                {'u': login['user_id'], 'c': course}, admin=True)
            review = gql('mutation($u:Int!,$c:Int!){insert_review_one(object:{user_id:$u,course_id:$c,liked:1,course_comment:"Preview smoke review",public:true}){id}}',
                         {'u': login['user_id'], 'c': course})['insert_review_one']['id']
            edited = gql('mutation($id:Int!){update_review_by_pk(pk_columns:{id:$id},_set:{course_comment:"Edited preview review"}){course_comment}}', {'id': review})
            assert edited['update_review_by_pk']['course_comment'] == 'Edited preview review'
            # Account deletion intentionally anonymizes reviews; remove our own review first.
            gql('mutation($id:Int!){delete_review_by_pk(id:$id){id}}', {'id': review})
            api(base + '/api/user', token=login['token'], method='DELETE')
            assert not gql('query($id:Int!){user(where:{id:{_eq:$id}}){id}}', {'id': login['user_id']}, admin=True)['user']
            assert not gql('query($id:Int!){review(where:{id:{_eq:$id}}){id}}', {'id': review}, admin=True)['review']
            print('PASS: migrations, synthetic seed, API/Hasura routing, signup, login, review creation/editing, account cleanup')
        except Exception:
            # CI stack has synthetic credentials only; retain terminal diagnostics on failure.
            print(run(*command, 'logs', '--tail', '8')[-10000:])
            raise
        finally:
            run(*command, 'down', '--volumes', '--remove-orphans')
            run('docker', 'network', 'rm', edge)
            print('Disposable smoke stack removed')


if __name__ == '__main__':
    main()
