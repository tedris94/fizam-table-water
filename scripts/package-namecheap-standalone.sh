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

# pnpm + file tracing omit nested runtime deps. Copy packages Next + Payload need at runtime.
resolve_pkg_dir() {
  local pkg="$1"
  node -e "
    const pkg = process.argv[1];
    const path = require('path');
    const fs = require('fs');
    const { createRequire } = require('module');
    const anchors = [];
    for (const name of ['next/package.json', 'payload/package.json', 'react-dom/package.json', '@payloadcms/db-sqlite/package.json']) {
      try { anchors.push(require.resolve(name)); } catch {}
    }
    anchors.push(path.join(process.cwd(), 'package.json'));
    const tryResolve = (request) => {
      for (const anchor of anchors) {
        try {
          const req = createRequire(anchor);
          return req.resolve(request);
        } catch {}
      }
      throw new Error('Cannot resolve ' + request);
    };
    const toPkgRoot = (resolved) => {
      let dir = path.dirname(resolved);
      if (!resolved.endsWith('package.json') && path.basename(resolved) !== 'package.json') {
        dir = path.dirname(resolved);
      }
      while (dir !== path.dirname(dir)) {
        if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
        dir = path.dirname(dir);
      }
      throw new Error('No package root for ' + pkg);
    };
    let resolved;
    try {
      resolved = tryResolve(pkg + '/package.json');
    } catch {
      resolved = tryResolve(pkg);
    }
    process.stdout.write(toPkgRoot(resolved));
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

echo "Copying runtime dependencies into standalone node_modules..."
while IFS= read -r dep; do
  [[ -n "$dep" ]] || continue
  ensure_standalone_dep "$dep"
done < <(node -e "
const path = require('path');
const { createRequire } = require('module');
const req = createRequire(path.join(process.cwd(), 'package.json'));
const names = new Set();

const addPkgJsonDeps = (pkgJsonPath) => {
  const p = require(pkgJsonPath);
  names.add(p.name);
  for (const dep of Object.keys(p.dependencies || {})) names.add(dep);
};

for (const anchor of [
  'next/package.json',
  'payload/package.json',
  '@payloadcms/db-sqlite/package.json',
  '@payloadcms/next/package.json',
]) {
  try {
    addPkgJsonDeps(req.resolve(anchor));
  } catch {}
}

for (const name of [
  'react',
  'react-dom',
  'graphql',
  'sharp',
  'libsql',
  '@libsql/client',
  'drizzle-orm',
  '@payloadcms/drizzle',
]) {
  names.add(name);
}

console.log([...names].sort().join('\n'));
")

verify_standalone_dep() {
  local pkg="$1"
  if [[ ! -f ".next/standalone/node_modules/${pkg}/package.json" ]]; then
    echo "error: ${pkg} not present in standalone node_modules" >&2
    exit 1
  fi
}

for dep in styled-jsx @swc/helpers @next/env react-dom libsql '@libsql/client'; do
  verify_standalone_dep "$dep"
done

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
