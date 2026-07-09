#!/usr/bin/env bash
#
# Sync, back up, and recover the editable-website data folder (SQLite DB +
# content-addressed assets) between your local machine and a Fly.io deployment.
#
# Safety model
#   - The database is copied only as a `VACUUM INTO` snapshot — never a raw file
#     copy, which in WAL mode loses or corrupts data.
#   - Assets are content-addressed and immutable, so they sync additively and
#     are never rolled back; a DB rollback just re-points at the same pool
#     (safe within ASSET_GRACE_PERIOD_DAYS, which is exactly the post-push
#     window an undo is for).
#   - `push` snapshots the current remote DB first (on the volume AND mirrored
#     locally) so it can be undone, validates before and after, and swaps the
#     DB at boot with no live connection open.
#
# Usage
#   FLY_APP=<app> ./scripts/data.sh pull            # remote -> local
#   FLY_APP=<app> ./scripts/data.sh push [--yes]    # local  -> remote
#   FLY_APP=<app> ./scripts/data.sh restore <name>  # roll remote back to a backup
#   FLY_APP=<app> ./scripts/data.sh backups         # list remote backups
#   FLY_APP=<app> ./scripts/data.sh backup          # take a remote backup only
#
set -euo pipefail

DATA_DIR_LOCAL="${DATA_DIR:-data}"
BACKUP_DIR_LOCAL="data-backups"
REMOTE_DATA="/data"
KEEP_BACKUPS="${KEEP_BACKUPS:-10}"
APP="${FLY_APP:-}"
ASSET_RE='^[a-f0-9]{64}(\.|$)'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

die() { echo "Error: $*" >&2; exit 1; }
info() { echo "→ $*"; }

need_app() {
	[ -n "$APP" ] || die "Set FLY_APP to your Fly.io app name (e.g. FLY_APP=my-site $0 $1)"
}

confirm() {
	local reply
	printf '%s [y/N] ' "$1"
	read -r reply </dev/tty
	[ "$reply" = "y" ] || [ "$reply" = "Y" ] || die "Aborted."
}

MID=""
ensure_running() {
	# sed (not head) reads all input, avoiding a SIGPIPE that pipefail would trip.
	MID="$(fly machine list -a "$APP" -q | sed -n '1p')"
	[ -n "$MID" ] || die "No machine found for app '$APP'."
	fly machine start "$MID" -a "$APP" >/dev/null 2>&1 || true
}

# Verify remote DB health from command *output*, not exit code (fly ssh does
# not reliably propagate the remote exit status).
verify_remote() {
	local ctx="$1" out
	out="$(remote integrity 2>/dev/null || true)"
	printf '%s' "$out" | grep -qx 'ok' || die "Remote integrity_check failed — $ctx"
	out="$(remote check-assets 2>/dev/null || true)"
	printf '%s' "$out" | grep -q '^OK:' || die "Remote references missing assets — $ctx"
}

# Run the in-container helper over SSH (pty-less, binary-safe).
remote() {
	fly ssh console -a "$APP" --machine "$MID" -C "sh /app/scripts/remote-db.sh $*"
}
sftp_get() { fly ssh sftp get -a "$APP" --machine "$MID" "$1" "$2"; }
sftp_put() { fly ssh sftp put -a "$APP" --machine "$MID" "$1" "$2"; }

# Backup names double as identifiers, so they must be unique even for two
# operations in the same second (a random suffix, not just seconds).
timestamp() { printf '%s-%04x' "$(date +%Y%m%d-%H%M%S)" "$RANDOM"; }

# Consistent local DB snapshot to $1; verifies integrity + referenced assets.
snapshot_local_db() {
	local dest="$1"
	[ -f "$DATA_DIR_LOCAL/db.sqlite3" ] || die "No local database at $DATA_DIR_LOCAL/db.sqlite3"
	sqlite3 "$DATA_DIR_LOCAL/db.sqlite3" "VACUUM INTO '$dest'"
	[ "$(sqlite3 "$dest" 'PRAGMA integrity_check')" = "ok" ] || die "Local snapshot failed integrity_check"
	node --disable-warning=ExperimentalWarning "$SCRIPT_DIR/check-assets.js" \
		"$dest" "$DATA_DIR_LOCAL/assets" || die "Local snapshot references missing assets"
}

