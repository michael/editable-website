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
#   ./scripts/data.sh pull                        # remote -> local
#   ./scripts/data.sh push [--yes]                # local  -> remote
#   ./scripts/data.sh restore <name>              # roll remote back to a backup
#   ./scripts/data.sh restore-cloud [--at <ts>]   # roll remote back via the backup bucket (PITR)
#   ./scripts/data.sh pull-cloud [--at <ts>]      # rebuild local data/ from the backup bucket
#   ./scripts/data.sh backups                     # list remote backups
#   ./scripts/data.sh backup                      # take a remote backup only
#   ./scripts/data.sh cloud-snapshots             # list restore points in the backup bucket
#   ./scripts/data.sh verify                      # health-check the deployed database + assets
#   ./scripts/data.sh reset                       # reset local database to fresh demo content
#   ./scripts/data.sh help                        # print the command reference
#
# The target app is read from fly.toml (app = '...'), same as the fly CLI.
# Override with -a <app> or the FLY_APP environment variable (-a wins).
#
set -euo pipefail

DATA_DIR_LOCAL="${DATA_DIR:-data}"
BACKUP_DIR_LOCAL="data-backups"
REMOTE_DATA="/data"
KEEP_BACKUPS="${KEEP_BACKUPS:-10}"
APP="${FLY_APP:-}"
ASSET_RE='^[a-f0-9]{64}(\.|$)'

# Strip -a <app> from anywhere in the arg list (like fly's own commands).
ARGS=()
while [ $# -gt 0 ]; do
	case "$1" in
		-a)
			[ $# -ge 2 ] || { echo "Error: -a requires an app name" >&2; exit 2; }
			APP="$2"
			shift
			;;
		*) ARGS+=("$1") ;;
	esac
	shift
done
set -- ${ARGS[@]+"${ARGS[@]}"}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Fall back to the app declared in fly.toml (-a and FLY_APP take precedence).
if [ -z "$APP" ] && [ -f "$SCRIPT_DIR/../fly.toml" ]; then
	APP="$(sed -n -E "s/^app[[:space:]]*=[[:space:]]*[\"']?([A-Za-z0-9-]+).*/\1/p" "$SCRIPT_DIR/../fly.toml" | sed -n '1p')"
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

die() { echo "Error: $*" >&2; exit 1; }
info() { echo "→ $*"; }

# plural <n> <singular> [<plural>] → "1 entry" / "3 entries"
plural() { [ "$1" -eq 1 ] && echo "$1 $2" || echo "$1 ${3:-${2}s}"; }

need_app() {
	[ -n "$APP" ] || die "No app configured — set app = 'my-site' in fly.toml, or pass -a <app>"
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
	# flyctl pads the -q output with whitespace, so strip it.
	MID="$(fly machine list -a "$APP" -q | sed -n '1p' | tr -d '[:space:]')"
	[ -n "$MID" ] || die "No machine found for app '$APP'."
	fly machine start "$MID" -a "$APP" >/dev/null 2>&1 || true
}

# Run a remote helper command, retrying while the machine comes back after a
# restart. Prints the first non-empty output; fails only after all attempts —
# a failed ssh connection must never read as a failed check.
remote_retry() {
	local out
	for _ in 1 2 3 4 5 6; do
		out="$(remote "$@" 2>/dev/null || true)"
		if [ -n "$out" ]; then
			printf '%s' "$out"
			return 0
		fi
		sleep 5
	done
	return 1
}

# Verify remote DB health from command *output*, not exit code (fly ssh does
# not reliably propagate the remote exit status).
verify_remote() {
	local ctx="$1" out
	out="$(remote_retry integrity)" ||
		die "Could not reach '$APP' to verify (the machine may still be coming up) — the data operation itself succeeded; verify later with: npm run data:verify"
	printf '%s' "$out" | grep -qx 'ok' || die "Remote integrity_check failed — $ctx"
	out="$(remote_retry check-assets)" ||
		die "Could not reach '$APP' to verify assets — the data operation itself succeeded; verify later with: npm run data:verify"
	printf '%s' "$out" | grep -q '^OK:' || die "Remote references missing assets — $ctx"
}

