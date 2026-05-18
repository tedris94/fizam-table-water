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

# Standalone file tracing + pnpm symlinks omit nested runtime deps (libsql, react-dom, …).
echo "Copying runtime dependency tree into standalone node_modules..."
node scripts/copy-standalone-runtime-deps.cjs

echo "Verifying standalone can load runtime modules..."
(
  cd .next/standalone
  node -e "
    require('styled-jsx/package.json');
    require('@swc/helpers/_/_interop_require_default');
    require('@next/env');
    require('react-dom/server.browser');
    require('libsql');
    require('semver/functions/coerce');
    require('sharp');
    console.log('runtime deps OK');
    process.exit(0);
  "
)

# GitHub artifact downloads often drop leading-dot folders (`.next`). Ship the build as
# `next-dist/`; on the server run:  mv next-dist .next
if [[ ! -f .next/standalone/.next/BUILD_ID ]]; then
  echo "error: .next/standalone/.next/BUILD_ID missing after standalone build" >&2
  exit 1
fi
rm -rf .next/standalone/next-dist
cp -a .next/standalone/.next .next/standalone/next-dist
if [[ ! -f .next/standalone/next-dist/BUILD_ID ]]; then
  echo "error: next-dist/BUILD_ID missing" >&2
  exit 1
fi
echo "OK: bundle ready under .next/standalone (see DEPLOY_NAMECHEAP.txt; includes next-dist/)"
