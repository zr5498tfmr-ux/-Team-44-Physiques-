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
 * ===== RE-DEPLOY AFTER EDITING =====
 *   Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy.
 *   The URL stays the same.
 */

const COACH_EMAILS = ['fentydavid@yahoo.com', 'cindybot1231@gmail.com'];

function doPost(e) {
  // Capture everything we can so the browser gets a clear error on failure.
  let stage = 'start';
  let rawBody = '';
  try {
    stage = 'read-body';
    rawBody = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
    if (!rawBody && e && e.parameter) {
      rawBody = JSON.stringify(e.parameter);
    }
    Logger.log('Raw body: ' + rawBody);

    stage = 'parse-json';
    const data = rawBody ? JSON.parse(rawBody) : {};

    stage = 'validate';
    if (!data.name || !data.email || !data.goals) {
      throw new Error('Missing required fields (name, email, goals).');
    }

    stage = 'send-mail';
    const name = String(data.name).trim();
    MailApp.sendEmail({
      to: COACH_EMAILS.join(','),
      replyTo: String(data.email || '').trim(),
      subject: '44 Physiques — New Coaching Inquiry from ' + name,
      htmlBody: buildEmailHtml(data)
    });

    return json({ ok: true });
  } catch (err) {
    Logger.log('doPost failed at stage=' + stage + ' error=' + err + ' body=' + rawBody);
    return json({
      ok: false,
      stage: stage,
      error: String(err && err.message ? err.message : err),
      receivedBodyLength: rawBody.length
    });
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

/**
 * Run this function manually from the Apps Script editor (Run button)
 * to test the mailer end-to-end without going through the web form.
 * If it works here but fails from the website, the script itself is fine
 * and the issue is in how the browser request is reaching it.
 */
function testMail() {
  const result = doPost({
    postData: {
      contents: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '555-1234',
        interest: 'Contest Prep',
        timeline: 'Show in 12 weeks',
        experience: 'Intermediate (1–3 yrs)',
        goals: 'This is a test inquiry submitted via testMail().'
      })
    }
  });
  Logger.log(result.getContent());
}
