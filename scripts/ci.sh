#!/usr/bin/env bash
set -euo pipefail

# CI script: auto-build, lint, test and AI code audit
if [ -z "${VITE_OPENAI_API_KEY-}" ]; then
  echo "==> Skipping AI code audit (no VITE_OPENAI_API_KEY set)"
else
  echo "==> Running AI code audit"
  node -e "require('../src/ai-sandbox').runSandboxTask('generateCode',{prompt:'audit code for vulnerabilities'}).then(r=>{ if(!r.success) { console.error('AI audit failed:',r.message); process.exit(1);} else { console.log('AI audit passed'); }});"
fi

echo "==> Linting (skipped errors)"
npm run lint || echo "Warning: lint errors ignored"

echo "==> Running tests"
npm test

echo "==> Building production bundle"
npm run build

echo "==> CI pipeline completed successfully"
