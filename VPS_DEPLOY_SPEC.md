# VPS deploy script — specification

Spec for `scripts/vps-deploy.sh`: a single local script that takes a fresh Ubuntu VPS (e.g. a DigitalOcean droplet) from zero to a running, TLS-terminated Editable site, and afterwards ships code updates to the same box. Modeled on the Writebook/ONCE installer experience, without Kamal or any registry.

This file is the working spec for the feature. Once implemented and stable, fold the design decisions into `ARCHITECTURE.md` and the user-facing instructions into README → Deploy to a VPS.

## Goals

- One command against a fresh VPS sets up everything: `./scripts/vps-deploy.sh root@203.0.113.10 my-site.example.com`
- The same command run again ships a code update (the script detects what's needed; no separate setup/deploy modes for the user to learn)
- The image is built locally and streamed over ssh — the server never needs git access, npm, or the memory to run a Vite build
- The only state on the server that matters is the bind-mounted data directory; the container is disposable and replaced on every deploy
- A destroyed server is recovered by running the script against a fresh one (boot-time disaster recovery from the backup bucket already exists in `scripts/run-cloud-boot.js`)

## Non-goals (v1)

- Zero-downtime deploys — a few seconds of downtime while the container is replaced is accepted
- Multiple servers, multiple apps per server, deployment locking
- ARM servers — the Dockerfile pins the Litestream `.deb` to `linux-x86_64`, so v1 requires an amd64 VPS and builds with `--platform linux/amd64` (revisit by making the Litestream download arch-aware)
- Provisioning the VPS itself or DNS — the user creates the droplet (with their ssh key) and points the domain's A record at it first, like the Writebook flow

## Design decisions

**Build locally, stream over ssh, no registry.** `docker buildx build --platform linux/amd64` with the image tagged `editable:<git short SHA>`, piped through gzip into `ssh <host> 'gunzip | docker load'`. This keeps the server free of build tooling and repo access, and needs no registry account.

**Host-level Caddy, not a Caddy container.** The app already binds `127.0.0.1:3000` and the README already documents the two-line Caddyfile. Caddy is installed from its apt repo and configured with exactly that config; certificates are Caddy's problem. No compose networking, no cert volumes.

**Compose stays the runtime, switched from `build:` to `image:`.** `docker-compose.yml` gains `image: 'editable:${IMAGE_TAG:-local}'` and drops `build: .` as the on-server path. Local from-source runs use `docker compose up --build` explicitly (compose builds the `image:` tag when `--build` is passed), so the local workflow documented today keeps working. The script deploys with `IMAGE_TAG=<sha> docker compose up -d --remove-orphans`; compose sees the tag change and replaces the container, leaving the `./data` bind mount untouched.

**Server layout.** Everything lives in one directory, `/srv/<site>` (site name = the domain's first label, e.g. `my-site`):

```
/srv/my-site/
├── docker-compose.yml   uploaded by the script on every deploy
├── .env                 created on first run, never overwritten
└── data/                the persistent site data (bind mount → /data)
```

`/etc/caddy/Caddyfile` holds the reverse-proxy config.

**Secrets.** On first run the script prompts for `ADMIN_PASSWORD` (offering a generated one), sets `ORIGIN=https://<domain>`, and writes the server's `.env`. Backup-bucket credentials (`BUCKET_NAME`, `AWS_*`) are copied from the local `.env` if present. That first-run bootstrap is the only implicit sync: afterwards the server's `.env` is authoritative and changes only through the explicit `env` command (`env` show / `env set KEY=VALUE` / `env set KEY` with hidden prompt / `env unset KEY`), which rewrites the file and recreates the container so the change takes effect — fly-secrets style, nothing moves without being named. Secrets are never passed as command-line arguments to remote shells.

**Idempotent provisioning, not a setup mode.** Every run executes the same phases; each phase checks before it acts (Docker installed? Caddy installed? Caddyfile current? `.env` present?). First run does everything; later runs fall through to the deploy phase in seconds.

**Dirty builds are labeled, not versioned.** A build from a working tree with uncommitted or untracked changes is tagged `<sha>-dirty`, so the image list and rollbacks can't mistake it for the committed state. Deploying dirty again reuses the tag — commits are the rollback anchors; dirty states are ephemeral by nature.

**Rollback = redeploy an old tag + existing data restore.** The script keeps the last 3 image tags on the server (older ones pruned after a successful deploy). `./scripts/vps-deploy.sh <host> <domain> --tag <sha>` starts that image instead of building. Content rollback is out of scope — that's `npm run data:restore`, which already works against the VPS via `DEPLOY_HOST`.

**Health check gates success.** After `compose up`, the script polls `127.0.0.1:3000` over ssh (curl, ~30 s budget). On failure it prints the container logs and exits non-zero; it does not auto-rollback in v1.

**`.env` bridge to the data toolbox.** After a successful first deploy the script prints the exact `DEPLOY_HOST` / `RESTART_CMD` / `REMOTE_EXEC` / `HOST_DATA_DIR` block for the local `.env` (values it already knows), so `npm run data:*` works immediately.

## Script interface

```
./scripts/vps-deploy.sh <user@host> <domain>   first deploy, or explicit target (always works)
./scripts/vps-deploy.sh                        deploy to DEPLOY_HOST         (npm run vps:deploy)
./scripts/vps-deploy.sh status                 running tag + rollback tags   (npm run vps:status)
./scripts/vps-deploy.sh env                    show the server's env, masked (npm run vps:env)
./scripts/vps-deploy.sh env set KEY=VALUE …    set env vars and restart the app
./scripts/vps-deploy.sh env set KEY            prompt for the value (hidden input)
./scripts/vps-deploy.sh env unset KEY …        remove env vars and restart the app

Options:
  --tag <sha>     deploy an already-uploaded image tag (rollback) instead of building
  --yes           skip confirmation prompts (except the first-run password prompt)
```

**Addressing.** `DEPLOY_HOST` in the local `.env` is the checkout's entire deployment identity — the same key the data toolbox uses, playing the role `fly.toml` plays for Fly.io. The user adds it by hand from the line the first deploy prints (deliberately not auto-written, so it stays transparent where commands are targeted). Everything else is discovered on the server via the `/srv/<site>/.deploy_env` marker (exactly one per the one-site-per-server rule): the deploy script reads the site and its domain (from `ORIGIN` in the server's `.env`), and `data.sh` derives `REMOTE_EXEC`, `RESTART_CMD`, and `HOST_DATA_DIR` from the marker's `CONTAINER_NAME` and path. Explicit values always override, and setups without the marker (bare node, hand-managed compose) keep configuring the data toolbox explicitly. The explicit `<user@host> <domain>` form is what works before any of this exists.

`<user@host>` is typically `root@<ip>` on a fresh droplet; any sudo-capable user works. ssh key access is assumed (the script never handles passwords).

## Execution phases

1. **Preflight (local).** Verify: git worktree present, `docker buildx` available, ssh connectivity to the host (`BatchMode=yes`), remote architecture is x86_64 (abort otherwise), domain resolves to the host's IP (warn, don't abort — DNS may still be propagating).
2. **Provision (remote, idempotent).** Install Docker (official convenience script) and Caddy (apt repo) if missing; create 1 GB swap if total RAM < 2 GB and no swap exists; create `/srv/<site>/data`.
3. **Configure (remote, idempotent).** Write `/etc/caddy/Caddyfile` (reverse_proxy block for the domain) and reload Caddy if it changed. First run: prompt for `ADMIN_PASSWORD`, write `.env` with it plus `ORIGIN` and any local bucket credentials.
4. **Build & upload (local → remote).** Skipped with `--tag`. Build `editable:<sha>` for linux/amd64, stream via `ssh docker load`. Upload `docker-compose.yml`.
5. **Activate (remote).** `IMAGE_TAG=<sha> docker compose up -d --remove-orphans` in `/srv/<site>` (tag passed via a `.deploy_tag` env file, not shell interpolation).
6. **Verify.** Poll `127.0.0.1:3000` via ssh until healthy or timeout; on success also curl `https://<domain>` from the local machine (warn-only — TLS issuance or DNS may lag). Print logs and fail otherwise.
7. **Cleanup & report.** Prune `editable:*` images beyond the newest 3. Print the deployed tag, the site URL, and (first run) the local `.env` block for the data commands.

