// Reporting windows, expressed in Pacific time.
//
// The briefing is a morning read, so the window that matters is "since this
// time yesterday", not a calendar day: an 08:00 send that ignored last evening
// would drop the most interesting hours of the day before. Every window is
// paired with the equally long window before it, which is what makes "what
// changed" a comparison rather than an assertion.

const LA = 'America/Los_Angeles';

/** Hour 0–23 in Los Angeles, DST-correct via the IANA database. */
export function laHour(d = new Date()) {
  const h = new Intl.DateTimeFormat('en-US', { timeZone: LA, hour: 'numeric', hour12: false }).format(d);
  return parseInt(h, 10) % 24;
}

/** yyyy-mm-dd in Los Angeles. */
export function laDate(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: LA, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
}

/** "Sat 20 Sep, 08:00" in Los Angeles — for labelling a window to a human. */
export function laLabel(d) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: LA, weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(d);
}

/**
 * The current window and the one immediately before it.
 * @param {Date} now
 * @param {number} hours
 */
export function windows(now = new Date(), hours = 24) {
  const ms = hours * 60 * 60 * 1000;
  const end = now;
  const start = new Date(end.getTime() - ms);
  const priorStart = new Date(start.getTime() - ms);
  return {
    hours,
    start, end,
    priorStart, priorEnd: start,
    label: `${laLabel(start)} → ${laLabel(end)} Pacific`,
    priorLabel: `${laLabel(priorStart)} → ${laLabel(start)} Pacific`,
  };
}
