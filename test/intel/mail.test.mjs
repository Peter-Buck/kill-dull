// The transport is the contact form's, already in production. What is tested
// here is the envelope this job builds on top of it.

import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMime, missingMailConfig, recipient, sender, sendBriefing } from '../../lib/intel/mail.mjs';

const full = {
  GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'secret', GOOGLE_REFRESH_TOKEN: 'refresh',
  ALERT_EMAIL_TO: 'peter@killdull.com', CONTACT_FROM_EMAIL: 'human@killdull.com',
};

test('the message is multipart/alternative, html and text', () => {
  const mime = buildMime({ from: 'a@b.com', to: 'c@d.com', subject: 'x', text: 'plain', html: '<p>rich</p>' });
  assert.match(mime, /Content-Type: multipart\/alternative; boundary="kd_/);
  assert.match(mime, /Content-Type: text\/plain; charset="UTF-8"/);
  assert.match(mime, /Content-Type: text\/html; charset="UTF-8"/);
  assert.ok(mime.includes(Buffer.from('plain', 'utf8').toString('base64')));
  assert.ok(mime.includes(Buffer.from('<p>rich</p>', 'utf8').toString('base64')));
});

test('an em dash in the subject is encoded rather than mangled', () => {
  const mime = buildMime({ from: 'a@b.com', to: 'c@d.com', subject: 'Kill Dull — WPP', text: 't', html: 'h' });
  assert.match(mime, /Subject: =\?UTF-8\?B\?/);
  assert.equal(mime.includes('Subject: Kill Dull —'), false);
});

test('a header cannot be injected through the subject', () => {
  const mime = buildMime({ from: 'a@b.com', to: 'c@d.com', subject: 'x\r\nBcc: someone@else.com', text: 't', html: 'h' });
  const headers = mime.split('\r\n\r\n')[0].split('\r\n');
  // The break is flattened into the Subject rather than starting a header.
  assert.equal(headers.length, 5);
  assert.equal(headers.some((h) => h.startsWith('Bcc:')), false);
  assert.ok(headers[2].startsWith('Subject: x Bcc: someone@else.com'));
});

test('missing configuration is reported by name, never by value', () => {
  assert.deepEqual(missingMailConfig({}), [
    'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'ALERT_EMAIL_TO', 'CONTACT_FROM_EMAIL',
  ]);
  assert.deepEqual(missingMailConfig(full), []);
});

test('ALERT_EMAIL_TO is the recipient this environment already provisions', () => {
  assert.equal(recipient(full), 'peter@killdull.com');
  assert.equal(recipient({ CONTACT_TO_EMAIL: 'fallback@killdull.com' }), 'fallback@killdull.com');
  assert.equal(recipient({}), null);
  assert.equal(sender(full), 'human@killdull.com');
});

test('an unconfigured mailer refuses instead of throwing', async () => {
  const r = await sendBriefing({ subject: 's', html: 'h', text: 't' }, {});
  assert.equal(r.ok, false);
  assert.match(r.reason, /^mail_not_configured:/);
});
