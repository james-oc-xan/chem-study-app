#!/bin/zsh
set -euo pipefail

REPO_DIR="/Users/james-clawdbot/projects/gf-study-app"
BRANCH="automation/nightly-tests"
LOG_DIR="$REPO_DIR/.logs"
SUMMARY_FILE="$LOG_DIR/latest-nightly-summary.md"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cd "$REPO_DIR"
mkdir -p "$LOG_DIR"

if [ ! -d "node_modules" ]; then
  npm install
fi

git fetch origin
if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
  git switch "${BRANCH}"
else
  git switch -c "${BRANCH}" origin/main
fi

git pull --rebase origin "${BRANCH}" || true
git merge --ff-only origin/main || true

npm run generate-tests
npm run test:ci

if git diff --quiet; then
  local_msg="${TIMESTAMP} – No changes detected."
  echo "$local_msg" | tee -a "$LOG_DIR/nightly-test-log.md"
  echo "::NO_CHANGES::"
  exit 0
fi

SUMMARY_CONTENT="$(cat "$SUMMARY_FILE" 2>/dev/null || echo "### Nightly test generation summary (${TIMESTAMP})\n- Tests updated.")"

git add __tests__ .logs package.json package-lock.json jest.config.js jest.setup.js scripts
COMMIT_MESSAGE="test: nightly automation updates (${TIMESTAMP})"
git commit -m "$COMMIT_MESSAGE"
git push -u origin "${BRANCH}"

echo "$SUMMARY_CONTENT" | tee "$LOG_DIR/latest-nightly-summary.md"
