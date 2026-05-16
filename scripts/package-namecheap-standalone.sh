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

# pnpm + Next file tracing often omit nested runtime deps. Copy everything next/package.json lists.
resolve_pkg_dir() {
  local pkg="$1"
  node -e "
    const path = require('path');
    const { createRequire } = require('module');
    const req = createRequire(path.join(process.cwd(), 'package.json'));
    const dir = path.dirname(req.resolve(process.argv[1] + '/package.json'));
    process.stdout.write(dir);
  " "$pkg"
}

ensure_standalone_dep() {
  local pkg="$1"
  local src dest
  src="$(resolve_pkg_dir "$pkg")"
  dest=".next/standalone/node_modules/${pkg}"
  mkdir -p "$(dirname "$dest")"
  rm -rf "$dest"
  cp -rL "$src" "$dest"
  echo "  + ${pkg}"
}

echo "Copying Next.js runtime dependencies into standalone node_modules..."
while IFS= read -r dep; do
  [[ -n "$dep" ]] || continue
  ensure_standalone_dep "$dep"
done < <(node -e "console.log(Object.keys(require('./node_modules/next/package.json').dependencies).join('\n'))")

verify_standalone_dep() {
  local pkg="$1"
  if [[ ! -f ".next/standalone/node_modules/${pkg}/package.json" ]]; then
    echo "error: ${pkg} not present in standalone node_modules" >&2
    exit 1
  fi
}

for dep in styled-jsx @swc/helpers @next/env; do
  verify_standalone_dep "$dep"
done

echo "Verifying standalone can load Next runtime modules..."
(
  cd .next/standalone
  node -e "
    require('styled-jsx/package.json');
    require('@swc/helpers/_/_interop_require_default');
    require('@next/env');
    console.log('runtime deps OK');
  "
)

echo "OK: bundle ready under .next/standalone (see DEPLOY_NAMECHEAP.txt inside)"
