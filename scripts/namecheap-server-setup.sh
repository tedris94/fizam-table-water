#!/usr/bin/env bash
# Run on Namecheap AFTER extracting the CI artifact into ~/fizam.ng
# Merges node_modules into CloudLinux venv and installs sharp@0.33.5 + semver.
set -euo pipefail

APP_ROOT="${APP_ROOT:-$HOME/fizam.ng}"
NODE_APP="${NODE_APP:-fizam.ng}"
NODE_VER="${NODE_VER:-24}"

VENV_BIN="$HOME/nodevenv/${NODE_APP}/${NODE_VER}/bin"
VENV_LIB="$HOME/nodevenv/${NODE_APP}/${NODE_VER}/lib"
VENV_NM="${VENV_LIB}/node_modules"
NPM="${VENV_BIN}/npm"
NODE_BIN="${VENV_BIN}/node"

cd "$APP_ROOT"

if [[ ! -x "$NODE_BIN" ]]; then
  echo "error: CloudLinux Node not found at $NODE_BIN" >&2
  echo "In cPanel → Setup Node.js App → Edit your app → click Run NPM Install, then re-run this script." >&2
  exit 1
fi

# SSH sessions do not put node on PATH; use the venv binary (same as Passenger).
export PATH="${VENV_BIN}:$PATH"

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

echo "Installing semver + sharp@0.33.5 (Namecheap CPU — no wasm32)..."
# Wasm sharp OOMs on shared hosting; purge any copy from CI bundle or cPanel npm install.
find "$VENV_NM" -type d -name 'sharp-wasm32' -prune -exec rm -rf {} + 2>/dev/null || true
rm -rf "$VENV_NM/@img/sharp-wasm32"
"$NPM" install semver@7 \
  sharp@0.33.5 \
  @img/sharp-linux-x64@0.33.5 \
  @img/sharp-libvips-linux-x64@1.0.4 \
  --include=optional --omit=dev --prefix "$VENV_LIB"

"$NODE_BIN" -e "
  const coerce = require('semver/functions/coerce');
  const sharp = require('sharp');
  const v = require('sharp/package.json').version;
  const c = coerce(v);
  const ver = c && c.version ? String(c.version) : null;
  if (!ver || !ver.startsWith('0.33.')) {
    throw new Error('Expected sharp 0.33.x, got ' + v);
  }
  try {
    require.resolve('@img/sharp-wasm32/package.json');
    throw new Error('@img/sharp-wasm32 still installed — remove it');
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND' && !String(e.message).includes('still installed')) throw e;
  }
  console.log('OK: semver + sharp', sharp.versions.sharp, '(no wasm32)');
"

# Passenger/LiteSpeed does not inherit SSH library paths — sharp needs libvips on LD_LIBRARY_PATH.
LIBVIPS_LIB="${VENV_NM}/@img/sharp-libvips-linux-x64/lib"
if [[ ! -f "${LIBVIPS_LIB}/libvips-cpp.so.42" ]]; then
  echo "error: ${LIBVIPS_LIB}/libvips-cpp.so.42 missing" >&2
  exit 1
fi

# Colocate libvips .so next to sharp's native binding ($ORIGIN lookup).
SHARP_LIB="${VENV_NM}/@img/sharp-linux-x64/lib"
if [[ -d "$SHARP_LIB" ]]; then
  for so in "${LIBVIPS_LIB}"/libvips*.so* "${LIBVIPS_LIB}"/libvips-cpp.so*; do
    [[ -e "$so" ]] || continue
    ln -sfn "$so" "${SHARP_LIB}/$(basename "$so")"
  done
  echo "Linked libvips libs into ${SHARP_LIB}"
fi

HTACCESS="${APP_ROOT}/.htaccess"
# LiteSpeed ignores PassengerEnvVar for Node — use SetEnv (see LiteSpeed CloudLinux docs).
if [[ -f "$HTACCESS" ]]; then
  if ! grep -q 'LD_LIBRARY_PATH' "$HTACCESS"; then
    cat >> "$HTACCESS" <<EOF

# sharp/libvips — LiteSpeed: use SetEnv (PassengerEnvVar is often ignored)
SetEnv LD_LIBRARY_PATH "${LIBVIPS_LIB}"
EOF
    echo "Added SetEnv LD_LIBRARY_PATH to .htaccess"
  elif grep -q 'PassengerEnvVar LD_LIBRARY_PATH' "$HTACCESS" && ! grep -q 'SetEnv LD_LIBRARY_PATH' "$HTACCESS"; then
    cat >> "$HTACCESS" <<EOF
SetEnv LD_LIBRARY_PATH "${LIBVIPS_LIB}"
EOF
    echo "Added SetEnv LD_LIBRARY_PATH (keep PassengerEnvVar if present)"
  fi
elif [[ ! -f "$HTACCESS" ]]; then
  cat > "$HTACCESS" <<EOF
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "${APP_ROOT}"
PassengerBaseURI "/"
PassengerNodejs "${NODE_BIN}"
PassengerAppType node
PassengerStartupFile start.cjs
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END

SetEnv LD_LIBRARY_PATH "${LIBVIPS_LIB}"
Options -Indexes
EOF
  echo "Wrote ${HTACCESS} with Passenger + SetEnv"
fi

if [[ ! -f "${APP_ROOT}/start.cjs" ]] && [[ -f "${APP_ROOT}/../start.cjs" ]]; then
  : # optional
fi
if [[ -f "${APP_ROOT}/start.cjs" ]]; then
  echo "Use cPanel startup file: start.cjs (sets LD_LIBRARY_PATH before server.js)"
fi

echo "Done. Restart the Node app in cPanel (Production), then:"
echo "  curl -sI https://fizam.ng/ | head -3"
echo "Keep data/fizam.db — do not delete on redeploy."
echo "cPanel env (required on Namecheap shared hosting):"
echo "  NODE_OPTIONS=--disable-wasm-trap-handler --require ${APP_ROOT}/preload-sharp.cjs"
echo "  LD_LIBRARY_PATH=${LIBVIPS_LIB}"
echo "Startup file: server.js (NOT launcher.js — lsnode requires the startup process to listen on PORT)"
