#!/usr/bin/env node
// Runs as this project's own `preinstall` lifecycle script — i.e. BEFORE npm
// resolves/fetches any dependency, including the private git dependency
// `@kidzink/ui` (github:adnankidzinkdesign-cell/kidzink-ui). CI environments
// (Netlify) have no git credentials for that private repo by default, so
// `npm install`/`npm ci` fails trying to clone it.
//
// Fix: if a KIDZINK_UI_PAT env var is present (set in Netlify's site
// environment variables — a GitHub PAT scoped to read-only access on just
// the kidzink-ui repo), rewrite plain `https://github.com/` git URLs to an
// authenticated form for the lifetime of this build container. Local dev is
// unaffected: if the env var isn't set (the normal case on a dev machine
// that already has its own GitHub auth via `gh`/git credential manager),
// this is a no-op.
const { execSync } = require("node:child_process");

const token = process.env.KIDZINK_UI_PAT;

if (!token) {
  process.exit(0);
}

execSync(
  `git config --global url."https://${token}@github.com/".insteadOf "https://github.com/"`
);
