/**
 * 44 Physiques — Website Inquiry Form Handler
 *
 * Receives JSON POST requests from the inquiry form on the main
 * 44 Physiques website and emails a formatted summary to the coaches.
 *
 * ===== DEPLOY =====
 *   1. Go to https://script.google.com and create a new project
 *   2. Replace the default Code.gs contents with this entire file
 *   3. Click Deploy → New deployment
 *   4. Type:            Web app
 *   5. Execute as:      Me (your Google account)
 *   6. Who has access:  Anyone
 *   7. Click Deploy, authorize the script when prompted
 *   8. Copy the Web app URL (format: https://script.google.com/macros/s/.../exec)
 *   9. Paste that URL into INQUIRY_ENDPOINT at the top of index.html
 *
 * ===== RE-DEPLOY AFTER CHANGES =====
 *   After editing this file in the Apps Script editor, click Deploy →
 *   Manage deployments → Edit (pencil) → Version: New version → Deploy.
 *   The URL stays the same.
 */

const COACH_EMAILS = ['fentydavid@yahoo.com', 'cindybot1231@gmail.com'];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const name = (data.name || 'Unknown').toString().trim();

    MailApp.sendEmail({
      to: COACH_EMAILS.join(','),
      replyTo: (data.email || '').toString().trim(),
      subject: '44 Physiques — New Coaching Inquiry from ' + name,
      htmlBody: buildEmailHtml(data)
    });

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message });
  }
}

function doGet() {
  return ContentService
    .createTextOutput('44 Physiques inquiry endpoint is live. POST only.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function buildEmailHtml(d) {
  const row = (label, value) =>
    '<tr>' +
      '<td style="padding:8px 14px;color:#666;font-weight:600;white-space:nowrap;border-bottom:1px solid #eee;">' + escapeHtml(label) + '</td>' +
      '<td style="padding:8px 14px;color:#111;border-bottom:1px solid #eee;">' + escapeHtml(value || '—') + '</td>' +
    '</tr>';

  return (
    '<div style="font-family:Arial,sans-serif;max-width:620px;color:#111;">' +
      '<h2 style="color:#c41e2a;margin:0 0 6px;letter-spacing:1px;">NEW COACHING INQUIRY</h2>' +
      '<p style="color:#888;margin:0 0 20px;font-size:13px;">Submitted via 44 Physiques website</p>' +
      '<table style="border-collapse:collapse;width:100%;margin-bottom:20px;">' +
        row('Name',       d.name) +
        row('Email',      d.email) +
        row('Phone',      d.phone) +
        row('Interest',   d.interest) +
        row('Timeline',   d.timeline) +
        row('Experience', d.experience) +
      '</table>' +
      '<h3 style="color:#333;margin:20px 0 10px;font-size:15px;letter-spacing:1px;">GOALS</h3>' +
      '<div style="padding:14px 16px;background:#f7f7f7;border-left:3px solid #c41e2a;white-space:pre-wrap;line-height:1.55;">' +
        escapeHtml(d.goals || '—') +
      '</div>' +
    '</div>'
  );
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function(c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
