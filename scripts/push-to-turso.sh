#!/usr/bin/env bash
#
# Push the local SQLite database to the live Turso database.
#
# What it does (in order):
#   1. Backs up the CURRENT live Turso DB to backups/ (safety net).
#   2. Checkpoints the local WAL into ./data/fizam.db (so no recent data is lost).
#   3. Dumps the local DB to a .sql file.
#   4. Destroys and recreates the live Turso DB from the local file (same name -> same URL).
#   5. Prints the new auth token + URL to put into Vercel.
#
# Run from WSL, inside the project root:
#   cd /mnt/c/wamp64/www/fizam.ng
#   bash scripts/push-to-turso.sh
#
set -euo pipefail

DB_NAME="fizam"
LOCAL_DB="./data/fizam.db"
TS="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="./backups"
LIVE_BACKUP="${BACKUP_DIR}/live-${DB_NAME}-${TS}.sql"
LOCAL_DUMP="${BACKUP_DIR}/local-dump-${TS}.sql"

echo "==> Project: $(pwd)"
echo "==> Target Turso DB: ${DB_NAME}"
echo

# --- Sanity checks ---------------------------------------------------------
command -v turso   >/dev/null 2>&1 || { echo "ERROR: turso CLI not found in PATH (run: source ~/.bashrc)"; exit 1; }
command -v sqlite3 >/dev/null 2>&1 || { echo "ERROR: sqlite3 not found (run: sudo apt install -y sqlite3)"; exit 1; }
[ -f "${LOCAL_DB}" ] || { echo "ERROR: local DB not found at ${LOCAL_DB}"; exit 1; }

mkdir -p "${BACKUP_DIR}"

echo "This will REPLACE all data in the live Turso DB '${DB_NAME}' with your local copy."
read -r -p "Type 'yes' to continue: " CONFIRM
[ "${CONFIRM}" = "yes" ] || { echo "Aborted."; exit 1; }
echo

# --- 1. Back up the current live DB ---------------------------------------
echo "==> [1/5] Backing up live DB to ${LIVE_BACKUP} ..."
turso db shell "${DB_NAME}" ".dump" > "${LIVE_BACKUP}"
echo "    Live backup saved ($(wc -l < "${LIVE_BACKUP}") lines)."
echo

# --- 2. Checkpoint local WAL ----------------------------------------------
echo "==> [2/5] Checkpointing local WAL into ${LOCAL_DB} ..."
sqlite3 "${LOCAL_DB}" "PRAGMA wal_checkpoint(TRUNCATE); VACUUM;"
echo "    Done. WAL folded into main file."
echo

# --- 3. Dump local DB (portable copy) -------------------------------------
echo "==> [3/5] Dumping local DB to ${LOCAL_DUMP} ..."
sqlite3 "${LOCAL_DB}" ".dump" > "${LOCAL_DUMP}"

# Strip Payload's dev-mode marker so the production build does not hang on the
# interactive "you've run in dev mode, run migrations? (y/N)" prompt.
sed -i "/,'dev',-1,/d" "${LOCAL_DUMP}"
echo "    Local dump saved ($(wc -l < "${LOCAL_DUMP}") lines); dev-mode marker stripped."
echo

# --- 4. Recreate live DB from the dump ------------------------------------
echo "==> [4/5] Recreating live DB '${DB_NAME}' from local data ..."
turso db destroy "${DB_NAME}" --yes
# The destroyed namespace needs a moment before the name can be reused.
sleep 5
CREATED=""
for attempt in 1 2 3 4 5 6; do
  if turso db create "${DB_NAME}"; then CREATED="yes"; break; fi
  echo "    create attempt ${attempt} failed (namespace still freeing) — retrying in 10s ..."
  sleep 10
done
[ -n "${CREATED}" ] || { echo "ERROR: could not recreate '${DB_NAME}'. Restore manually: turso db shell ${DB_NAME} < ${LOCAL_DUMP}"; exit 1; }

# A freshly created DB's host needs a few seconds to become routable, otherwise
# the load fails with "error code 502: no route configured for host ...".
echo "    Waiting for the new endpoint to become routable ..."
sleep 5
LOADED=""
for attempt in 1 2 3 4 5 6 7 8; do
  if turso db shell "${DB_NAME}" < "${LOCAL_DUMP}"; then LOADED="yes"; break; fi
  echo "    load attempt ${attempt} failed (endpoint warming up) — retrying in 8s ..."
  sleep 8
done
[ -n "${LOADED}" ] || { echo "ERROR: data load failed. Retry manually: turso db shell ${DB_NAME} < ${LOCAL_DUMP}"; exit 1; }
echo "    Live DB recreated and loaded from ${LOCAL_DUMP}."
echo

# --- 5. Baseline the migration log ----------------------------------------
# The local dump comes from a push-mode dev DB, whose payload_migrations log
# only records the first few migrations even though the dump already contains
# the FULL current schema. In production Payload runs "pending" migrations on
# connect, so any unrecorded migration tries to re-create tables that already
# exist -> "table already exists" build failure on Vercel.
# Mark every migration file as applied (idempotent) so production skips them.
echo "==> [5/6] Baselining payload_migrations so production skips existing schema ..."
BASELINE_SQL="${BACKUP_DIR}/baseline-migrations-${TS}.sql"
: > "${BASELINE_SQL}"
for f in src/migrations/*.ts; do
  name="$(basename "${f}" .ts)"
  [ "${name}" = "index" ] && continue
  printf "INSERT INTO payload_migrations (name, batch) SELECT '%s', 1 WHERE NOT EXISTS (SELECT 1 FROM payload_migrations WHERE name = '%s');\n" "${name}" "${name}" >> "${BASELINE_SQL}"
done
if [ ! -s "${BASELINE_SQL}" ]; then
  echo "    WARNING: no migration files found under src/migrations/ — skipping baseline."
else
  BASELINED=""
  for attempt in 1 2 3 4 5; do
    if turso db shell "${DB_NAME}" < "${BASELINE_SQL}"; then BASELINED="yes"; break; fi
    echo "    baseline attempt ${attempt} failed — retrying in 5s ..."
    sleep 5
  done
  [ -n "${BASELINED}" ] || { echo "ERROR: migration baseline failed. Apply manually: turso db shell ${DB_NAME} < ${BASELINE_SQL}"; exit 1; }
  echo "    Migration log baselined ($(grep -c INSERT "${BASELINE_SQL}") migrations marked applied)."
fi
echo

# --- 6. Output new connection details -------------------------------------
echo "==> [6/6] New connection details for Vercel:"
echo
echo "DATABASE_URI=$(turso db show "${DB_NAME}" --url)"
echo -n "DATABASE_AUTH_TOKEN="
turso db tokens create "${DB_NAME}"
echo
echo "Update those two values in Vercel -> Settings -> Environment Variables, then redeploy."
echo "Live backup kept at: ${LIVE_BACKUP}"
