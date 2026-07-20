#!/usr/bin/env bash
#
# Deploy an Editable site to a VPS — see VPS_DEPLOY_SPEC.md for the design.
#
# One command takes a fresh Ubuntu server (amd64, ssh key access) to a running,
# TLS-terminated site; the same command run again ships a code update. The
# image is built locally and streamed over ssh — the server never needs git
# access, npm, or the memory to run a build. The only state that matters on
# the server is the bind-mounted data directory (/srv/<site>/data); the
# container is disposable and replaced on every deploy.
#
# Usage
#   ./scripts/deploy_vps.sh <user@host> <domain> [options]
#
#   ./scripts/deploy_vps.sh root@203.0.113.10 my-site.example.com
#
# Options
#   --tag <tag>   deploy an already-uploaded image tag (rollback) instead of
#                 building — the last 3 tags are kept on the server
#   --push-env    re-sync ORIGIN and backup-bucket credentials into the
#                 server's .env (never done silently on normal deploys)
#   --yes         skip confirmation prompts (except the first-run password)
#
# Every run executes the same idempotent phases — preflight, provision,
# configure, build & upload, activate, verify, cleanup. The first run does
# everything; later runs fall through to the deploy phases in seconds.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

die() { echo "Error: $*" >&2; exit 1; }
info() { echo "→ $*"; }
warn() { echo "Warning: $*" >&2; }

confirm() {
	[ "$YES" = true ] && return 0
	local reply
	printf '%s [y/N] ' "$1"
	read -r reply </dev/tty
	[ "$reply" = "y" ] || [ "$reply" = "Y" ] || die "Aborted."
}

# ---- arguments ---------------------------------------------------------------

TARGET=""
DOMAIN=""
TAG=""
PUSH_ENV=false
YES=false

usage() { sed -n '3,26p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; }

while [ $# -gt 0 ]; do
	case "$1" in
		--tag)
			[ $# -ge 2 ] || die "--tag requires a value"
			TAG="$2"
			shift
			;;
		--push-env) PUSH_ENV=true ;;
		--yes) YES=true ;;
		-h | --help) usage; exit 0 ;;
		-*) die "Unknown option '$1' (see --help)" ;;
		*)
			if [ -z "$TARGET" ]; then TARGET="$1"
			elif [ -z "$DOMAIN" ]; then DOMAIN="$1"
			else die "Unexpected argument '$1' (see --help)"
			fi
			;;
	esac
	shift
done

[ -n "$TARGET" ] && [ -n "$DOMAIN" ] || { usage; exit 2; }

case "$TARGET" in
	*@*) ;;
	*) die "Target must be user@host, e.g. root@203.0.113.10" ;;
esac

# Values interpolated into remote commands are validated to safe character
# sets first — everything else reaches the remote side via stdin only.
DOMAIN="$(echo "$DOMAIN" | tr '[:upper:]' '[:lower:]')"
echo "$DOMAIN" | grep -Eq '^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$' ||
	die "'$DOMAIN' does not look like a domain name"
if [ -n "$TAG" ]; then
	echo "$TAG" | grep -Eq '^[A-Za-z0-9][A-Za-z0-9._-]*$' || die "'$TAG' is not a valid image tag"
fi

SITE="${DOMAIN%%.*}"
SRV="/srv/$SITE"
CONTAINER="editable-$SITE"
REMOTE_USER="${TARGET%%@*}"
HOST_ADDR="${TARGET#*@}"

SUDO=""
[ "$REMOTE_USER" = "root" ] || SUDO="sudo"

# accept-new: trust a fresh server's host key on first contact (a brand-new
# droplet is never in known_hosts), but still fail hard if a known key changes.
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new)
rssh() { ssh "${SSH_OPTS[@]}" "$TARGET" "$@"; }

# Like rssh, but retries transient connection failures (ssh exit code 255) —
# fresh droplets drop occasional connections while they finish booting. Only
# for commands that read nothing from stdin (a retry would find it drained).
rssh_retry() {
	local attempt rc
	for attempt in 1 2 3 4 5; do
		rc=0
		rssh "$@" </dev/null || rc=$?
		[ "$rc" -eq 255 ] || return "$rc"
		[ "$attempt" -lt 5 ] || break
		warn "ssh connection dropped — retrying in 5s ($attempt/5)"
		sleep 5
	done
	return "$rc"
}

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# ---- phase 1: preflight ------------------------------------------------------

command -v docker >/dev/null || die "docker is not installed locally"
command -v git >/dev/null || die "git is not installed"
if [ -z "$TAG" ]; then
	docker buildx version >/dev/null 2>&1 || die "docker buildx is not available"
	git rev-parse --short HEAD >/dev/null 2>&1 || die "not inside a git checkout"
