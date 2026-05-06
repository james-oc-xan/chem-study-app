#!/bin/zsh
set -euo pipefail

REPO_DIR="/Users/james-clawdbot/projects/gf-study-app"
BRANCH="automation/nightly-tests"
WORKTREE_DIR="$REPO_DIR/.automation-worktree"
LOG_DIR="$REPO_DIR/.logs"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p "$LOG_DIR"

cleanup() {
  if [ -d "$WORKTREE_DIR" ]; then
    git -C "$REPO_DIR" worktree remove --force "$WORKTREE_DIR" || true
  fi
}

trap cleanup EXIT

cd "$REPO_DIR"
cleanup

git fetch origin

git worktree add -B "$BRANCH" "$WORKTREE_DIR" "origin/$BRANCH" 2>/dev/null || \
  git worktree add -B "$BRANCH" "$WORKTREE_DIR" origin/main

cd "$WORKTREE_DIR"

if [ ! -d "node_modules" ]; then
  npm install
fi

npm run generate-tests
npm run test:ci

STATUS_OUTPUT="$(git status --porcelain)"
NON_LOG_CHANGES="$(echo "$STATUS_OUTPUT" | grep -vE '^.. \\.logs/' || true)"

if [ -z "$STATUS_OUTPUT" ] || [ -z "$NON_LOG_CHANGES" ]; then
  local_msg="${TIMESTAMP} – No code/test changes detected."
  echo "$local_msg" | tee -a "$LOG_DIR/nightly-test-log.md"
  git checkout -- .logs 2>/dev/null || true
  echo "::NO_CHANGES::"
  exit 0
fi

SUMMARY_PATH="$WORKTREE_DIR/.logs/latest-nightly-summary.md"
SUMMARY_CONTENT="$(cat "$SUMMARY_PATH" 2>/dev/null || echo "### Nightly test generation summary (${TIMESTAMP})\n- Tests updated.")"

git add __tests__ .logs package.json package-lock.json jest.config.js jest.setup.js scripts
COMMIT_MESSAGE="test: nightly automation updates (${TIMESTAMP})"
git commit -m "$COMMIT_MESSAGE"
git push -u origin "$BRANCH"

echo "$SUMMARY_CONTENT" | tee "$LOG_DIR/latest-nightly-summary.md"
