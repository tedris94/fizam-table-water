#!/usr/bin/env bash
# Build Next.js standalone output and merge assets required for Passenger / Namecheap.
# Intended for Linux (GitHub Actions) or WSL. Run from repo root: bash scripts/package-namecheap-standalone.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export BUILD_STANDALONE="${BUILD_STANDALONE:-1}"
export NODE_OPTIONS="${NODE_OPTIONS:---no-deprecation}"

pnpm install --frozen-lockfile
pnpm run build:standalone

if [[ ! -f .next/standalone/server.js ]]; then
  echo "error: .next/standalone/server.js missing — standalone build failed" >&2
  exit 1
fi

mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

mkdir -p .next/standalone/data
if [[ -f data/.gitkeep ]]; then
  cp data/.gitkeep .next/standalone/data/.gitkeep
fi

cp "$ROOT/scripts/namecheap-DEPLOY.txt" .next/standalone/DEPLOY_NAMECHEAP.txt

# Standalone file tracing + pnpm symlinks omit many runtime deps. Install hoisted prod
# deps in a staging dir and merge (flat node_modules, safe on cPanel).
echo "Merging hoisted production node_modules into standalone..."
# Install outside the repo so pnpm does not hoist into the workspace root (..).
DEPLOY_STAGING="$(mktemp -d)"
trap 'rm -rf "$DEPLOY_STAGING"' EXIT
cp package.json pnpm-lock.yaml "$DEPLOY_STAGING/"
{
  cat .npmrc 2>/dev/null || true
  echo "node-linker=hoisted"
} > "${DEPLOY_STAGING}/.npmrc"
pnpm install --prod --frozen-lockfile --dir "$DEPLOY_STAGING"
STAGING_NODE_MODULES="${DEPLOY_STAGING}/node_modules"
if [[ ! -d "$STAGING_NODE_MODULES" ]]; then
  echo "error: staging node_modules missing at ${STAGING_NODE_MODULES}" >&2
  exit 1
fi
mkdir -p .next/standalone/node_modules
rsync -a "${STAGING_NODE_MODULES}/" .next/standalone/node_modules/

echo "Verifying standalone can load runtime modules..."
(
  cd .next/standalone
  node -e "
    require('styled-jsx/package.json');
    require('@swc/helpers/_/_interop_require_default');
    require('@next/env');
    require('react-dom/server.browser');
    require('libsql');
    console.log('runtime deps OK');
  "
)

echo "OK: bundle ready under .next/standalone (see DEPLOY_NAMECHEAP.txt inside)"
