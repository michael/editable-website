#!/usr/bin/env sh
# In-container helper for data sync/backup operations. Invoked over SSH by
# scripts/data.sh so the orchestrator never has to nest sqlite quoting inside
# `fly ssh console -C`. Lives in the image (COPY /app), run via `sh`.
set -eu

DATA="${DATA_DIR:-/data}"
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ASSET_RE='^[a-f0-9]\{64\}\(\.\|$\)'

cmd="${1:-}"
[ -n "$cmd" ] && shift || true

case "$cmd" in
	prepare)
		# Staging + backup directories must exist before sftp put / VACUUM INTO.
		mkdir -p "$DATA/incoming" "$DATA/backups"
		;;

	backup)
		# Consistent point-in-time snapshot of the live DB (safe under writes).
		ts="$1"
		mkdir -p "$DATA/backups"
		sqlite3 "$DATA/db.sqlite3" "VACUUM INTO '$DATA/backups/$ts.db'"
		echo "$DATA/backups/$ts.db"
		;;

	snapshot)
		# Consistent snapshot to an arbitrary destination (used by pull).
		dest="$1"
		mkdir -p "$(dirname "$dest")"
		sqlite3 "$DATA/db.sqlite3" "VACUUM INTO '$dest'"
		;;

	promote-stage)
		# Validate an uploaded snapshot, then move it into the swap slot.
		part="$DATA/incoming/db.sqlite3.part"
		# -list -noheader: newer sqlite3 CLIs render box tables on a tty (fly ssh
		# allocates one), which would break the string comparison below.
		res=$(sqlite3 -list -noheader "$part" 'PRAGMA integrity_check')
		[ "$res" = "ok" ] || { echo "integrity_check failed: $res" >&2; exit 1; }
		mv "$part" "$DATA/incoming/db.sqlite3"
		;;

	cloud-snapshots)
		# User-facing list of restore points: one timestamp per stored change
		# set, chronological. Litestream internals (compaction levels, txids)
		# stay out of sight: the same transaction range exists at several
		# levels, so ranges are deduped keeping the lowest level, whose
		# 'created' stamp is the original write time — higher-level copies
		# carry misleading compaction-time stamps.
		# Timestamps are shown verbatim in litestream's native RFC3339 — the
		# same format --at takes, and what manual litestream commands expect.
		litestream ltx -config "$SCRIPT_DIR/litestream.yml" -level all "$DATA/db.sqlite3" |
			awk 'NR > 1 && NF >= 5 {
				key = $2 "-" $3
				if (!(key in lvl) || $1 + 0 < lvl[key] + 0) { lvl[key] = $1; created[key] = $5 }
			}
			END { for (k in created) print created[k] }' |
			sort -u
		;;

	cloud-restore)
		# Restore the database from the backup bucket into the staging file,
		# to be validated and promoted like any push. Optional arg: RFC3339
		# timestamp for point-in-time restore. Secrets come from the machine env.
		ts="${1:-}"
		mkdir -p "$DATA/incoming"
		rm -f "$DATA/incoming/db.sqlite3.part"
		if [ -n "$ts" ]; then
			litestream restore -config "$SCRIPT_DIR/litestream.yml" -timestamp "$ts" \
				-o "$DATA/incoming/db.sqlite3.part" "$DATA/db.sqlite3"
		else
			litestream restore -config "$SCRIPT_DIR/litestream.yml" \
				-o "$DATA/incoming/db.sqlite3.part" "$DATA/db.sqlite3"
		fi
		;;

	stage-backup)
		# Copy an existing on-volume backup into the swap slot (restore path).
		ts="$1"
		mkdir -p "$DATA/incoming"
		cp "$DATA/backups/$ts.db" "$DATA/incoming/db.sqlite3"
		;;

	summary)
		# One-line content summary of the live database, shown after restores
		# so the operator immediately sees what state they produced.
		sqlite3 -list -noheader "$DATA/db.sqlite3" \
			"SELECT count(*) || ' document(s), last edited ' || COALESCE(max(updated_at), 'unknown') FROM documents"
		node --disable-warning=ExperimentalWarning "$SCRIPT_DIR/check-assets.js" \
			"$DATA/db.sqlite3" "$DATA/assets" 2>/dev/null |
			sed -n 's/^OK: all \(.*\) referenced assets present$/\1 referenced asset(s)/p'
		;;

	integrity)
		# -list -noheader: callers compare this output to 'ok' (see promote-stage).
		sqlite3 -list -noheader "${1:-$DATA/db.sqlite3}" 'PRAGMA integrity_check'
		;;

	check-assets)
		node --disable-warning=ExperimentalWarning "$SCRIPT_DIR/check-assets.js" \
			"$DATA/db.sqlite3" "$DATA/assets"
		;;

	list-assets)
		ls -1 "$DATA/assets" 2>/dev/null | grep "$ASSET_RE" || true
		;;

	tar-assets)
		# Tar the named asset entries (files and/or variant dirs) to stdout dest.
		# Entry names are read from $DATA/incoming/asset-list.
		mkdir -p "$DATA/incoming"
		tar -czf "$DATA/incoming/assets.tgz" -C "$DATA/assets" \
			--exclude '.DS_Store' -T "$DATA/incoming/asset-list"
		;;

	extract-assets)
		# Additive: content-addressed names mean identical bytes, never clobber.
		tar -xzf "$DATA/incoming/assets.tgz" -C "$DATA/assets"
		rm -f "$DATA/incoming/assets.tgz" "$DATA/incoming/asset-list"
		;;

	clean-incoming)
		# Remove pull/transfer temporaries. Never touches a staged db.sqlite3
		# (that is a pending swap, cleared by the boot promote instead).
		rm -f "$DATA/incoming/pull.db" "$DATA/incoming/assets.tgz" \
			"$DATA/incoming/asset-list" "$DATA/incoming/db.sqlite3.part"
		;;

	list-backups)
		ls -1t "$DATA/backups"/*.db 2>/dev/null | xargs -r -n1 basename || true
		;;

	prune-backups)
		keep="$1"
		cd "$DATA/backups" 2>/dev/null || exit 0
		ls -1t ./*.db 2>/dev/null | tail -n +"$((keep + 1))" | xargs -r rm -f
		;;

	*)
		echo "unknown remote command: $cmd" >&2
		exit 2
		;;
esac
