#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
command -v node >/dev/null || { echo 'Install Node.js LTS first.'; exit 1; }
command -v docker >/dev/null || { echo 'Install/start Docker Desktop first.'; exit 1; }
[ -d node_modules ] || npm install
npm run db:up
npm run db:setup
npm run dev
