#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_ROOT"

if [[ -d next-dist ]] && [[ ! -d .next ]]; then
  echo "Renaming next-dist → .next"
  mv next-dist .next
fi

if [[ ! -f start.cjs ]]; then
  echo "Writing missing start.cjs"
  cat > start.cjs <<'EOF'
'use strict'
/**
 * Namecheap / LiteSpeed Passenger entrypoint.
 * Sets LD_LIBRARY_PATH for sharp/libvips before Next standalone boots.
 */
const path = require('path')

const libvipsLib = path.join(
  __dirname,
  'node_modules',
  '@img',
  'sharp-libvips-linux-x64',
  'lib',
)
process.env.LD_LIBRARY_PATH = [libvipsLib, process.env.LD_LIBRARY_PATH]
  .filter(Boolean)
  .join(':')

process.env.NODE_ENV = process.env.NODE_ENV || 'production'
process.env.NEXT_TELEMETRY_DISABLED = '1'

import('./server.js')
EOF
  chmod 644 start.cjs
fi

if [[ ! -f preload-sharp.cjs ]]; then
  echo "Writing missing preload-sharp.cjs"
  cat > preload-sharp.cjs <<'EOF'
'use strict'
/** Loaded via NODE_OPTIONS=--require /home/$USER/fizam.ng/preload-sharp.cjs (LiteSpeed / Passenger). */
const path = require('path')
const libvipsLib = path.join(
  __dirname,
  'node_modules',
  '@img',
  'sharp-libvips-linux-x64',
  'lib',
)
process.env.LD_LIBRARY_PATH = [libvipsLib, process.env.LD_LIBRARY_PATH]
  .filter(Boolean)
  .join(':')
EOF
  chmod 644 preload-sharp.cjs
fi

bash -x scripts/namecheap-server-setup.sh

echo
printf '%s\n' 'Post-deploy setup complete. Now restart the Node.js application in cPanel (Production).' 'Then verify with:'
printf '%s\n' '  curl -sI https://fizam.ng/ | head -5' '  curl -sI https://fizam.ng/admin | head -5'
