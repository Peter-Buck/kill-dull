// The Intelligence model.
//
// Rows in, briefing out. Pure: no network, no clock, no environment. Both the
// /intelligence page and the daily email call this same function, because two
// analysis paths would eventually disagree and there would be no way to tell
// which one was lying.
//
// The epistemic rules of the collection layer survive intact here:
//
//   * A network operator is not an employer. Only ORG_IDENTIFIED — a company
//     name corroborated by a business/education/government network type — is
//     reported as an organisation. ORG_POSSIBLE is reported separately, always
//     labelled as a lead.
//   * Weak evidence stays weak. Nothing in this file promotes a signal.
//   * UNKNOWN stays UNKNOWN. It is counted and shown, never quietly dropped
//     into a residual bucket that implies knowledge.
//   * No identity inference. A visitor is a distinct_id and nothing more; the
//     labels here are ordinals, not names.
//   * No raw IP. The rows do not contain one — collection never stores it —
//     and nothing here reconstructs an address from what is left.
//
// The briefing answers five questions in this order: what happened, what looks
// interesting, what they did, what changed, what deserves attention.

const DWELL_LABEL = {
  5: '0–5s', 15: '5–15s', 30: '15–30s', 60: '30–60s',
  120: '1–2m', 300: '2–5m', 100000: '5m+',
};
const DWELL_ORDER = [5, 15, 30, 60, 120, 300, 100000];

const INTENT_EVENTS = {
  contact_submitted: 'Contact form submitted',
  cta_click: 'BENCH commitment started',
  email_click: 'Email opened',
  linkedin_click: 'LinkedIn followed',
  outbound_click: 'Outbound reference followed',
  reading_opened: 'Published Reading opened',
};

// Events that represent a deliberate act rather than a page being rendered.
// Ordered by how much of a decision each one takes.
const INTENT_WEIGHT = {
  contact_submitted: 100,
  cta_click: 60,
  email_click: 40,
  reading_opened: 12,
  linkedin_click: 10,
  outbound_click: 4,
};

const ORG_STATES = new Set(['ORG_IDENTIFIED', 'ORG_POSSIBLE']);

function dwellSeconds(b) {
  const n = Number(b);
  return Number.isFinite(n) ? n : 0;
}

function bump(map, key, by = 1) {
  if (key == null || key === '') return;
  map.set(key, (map.get(key) || 0) + by);
}

function addTo(map, key, id) {
  if (key == null || key === '') return;
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(id);
}

function descend(entries) {
  return entries.sort((a, b) => b.count - a.count || String(a.key).localeCompare(String(b.key)));
}

function tally(map) {
  return descend([...map].map(([key, v]) => ({
    key, count: v instanceof Set ? v.size : v,
  })));
}

/** "New York, NY" / "London, GB" / "Unknown location". Region falls back to country. */
export function placeLabel(row) {
  const region = row.geo_region || row.geo_country;
  if (row.geo_city && region) return `${row.geo_city}, ${region}`;
  return row.geo_city || row.geo_country || null;
}

/**
 * How a visitor's network may be described, and whether an organisation may be
 * named at all. This is the single gate every organisation claim passes through.
 */
export function networkClaim(row) {
  const state = row.net_state || 'UNKNOWN';
  const name = row.net_name || null;
  const org = row.net_org || null;
  // org_confidence is written by collection; HIGH only ever accompanies
  // ORG_IDENTIFIED. Both are required, so a mismatch fails closed.
  const high = row.org_confidence === 'HIGH' && state === 'ORG_IDENTIFIED' && Boolean(org);

  switch (state) {
    case 'ORG_IDENTIFIED':
      return high
        ? { state, org, confidence: 'HIGH', network: name, label: org }
        : { state, org: null, confidence: 'NONE', network: name, label: name || 'ORG UNKNOWN' };
    case 'ORG_POSSIBLE':
      return { state, org, confidence: 'LOW', network: name, label: `${org} · ORG POSSIBLE` };
    case 'PRIVATE_RELAY':
      return { state, org: null, confidence: 'NONE', network: name,
        label: name === 'Apple Private Relay' ? 'Apple Private Relay · ORG UNKNOWN'
          : `${name ? `${name} · ` : ''}PRIVATE RELAY · ORG UNKNOWN` };
    case 'VPN_PROXY':
      return { state, org: null, confidence: 'NONE', network: name,
        label: `${name ? `${name} · ` : ''}VPN / PROXY · ORG UNKNOWN` };
    case 'DATACENTER':
      return { state, org: null, confidence: 'NONE', network: name,
        label: `${name ? `${name} · ` : ''}DATACENTER · ORG UNKNOWN` };
    case 'MOBILE':
      return { state, org: null, confidence: 'NONE', network: name,
        label: `${name ? `${name} · ` : ''}MOBILE · ORG UNKNOWN` };
    case 'RESIDENTIAL':
      return { state, org: null, confidence: 'NONE', network: name,
        label: `${name ? `${name} · ` : ''}ORG UNKNOWN` };
    default:
      return { state: 'UNKNOWN', org: null, confidence: 'NONE', network: name, label: 'ORG UNKNOWN' };
  }
}

