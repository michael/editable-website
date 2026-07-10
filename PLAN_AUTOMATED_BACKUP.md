# Plan: automated remote backups

Status: draft, not implemented. This plan adds continuous, automated off-site backups (database + assets) to an S3-compatible bucket, with point-in-time recovery — while keeping Fly's suspend mode a first-class option.

## Design principle: write-driven, not time-driven

No cron jobs, on the machine or anywhere else. A suspended machine is by definition one where nothing is being written, so a backup system that reacts to writes has nothing to miss while suspended. Every piece below is triggered by a write or by boot — never by a clock.

This is what makes suspend mode (`auto_stop_machines = "suspend"`) fully supported: small sites get scale-to-zero economics and lower energy use without a weaker backup story.

## The two data streams

### Database → Litestream (continuous replication)

[Litestream](https://litestream.io) tails the SQLite WAL (Editable already runs WAL mode) and streams segments to the bucket. It provides point-in-time recovery: restore the database to any moment, not just to discrete snapshots.

- Runs inside the machine, wrapping the app process: `litestream replicate -exec "<app start command>"`. Its lifecycle is the app's lifecycle — awake when the app is awake, suspended when it suspends.
- Idle when nothing writes. No writes can happen while suspended, so nothing is missed.

### Assets → mirror on upload + reconcile on boot

Assets only enter the system through an HTTP upload to the app — the machine is guaranteed awake at that moment. Two mechanisms, both write/boot-driven:

1. **Mirror on upload**: when an asset is saved, also put it to the bucket (async, non-blocking — an S3 hiccup must not fail the user's upload).
2. **Reconciliation sweep on boot**: compare the local `assets/` directory against the bucket listing and upload whatever is missing. Content-addressed, immutable names make this trivially correct and cheap. Boot happens on every deploy and every data-push swap, so the sweep runs often without any scheduler.

Deliberately *not* coupled to Litestream activity — the app's own write path is the simpler, more direct hook.

### The bucket is append-only

Local asset garbage collection (`ASSET_GRACE_PERIOD_DAYS`) is never mirrored to the bucket. Consequence: restoring an old database against the bucket has **no grace-period bound** — every asset ever uploaded is still there. The grace period only limits restores against the volume's local asset pool. Storage is cheap; an optional S3 lifecycle rule can archive cold objects later if needed.

## Suspend mode analysis

- While suspended: zero writes, zero backup work needed. "Nothing happening" is a correct state, not a missed schedule.
- The one real window: Litestream syncs on an interval (default 1s). A suspend arriving immediately after a write can freeze a not-yet-shipped segment in memory. Fly's suspend preserves memory and resumes on the next request, so the segment ships on wake. Data is at risk only in the scenario "write → suspend → volume destroyed before any future wake" — a seconds-wide window on a site someone was actively editing. Documented honestly; not worth engineering around.

## User-facing behavior

### Setup: create bucket, set secrets, done

- Default documented path: [Tigris](https://fly.io/docs/tigris/) via `fly storage create` — one command, Fly-native, injects the S3 credentials as secrets automatically.
- Any S3-compatible store (Cloudflare R2, AWS S3, MinIO) works via the same env vars: endpoint, bucket, access key, secret key.
- **Opt-in by presence**: if `BUCKET_NAME` is set, replication runs; if not, everything behaves exactly as today. No config file, no flag.

### Configuration (env vars / secrets)

The names match what `fly storage create` (Tigris) injects, so the default path is zero-config. Any S3-compatible provider works by setting the same variables manually:

| Variable | Purpose | Example |
| --- | --- | --- |
| `BUCKET_NAME` | Bucket to replicate into. Presence enables automated backups. | `my-site-backup` |
| `AWS_ENDPOINT_URL_S3` | S3 endpoint of the provider | `https://fly.storage.tigris.dev` |
| `AWS_REGION` | Bucket region | `auto` |
| `AWS_ACCESS_KEY_ID` | Access key | — |
| `AWS_SECRET_ACCESS_KEY` | Secret key | — |

Litestream reads the AWS credential variables natively; endpoint and bucket feed its replica config. The asset mirror uses the same five variables. Bucket layout: `db/` for the Litestream replica, `assets/` for the asset mirror — one bucket per site, mirroring the one-checkout-per-app rule.

### Disaster recovery is automatic

Boot order becomes:

1. Promote staged database if present (existing swap mechanism, unchanged)
2. `litestream restore -if-db-not-exists` — a fresh volume self-restores from the bucket
3. Asset reconciliation sweep
4. Start the app under `litestream replicate -exec`

Meaning: "your volume died" recovery is `fly deploy` against a fresh volume. The database comes back from the bucket; assets referenced by it are re-downloaded (or served from the bucket mirror — implementation detail to settle).

### Restore to production, point-in-time

A command that restores the database to a given moment and ships it through the **existing staged-swap path**, inheriting all the push safeguards (pre-restore backup, swap at boot with no open connection, post-swap verification):

```sh
npm run data:restore-cloud -- --at "2026-07-10T15:00"
```

### Restore to local

Rebuild a full local working copy from nothing but the bucket: litestream-restore the database into `data/`, then download the assets it references. Covers "new laptop" and "audit what the site looked like at time X" without touching production.

### Roles of the existing tools (unchanged)

- `data:push` / `data:pull` / `data:backup` / `data:restore` — deliberate, operational snapshots you take and move by hand. The pre-push backup ritual does not change.
- Litestream + bucket — always-on disaster recovery and point-in-time history.

They complement each other; neither replaces the other.

## Implementation order

Each step is independently shippable:

1. **Litestream core**: binary in the Docker image, conditional wrap in the start script, `restore -if-db-not-exists` at boot. Highest value per line — continuous DB backup plus disaster recovery.
2. **Asset mirroring**: put-to-bucket in the asset save path + boot reconciliation sweep.
3. **Restore commands**: `data:restore-cloud` (production PITR) and local cloud restore.
4. **Documentation**: "Automated backups" README section — setup, the suspend statement, both restore paths, and the roles table above.

## Invariants and open questions

- **Litestream starts after the promote step, always.** A database swap must be followed by Litestream opening a fresh replication generation; the boot ordering above guarantees this because swaps only happen at boot.
- **Process supervision semantics** (settle before coding step 1): signal forwarding through `litestream -exec`, exit-code propagation, and crash policy — a Litestream failure should degrade to "no replication + loud logs", never take the site down.
- **Checkpointing**: Litestream wants to control WAL checkpointing. Verify `node:sqlite` doesn't fight it (default auto-checkpoint vs. Litestream's read lock); may need to disable auto-checkpoint in the app when replication is active.
- **Serving assets from the bucket** on a fresh volume vs. re-downloading them locally at restore time — pick one for the disaster-recovery path.
