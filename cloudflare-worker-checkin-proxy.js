/**
 * 44 Physiques — Check-In Data Proxy (Cloudflare Worker)
 *
 * Purpose: the progress dashboard (progress.html) needs the athlete's check-in
 * data from the Google Apps Script web app. Calling script.google.com directly
 * from the browser is fragile — when a visitor is signed into multiple Google
 * accounts the request gets mis-routed (/u/1/…) and fails, and some ad-blockers /
 * tracking-prevention modes block the cross-site request.
 *
 * This Worker sits on our OWN domain and forwards the request to the Apps Script
 * server-side. The browser only ever talks to team44physiques.com, so none of the
 * Google-account / ad-blocker problems can happen. It returns clean JSON with
 * permissive CORS headers.
 *
 * ===== DEPLOY (in the Cloudflare dashboard) =====
 *  1. Cloudflare dashboard → Workers & Pages → Create application → Create Worker.
 *  2. Name it e.g. "checkin-proxy" → Deploy → "Edit code".
 *  3. Replace the default code with this entire file → Deploy.
 *  4. Open the Worker → Settings → Triggers → Routes → Add route:
 *        Route:  team44physiques.com/checkin-data*
 *        Zone:   team44physiques.com
 *     Save. (The dashboard is already pointed at /checkin-data.)
 *
 * Note: the dashboard automatically falls back to its old direct call if this
 * proxy is ever unreachable, so nothing breaks while you set it up.
 */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQsJLZGRyvYLWfbEOLjdBP-pLIyotG6GPfQXcQPUMaKGIStfG-57sXL8apAmLDXTgslw/exec';

// Only these params are forwarded to the Apps Script (no "callback" → clean JSON).
const ALLOWED_PARAMS = ['action', 'email', 'code'];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    try {
      const inUrl = new URL(request.url);
      const target = new URL(APPS_SCRIPT_URL);
      ALLOWED_PARAMS.forEach((k) => {
        if (inUrl.searchParams.has(k)) target.searchParams.set(k, inUrl.searchParams.get(k));
      });

      const upstream = await fetch(target.toString(), { method: 'GET', redirect: 'follow' });
      const body = await upstream.text();

      return new Response(body, {
        status: 200,
        headers: Object.assign(
          { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
          CORS_HEADERS
        )
      });
    } catch (err) {
      return new Response(JSON.stringify({ result: 'error', message: 'proxy error' }), {
        status: 200,
        headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, CORS_HEADERS)
      });
    }
  }
};