/** Pages that are the site arguing for itself, as opposed to legal boilerplate. */
function isSubstantive(pageType) {
  return ['HOME', 'DISCIPLINE', 'BENCH', 'READINGS', 'COMPANY', 'CONTACT'].includes(pageType);
}

function pageTypeOf(row) {
  if (row.page_type) return row.page_type;
  const p = String(row.path || '').replace(/\.html$/, '');
  if (p === '/' || p === '') return 'HOME';
  const m = ['discipline', 'bench', 'readings', 'contact'].find((x) => p.startsWith(`/${x}`));
  if (m) return m.toUpperCase();
  if (p.startsWith('/bureau')) return 'COMPANY';
  if (/^\/(privacy|terms|accessibility)/.test(p)) return 'LEGAL';
  return 'OTHER';
}

/**
 * Build one visitor's record from their events, newest facts winning for the
 * mutable ones (geography and network can legitimately change mid-visit when
 * someone moves from office wifi to a phone).
 */
function visitorRecord(id, rows) {
  const sorted = [...rows].sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const journey = [];
  const pages = new Set();
  const readings = new Set();
  const intents = [];
  let maxDwell = 0;
  let maxScroll = 0;
  const networksSeen = new Map();
  const placesSeen = new Map();

  for (const r of sorted) {
    const claim = networkClaim(r);
    if (r.net_state) bump(networksSeen, claim.label);
    const place = placeLabel(r);
    if (place) bump(placesSeen, place);

    if (r.event === 'content_view') {
      const t = pageTypeOf(r);
      pages.add(t);
      if (journey[journey.length - 1] !== t) journey.push(t);
    }
    if (r.event === 'content_dwell') {
      maxDwell = Math.max(maxDwell, dwellSeconds(r.dwell_bucket));
      const s = Number(r.scroll_depth_bucket);
      if (Number.isFinite(s)) maxScroll = Math.max(maxScroll, s);
    }
    if (r.event === 'reading_opened' && r.reading_brand) readings.add(r.reading_brand);
    if (INTENT_EVENTS[r.event]) {
      intents.push({ event: r.event, label: INTENT_EVENTS[r.event], target: r.target || r.reading_brand || null });
    }
  }

  // The network claim shown for the visitor is the strongest one their own
  // events support — an ORG_IDENTIFIED office visit is not erased by a later
  // event from the same id on a phone — but it is never combined across rows.
  const ranked = sorted
    .map(networkClaim)
    .sort((a, b) => (ORG_STATES.has(b.state) ? 1 : 0) - (ORG_STATES.has(a.state) ? 1 : 0)
      || (b.confidence === 'HIGH' ? 1 : 0) - (a.confidence === 'HIGH' ? 1 : 0));
  const claim = ranked[0] || networkClaim({});

  const place = [...placesSeen].sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const weight = intents.reduce((sum, i) => sum + (INTENT_WEIGHT[i.event] || 0), 0)
    + (claim.confidence === 'HIGH' ? 50 : 0)
    + (claim.state === 'ORG_POSSIBLE' ? 8 : 0)
    + Math.min(pages.size, 6) * 6
    + (maxDwell >= 120 ? 10 : maxDwell >= 60 ? 6 : 0)
    + (maxScroll >= 75 ? 4 : 0);

  return {
    id,
    firstSeen: first?.timestamp || null,
    lastSeen: last?.timestamp || null,
    events: sorted.length,
    journey,
    pages: [...pages],
    substantivePages: [...pages].filter(isSubstantive).length,
    readings: [...readings],
    intents,
    maxDwell,
    maxDwellLabel: maxDwell ? DWELL_LABEL[maxDwell] || `${maxDwell}s` : null,
    maxScroll,
    place,
    placesSeen: [...placesSeen.keys()],
    network: claim,
    networkLabels: [...networksSeen.keys()],
    weight,
    returning: false, // set by aggregate(), which alone knows the earlier window
  };
}