list_local_assets() {
	ls -1 "$DATA_DIR_LOCAL/assets" 2>/dev/null | grep -E "$ASSET_RE" | sort || true
}

# ---- push: local -> remote -------------------------------------------------
cmd_push() {
	need_app push
	local yes="${1:-}"

	info "Validating local data…"
	snapshot_local_db "$TMP/push.db"

	[ "$yes" = "--yes" ] || confirm "Replace the database on '$APP' with your local one?"

	ensure_running
	mkdir -p "$BACKUP_DIR_LOCAL"
	local ts; ts="$(timestamp)"

	info "Backing up current remote database ($ts)…"
	remote prepare
	remote backup "$ts" >/dev/null
	sftp_get "$REMOTE_DATA/backups/$ts.db" "$BACKUP_DIR_LOCAL/$ts.db"
	remote prune-backups "$KEEP_BACKUPS"

	info "Syncing assets (additive)…"
	list_local_assets >"$TMP/local_assets"
	remote list-assets | sort >"$TMP/remote_assets" || true
	comm -23 "$TMP/local_assets" "$TMP/remote_assets" >"$TMP/to_push" || true
	if [ -s "$TMP/to_push" ]; then
		info "  $(wc -l <"$TMP/to_push" | tr -d ' ') new asset entr(y/ies)"
		tar -czf "$TMP/assets.tgz" -C "$DATA_DIR_LOCAL/assets" --exclude '.DS_Store' -T "$TMP/to_push"
		sftp_put "$TMP/assets.tgz" "$REMOTE_DATA/incoming/assets.tgz"
		remote extract-assets
	else
		info "  assets already in sync"
	fi

	info "Staging database…"
	sftp_put "$TMP/push.db" "$REMOTE_DATA/incoming/db.sqlite3.part"
	remote promote-stage

	info "Restarting to swap in the new database…"
	fly machine restart "$MID" -a "$APP"

	info "Verifying…"
	verify_remote "restore with: $0 restore $ts"

	echo
	echo "✓ Pushed to '$APP'. Undo with:"
	echo "    FLY_APP=$APP $0 restore $ts"
}

# ---- pull: remote -> local -------------------------------------------------
cmd_pull() {
	need_app pull

	if command -v lsof >/dev/null 2>&1 && lsof "$DATA_DIR_LOCAL/db.sqlite3" >/dev/null 2>&1; then
		die "Local database is open — stop the dev server before pulling."
	fi

	ensure_running
	mkdir -p "$BACKUP_DIR_LOCAL" "$DATA_DIR_LOCAL/assets"
	local ts; ts="$(timestamp)"

	info "Snapshotting remote database…"
	remote prepare
	remote snapshot "$REMOTE_DATA/incoming/pull.db"
	sftp_get "$REMOTE_DATA/incoming/pull.db" "$TMP/pull.db"
	[ "$(sqlite3 "$TMP/pull.db" 'PRAGMA integrity_check')" = "ok" ] || die "Downloaded snapshot failed integrity_check"

	info "Syncing assets (additive)…"
	remote list-assets | sort >"$TMP/remote_assets" || true
	list_local_assets >"$TMP/local_assets"
	comm -13 "$TMP/local_assets" "$TMP/remote_assets" >"$TMP/to_pull" || true
	if [ -s "$TMP/to_pull" ]; then
		info "  $(wc -l <"$TMP/to_pull" | tr -d ' ') new asset entr(y/ies)"
		sftp_put "$TMP/to_pull" "$REMOTE_DATA/incoming/asset-list"
		remote tar-assets
		sftp_get "$REMOTE_DATA/incoming/assets.tgz" "$TMP/assets.tgz"
		tar -xzf "$TMP/assets.tgz" -C "$DATA_DIR_LOCAL/assets"
	else
		info "  assets already in sync"
	fi
	remote clean-incoming

	if [ -f "$DATA_DIR_LOCAL/db.sqlite3" ]; then
		info "Backing up current local database…"
		sqlite3 "$DATA_DIR_LOCAL/db.sqlite3" "VACUUM INTO '$BACKUP_DIR_LOCAL/local-$ts.db'"
	fi

	info "Swapping in pulled database…"
	rm -f "$DATA_DIR_LOCAL/db.sqlite3-wal" "$DATA_DIR_LOCAL/db.sqlite3-shm"
	mv "$TMP/pull.db" "$DATA_DIR_LOCAL/db.sqlite3"

	echo
	echo "✓ Pulled from '$APP'."
	if [ -f "$BACKUP_DIR_LOCAL/local-$ts.db" ]; then
		echo "  Previous local DB: $BACKUP_DIR_LOCAL/local-$ts.db"
	fi
}

