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

# Next boot resolves styled-jsx/package.json; pnpm + file tracing often omit it from standalone.
ensure_standalone_dep() {
  local pkg="$1"
  local src="node_modules/${pkg}"
  local dest=".next/standalone/node_modules/${pkg}"
  if [[ ! -e "$src" ]]; then
    echo "error: ${src} missing — run pnpm install" >&2
    exit 1
  fi
  mkdir -p .next/standalone/node_modules
  rm -rf "$dest"
  cp -rL "$src" "$dest"
}

ensure_standalone_dep styled-jsx

if [[ ! -f .next/standalone/node_modules/styled-jsx/package.json ]]; then
  echo "error: styled-jsx not present in standalone node_modules" >&2
  exit 1
fi

echo "OK: bundle ready under .next/standalone (see DEPLOY_NAMECHEAP.txt inside)"