# Run the in-container helper over SSH (pty-less, binary-safe).
remote() {
	fly ssh console -a "$APP" --machine "$MID" -C "sh /app/scripts/remote-db.sh $*"
}
sftp_get() { fly ssh sftp get -a "$APP" --machine "$MID" "$1" "$2"; }
sftp_put() { fly ssh sftp put -a "$APP" --machine "$MID" "$1" "$2"; }

# Backup names double as identifiers, so they must be unique even for two
# operations in the same second (a random suffix, not just seconds). They
# carry the app name so backups of multiple apps can share data-backups/.
# Timestamps are UTC in ISO 8601 basic format (20260712T143535Z) — filename-
# safe, and directly comparable to cloud restore points and fly logs.
timestamp() { printf '%s-%s-%04x' "$APP" "$(date -u +%Y%m%dT%H%M%SZ)" "$RANDOM"; }

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
	# Clear leftovers from any interrupted run — sftp put refuses to overwrite.
	remote clean-incoming
	remote backup "$ts" >/dev/null
	sftp_get "$REMOTE_DATA/backups/$ts.sqlite3" "$BACKUP_DIR_LOCAL/$ts.sqlite3"
	remote prune-backups "$KEEP_BACKUPS"

	info "Syncing assets (additive)…"
	list_local_assets >"$TMP/local_assets"
	remote list-assets | sort >"$TMP/remote_assets" || true
	comm -23 "$TMP/local_assets" "$TMP/remote_assets" >"$TMP/to_push" || true
	if [ -s "$TMP/to_push" ]; then
		info "  $(plural "$(wc -l <"$TMP/to_push" | tr -d ' ')" 'new asset entry' 'new asset entries')"
		# COPYFILE_DISABLE: keep macOS tar from embedding xattr headers that
		# GNU tar on the server warns about.
		COPYFILE_DISABLE=1 tar -czf "$TMP/assets.tgz" -C "$DATA_DIR_LOCAL/assets" --exclude '.DS_Store' -T "$TMP/to_push"
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
	verify_remote "restore with: npm run data:restore $ts"

	echo
	echo "✓ Pushed to '$APP'. Undo with:"
	echo "    npm run data:restore $ts -- -a $APP"
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
	# Clear leftovers from any interrupted run — VACUUM INTO and sftp put both
	# refuse to overwrite existing files.
	remote clean-incoming
	remote snapshot "$REMOTE_DATA/incoming/pull.db"
	sftp_get "$REMOTE_DATA/incoming/pull.db" "$TMP/pull.db"
	[ "$(sqlite3 "$TMP/pull.db" 'PRAGMA integrity_check')" = "ok" ] || die "Downloaded snapshot failed integrity_check"

	info "Syncing assets (additive)…"
	remote list-assets | sort >"$TMP/remote_assets" || true
	list_local_assets >"$TMP/local_assets"
	comm -13 "$TMP/local_assets" "$TMP/remote_assets" >"$TMP/to_pull" || true
	if [ -s "$TMP/to_pull" ]; then
		info "  $(plural "$(wc -l <"$TMP/to_pull" | tr -d ' ')" 'new asset entry' 'new asset entries')"
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
		sqlite3 "$DATA_DIR_LOCAL/db.sqlite3" "VACUUM INTO '$BACKUP_DIR_LOCAL/local-$ts.sqlite3'"
	fi

	info "Swapping in pulled database…"
	rm -f "$DATA_DIR_LOCAL/db.sqlite3-wal" "$DATA_DIR_LOCAL/db.sqlite3-shm"
	mv "$TMP/pull.db" "$DATA_DIR_LOCAL/db.sqlite3"

	echo
	echo "✓ Pulled from '$APP'."
	if [ -f "$BACKUP_DIR_LOCAL/local-$ts.sqlite3" ]; then
		echo "  Previous local DB: $BACKUP_DIR_LOCAL/local-$ts.sqlite3"
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
	[ -n "$name" ] || die "Usage: npm run data:restore <name> [-- --yes]   (see: npm run data:backups)"
	name="${name%.sqlite3}"

	ensure_running
	[ "$yes" = "--yes" ] || confirm "Roll the database on '$APP' back to backup '$name'?"

	mkdir -p "$BACKUP_DIR_LOCAL"
	local ts; ts="$(timestamp)"
	info "Backing up current remote database before restore ($ts)…"
	remote prepare
	# Clear leftovers from any interrupted run — sftp put refuses to overwrite.
	remote clean-incoming
	remote backup "$ts" >/dev/null
	sftp_get "$REMOTE_DATA/backups/$ts.sqlite3" "$BACKUP_DIR_LOCAL/$ts.sqlite3"

	if remote list-backups | grep -qx "$name.sqlite3"; then
		info "Staging backup from remote volume…"
		remote stage-backup "$name"
	elif [ -f "$BACKUP_DIR_LOCAL/$name.sqlite3" ]; then
		info "Backup not on volume — staging from local mirror…"
		sftp_put "$BACKUP_DIR_LOCAL/$name.sqlite3" "$REMOTE_DATA/incoming/db.sqlite3.part"
		remote promote-stage
	else
		die "Backup '$name' not found on volume or in $BACKUP_DIR_LOCAL/"
	fi

	info "Restarting to swap in the restored database…"
	fly machine restart "$MID" -a "$APP"

	info "Verifying…"
	local out
	out="$(remote_retry integrity)" ||
		die "Could not reach '$APP' to verify (the machine may still be coming up) — the restore itself succeeded; verify later with: npm run data:verify"
	printf '%s' "$out" | grep -qx 'ok' || die "Remote integrity_check failed"
	out="$(remote_retry check-assets)" || out=""
	printf '%s' "$out" | grep -q '^OK:' ||
		echo "Warning: restored DB references assets no longer on disk (past grace period?)"

	echo
	echo "✓ Restored '$APP' to '$name': $(remote summary 2>/dev/null | tr '\n' ' ' | sed 's/ $//')."
	echo "  The pre-restore state is backup '$ts'."
}