fi

info "Checking ssh connectivity to $TARGET"
rssh_retry true 2>/dev/null || die "cannot ssh into $TARGET (key-based access required)"

REMOTE_ARCH="$(rssh_retry uname -m)"
[ "$REMOTE_ARCH" = "x86_64" ] ||
	die "server is $REMOTE_ARCH — only amd64 servers are supported (the image pins the x86_64 Litestream build)"

# DNS sanity check — warn only, propagation may still be in progress.
if echo "$HOST_ADDR" | grep -Eq '^[0-9.]+$' && command -v dig >/dev/null; then
	RESOLVED="$(dig +short A "$DOMAIN" | sed -n '1p')"
	if [ -z "$RESOLVED" ]; then
		warn "$DOMAIN does not resolve yet — TLS will fail until the A record points at $HOST_ADDR"
	elif [ "$RESOLVED" != "$HOST_ADDR" ]; then
		warn "$DOMAIN resolves to $RESOLVED, not $HOST_ADDR — TLS will fail until DNS is fixed"
	fi
fi

FIRST_RUN=false
rssh_retry "test -f $SRV/.env" 2>/dev/null || FIRST_RUN=true

if [ "$FIRST_RUN" = true ]; then
	confirm "Set up $TARGET as a new Editable server for https://$DOMAIN?"
fi

# ---- phase 2: provision (remote, idempotent) ---------------------------------

info "Provisioning server (no-op when already set up)"
{
	printf 'SITE=%q\nAPP_USER=%q\n' "$SITE" "$REMOTE_USER"
	cat <<'REMOTE'
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

command -v curl >/dev/null || { apt-get update -qq; apt-get install -y -qq curl ca-certificates; }
command -v docker >/dev/null || { echo "→ Installing Docker"; curl -fsSL https://get.docker.com | sh; }
command -v caddy >/dev/null || {
	echo "→ Installing Caddy"
	apt-get update -qq
	apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https gnupg
	curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' |
		gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
	curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
		>/etc/apt/sources.list.d/caddy-stable.list
	apt-get update -qq
	apt-get install -y -qq caddy
}

# 1 GB swap on small machines, so the running app never gets OOM-killed.
total_kb=$(awk '/MemTotal/ {print $2}' /proc/meminfo)
if [ "$total_kb" -lt 2000000 ] && [ "$(swapon --noheadings | wc -l)" -eq 0 ]; then
	echo "→ Creating 1 GB swapfile (server has <2 GB RAM)"
	fallocate -l 1G /swapfile
	chmod 600 /swapfile
	mkswap /swapfile >/dev/null
	swapon /swapfile
	grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >>/etc/fstab
fi

mkdir -p "/srv/$SITE/data"
[ "$APP_USER" = "root" ] || chown "$APP_USER" "/srv/$SITE"
REMOTE
} | rssh "$SUDO bash -s"

# ---- phase 3: configure (remote, idempotent) ---------------------------------

info "Configuring Caddy for $DOMAIN"
{
	printf 'DOMAIN=%q\n' "$DOMAIN"
	cat <<'REMOTE'
set -euo pipefail
mkdir -p /etc/caddy/sites
site_file="/etc/caddy/sites/$DOMAIN.caddy"
desired="$DOMAIN {
	reverse_proxy 127.0.0.1:3000
}"
changed=""
if [ ! -f "$site_file" ] || [ "$(cat "$site_file")" != "$desired" ]; then
	printf '%s\n' "$desired" >"$site_file"
	changed=1
fi
grep -q 'import sites/\*\.caddy' /etc/caddy/Caddyfile || {
	printf '\nimport sites/*.caddy\n' >>/etc/caddy/Caddyfile
	changed=1
}
[ -z "$changed" ] || systemctl reload caddy
REMOTE
} | rssh "$SUDO bash -s"

# Read a value from the local .env (first uncommented occurrence).
local_env_val() {
	[ -f .env ] || return 0
	sed -n -E "s/^$1=[\"']?([^\"']*)[\"']?[[:space:]]*$/\1/p" .env | sed -n '1p'
}

BUCKET_KEYS="BUCKET_NAME AWS_ENDPOINT_URL_S3 AWS_REGION AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY"

# Append KEY="value" for each bucket key with a local value to the file in $1.
append_bucket_creds() {
	local key value
	for key in $BUCKET_KEYS; do
		value="$(local_env_val "$key")"
		[ -n "$value" ] && printf '%s="%s"\n' "$key" "$value" >>"$1"
	done
	return 0
}