## Repository changes

1. `docker-compose.yml` — switch the service to `image: 'editable:${IMAGE_TAG:-local}'`; keep everything else (ports, env_file, bind mount) as is
2. `scripts/vps-deploy.sh` — the script per this spec (`set -euo pipefail`; remote steps as small quoted heredoc scripts, no unvalidated interpolation into remote shells)
3. `package.json` — `"vps:deploy": "./scripts/vps-deploy.sh"` and `"vps:env": "./scripts/vps-deploy.sh env"`
4. `README.md` — rewrite Deploy to a VPS around the script; keep the manual compose flow as a short "doing it by hand" note
5. `.env.example` — update the deployment-block example values to the `editable-<site>` container naming

## Implementation steps

1. Compose switch to `image:` + verify the local `docker compose up --build` path still works
2. Script skeleton: argument parsing, preflight, ssh helpers
3. Provision + configure phases against a throwaway droplet
4. Build/upload/activate/verify phases; end-to-end first deploy
5. Second-run path (update deploy), `--tag` rollback, image pruning
6. README rewrite + `package.json` script

Each step is independently verifiable; 3–5 need a real amd64 VPS to test against.

Status: implemented (compose switch, script, `vps:deploy` / `vps:env` / `vps:status` npm scripts, `data.sh` auto-discovery, README, `.env.example`). Verified against a real DigitalOcean droplet: first deploy (provisioning, TLS via Caddy, password prompt), update deploy (cached build, container replacement, health check, report), and the short-form `env` show and `status` commands with server-side site discovery. Real-world hardening that came out of that testing: ssh retries on transient connection drops (fresh droplets get hammered by brute-force bots, and sshd's MaxStartups randomly sheds new connections) and ssh connection multiplexing so each run plays that lottery only once. Also verified: `--tag` deploys (used to ship a compose-only fix without rebuilding) and `data.sh` against a script-managed server with only `DEPLOY_HOST` set. That testing surfaced and fixed a pre-existing bug: `docker-compose.yml` never set `DATA_DIR=/data` (fly.toml does for Fly), so compose-run containers wrote content to the ephemeral `/app/data` and every redeploy silently wiped it — now fixed in the compose file. Still untested: `env set`/`unset` and the disaster-recovery path (fresh droplet restoring from a backup bucket).

## Open questions

- Should the script optionally harden the box (ufw allowing 22/80/443, unattended-upgrades)? Writebook's installer does some of this. Leaning yes for ufw, no for anything beyond — but deferred until after v1 works end to end.
- One site per server is the decided v1 scope. Multi-site later is additive, not a redesign — the collisions are: the fixed host port 3000, the hardcoded `container_name: editable`, the script owning all of `/etc/caddy/Caddyfile`, and the shared `editable:<sha>` image namespace. To keep that door open cheaply, v1 adopts two conventions now: name the container `editable-<site>`, and write the Caddy config as `/etc/caddy/sites/<domain>.caddy` imported from the main Caddyfile. A future multi-site step then only needs a per-site `APP_PORT` and per-site image repos (`editable-<site>:<sha>`).
