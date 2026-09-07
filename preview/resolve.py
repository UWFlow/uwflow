#!/usr/bin/env python3
"""Resolve immutable revisions BEFORE the protected environment approval."""
import json
import os
import re
import subprocess


def get(path):
    return json.loads(subprocess.check_output(['gh', 'api', path]))


def main():
    action, pr = os.environ['PREVIEW_ACTION'], os.environ['PREVIEW_PR']
    if action not in ('deploy', 'destroy', 'status'):
        raise ValueError('Invalid action')
    if action != 'status' and not re.fullmatch(r'[1-9][0-9]{0,6}', pr):
        raise ValueError('Invalid PR number')
    frontend, backend = '', ''
    if action == 'deploy':
        pull = get('repos/UWFlow/uwflow_frontend/pulls/' + pr)
        if pull['state'] != 'open' or pull['head']['repo']['full_name'] != 'UWFlow/uwflow_frontend':
            raise ValueError('Choose an open PR on a maintainer-owned frontend branch')
        frontend = pull['head']['sha']
        backend = os.environ.get('PREVIEW_BACKEND_SHA') or get('repos/UWFlow/uwflow/commits/main')['sha']
        if not re.fullmatch(r'[0-9a-f]{40}', backend):
            raise ValueError('Backend revision must be a full SHA')
        get('repos/UWFlow/uwflow/commits/' + backend)
    with open(os.environ['GITHUB_OUTPUT'], 'a') as out:
        out.write(f'frontend_sha={frontend}\nbackend_sha={backend}\n')
    with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as out:
        out.write(f'Action: **{action}**\n\nFrontend PR #{pr}: `{frontend}`\n\nBackend: `{backend}`\n')
        out.write('\nReview these exact commits before approving the `ec2-preview` environment.\n')


if __name__ == '__main__':
    main()
