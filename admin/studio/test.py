#!/usr/bin/env python3
"""Exercise the real admin gateway and Studio against disposable PostgreSQL 15.

Requires Python 3, Docker Compose v2+, and htpasswd. No production env/data used.
"""
import base64
import json
import os
from pathlib import Path
import secrets
import subprocess
import tempfile
import urllib.error
import urllib.request


ROOT = Path(__file__).resolve().parents[2]


def run(*args, **kwargs):
    return subprocess.run(args, check=True, text=True, capture_output=True, **kwargs).stdout


def main():
    with tempfile.TemporaryDirectory(prefix="uwflow-studio-test-") as directory:
        temp = Path(directory)
        password = secrets.token_hex(32)
        web_password = secrets.token_hex(24)
        auth_file = temp / "htpasswd"
        auth_file.write_text(run("htpasswd", "-niB", "test-admin", input=web_password + "\n"))
        auth_file.chmod(0o644)
        env_file = temp / ".env"
        env_file.touch()
        studio_env = temp / "studio.env"
        studio_env.write_text("STUDIO_DB_PASSWORD=" + password + "\nSTUDIO_CRYPTO_KEY="
                              + secrets.token_hex(32) + "\n")
        studio_env.chmod(0o600)
        base = temp / "base.json"
        base.write_text(json.dumps({"services": {"postgres": {
            "image": "postgres:15-alpine",
            "environment": {"POSTGRES_PASSWORD": password, "POSTGRES_DB": "studio_test"},
            "tmpfs": ["/var/lib/postgresql/data"],
            "healthcheck": {"test": ["CMD", "pg_isready", "-U", "postgres"],
                            "interval": "2s", "timeout": "2s", "retries": 30}
        }}}))
        override = temp / "override.json"
        override.write_text(json.dumps({"services": {"studio-proxy": {"volumes": [{
            "type": "bind", "source": str(auth_file),
            "target": "/etc/nginx/studio.htpasswd", "read_only": True
        }]}}}))
        env = {**os.environ, "POSTGRES_PORT": "5432", "POSTGRES_DB": "studio_test",
               "STUDIO_ENV_FILE": str(studio_env)}
        # Explicit files/project/env prevent touching the normal backend stack.
        compose = ["docker", "compose", "--project-name", "uwflow-studio-test-" + secrets.token_hex(4),
                   "--project-directory", str(ROOT), "--env-file", str(env_file),
                   "-f", str(base), "-f", str(ROOT / "docker-compose.studio.yml"), "-f", str(override)]

        def dc(*args, **kwargs):
            return run(*compose, *args, env=env, **kwargs)

        def sql(query):
            return dc("exec", "-T", "postgres", "psql", "-v", "ON_ERROR_STOP=1",
                      "-U", "postgres", "-d", "studio_test", input=query)

        def request(path, payload=None, authenticated=True, headers=None):
            values = {"Host": "localhost:8001", **(headers or {})}
            if authenticated:
                values["Authorization"] = "Basic " + base64.b64encode(
                    ("test-admin:" + web_password).encode()).decode()
            data = None if payload is None else json.dumps(payload).encode()
            if data is not None:
                values["Content-Type"] = "application/json"
            req = urllib.request.Request("http://127.0.0.1:8001" + path, data=data, headers=values)
            try:
                with urllib.request.urlopen(req, timeout=65) as response:
                    return response.status, response.read().decode()
            except urllib.error.HTTPError as error:
                return error.code, error.read().decode()

        try:
            # Configuration security invariants are checked before starting anything.
            config = json.loads(dc("config", "--format", "json"))
            services = config["services"]
            assert not services["studio"].get("ports")
            assert not services["studio-meta"].get("ports")
            assert services["studio-proxy"]["ports"][0]["host_ip"] == "127.0.0.1"
            for name in ("studio", "studio-meta", "studio-proxy"):
                assert "default" not in services[name]["networks"]
            assert config["networks"]["studio-web"]["internal"]
            assert config["networks"]["studio-db"]["internal"]
            # Missing/default/equal secrets must fail before either app starts.
            for bad_env in ({}, {"STUDIO_DB_PASSWORD": "default", "STUDIO_CRYPTO_KEY": "default"},
                            {"STUDIO_DB_PASSWORD": "a" * 64, "STUDIO_CRYPTO_KEY": "a" * 64}):
                result = subprocess.run(["sh", str(ROOT / "admin/studio/entrypoint.sh"), "true"],
                                        env={"PATH": os.environ["PATH"], **bad_env}, capture_output=True)
                assert result.returncode != 0
            dc("up", "-d", "--wait", "postgres")
            sql((ROOT / "admin/studio/create-role.sql").read_text())
            sql("ALTER ROLE flow_studio PASSWORD '" + password + "';\n"
                "CREATE TABLE public.studio_fixture (id integer PRIMARY KEY, value text);\n"
                "INSERT INTO public.studio_fixture VALUES (1, 'before');\n"
                "CREATE TABLE public.studio_rls_fixture (id integer);\n"
                "ALTER TABLE public.studio_rls_fixture ENABLE ROW LEVEL SECURITY;\n"
                "INSERT INTO public.studio_rls_fixture VALUES (1);\n")
            dc("up", "-d", "--wait", "--wait-timeout", "180", "studio-proxy")
            query_path = "/api/platform/pg-meta/default/query"
            for path in ("/", "/api/platform/projects", query_path):
                assert request(path, authenticated=False)[0] == 401, path
                assert request(path, authenticated=False,
                               headers={"Authorization": "Basic d3Jvbmc6d3Jvbmc="})[0] == 401, path
            for headers in ({"Host": "attacker.example"}, {"Origin": "https://attacker.example"},
                            {"Sec-Fetch-Site": "cross-site"}):
                assert request(query_path, {"query": "SELECT 1"}, headers=headers)[0] == 403
            assert request("/project/default/editor")[0] == 200
            assert request("/api/platform/projects")[0] == 200

            def query(statement):
                status, body = request(query_path, {"query": statement})
                assert status == 200, (status, body)
                return json.loads(body)

            assert query("SELECT current_user AS name")[0]["name"] == "flow_studio"
            assert query("SELECT value FROM public.studio_fixture")[0]["value"] == "before"
            query("UPDATE public.studio_fixture SET value = 'after' WHERE id = 1")
            assert query("SELECT value FROM public.studio_fixture")[0]["value"] == "after"
            assert query("SELECT * FROM public.studio_rls_fixture") == []
            for statement in ("ALTER ROLE flow_studio SUPERUSER",
                              "DROP TABLE public.studio_fixture"):
                status, _ = request(query_path, {"query": statement})
                assert status >= 400, statement
            # Exercise the endpoint used to populate the table browser as well as SQL.
            status, body = request("/api/platform/pg-meta/default/tables?included_schemas=public")
            assert status == 200 and "studio_fixture" in body, (status, body)
            print("PASS: gateway auth/origin checks, Studio table discovery, SQL read/write, RLS and role restrictions")
        except Exception:
            print(dc("logs", "--tail", "30", "studio", "studio-meta", "studio-proxy"))
            raise
        finally:
            # Only this random project is removed; its database lives in tmpfs.
            dc("down", "--volumes", "--remove-orphans")


if __name__ == "__main__":
    main()
