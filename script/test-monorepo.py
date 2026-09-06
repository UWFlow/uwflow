#!/usr/bin/env python3
"""Exercise CLI behavior with disposable Git state and a recording Docker/Bun stub."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class MonorepoCommands(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="uwflow-commands-")
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name).resolve()
        self.bin = self.directory / "bin"
        self.bin.mkdir()
        self.log = self.directory / "commands.jsonl"
        self.env = dict(os.environ, PATH=f"{self.bin}:{os.environ['PATH']}",
                        COMMAND_LOG=str(self.log))
        for name in ("SENTRY_AUTH_TOKEN", "IMAGE_TAG", "UWFLOW_IMAGE_TAG"):
            self.env.pop(name, None)
        stub = '''#!/usr/bin/env python3
import json, os, sys
from pathlib import Path
with open(os.environ["COMMAND_LOG"], "a") as output:
    output.write(json.dumps({"tool": Path(sys.argv[0]).name, "args": sys.argv[1:],
                             "cwd": os.getcwd(), "tag": os.getenv("UWFLOW_IMAGE_TAG")}) + "\\n")
if os.getenv("FAIL_COMMAND") in sys.argv[1:]:
    sys.exit(17)
'''
        for name in ("docker", "bun"):
            path = self.bin / name
            path.write_text(stub)
            path.chmod(0o755)

    def run_command(self, args, expected=0, cwd=None):
        result = subprocess.run(args, cwd=cwd or self.directory, env=self.env,
                                text=True, capture_output=True)
        self.assertEqual(result.returncode, expected, result.stdout + result.stderr)
        return result

    def calls(self):
        return [json.loads(line) for line in self.log.read_text().splitlines()] if self.log.exists() else []

    def test_build_all_components_from_another_directory(self):
        self.env["IMAGE_TAG"] = "test-release"
        self.run_command([str(ROOT / "script/build.sh")])
        calls = self.calls()
        self.assertEqual(len(calls), 4)
        for service, call in zip(("api", "email", "uw", "frontend"), calls):
            self.assertEqual(call["args"][0], "build")
            self.assertIn(f"neuwflow/{service}:test-release", call["args"])
            self.assertIn(f"neuwflow/{service}:latest", call["args"])
            self.assertEqual(call["args"][-1], str(ROOT / ("frontend" if service == "frontend" else "flow")))
            self.assertNotIn("--secret", call["args"])

    def test_frontend_secret_uses_buildkit_reference(self):
        self.env["SENTRY_AUTH_TOKEN"] = "test-token-not-for-build-args"
        self.run_command([str(ROOT / "script/build.sh"), "frontend"])
        args = self.calls()[0]["args"]
        self.assertIn("id=sentry_auth_token,env=SENTRY_AUTH_TOKEN", args)
        self.assertNotIn(self.env["SENTRY_AUTH_TOKEN"], " ".join(args))

    def test_invalid_build_input_fails_before_any_build(self):
        self.run_command([str(ROOT / "script/build.sh"), "frontend", "typo"], expected=2)
        self.assertEqual(self.calls(), [])
        self.env["IMAGE_TAG"] = "bad/tag"
        self.run_command([str(ROOT / "script/build.sh")], expected=2)
        self.assertEqual(self.calls(), [])

    def test_frontend_deploy_keeps_other_services_running(self):
        self.env["UWFLOW_IMAGE_TAG"] = "known-good-release"
        self.run_command([str(ROOT / "script/deploy.sh"), "frontend"])
        calls = self.calls()[1:]  # First call detects the Compose plugin.
        self.assertEqual(len(calls), 3)
        for call in calls:
            self.assertIn(str(ROOT / "docker-compose.yml"), call["args"])
            self.assertIn("--env-file", call["args"])
            self.assertIn(str(ROOT / ".env"), call["args"])
            self.assertEqual(call["args"][-1], "frontend")
            self.assertNotIn("down", call["args"])
            self.assertNotIn("postgres", call["args"])
            self.assertEqual(call["tag"], "known-good-release")
        self.assertIn("pull", calls[0]["args"])
        self.assertIn("--no-deps", calls[1]["args"])
        self.assertIn("ps", calls[2]["args"])

    def test_failed_pull_does_not_restart_services(self):
        self.env["FAIL_COMMAND"] = "pull"
        self.run_command([str(ROOT / "script/deploy.sh"), "frontend"], expected=17)
        self.assertFalse(any("up" in call["args"] for call in self.calls()))

    def test_invalid_deploy_service_has_no_side_effects(self):
        self.run_command([str(ROOT / "script/deploy.sh"), "frontend", "typo"], expected=2)
        self.assertEqual(self.calls(), [])

    def test_frontend_make_targets_do_not_read_backend_environment(self):
        shutil.copy(ROOT / "Makefile", self.directory / "Makefile")
        (self.directory / "frontend").mkdir()
        # Parsing this file would fail: frontend-only targets must not include it.
        (self.directory / ".env").write_text("this is not valid Make syntax\n")
        self.run_command(["make", "frontend-install", "frontend-check", "frontend-build"])
        self.assertEqual(len(self.calls()), 5)
        self.assertTrue(all(call["cwd"] == str(self.directory / "frontend") for call in self.calls()))
        (self.directory / ".env").unlink()
        self.run_command(["make", "help"])
        self.run_command(["make", "-n", "start"], expected=2)

    def test_hook_lints_frontend_without_modifying_staged_work(self):
        self.run_command(["git", "init", "--quiet"])
        (self.directory / "frontend").mkdir()
        source = self.directory / "frontend/example.ts"
        source.write_text("const staged = 1;\n")
        self.run_command(["git", "add", "frontend/example.ts"])
        source.write_text("const unstaged = 2;\n")
        before = self.run_command(["git", "diff", "--cached"]).stdout
        self.run_command([str(ROOT / ".githooks/pre-commit")])
        self.assertEqual(self.calls()[0]["cwd"], str(self.directory / "frontend"))
        self.assertEqual(self.calls()[0]["args"], ["run", "lint-nofix"])
        self.assertEqual(before, self.run_command(["git", "diff", "--cached"]).stdout)
        self.assertEqual(source.read_text(), "const unstaged = 2;\n")
        self.env["FAIL_COMMAND"] = "lint-nofix"
        self.run_command([str(ROOT / ".githooks/pre-commit")], expected=17)

    def test_installed_hook_runs_on_git_commit(self):
        self.run_command(["git", "init", "--quiet"])
        shutil.copy(ROOT / "Makefile", self.directory / "Makefile")
        shutil.copytree(ROOT / ".githooks", self.directory / ".githooks")
        (self.directory / "frontend").mkdir()
        (self.directory / "frontend/example.ts").write_text("const staged = 1;\n")
        self.run_command(["make", "hooks"])
        self.run_command(["git", "add", "frontend/example.ts"])
        self.run_command(["git", "-c", "commit.gpgsign=false", "-c", "user.name=Migration Test",
                          "-c", "user.email=migration-test@example.invalid", "commit", "-m", "Hook test"])
        self.assertEqual(self.calls()[0]["args"], ["run", "lint-nofix"])

    def test_hook_skips_backend_only_work(self):
        self.run_command(["git", "init", "--quiet"])
        (self.directory / "example.go").write_text("package main\n")
        self.run_command(["git", "add", "example.go"])
        self.run_command([str(ROOT / ".githooks/pre-commit")])
        self.assertEqual(self.calls(), [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
