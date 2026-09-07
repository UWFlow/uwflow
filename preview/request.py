#!/usr/bin/env python3
"""Serialize workflow inputs; never interpolate PR input into a shell command."""
import json
import os

request = {'action': os.environ['PREVIEW_ACTION']}
if request['action'] in ('deploy', 'destroy'):
    request['pr'] = int(os.environ['PREVIEW_PR'])
if request['action'] == 'deploy':
    request.update({key: os.environ[key.upper()] for key in
                    ('frontend_sha', 'backend_sha', 'api_image', 'hasura_image')})
    request['ttl_hours'] = int(os.environ['TTL_HOURS'])
print(json.dumps(request))
