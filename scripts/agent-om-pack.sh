#!/usr/bin/env bash
# Packs the Agent Object Model packages from ../agent-om into vendor/agent-om/,
# where package.json installs them from (file: tarballs, as an npm user gets
# them). core and react are built first; actions and agent ship their source.
# Run it again after changing agent-om, then `pnpm install`.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
agentom="${AGENT_OM_DIR:-$root/../agent-om}"
out="$root/vendor/agent-om"

mkdir -p "$out"
rm -f "$out"/*.tgz
(cd "$agentom" && pnpm --filter @agent-om/core --filter @agent-om/react build)
for pkg in core react actions agent; do
  (cd "$agentom/packages/$pkg" && pnpm pack --pack-destination "$out" >/dev/null)
done
ls "$out"
