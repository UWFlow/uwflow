import io
import json
from pathlib import Path
import sys
import tempfile
import time
import unittest
from unittest.mock import patch
import zipfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from controller import Controller, validate, write_json

CONFIG = json.loads((Path(__file__).resolve().parents[1] / 'config.example.json').read_text())
REQUEST = {'action': 'deploy', 'pr': 42, 'frontend_sha': 'a' * 40, 'backend_sha': 'b' * 40,
           'api_image': CONFIG['image_prefix'] + '-api@sha256:' + 'c' * 64,
           'hasura_image': CONFIG['image_prefix'] + '-hasura@sha256:' + 'd' * 64, 'ttl_hours': 24}


class Fake(Controller):
    def __init__(self, root):
        super().__init__(CONFIG, root)
        self.calls = []
        self.cloud_branches = []
        self.closed = False
        self.cloud_failure = False

    def github_pr(self, pr):
        if self.cloud_failure:
            raise RuntimeError('GitHub unavailable')
        return {'state': 'closed' if self.closed else 'open',
                'head': {'sha': REQUEST['frontend_sha'], 'repo': {'full_name': CONFIG['frontend_repo']}}}

    def run(self, *args, **kwargs):
        self.calls.append(args)
        return ''

    def branches(self):
        if self.cloud_failure:
            raise RuntimeError('Neon unavailable')
        return self.cloud_branches

    def neon(self, path, method='GET', body=None):
        self.calls.append(('neon', path, method, body))
        return {}

    def vercel(self, path, method='GET', body=None, headers=None):
        self.calls.append(('vercel', path, method, body))
        return {'deployments': [], 'pagination': {}}

    def check_host_capacity(self):
        pass

    def setup_neon(self, record):
        return 'postgres://example'

    def config_stack(self, record, req, uri):
        pass

    def ready(self, record):
        pass

    def deploy_frontend(self, record):
        record['url'] = 'https://preview.vercel.app'


class LifecycleTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.controller = Fake(self.root)
        self.controller.c = {**CONFIG, 'max_previews': 2}

    def tearDown(self):
        self.temp.cleanup()

    def record(self):
        record = self.controller.reserve(REQUEST)
        directory = self.root / record['key']
        directory.mkdir(exist_ok=True)
        write_json(directory / 'compose.json', {})
        return record

    def test_capacity_survives_process_restart_and_counts_pending_cleanup(self):
        record = self.record()
        record['phase'] = 'deleting'
        self.controller.save()
        second = {**REQUEST, 'pr': 43}
        self.controller.reserve(second)
        restarted = Controller(self.controller.c, self.root)
        with self.assertRaisesRegex(RuntimeError, 'capacity full'):
            restarted.reserve({**REQUEST, 'pr': 44})
        self.assertEqual(len(restarted.state), 2)

    def test_updates_reuse_branch_port_and_preserve_database_identity(self):
        record = self.record()
        record.update(phase='ready', branch_id='br-isolated')
        self.controller.save()
        updated = self.controller.reserve(REQUEST)
        self.assertEqual(updated['branch_id'], 'br-isolated')
        self.assertEqual(updated['branch_name'], record['branch_name'])
        self.assertEqual(updated['port'], record['port'])
        self.assertEqual(len(self.controller.state), 1)

    def test_expiry_stops_containers_during_provider_outage_and_retries(self):
        record = self.record()
        record['expires_at'] = 0
        self.controller.cloud_failure = True
        with self.assertRaisesRegex(RuntimeError, 'pending'):
            self.controller.reconcile()
        self.assertIn('down', self.controller.calls[0])
        self.assertIn('pr-42', self.controller.state)
        self.controller.cloud_failure = False
        self.controller.reconcile()
        self.assertEqual(self.controller.state, {})

    def test_closed_pr_is_cleaned_without_waiting_for_ttl(self):
        self.record()
        self.controller.closed = True
        self.controller.reconcile()
        self.assertEqual(self.controller.state, {})

    def test_open_unexpired_preview_is_untouched(self):
        self.record()
        self.controller.reconcile()
        self.assertEqual(self.controller.calls, [])

    def test_recovers_neon_create_with_lost_response_and_never_deletes_baseline(self):
        record = self.record()
        self.controller.cloud_branches = [
            {'name': 'baseline', 'id': CONFIG['neon_parent'], 'parent_id': None},
            {'name': record['branch_name'], 'id': 'br-child', 'parent_id': CONFIG['neon_parent']}]
        self.controller.destroy('pr-42')
        self.assertEqual([c[1] for c in self.controller.calls if c[0] == 'neon'], ['/branches/br-child'])
        self.controller.destroy('pr-42')  # Idempotent after successful cleanup.

    def test_refuses_cleanup_if_branch_ownership_does_not_match(self):
        record = self.record()
        self.controller.cloud_branches = [{'name': record['branch_name'], 'id': CONFIG['neon_parent'], 'parent_id': None}]
        with self.assertRaisesRegex(RuntimeError, 'non-preview'):
            self.controller.destroy('pr-42')
        self.assertFalse(any(c[0] == 'neon' for c in self.controller.calls))

    def test_changed_pr_fails_before_reservation_or_compute(self):
        with self.assertRaisesRegex(ValueError, 'changed'):
            self.controller.deploy({**REQUEST, 'frontend_sha': 'e' * 40})
        self.assertEqual(self.controller.state, {})
        self.assertEqual(self.controller.calls, [])

    def test_failure_after_reservation_rolls_back_and_releases_capacity(self):
        self.controller.ready = lambda record: (_ for _ in ()).throw(RuntimeError('not ready'))
        with self.assertRaisesRegex(RuntimeError, 'not ready'):
            self.controller.deploy(REQUEST)
        self.assertEqual(self.controller.state, {})

    def test_never_forces_image_removal_or_prunes_other_projects(self):
        self.record()
        self.controller.destroy('pr-42')
        commands = repr(self.controller.calls)
        self.assertNotIn('prune', commands)
        self.assertNotIn('--force', commands)
        self.assertNotIn('backend_postgres', commands)

    def test_lost_vercel_response_recovered_by_ownership_metadata(self):
        record = self.record()
        calls = []
        def vercel(path, method='GET', body=None, headers=None):
            calls.append((path, method))
            return {'deployments': [
                {'uid': 'dpl-owned', 'meta': {'uwflowPreview': record['branch_name']}},
                {'uid': 'dpl-other', 'meta': {'uwflowPreview': 'another'}}], 'pagination': {}}
        self.controller.vercel = vercel
        self.controller.destroy('pr-42')
        self.assertIn(('/v13/deployments/dpl-owned', 'DELETE'), calls)
        self.assertNotIn(('/v13/deployments/dpl-other', 'DELETE'), calls)

    def test_status_contains_no_secrets(self):
        record = self.record()
        record['database_url'] = 'do-not-print'
        self.assertNotIn('do-not-print', json.dumps(self.controller.status()))


