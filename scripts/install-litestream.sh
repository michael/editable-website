#!/usr/bin/env bash
#
# Install the litestream binary into node_modules/.bin, pinned to the same
# version the production image runs, so local restores read the exact bucket
# format the server writes. No sudo, no global install; npm run scripts find
# it automatically. Re-run any time (e.g. after node_modules was recreated).
set -euo pipefail

die() { echo "Error: $*" >&2; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Single source of truth: the version the Dockerfile ships.
VERSION="$(sed -n 's/^ARG LITESTREAM_VERSION=\(.*\)$/\1/p' "$SCRIPT_DIR/../Dockerfile")"
[ -n "$VERSION" ] || die "Could not read LITESTREAM_VERSION from the Dockerfile"

case "$(uname -s)" in
	Darwin) os="darwin" ;;
	Linux) os="linux" ;;
	*) die "Unsupported OS: $(uname -s) — install litestream manually from https://litestream.io/install/" ;;
esac

case "$(uname -m)" in
	arm64 | aarch64) arch="arm64" ;;
	x86_64 | amd64) arch="x86_64" ;;
	*) die "Unsupported architecture: $(uname -m) — install litestream manually from https://litestream.io/install/" ;;
esac

DEST_DIR="$SCRIPT_DIR/../node_modules/.bin"
[ -d "$DEST_DIR" ] || die "node_modules/.bin not found — run npm install first"

url="https://github.com/benbjohnson/litestream/releases/download/v${VERSION}/litestream-${VERSION}-${os}-${arch}.tar.gz"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "→ Downloading litestream v${VERSION} (${os}-${arch})…"
curl -fsSL "$url" -o "$TMP/litestream.tar.gz"
tar -xzf "$TMP/litestream.tar.gz" -C "$TMP"

bin="$(find "$TMP" -name litestream -type f | head -1)"
[ -n "$bin" ] || die "litestream binary not found in release archive"

mv "$bin" "$DEST_DIR/litestream"
chmod +x "$DEST_DIR/litestream"

echo "✓ Installed: $("$DEST_DIR/litestream" version) → node_modules/.bin/litestream"
