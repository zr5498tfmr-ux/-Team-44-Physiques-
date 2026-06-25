# 44 Physiques — Website Notes

This repo is the live website served at **team44physiques.com** (GitHub Pages).
`main` publishes to the live site, so work on a branch and open a PR.

## ⚠️ Google account for Apps Script changes
The progress dashboard (`progress.html`) reads check-in data from a Google Apps
Script web app. **All Apps Script changes — for both this site and the check-in
form — must be made while logged into the Cindy Bot Google account:**

> **cindybot1231@gmail.com**

That account owns the Apps Script project behind the live web app (deployment URL
ends in `.../AKfycbzQsJLZGRyvYLWfbEOLjdBP-pLIyotG6GPfQXcQPUMaKGIStfG-57sXL8apAmLDXTgslw/exec`),
the data spreadsheet, and the photos Drive folder. Editing/deploying from any other
Google login creates a disconnected copy that never reaches the live site. The Apps
Script source lives in the `44Physiques-check-in-form` repo (`google-apps-script.gs`)
and is pasted in manually — it is NOT auto-deployed by GitHub.

## Key pages
- **`index.html`** — homepage.
- **`progress.html`** — athlete progress dashboard. Login (email + 6-char code) →
  JSONP to the Apps Script → trend charts, weeks-out-from-show comparison, photo
  comparison, history table. Uses Chart.js from a CDN.