class ConfigurationTests(unittest.TestCase):
    def test_neon_setup_waits_for_rotation_and_enforces_verified_tls(self):
        with tempfile.TemporaryDirectory() as directory:
            controller = Controller(CONFIG, Path(directory))
            record = controller.reserve(REQUEST)
            calls = []
            def neon(path, method='GET', body=None):
                calls.append((path, method, body))
                if path.startswith('/branches?'):
                    return {'branches': []}
                if path == '/branches':
                    return {'branch': {'id': 'br-child', 'parent_id': CONFIG['neon_parent']},
                            'operations': [{'id': 'op-create'}]}
                if path.endswith('/reset_password'):
                    return {'operations': [{'id': 'op-password'}]}
                if path.startswith('/operations/'):
                    return {'operation': {'status': 'finished'}}
                if path.startswith('/connection_uri?'):
                    return {'uri': 'postgres://preview:rotated@ep-child.neon.tech/flow_preview?sslmode=require&channel_binding=require'}
                raise AssertionError(path)
            controller.neon = neon
            uri = controller.setup_neon(record)
            self.assertIn('sslmode=verify-full', uri)
            self.assertIn('sslrootcert=', uri)
            self.assertNotIn('channel_binding', uri)
            paths = [call[0] for call in calls]
            self.assertLess(paths.index('/operations/op-create'), paths.index('/operations/op-password'))
            self.assertTrue(paths[-1].startswith('/connection_uri?'))
            self.assertIn('branch_id=br-child', paths[-1])
            self.assertIn('pooled=false', paths[-1])

    def test_neon_branch_pagination_uses_provider_next_cursor(self):
        with tempfile.TemporaryDirectory() as directory:
            controller = Controller(CONFIG, Path(directory))
            paths = []
            def neon(path):
                paths.append(path)
                return ({'branches': [{'id': 'second'}]} if 'cursor=next-page' in path else
                        {'branches': [{'id': 'first'}], 'pagination': {'next': 'next-page'}})
            controller.neon = neon
            self.assertEqual([b['id'] for b in controller.branches()], ['first', 'second'])
            self.assertEqual(len(paths), 2)

    def test_rejects_injection_mutable_images_and_unbounded_ttl(self):
        for field, value in [('pr', '../production'), ('pr', True), ('frontend_sha', 'main'),
                             ('backend_sha', 'a' * 40 + ';id'), ('api_image', 'evil/api:latest'),
                             ('ttl_hours', 9999), ('ttl_hours', True)]:
            with self.subTest(field=field, value=value), self.assertRaises(ValueError):
                validate({**REQUEST, field: value}, CONFIG)
        self.assertEqual(validate(REQUEST, CONFIG), REQUEST)

    def test_generated_stack_is_bounded_and_has_no_production_mounts(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            controller = Controller(CONFIG, root)
            record = controller.reserve(REQUEST)
            controller.config_stack(record, REQUEST, 'postgres://preview:secret$literal@ep-test.neon.tech/flow?sslmode=verify-full')
            path = root / 'pr-42' / 'compose.json'
            config = json.loads(path.read_text())
            self.assertEqual(path.stat().st_mode & 0o777, 0o600)
            self.assertNotIn('volumes', config)
            for service in config['services'].values():
                self.assertIn('mem_limit', service)
                self.assertIn('cpus', service)
                self.assertIn('pids_limit', service)
                self.assertEqual(service['cap_drop'], ['ALL'])
                self.assertNotIn('container_name', service)
                self.assertNotIn('privileged', service)
            api_service = config['services']['api']
            self.assertTrue(api_service['read_only'])
            self.assertNotIn('ports', api_service)
            self.assertNotIn('edge', api_service.get('networks', {}))
            self.assertIn('secret$$literal', api_service['environment']['DATABASE_URL'])
            self.assertIn('sslmode=verify-full', api_service['environment']['DATABASE_URL'])
            self.assertIn('pool_max_conns=5', api_service['environment']['DATABASE_URL'])
            self.assertNotIn('docker.sock', json.dumps(config))

    def test_uploaded_frontend_replaces_production_routes_without_modifying_source(self):
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w') as archive:
            archive.writestr('repo/vercel.json', '{"rewrites":[{"destination":"https://uwflow.com/api"}]}')
            archive.writestr('repo/.env', 'production-secret')
            archive.writestr('repo/.eslintrc.js', 'module.exports = {}')
            archive.writestr('repo/package.json', '{}')
        with tempfile.TemporaryDirectory() as directory:
            controller = Controller(CONFIG, Path(directory))
            record = controller.reserve(REQUEST)
            with patch('urllib.request.urlopen', return_value=io.BytesIO(buffer.getvalue())):
                files = controller.frontend_files(record)
            config = json.loads(files['vercel.json'])
            self.assertIn('bun run build:vercel', config['buildCommand'])
            self.assertNotIn('https://uwflow.com', files['vercel.json'].decode())
            self.assertIn('pr-42.preview-api.uwflow.com', files['vercel.json'].decode())
            self.assertNotIn('.env', files)
            self.assertIn('.eslintrc.js', files)

    def test_archive_path_traversal_is_rejected(self):
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w') as archive:
            archive.writestr('repo/../bad', 'bad')
        with tempfile.TemporaryDirectory() as directory:
            controller = Controller(CONFIG, Path(directory))
            record = controller.reserve(REQUEST)
            with patch('urllib.request.urlopen', return_value=io.BytesIO(buffer.getvalue())):
                with self.assertRaisesRegex(ValueError, 'Unsafe'):
                    controller.frontend_files(record)


if __name__ == '__main__':
    unittest.main()
