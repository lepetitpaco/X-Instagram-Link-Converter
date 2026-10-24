#!/bin/bash
# Régénère icons/icon*.png et les visuels de store/ (Chromium dans Docker, rien à installer sur la machine)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
docker run --rm -v "$ROOT":/ext -w /tmp mcr.microsoft.com/playwright:v1.48.2-jammy \
  sh -c 'npm i -s playwright@1.48.2 >/dev/null 2>&1 && cp /ext/store/render.mjs /tmp/render.mjs && sed -i "s#^const STORE = .*#const STORE = \"/ext/store\";#" /tmp/render.mjs && node /tmp/render.mjs'
