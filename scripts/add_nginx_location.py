#!/usr/bin/env python3
"""Idempotently adds the /metastrip/ proxy location to the nginx default site."""
import sys

CONF = "/etc/nginx/sites-available/default"

content = open(CONF).read()

if "location /metastrip" in content:
    print("nginx: /metastrip/ already configured, skipping")
    sys.exit(0)

block = (
    "\n    location /metastrip/ {"
    "\n        proxy_pass http://127.0.0.1:4001/;"
    "\n        proxy_http_version 1.1;"
    "\n        proxy_set_header Host $host;"
    "\n        proxy_set_header X-Real-IP $remote_addr;"
    "\n        client_max_body_size 200M;"
    "\n    }"
)

content = content.rstrip()
if content.endswith("}"):
    content = content[:-1] + block + "\n}"

open(CONF, "w").write(content)
print("nginx: added /metastrip/ location block")
