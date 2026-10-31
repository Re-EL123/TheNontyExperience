#!/usr/bin/env bash
# Run from the repo root BEFORE copying the scaffold in. Preserves git history.
set -euo pipefail
mkdir -p apps/web docs
git mv index.html apps/web/index.html
git mv assets apps/web/assets
[ -f CNAME ] && git mv CNAME apps/web/CNAME
git mv README.md docs/design-spec.md
git commit -m "chore: move static site into apps/web (monorepo)"
echo "Done. Now copy the scaffold over the repo root."