# ---- restore-cloud: point-in-time restore from the backup bucket -----------
cmd_restore_cloud() {
	need_app restore-cloud
	local at="" yes=""
	while [ $# -gt 0 ]; do
		case "$1" in
			--yes) yes="--yes" ;;
			--at)
				shift
				at="${1:-}"
				[ -n "$at" ] || die "--at requires an RFC3339 timestamp (e.g. 2026-07-10T15:00:00Z)"
				;;
			*) die "Unknown argument: $1   (usage: npm run data:restore-cloud [-- --at <timestamp>] [-- --yes])" ;;
		esac
		shift
	done

	ensure_running
	[ "$yes" = "--yes" ] || confirm "Roll the database on '$APP' back to ${at:-the latest bucket state}?"

	mkdir -p "$BACKUP_DIR_LOCAL"
	local ts; ts="$(timestamp)"
	info "Backing up current remote database before restore ($ts)…"
	remote prepare
	remote clean-incoming
	remote backup "$ts" >/dev/null
	sftp_get "$REMOTE_DATA/backups/$ts.sqlite3" "$BACKUP_DIR_LOCAL/$ts.sqlite3"

	info "Restoring database from bucket${at:+ (as of $at)}…"
	remote cloud-restore "$at"
	remote promote-stage

	info "Restarting to swap in the restored database…"
	fly machine restart "$MID" -a "$APP"

	info "Verifying…"
	verify_remote "roll back with: npm run data:restore $ts"

	echo
	echo "✓ Restored '$APP' from the bucket${at:+ (as of $at)}: $(remote summary 2>/dev/null | tr '\n' ' ' | sed 's/ $//')."
	echo "  The pre-restore state is backup '$ts'."
}