if [ "$FIRST_RUN" = true ]; then
	info "Creating the server's .env"
	GENERATED="$(openssl rand -base64 18 2>/dev/null || head -c 18 /dev/urandom | base64)"
	printf 'Admin password for %s [enter for generated: %s]: ' "$DOMAIN" "$GENERATED"
	read -r ADMIN_PW </dev/tty
	[ -n "$ADMIN_PW" ] || ADMIN_PW="$GENERATED"
	case "$ADMIN_PW" in
		*[\"\\]*) die 'the admin password must not contain " or \' ;;
	esac
	{
		printf 'ADMIN_PASSWORD="%s"\n' "$ADMIN_PW"
		printf 'ORIGIN="https://%s"\n' "$DOMAIN"
	} >"$TMP/env"
	append_bucket_creds "$TMP/env"
	rssh "$SUDO tee $SRV/.env >/dev/null && $SUDO chmod 600 $SRV/.env" <"$TMP/env"
elif [ "$PUSH_ENV" = true ]; then
	info "Re-syncing ORIGIN and bucket credentials into the server's .env"
	rssh "$SUDO cat $SRV/.env" >"$TMP/env"
	{
		grep -E '^ADMIN_PASSWORD=' "$TMP/env" || die "server .env has no ADMIN_PASSWORD — refusing to rewrite it"
		printf 'ORIGIN="https://%s"\n' "$DOMAIN"
	} >"$TMP/env.new"
	append_bucket_creds "$TMP/env.new"
	echo "The server's .env will become (ADMIN_PASSWORD kept as is):"
	sed -E 's/^(AWS_SECRET_ACCESS_KEY|ADMIN_PASSWORD)=.*/\1="…"/' "$TMP/env.new" | sed 's/^/    /'
	confirm "Overwrite $SRV/.env with this?"
	rssh "$SUDO tee $SRV/.env >/dev/null && $SUDO chmod 600 $SRV/.env" <"$TMP/env.new"
fi

# ---- phase 4: build & upload -------------------------------------------------

if [ -z "$TAG" ]; then
	TAG="$(git rev-parse --short HEAD)"
	git diff-index --quiet HEAD -- 2>/dev/null ||
		warn "uncommitted changes — the image is built from the working tree but tagged $TAG"
	info "Building editable:$TAG for linux/amd64"
	docker buildx build --platform linux/amd64 -t "editable:$TAG" --load .
	info "Streaming image to the server (this can take a few minutes)"
	docker save "editable:$TAG" | gzip | rssh "gunzip | $SUDO docker load"
else
	rssh "$SUDO docker image inspect editable:$TAG >/dev/null 2>&1" ||
		die "image editable:$TAG is not on the server (only built tags can be rolled back to)"
	info "Deploying existing image editable:$TAG"
fi

rssh "$SUDO tee $SRV/docker-compose.yml >/dev/null" <docker-compose.yml

# ---- phase 5: activate -------------------------------------------------------

info "Starting the new container"
printf 'IMAGE_TAG=%s\nCONTAINER_NAME=%s\n' "$TAG" "$CONTAINER" |
	rssh "$SUDO tee $SRV/.deploy_env >/dev/null"
rssh_retry "cd $SRV && $SUDO docker compose --env-file .env --env-file .deploy_env up -d --remove-orphans"

# ---- phase 6: verify ---------------------------------------------------------

info "Waiting for the app to respond"
if ! rssh_retry 'for i in $(seq 30); do curl -fsS -o /dev/null http://127.0.0.1:3000 && exit 0; sleep 1; done; exit 1'; then
	echo "--- container logs -----------------------------------------------------" >&2
	rssh_retry "$SUDO docker logs --tail 50 $CONTAINER" >&2 || true
	die "the app did not become healthy — the failing container is left running for inspection"
fi

if ! curl -fsS -o /dev/null --max-time 15 "https://$DOMAIN" 2>/dev/null; then
	warn "https://$DOMAIN is not reachable from here yet (DNS propagation or TLS issuance may still be in progress)"
fi

# ---- phase 7: cleanup & report -----------------------------------------------

# Keep the newest 3 editable images for --tag rollbacks (rmi of an in-use
# image fails harmlessly, e.g. right after rolling back to an older tag).
rssh_retry "$SUDO docker images editable --format '{{.Repository}}:{{.Tag}}' | tail -n +4 | xargs -r $SUDO docker rmi >/dev/null 2>&1 || true"

echo
info "Deployed editable:$TAG to https://$DOMAIN"
if [ "$FIRST_RUN" = true ]; then
	cat <<LOCAL_ENV

To point the npm run data:* commands at this server, add to your local .env:

    DEPLOY_HOST="$TARGET"
    RESTART_CMD="docker restart $CONTAINER"
    REMOTE_EXEC="docker exec $CONTAINER"
    HOST_DATA_DIR="$SRV/data"
LOCAL_ENV
fi
