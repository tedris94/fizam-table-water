#!/usr/bin/env bash
# Build Next.js standalone output and merge assets required for Passenger / Namecheap.
# Intended for Linux (GitHub Actions) or WSL. Run from repo root: bash scripts/package-namecheap-standalone.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export BUILD_STANDALONE="${BUILD_STANDALONE:-1}"
export NODE_OPTIONS="${NODE_OPTIONS:---no-deprecation}"

pnpm install --frozen-lockfile

# Next.js static generation runs Payload in parallel workers. Run migrations once here
# so prodMigrations on connect only see an up-to-date schema (avoids SQLITE race errors).
mkdir -p data
export PAYLOAD_SECRET="${PAYLOAD_SECRET:-ci-build-placeholder-secret}"
pnpm payload migrate

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
cp "$ROOT/start.cjs" .next/standalone/start.cjs
cp "$ROOT/launcher.cjs" .next/standalone/launcher.cjs
cp "$ROOT/launcher.js" .next/standalone/launcher.js
cp "$ROOT/preload-sharp.cjs" .next/standalone/preload-sharp.cjs
mkdir -p .next/standalone/scripts
cp "$ROOT/scripts/namecheap-server-setup.sh" .next/standalone/scripts/namecheap-server-setup.sh
chmod +x .next/standalone/scripts/namecheap-server-setup.sh 2>/dev/null || true
mkdir -p .next/standalone/migrations
cp -r "$ROOT/src/migrations/"* .next/standalone/migrations/

# Standalone file tracing + pnpm symlinks omit nested runtime deps (libsql, react-dom, …).
echo "Copying runtime dependency tree into standalone node_modules..."
node scripts/copy-standalone-runtime-deps.cjs

if [[ "$(uname -s)" == "Linux" ]]; then
  for pkg in node_modules/@img/sharp-linux-x64 node_modules/@img/sharp-libvips-linux-x64; do
    if [[ ! -f ".next/standalone/${pkg}/package.json" ]]; then
      echo "error: missing .next/standalone/${pkg} (sharp linux bindings)" >&2
      exit 1
    fi
  done
fi

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