# ---- pull-cloud: rebuild the local data/ folder from the backup bucket -----
cmd_pull_cloud() {
	local at=""
	while [ $# -gt 0 ]; do
		case "$1" in
			--at)
				shift
				at="${1:-}"
				[ -n "$at" ] || die "--at requires an RFC3339 timestamp (e.g. 2026-07-12T13:00:00Z)"
				;;
			*) die "Unknown argument: $1   (usage: npm run data:pull-cloud [-- --at <timestamp>])" ;;
		esac
		shift
	done

	# Prefer the project-local, version-pinned binary (npm run litestream:install).
	PATH="$SCRIPT_DIR/../node_modules/.bin:$PATH"
	command -v litestream >/dev/null 2>&1 ||
		die "litestream is not installed — run: npm run litestream:install"

	# Bucket credentials from the environment, falling back to .env.
	if [ -z "${BUCKET_NAME:-}" ] && [ -f .env ]; then
		set -a
		# shellcheck disable=SC1091
		. ./.env
		set +a
	fi
	[ -n "${BUCKET_NAME:-}" ] || die "Set BUCKET_NAME (and the AWS_* credentials) in .env or the environment"

	if command -v lsof >/dev/null 2>&1 && lsof "$DATA_DIR_LOCAL/db.sqlite3" >/dev/null 2>&1; then
		die "Local database is open — stop the dev server before pulling."
	fi

	mkdir -p "$BACKUP_DIR_LOCAL" "$DATA_DIR_LOCAL/assets"
	local ts; ts="$(date -u +%Y%m%dT%H%M%SZ)"

	info "Restoring database from bucket${at:+ (as of $at)}…"
	export DATA_DIR="$DATA_DIR_LOCAL"
	if [ -n "$at" ]; then
		litestream restore -config "$SCRIPT_DIR/litestream.yml" -timestamp "$at" -o "$TMP/cloud.db" "$DATA_DIR_LOCAL/db.sqlite3"
	else
		litestream restore -config "$SCRIPT_DIR/litestream.yml" -o "$TMP/cloud.db" "$DATA_DIR_LOCAL/db.sqlite3"
	fi
	[ "$(sqlite3 "$TMP/cloud.db" 'PRAGMA integrity_check')" = "ok" ] || die "Restored snapshot failed integrity_check"

	if [ -f "$DATA_DIR_LOCAL/db.sqlite3" ]; then
		info "Backing up current local database…"
		sqlite3 "$DATA_DIR_LOCAL/db.sqlite3" "VACUUM INTO '$BACKUP_DIR_LOCAL/local-$ts.sqlite3'"
	fi

	info "Swapping in restored database…"
	rm -f "$DATA_DIR_LOCAL/db.sqlite3-wal" "$DATA_DIR_LOCAL/db.sqlite3-shm"
	mv "$TMP/cloud.db" "$DATA_DIR_LOCAL/db.sqlite3"

	info "Downloading referenced assets…"
	node --disable-warning=ExperimentalWarning "$SCRIPT_DIR/restore-assets.js"

	echo
	echo "✓ Restored local data/ from the bucket."
}

# ---- reset: reset the local database to fresh demo content -----------------
cmd_reset() {
	local yes="${1:-}"

	if command -v lsof >/dev/null 2>&1 && lsof "$DATA_DIR_LOCAL/db.sqlite3" >/dev/null 2>&1; then
		die "Local database is open — stop the dev server before resetting."
	fi

	[ "$yes" = "--yes" ] || confirm "Reset your local database to fresh demo content? (assets stay in place)"

	local ts; ts="$(date -u +%Y%m%dT%H%M%SZ)"
	if [ -f "$DATA_DIR_LOCAL/db.sqlite3" ]; then
		info "Backing up current local database…"
		mkdir -p "$BACKUP_DIR_LOCAL"
		sqlite3 "$DATA_DIR_LOCAL/db.sqlite3" "VACUUM INTO '$BACKUP_DIR_LOCAL/local-$ts.sqlite3'"
	fi

	# Only the database is reset. Assets stay in place: the pool is
	# content-addressed, and files the fresh database doesn't reference are
	# cleaned up by the grace-period sweep.
	rm -f "$DATA_DIR_LOCAL/db.sqlite3" "$DATA_DIR_LOCAL/db.sqlite3-wal" "$DATA_DIR_LOCAL/db.sqlite3-shm"

	echo
	echo "✓ Local database cleared. Start the dev server (npm run dev) to get a freshly seeded site."
	if [ -f "$BACKUP_DIR_LOCAL/local-$ts.sqlite3" ]; then
		echo "  Previous database: $BACKUP_DIR_LOCAL/local-$ts.sqlite3"
	fi
}

