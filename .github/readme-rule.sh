#!/bin/sh
# The README rule from .githooks/commit-msg, checked on every commit in a
# range. The hook only runs where it has been enabled, which a contributor's
# clone may not have, so CI checks the same thing on every pull request.
#
# Usage: sh .github/readme-rule.sh <base> <head>
#
# Keep the pattern below in step with the hook.

fail=0
for c in $(git rev-list --no-merges "$1..$2"); do
  files=$(git diff-tree --no-commit-id --name-only -r "$c")
  echo "$files" | grep -qx 'index.html' || continue
  echo "$files" | grep -qx 'README.md' && continue
  git log -1 --format=%B "$c" | grep -qiE '^README: unchanged *(-|—|–) *[^ ]' && continue
  echo "$(git log -1 --format='%h %s' "$c")"
  fail=1
done

if [ "$fail" = 1 ]; then
  cat >&2 <<'EOF'

These commits change index.html but not README.md. If a player would
notice the change, update the README. If not, add a line to the commit
message saying why:

    README: unchanged - <why>
EOF
fi
exit "$fail"
