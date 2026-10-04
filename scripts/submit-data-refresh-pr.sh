#!/usr/bin/env bash
# A proposed snapshot is not a publication. Preserve protected-main checks.
set -euo pipefail
kind="$1"
title="$2"
shift 2
case "$kind" in albo|pnrr|anac) ;; *) echo "Unsupported refresh kind" >&2; exit 1 ;; esac
: "${GH_TOKEN:?GitHub token required}"
: "${GITHUB_REPOSITORY:?Repository required}"
: "${GITHUB_RUN_ID:?Workflow run required}"

for snapshot_path in "$@"; do
  case "$kind:$snapshot_path" in
    albo:data/public/albo|albo:data/public/albo/*|pnrr:artifacts/lamezia-trasparente/src/data/generated/lameziaPnrrProjects.json|anac:data/public/contracts/anac-bdncp/latest.json|anac:data/public/contracts/anac-authority/latest.json) ;;
    *) echo "Unexpected refresh path: $snapshot_path" >&2; exit 1 ;;
  esac
done

git add -- "$@"
if git diff --cached --quiet; then
  echo "No $kind snapshot changes to propose."
  exit 0
fi
# One pending proposal per source family bounds the queue during review.
# Do not overwrite a reviewed head; the next run reacquires after merge.
pending_url="$(gh pr list --repo "$GITHUB_REPOSITORY" --state open --json headRefName,url --jq ".[] | select(.headRefName | startswith(\"data/refresh-${kind}-\")) | .url" | head -n 1)"
if [[ -n "$pending_url" ]]; then
  echo "::notice::Pending $kind proposal: $pending_url. No new PR; source will be reacquired after review."
  if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
    printf '### Refresh awaiting review\n\nPending PR: %s\n\nNo new snapshot was published.\n' "$pending_url" >> "$GITHUB_STEP_SUMMARY"
  fi
  exit 0
fi
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
branch="data/refresh-${kind}-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT:-1}"
git switch -c "$branch"
git commit -m "$title"
git push origin "HEAD:refs/heads/$branch"
body_file="$(mktemp)"
trap 'rm -f "$body_file"' EXIT
cat > "$body_file" <<EOF
Related to #1649.

Proposes the generated $kind snapshot; it is not yet published. Source metadata,
coverage limitations, degraded acquisition states and privacy gates are preserved.
Run: https://github.com/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID

Validation: the acquisition workflow completed its preceding checks; CI,
PR hook guard and static fallback smoke are explicitly dispatched for this head.
Review the source changes and required checks before merging. No protected-main bypass.
EOF
pr_url="$(gh pr create --repo "$GITHUB_REPOSITORY" --base main --head "$branch" --title "$title" --body-file "$body_file")"
pr_number="${pr_url##*/}"
[[ "$pr_number" =~ ^[0-9]+$ ]] || { echo "Invalid PR response" >&2; exit 1; }
# GITHUB_TOKEN writes do not trigger ordinary push/pull_request workflows.
# workflow_dispatch is the supported exception; request checks explicitly.
gh workflow run ci.yml --repo "$GITHUB_REPOSITORY" --ref "$branch"
gh workflow run hook-guard.yml --repo "$GITHUB_REPOSITORY" --ref "$branch" -f "pr_number=$pr_number"
gh workflow run v0-static-fallback-smoke.yml --repo "$GITHUB_REPOSITORY" --ref "$branch"
# These are the data/* families already eligible under trusted-auto-merge.
# GitHub still enforces all checks and any applicable required review.
if ! gh pr merge "$pr_number" --repo "$GITHUB_REPOSITORY" --auto --squash; then
  echo "::warning::Auto-merge could not be armed; proposal remains open for review: $pr_url"
fi
if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  printf '### Snapshot proposed, not published\n\nPR: %s\n\nMerge and deployment verification remain required.\n' "$pr_url" >> "$GITHUB_STEP_SUMMARY"
fi
echo "$pr_url"
