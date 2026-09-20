// HTML escaping. Every value that reaches a briefing came from somewhere else —
// a provider's company name, a referrer hostname, a brand string read out of the
// page — so all of it is escaped on the way out. The Intelligence page and the
// email are both HTML documents; neither may execute anything a third party put
// in a field.
export function escapeHTML(v) {
  if (v == null) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
