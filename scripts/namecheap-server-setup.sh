#!/usr/bin/env bash
# Run on Namecheap AFTER extracting the CI artifact into ~/fizam.ng
# Merges node_modules into CloudLinux venv and installs sharp@0.33.5 + semver.
set -euo pipefail

APP_ROOT="${APP_ROOT:-$HOME/fizam.ng}"
NODE_APP="${NODE_APP:-fizam.ng}"
NODE_VER="${NODE_VER:-24}"

VENV_LIB="$HOME/nodevenv/${NODE_APP}/${NODE_VER}/lib"
VENV_NM="${VENV_LIB}/node_modules"
NPM="${VENV_LIB}/../bin/npm"

cd "$APP_ROOT"

if [[ ! -f server.js ]]; then
  echo "error: server.js not found in $APP_ROOT" >&2
  exit 1
fi

if [[ -d next-dist ]] && [[ ! -d .next ]]; then
  echo "Renaming next-dist → .next"
  mv next-dist .next
fi

mkdir -p "$VENV_NM" data
chmod 775 data 2>/dev/null || true

if [[ -d node_modules ]] && [[ ! -L node_modules ]]; then
  echo "Merging bundle node_modules into CloudLinux venv..."
  cp -a node_modules/. "$VENV_NM/"
  rm -rf node_modules
fi

ln -sfn "$VENV_NM" node_modules

echo "Installing semver + sharp@0.33.5 (Namecheap CPU / pnpm trace fixes)..."
rm -rf "$VENV_NM/@img/sharp-wasm32"
"$NPM" install semver@7 sharp@0.33.5 --include=optional --omit=dev --prefix "$VENV_LIB"

node -e "require('semver/functions/coerce'); require('sharp'); console.log('OK: semver + sharp', require('sharp').versions.sharp)"

echo "Done. Restart the Node app in cPanel (Production), then:"
echo "  curl -sI https://fizam.ng/ | head -3"
echo "Keep data/fizam.db — do not delete on redeploy."