cmd_backup() {
	need_app backup
	ensure_running
	mkdir -p "$BACKUP_DIR_LOCAL"
	local ts; ts="$(timestamp)"
	remote prepare
	remote backup "$ts" >/dev/null
	sftp_get "$REMOTE_DATA/backups/$ts.sqlite3" "$BACKUP_DIR_LOCAL/$ts.sqlite3"
	remote prune-backups "$KEEP_BACKUPS"
	echo "✓ Backup '$ts' (remote volume + $BACKUP_DIR_LOCAL/$ts.sqlite3)"
}

cmd_backups() {
	need_app backups
	ensure_running
	echo "Remote backups on '$APP':"
	remote list-backups
}

# ---- verify: health-check the deployment ------------------------------------
cmd_verify() {
	need_app verify
	ensure_running
	info "Verifying '$APP'…"
	verify_remote "list restore points with: npm run data:backups"
	echo "✓ '$APP' is healthy: $(remote summary 2>/dev/null | tr '\n' ' ' | sed 's/ $//')."
}

cmd_cloud_snapshots() {
	need_app cloud-snapshots
	ensure_running
	echo "Restore points for '$APP', oldest first — restore one with restore-cloud/pull-cloud --at <timestamp>."
	echo "Older points get consolidated over time: recent history is fine-grained, old history coarser."
	remote cloud-snapshots
}

usage() {
	cat <<'EOF'
Data commands (via npm run; positional arguments work directly, flags need a -- separator):

  npm run data:pull                            copy the live site's data to your machine
  npm run data:push [-- --yes]                 replace the live site's data with your local state
  npm run data:backup                          snapshot the live database
  npm run data:backups                         list the live site's snapshots
  npm run data:restore <name> [-- --yes]       roll the live site back to a snapshot
  npm run data:cloud-snapshots                 list restore points in the backup bucket
  npm run data:restore-cloud [-- --at <ts>]    roll the live site back to a point in time
  npm run data:pull-cloud [-- --at <ts>]       rebuild local data/ from the backup bucket
  npm run data:verify                          health-check the deployed database + assets
  npm run data:reset [-- --yes]                reset local database to fresh demo content (assets stay)
  npm run litestream:install                   one-time local setup for the cloud commands

The target app comes from fly.toml; override with:  -- -a <app>
Snapshot names (<name>) look like my-site-20260712T143535Z-3f2a (file extension optional) — list them with data:backups.
Timestamps (<ts>) are RFC3339 UTC, e.g. 2026-07-12T14:35:35Z — list them with data:cloud-snapshots.
See README → Backup, sync & recovery for details.
EOF
}

case "${1:-}" in
	push) shift; cmd_push "${1:-}" ;;
	pull) cmd_pull ;;
	restore) shift; cmd_restore "$@" ;;
	restore-cloud) shift; cmd_restore_cloud "$@" ;;
	pull-cloud) shift; cmd_pull_cloud "$@" ;;
	backup) cmd_backup ;;
	backups) cmd_backups ;;
	cloud-snapshots) cmd_cloud_snapshots ;;
	verify) cmd_verify ;;
	reset) shift; cmd_reset "${1:-}" ;;
	help) usage ;;
	*) usage >&2; exit 2 ;;
esac