# ---- restore: roll remote back to a backup ---------------------------------
cmd_restore() {
	need_app "restore <name>"
	local name="" yes=""
	for arg in "$@"; do
		case "$arg" in
			--yes) yes="--yes" ;;
			*) name="$arg" ;;
		esac
	done
	[ -n "$name" ] || die "Usage: $0 restore <name> [--yes]   (see: $0 backups)"
	name="${name%.db}"

	ensure_running
	[ "$yes" = "--yes" ] || confirm "Roll the database on '$APP' back to backup '$name'?"

	mkdir -p "$BACKUP_DIR_LOCAL"
	local ts; ts="$(timestamp)"
	info "Backing up current remote database before restore ($ts)…"
	remote prepare
	remote backup "$ts" >/dev/null
	sftp_get "$REMOTE_DATA/backups/$ts.db" "$BACKUP_DIR_LOCAL/$ts.db"

	if remote list-backups | grep -qx "$name.db"; then
		info "Staging backup from remote volume…"
		remote stage-backup "$name"
	elif [ -f "$BACKUP_DIR_LOCAL/$name.db" ]; then
		info "Backup not on volume — staging from local mirror…"
		sftp_put "$BACKUP_DIR_LOCAL/$name.db" "$REMOTE_DATA/incoming/db.sqlite3.part"
		remote promote-stage
	else
		die "Backup '$name' not found on volume or in $BACKUP_DIR_LOCAL/"
	fi

	info "Restarting to swap in the restored database…"
	fly machine restart "$MID" -a "$APP"

	info "Verifying…"
	local out
	out="$(remote integrity 2>/dev/null || true)"
	printf '%s' "$out" | grep -qx 'ok' || die "Remote integrity_check failed"
	out="$(remote check-assets 2>/dev/null || true)"
	printf '%s' "$out" | grep -q '^OK:' ||
		echo "Warning: restored DB references assets no longer on disk (past grace period?)"

	echo
	echo "✓ Restored '$APP' to '$name'. The pre-restore state is backup '$ts'."
}

cmd_backup() {
	need_app backup
	ensure_running
	mkdir -p "$BACKUP_DIR_LOCAL"
	local ts; ts="$(timestamp)"
	remote prepare
	remote backup "$ts" >/dev/null
	sftp_get "$REMOTE_DATA/backups/$ts.db" "$BACKUP_DIR_LOCAL/$ts.db"
	remote prune-backups "$KEEP_BACKUPS"
	echo "✓ Backup '$ts' (remote volume + $BACKUP_DIR_LOCAL/$ts.db)"
}

cmd_backups() {
	need_app backups
	ensure_running
	echo "Remote backups on '$APP':"
	remote list-backups
}

case "${1:-}" in
	push) shift; cmd_push "${1:-}" ;;
	pull) cmd_pull ;;
	restore) shift; cmd_restore "$@" ;;
	backup) cmd_backup ;;
	backups) cmd_backups ;;
	*)
		echo "Usage: FLY_APP=<app> $0 {pull|push [--yes]|restore <name> [--yes]|backup|backups}" >&2
		exit 2
		;;
esac
