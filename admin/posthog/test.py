#!/usr/bin/env python3
"""Test the bootstrap against disposable PostgreSQL 15; never use the app volume."""
import json
from pathlib import Path
import secrets
import subprocess
import time
import uuid

ROOT = Path(__file__).resolve().parents[2]
NAME = "posthog-access-test-" + uuid.uuid4().hex[:12]


def run(*args, input=None, ok=True):
    result = subprocess.run(args, input=input, text=True, capture_output=True)
    if ok and result.returncode:
        raise RuntimeError(result.stderr)
    return result


def sql(query, *, user="postgres", ok=True):
    return run("docker", "exec", "-i", NAME, "psql", "-X", "-v",
               "ON_ERROR_STOP=1", "-At", "-U", user, "-d", "postgres",
               input=query, ok=ok)


try:
    run("docker", "run", "--rm", "-d", "--name", NAME,
        "--tmpfs", "/var/lib/postgresql/data", "-p", "127.0.0.1::5432",
        "-e", "POSTGRES_PASSWORD=" + secrets.token_hex(24), "postgres:15-alpine")
    for attempt in range(60):
        if run("docker", "exec", NAME, "pg_isready", "-U", "postgres", ok=False).returncode == 0:
            break
        time.sleep(1)
    else:
        raise RuntimeError("Disposable PostgreSQL did not become ready")

    ports = json.loads(run("docker", "inspect", NAME, "--format",
                           "{{json .NetworkSettings.Ports}}").stdout)
    assert all(p["HostIp"] == "127.0.0.1" for p in ports["5432/tcp"])
    bootstrap = (ROOT / "admin/posthog/bootstrap.sql").read_text()
    sql(bootstrap)
    flags = sql("SELECT rolcanlogin, rolsuper, rolcreatedb, rolcreaterole, "
                "rolinherit, rolreplication, rolbypassrls, rolconnlimit "
                "FROM pg_roles WHERE rolname='flow_posthog'").stdout.strip()
    assert flags == "f|f|f|f|f|f|f|3", flags
    assert sql(bootstrap, ok=False).returncode != 0, "Existing role was reused"
    assert sql("SELECT 1", user="flow_posthog", ok=False).returncode != 0

    # Fixture-only approval; this grants no application data in the real bootstrap.
    sql("CREATE TABLE public.approved (id integer PRIMARY KEY); "
        "INSERT INTO public.approved VALUES (1); "
        "CREATE TABLE public.private_data (secret text); "
        "CREATE ROLE other_role; "
        "GRANT USAGE ON SCHEMA public TO flow_posthog; "
        "GRANT SELECT ON public.approved TO flow_posthog; "
        "ALTER ROLE flow_posthog LOGIN;")
    assert sql("SELECT id FROM public.approved", user="flow_posthog").stdout.strip() == "1"
    assert sql("SHOW default_transaction_read_only", user="flow_posthog").stdout.strip() == "on"
    for query in (
        "SELECT * FROM public.private_data",
        "INSERT INTO public.approved VALUES (2)",
        "UPDATE public.approved SET id=2",
        "DELETE FROM public.approved",
        "CREATE TABLE public.forbidden (id integer)",
        "CREATE ROLE forbidden",
        "SET ROLE other_role",
        "ALTER ROLE flow_posthog REPLICATION",
    ):
        # Turn off the convenience setting in a separate statement/transaction:
        # failure must come from privileges, not a read-only transaction.
        result = sql("SET default_transaction_read_only=off;\n" + query,
                     user="flow_posthog", ok=False)
        assert result.returncode != 0, "Unexpected success: " + query
        assert "read-only transaction" not in result.stderr, result.stderr
    sql("CREATE TABLE public.future_table (id integer)")
    assert sql("SELECT * FROM public.future_table", user="flow_posthog", ok=False).returncode != 0
    print("PASS: bootstrap, NOLOGIN, role flags, explicit read, denied writes/escalation, "
          "private/future table isolation, loopback Docker publication")
finally:
    run("docker", "stop", NAME, ok=False)
