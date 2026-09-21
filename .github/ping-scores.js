// Reads one row id from a score database, so Supabase sees activity and
// doesn't pause a free project after a quiet week. Read-only: it uses the
// same public key as the page, which can't change anything.
//
// Usage: node .github/ping-scores.js [sandbox|production]   (default sandbox)
//
// The address and key come from SCORE_SERVICES in index.html, so this can
// never point somewhere the game doesn't. Exits non-zero if the database
// doesn't answer, which fails the workflow, and GitHub emails about it.

const fs = require('fs');
const path = require('path');

const target = process.argv[2] || 'sandbox';
const page = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const block = page.match(new RegExp(`\\b${target}: \\{\\s*url: '([^']+)',\\s*key: '([^']+)'`));
if (!block) {
  console.error(`No "${target}" in SCORE_SERVICES in index.html`);
  process.exit(1);
}
const [, url, key] = block;

fetch(`${url}/rest/v1/scores?select=id&limit=1`, { headers: { apikey: key } })
  .then((response) => {
    console.log(`${target}: ${response.status}`);
    if (!response.ok) process.exit(1);
  })
  .catch((error) => {
    console.error(`${target}: ${error.message}`);
    process.exit(1);
  });