function summarise(rows) {
  const byVisitor = new Map();
  for (const r of rows) {
    const id = r.distinct_id;
    if (!id) continue;
    if (!byVisitor.has(id)) byVisitor.set(id, []);
    byVisitor.get(id).push(r);
  }
  const views = rows.filter((r) => r.event === 'content_view').length;
  const intents = rows.filter((r) => INTENT_EVENTS[r.event]).length;
  return { visitors: byVisitor, events: rows.length, views, intents };
}

function delta(now, before) {
  const diff = now - before;
  return {
    now, before, diff,
    pct: before === 0 ? (now === 0 ? 0 : null) : Math.round((diff / before) * 100),
  };
}

/**
 * @param {object} input
 * @param {Array<object>} input.rows        events inside the reporting window
 * @param {Array<object>} input.priorRows   events in the equally long window before it
 * @param {Set<string>|Array<string>} [input.knownIds] ids seen before the window opened
 * @param {object} input.window             from lib/intel/window.mjs
 */
export function aggregate({ rows = [], priorRows = [], knownIds = [], window = {} } = {}) {
  const known = knownIds instanceof Set ? knownIds : new Set(knownIds);
  const now = summarise(rows);
  const before = summarise(priorRows);

  // Visitors, numbered in order of first appearance. The ordinal is a label for
  // this briefing only; it identifies a browser's consent cookie, not a person,
  // and it is not stable between briefings.
  const visitors = [...now.visitors.entries()]
    .map(([id, rs]) => visitorRecord(id, rs))
    .sort((a, b) => String(a.firstSeen).localeCompare(String(b.firstSeen)));
  visitors.forEach((v, i) => {
    v.label = `Anonymous #${i + 1}`;
    v.returning = known.has(v.id) || before.visitors.has(v.id);
  });
  // The raw distinct_id is a join key, not something to publish. It leaves the
  // model here so neither the page nor the email can print it by accident.
  const publishable = visitors.map(({ id, ...rest }) => rest);

  // WHAT HAPPENED
  const pageViews = new Map();
  const pageVisitors = new Map();
  const dwellByPage = new Map();
  for (const r of rows) {
    if (r.event === 'content_view') {
      const t = pageTypeOf(r);
      bump(pageViews, t);
      addTo(pageVisitors, t, r.distinct_id);
    }
    if (r.event === 'content_dwell') {
      const t = pageTypeOf(r);
      if (!dwellByPage.has(t)) dwellByPage.set(t, []);
      dwellByPage.get(t).push(dwellSeconds(r.dwell_bucket));
    }
  }
  const pages = tally(pageViews).map(({ key, count }) => {
    const d = (dwellByPage.get(key) || []).sort((a, b) => a - b);
    const median = d.length ? d[Math.floor(d.length / 2)] : 0;
    return {
      pageType: key,
      views: count,
      visitors: pageVisitors.get(key)?.size || 0,
      medianDwell: median ? DWELL_LABEL[median] || `${median}s` : null,
      deepReads: d.filter((x) => x >= 60).length,
    };
  });

  // Dwell distribution across the whole window — how the site was read, not who.
  const dwellDist = DWELL_ORDER.map((b) => ({
    bucket: b,
    label: DWELL_LABEL[b],
    count: rows.filter((r) => r.event === 'content_dwell' && dwellSeconds(r.dwell_bucket) === b).length,
  })).filter((d) => d.count > 0);

  // WHAT THEY DID
  const intentCounts = new Map();
  const intentVisitors = new Map();
  for (const r of rows) {
    if (!INTENT_EVENTS[r.event]) continue;
    bump(intentCounts, r.event);
    addTo(intentVisitors, r.event, r.distinct_id);
  }
  const intents = tally(intentCounts).map(({ key, count }) => ({
    event: key, label: INTENT_EVENTS[key], count, visitors: intentVisitors.get(key)?.size || 0,
  }));

  const readingOpens = new Map();
  const readingVisitors = new Map();
  for (const r of rows) {
    if (r.event !== 'reading_opened' || !r.reading_brand) continue;
    bump(readingOpens, r.reading_brand);
    addTo(readingVisitors, r.reading_brand, r.distinct_id);
  }
  const readings = tally(readingOpens).map(({ key, count }) => ({
    brand: key, opens: count, visitors: readingVisitors.get(key)?.size || 0,
  }));

  const outbound = tally(rows.reduce((m, r) => {
    if (r.event === 'outbound_click' && r.target) bump(m, r.target);
    return m;
  }, new Map())).map(({ key, count }) => ({ target: key, count }));

  // HOW THEY ARRIVED
  const referrers = tally(rows.reduce((m, r) => {
    if (r.event === 'content_view') bump(m, r.referrer_domain || 'direct / unknown');
    return m;
  }, new Map())).map(({ key, count }) => ({ source: key, count }));
  const campaigns = tally(rows.reduce((m, r) => {
    if (r.utm_source) bump(m, r.utm_source);
    return m;
  }, new Map())).map(({ key, count }) => ({ source: key, count }));

  // WHERE
  const placeMap = new Map();
  const countryMap = new Map();
  for (const v of visitors) {
    if (v.place) addTo(placeMap, v.place, v.id);
    else addTo(placeMap, 'Location unknown', v.id);
  }
  for (const r of rows) addTo(countryMap, r.geo_country || 'Unknown', r.distinct_id);
  const places = tally(placeMap).map(({ key, count }) => ({ place: key, visitors: count }));
  const countries = tally(countryMap).map(({ key, count }) => ({ country: key, visitors: count }));

  // NETWORK AND ORGANISATION
  const stateMap = new Map();
  for (const v of visitors) addTo(stateMap, v.network.state, v.id);
  const networkStates = tally(stateMap).map(({ key, count }) => ({ state: key, visitors: count }));

  const identified = [];
  const possible = [];
  for (const v of publishable) {
    if (v.network.confidence === 'HIGH') identified.push(v);
    else if (v.network.state === 'ORG_POSSIBLE') possible.push(v);
  }
  const orgFold = (list) => {
    const m = new Map();
    for (const v of list) {
      const name = v.network.org;
      if (!name) continue;
      if (!m.has(name)) m.set(name, { org: name, visitors: 0, views: 0, pages: new Set(), places: new Set() });
      const e = m.get(name);
      e.visitors += 1;
      e.views += v.events;
      v.pages.forEach((p) => e.pages.add(p));
      if (v.place) e.places.add(v.place);
    }
    return [...m.values()].map((e) => ({
      ...e, pages: [...e.pages], places: [...e.places],
    })).sort((a, b) => b.visitors - a.visitors || a.org.localeCompare(b.org));
  };
  const organisations = { identified: orgFold(identified), possible: orgFold(possible) };

  // WHAT CHANGED
  const change = {
    visitors: delta(now.visitors.size, before.visitors.size),
    events: delta(now.events, before.events),
    views: delta(now.views, before.views),
    intents: delta(now.intents, before.intents),
  };

  // WHAT DESERVES ATTENTION
  // Ordering, not judgement: the reasons are printed alongside so the ranking
  // can be disagreed with. A visitor with no reason at all never appears.
  const attention = publishable
    .map((v) => {
      const reasons = [];
      if (v.network.confidence === 'HIGH') reasons.push(`Identified organisation: ${v.network.org}`);
      else if (v.network.state === 'ORG_POSSIBLE') reasons.push(`Possible organisation (unconfirmed): ${v.network.org}`);
      for (const i of v.intents) reasons.push(i.target ? `${i.label} (${i.target})` : i.label);
      if (v.substantivePages >= 3) reasons.push(`Read ${v.substantivePages} substantive pages`);
      if (v.maxDwell >= 120) reasons.push(`Stayed ${v.maxDwellLabel} on a page`);
      if (v.returning) reasons.push('Returning visitor');
      return { ...v, reasons };
    })
    .filter((v) => v.reasons.length > 0)
    .sort((a, b) => b.weight - a.weight || b.events - a.events)
    .slice(0, 12);

  const errors = tally(rows.reduce((m, r) => {
    if (r.event === 'not_found_404') bump(m, `404 · ${r.path || 'unknown path'}`);
    if (r.event === 'api_error') bump(m, `api_error · ${r.route || r.stage || 'unknown'} ${r.code || r.status || ''}`.trim());
    return m;
  }, new Map())).map(({ key, count }) => ({ what: key, count }));

  const returning = visitors.filter((v) => v.returning).length;

  return {
    window,
    totals: {
      events: now.events,
      visitors: now.visitors.size,
      views: now.views,
      intents: now.intents,
      returning,
      new: now.visitors.size - returning,
    },
    change,
    pages,
    dwellDist,
    intents,
    readings,
    outbound,
    referrers,
    campaigns,
    places,
    countries,
    networkStates,
    organisations,
    attention,
    visitors: publishable,
    errors,
    quiet: now.events === 0,
  };
}

export { DWELL_LABEL, INTENT_EVENTS };
