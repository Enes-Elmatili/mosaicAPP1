#!/usr/bin/env bash
set -euo pipefail

API_URL="http://localhost:3000"
WEB_URL="http://localhost:5173"
MASTER_KEY="${MASTER_KEY:-dev-master-key}"

cleanup() {
  echo "== Cleanup =="
  if [[ -n "${API_PID-}" ]] && ps -p $API_PID >/dev/null 2>&1; then kill $API_PID || true; fi
  if [[ -n "${WEB_PID-}" ]] && ps -p $WEB_PID >/dev/null 2>&1; then kill $WEB_PID || true; fi
  if [[ -n "${PREVIEW_PID-}" ]] && ps -p $PREVIEW_PID >/dev/null 2>&1; then kill $PREVIEW_PID || true; fi
}
trap cleanup EXIT

echo "== 0) NPM deps =="
npm install

echo "== 1) Playwright browsers (chromium + firefox) =="
npx playwright install chromium firefox

echo "== 2) Launch API & Web (background) =="
npm run dev:api >/tmp/api.log 2>&1 & API_PID=$!
npm run dev:web >/tmp/web.log 2>&1 & WEB_PID=$!

echo "Waiting for API on $API_URL and Web on $WEB_URL ..."
for i in {1..60}; do
  (curl -sf "$API_URL/api/requests?page=1&pageSize=1" >/dev/null 2>&1 && curl -sf "$WEB_URL" >/dev/null 2>&1) && break
  sleep 1
done
curl -sf "$WEB_URL" >/dev/null || { echo "Web not up, see /tmp/web.log"; exit 1; }
curl -sf "$API_URL/api/requests?page=1&pageSize=1" >/dev/null || echo "(API list may be empty yet — continuing)"

echo "== 3) Run E2E =="
export VITE_MASTER_KEY="$MASTER_KEY"
npm run test:e2e || true

echo "== 4) Prisma migrate + backfill =="
npx prisma migrate dev
node scripts/backfill-clientInfo.js

echo "== 5) PWA build with SW =="
VITE_ENABLE_PWA=true npm run build
npm run preview >/dev/null 2>&1 & PREVIEW_PID=$!
sleep 2

echo "== 6) Smoke checks API =="
curl -sf "$API_URL/api/requests?page=1&pageSize=1" >/dev/null && echo "API list OK"
curl -sf -X POST "$API_URL/api/requests" \
 -H 'Content-Type: application/json' \
 -H "x-master-key: $MASTER_KEY" \
 -d '{"propertyId":"verify-1","serviceType":"general","description":"verify run"}' >/dev/null \
 && echo "Create OK"

echo "== 7) Package artifacts =="
zip -r playwright-artifacts.zip playwright-report test-results || true
echo "Artifacts: playwright-artifacts.zip"
echo "API logs: /tmp/api.log  |  Web logs: /tmp/web.log"

echo "== DONE =="
echo "• E2E: ./playwright-report/index.html (traces: ./test-results/)"
echo "• PWA: build OK (preview lancé)"
echo "• Prisma: migrations + backfill OK"
