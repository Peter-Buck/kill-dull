// Canonical event allow-list + property sanitizer for /api/collect.
// No free text, no PII, no IP. Everything a browser sends is validated here.
//
// Ported from peter-buck.com's schema.ts. The sanitizer's rules are unchanged.
// The event list is not: it describes Kill Dull, and every entry below names
// something the site actually does today. There is no résumé here, no
// INTERROGATE, no assistant and no verdict, so none of those events exist.

export const EVENTS = new Set([
  // Reading the site.
  'content_view',        // a page was opened
  'content_dwell',       // how long, how far down — both bucketed

  // The one piece of content that opens rather than scrolls.
  // A Published Reading is an <article class="record-card">, opened by tap,
  // hover or Enter/Space (assets/kd.js). This records that it was opened.
  'reading_opened',

  // Deliberate contact.
  'contact_submitted',   // the /contact form posted successfully
  'cta_click',           // mailto:...?subject=A commitment for BENCH
  'email_click',         // plain mailto:human@killdull.com
  'linkedin_click',      // the LinkedIn profile link
  'outbound_click',      // an external reference link leaving the site

  // The Marketing Judgment Test funnel (/assessment). That someone began,
  // finished, downloaded or emailed their Reading — never an answer, a score
  // or the Reading itself, which stay in the respondent's browser.
  'assessment_started',
  'assessment_completed',
  'assessment_reading_downloaded',
  'assessment_reading_emailed',

  // Ask Kill Dull: that it was opened, and which predefined question was
  // chosen (by position, q1–q10). It has no free text to capture.
  'ask_opened',
  'ask_question_selected',

  // A page that does not exist was requested (the 404 page was served).
  'not_found_404',
]);

const ALLOWED_PROPS = new Set([
  // Where.
  'path', 'page_path', 'page_type',
  // How they arrived.
  'source', 'referrer_domain',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  // How they read. Buckets, never raw seconds or pixels.
  'dwell_bucket', 'scroll_depth_bucket',
  // Which Reading. Site-authored brand names, not visitor data.
  'reading_brand',
  // Which control, and where it was.
  'location', 'target',
]);

/**
 * Drop everything not explicitly allowed. An unlisted key, a null, an
 * over-long string or a non-scalar never reaches PostHog — which is what
 * keeps free text, and anything typed into the contact form, out of analytics.
 * @param {Record<string, unknown>} props
 * @returns {Record<string, unknown>}
 */
export function sanitizeProps(props = {}) {
  return sanitizeWithCount(props).props;
}

/** The same, also saying how many offered properties were refused (for operational visibility). */
export function sanitizeWithCount(props = {}) {
  const out = sanitizeOnly(props);
  return { props: out, dropped: Object.keys(props || {}).length - Object.keys(out).length };
}

function sanitizeOnly(props = {}) {
  const out = {};
  for (const [k, v] of Object.entries(props)) {
    if (!ALLOWED_PROPS.has(k) || v == null) continue;
    if (typeof v === 'string' && v.length > 64) continue; // length/minimization
    if (!['string', 'number', 'boolean'].includes(typeof v)) continue; // type guard
    out[k] = v;
  }
  return out;
}

/**
 * Every reason the collector can refuse an event, by name. The collector counts
 * each refusal under one of these, and Intelligence reads the same list back,
 * so a reason cannot be counted without also being reported.
 */
export const REFUSALS = [
  'no_consent', 'unknown_event', 'cookie_mismatch', 'non_production', 'internal',
  'rate_limited', 'bad_body', 'too_large', 'bad_id', 'bad_origin',
  'props_dropped', 'not_configured', 'ingest_failed',
];
