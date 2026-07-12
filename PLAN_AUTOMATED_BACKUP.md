# Plan: automated remote backups

Status: implemented (see README → Automated backups for the user-facing docs). Continuous off-site backups (database + assets) to an S3-compatible bucket, with point-in-time recovery. Suspend mode stays fully supported. Implementation notes: Litestream runs as a supervised sidecar spawned from `scripts/run-cloud-boot.js` (not `-exec` — a Litestream crash must not take the site down); asset S3 access uses `aws4fetch` in `scripts/s3.js`; Litestream is pinned in the Dockerfile.

## Design principle: write-driven, not time-driven

No cron jobs, on the machine or anywhere else. Every backup action is triggered by a write or by boot, never by a clock. A suspended machine writes nothing, so there is nothing to miss — which is what makes suspend mode (`auto_stop_machines = "suspend"`) safe to keep.

## Backing up (server → bucket)

Three mechanisms, all upload-only. None of them ever changes anything on the server.

### Database: Litestream

[Litestream](https://litestream.io) tails the SQLite WAL (Editable already runs WAL mode) and streams every change to the bucket. This gives point-in-time recovery, not just discrete snapshots. It wraps the app process (`litestream replicate -exec "<app start command>"`), so it runs exactly when the app runs and suspends with it.

### Assets: mirror on upload

When a user uploads an asset, the server also puts it to the bucket. Async and best-effort — a bucket hiccup must never fail the user's upload, so a mirror can occasionally be missed.

### Assets: reconciliation sweep at boot

Catches those misses. At boot, the server diffs the filenames in `/data/assets` against the bucket's `assets/` listing and uploads whatever the bucket lacks. Filenames are content hashes and files are immutable, so a name present on both sides proves the content matches — the sweep is a plain set difference. Boots happen on every deploy and every data-push swap, so misses are repaired promptly.

### The bucket is append-only

Local asset garbage collection (`ASSET_GRACE_PERIOD_DAYS`) is never mirrored to the bucket, so restores from the bucket are not bounded by the grace period — every asset ever uploaded is still there. An optional S3 lifecycle rule can archive cold objects if storage ever matters.

## Restoring (bucket → server or laptop)

Restores are separate mechanisms and run only in two cases: explicitly invoked, or at boot when the volume has **no database at all** (disaster recovery). A normal boot on a healthy machine never downloads anything.

All restores download **only the assets the restored database references** — the database lists its asset hashes, so despite the bucket holding full history, a restore transfers just the site's working set as of that moment, never the accumulated past. Unreferenced assets inside the grace window are not restored either: they stay in the bucket, and any later restore to an earlier point fetches its own referenced set — against the bucket, every database state is self-sufficient.

1. **Disaster recovery, automatic**: if the volume is empty at boot, `litestream restore -if-db-not-exists` pulls the database from the bucket, then the assets that database references are downloaded. "Your volume died" recovery = `fly deploy` against a fresh volume.
2. **Point-in-time restore to production**: `npm run data:restore-cloud -- --at "2026-07-10T15:00"` — restores the database to that moment and ships it through the existing staged-swap path, inheriting the push safeguards (pre-restore backup, swap at boot, verification).
3. **Restore to local**: rebuild a full working copy on your machine from nothing but the bucket — database via litestream restore, then the assets it references. Covers "new laptop" and "inspect the site as of time X" without touching production.

## Boot order

1. Promote staged database if present (existing swap mechanism, unchanged)
2. `litestream restore -if-db-not-exists` (no-op unless the volume is empty)
3. Asset reconciliation sweep (upload-only)
4. Start the app under `litestream replicate -exec`

## Configuration

Opt-in by presence: if `BUCKET_NAME` is set, automated backups run; if not, nothing changes. The variable names match what Tigris injects, so on Fly the whole setup is one command (`fly storage create`). Any S3-compatible provider (R2, AWS S3, MinIO) works by setting the same secrets manually:

| Variable | Purpose | Example |
| --- | --- | --- |
| `BUCKET_NAME` | Bucket to back up into. Presence enables the feature. | `my-site-backup` |
| `AWS_ENDPOINT_URL_S3` | S3 endpoint of the provider | `https://fly.storage.tigris.dev` |
| `AWS_REGION` | Bucket region | `auto` |
| `AWS_ACCESS_KEY_ID` | Access key | — |
| `AWS_SECRET_ACCESS_KEY` | Secret key | — |

Bucket layout: `db/` for the Litestream replica, `assets/` for the asset mirror. One bucket per site, matching the one-checkout-per-app rule.

## Relation to the manual data scripts

Unchanged and complementary: `data:push`/`data:pull`/`data:backup`/`data:restore` remain the tools for deliberate, operational state moves (including the pre-push backup ritual). The bucket is the always-on disaster-recovery and point-in-time layer underneath.

## Suspend edge case

Litestream syncs on an interval (default 1s), so a suspend arriving immediately after a write can hold an unshipped segment in memory. Fly's suspend preserves memory, so the segment ships on the next wake. Data is lost only if the volume is destroyed before any future wake — a seconds-wide window. Documented, not engineered around.

## Implementation order

Each step independently shippable:

1. **Litestream core**: binary in the image, conditional wrap in the start script, `restore -if-db-not-exists` at boot.
2. **Asset mirroring**: put-to-bucket in the save path + boot sweep.
3. **Restore commands**: `data:restore-cloud` and restore-to-local.
4. **Documentation**: finalize the README "Automated backups" section (remove its "planned" status note).

## Invariants and open questions

- **Litestream always starts after the promote step.** A swapped-in database needs a fresh replication generation; the boot order above guarantees it.
- **Process supervision** (settle before step 1): signal forwarding and exit codes through `litestream -exec`; a Litestream failure must degrade to "no replication + loud logs", never take the site down.
- **Checkpointing**: Litestream wants to control WAL checkpointing — verify `node:sqlite`'s auto-checkpoint doesn't fight it; may need disabling when replication is active.
- **Fresh-volume assets**: re-download to the volume vs. serve from the bucket — pick one for the disaster-recovery path.
