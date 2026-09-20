// One renderer, two surfaces.
//
// The /intelligence page and the daily email are the same briefing. Writing it
// twice would guarantee they eventually disagreed, so the body is built once,
// with inline styles, because email clients strip stylesheets. The page wraps
// that same body in a document that adds the real Kill Dull webfonts; the email
// gets the fallbacks. Nothing else differs.
//
// This is Kill Dull's existing identity — ink, paper, yellow, Space Grotesk and
// IBM Plex Mono, square corners, rules rather than boxes. No redesign.

import { escapeHTML } from './escape.mjs';

const INK = '#0D0D0C';
const PAPER = '#EFEDE4';
const YELLOW = '#FFFF00';
const BORDER = '#2a2925';
const SECONDARY = '#8a8880';
const BODY = '#c9c6bd';

const SANS = "'Space Grotesk', Helvetica, Arial, sans-serif";
const MONO = "'IBM Plex Mono', 'SF Mono', Menlo, Consolas, monospace";

const s = {
  label: `font-family:${MONO};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${SECONDARY};margin:0 0 14px;`,
  h2: `font-family:${SANS};font-size:13px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${PAPER};margin:0 0 18px;padding-bottom:10px;border-bottom:1px solid ${BORDER};`,
  section: 'margin:0 0 44px;',
  body: `font-family:${SANS};font-size:15px;line-height:1.6;color:${BODY};margin:0 0 12px;`,
  small: `font-family:${MONO};font-size:11px;line-height:1.7;color:${SECONDARY};margin:0;`,
  row: `font-family:${SANS};font-size:14px;line-height:1.55;color:${BODY};padding:7px 0;border-bottom:1px solid ${BORDER};`,
  num: `font-family:${MONO};font-size:13px;color:${PAPER};`,
};

const esc = escapeHTML;

function pct(d) {
  if (!d) return '';
  if (d.pct === null) return d.now > 0 ? 'new' : '';
  if (d.pct === 0 && d.diff === 0) return 'no change';
  return `${d.diff > 0 ? '+' : ''}${d.pct}%`;
}

function changeColour(d) {
  if (!d || d.diff === 0) return SECONDARY;
  return d.diff > 0 ? YELLOW : SECONDARY;
}

function metric(name, d) {
  return `<td style="padding:0 20px 0 0;vertical-align:top;">
    <div style="${s.label}margin:0 0 6px;">${esc(name)}</div>
    <div style="font-family:${MONO};font-size:30px;line-height:1;color:${PAPER};">${d.now}</div>
    <div style="font-family:${MONO};font-size:11px;color:${changeColour(d)};margin-top:6px;">${esc(pct(d))} <span style="color:${SECONDARY};">vs ${d.before}</span></div>
  </td>`;
}

function section(title, inner) {
  if (!inner) return '';
  return `<div style="${s.section}"><div style="${s.h2}">${esc(title)}</div>${inner}</div>`;
}

function list(items) {
  if (!items.length) return '';
  return items.map((i) => `<div style="${s.row}">${i}</div>`).join('');
}

function pair(left, right) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="font-family:${SANS};font-size:14px;color:${BODY};">${left}</td>
    <td align="right" style="${s.num}white-space:nowrap;padding-left:16px;">${right}</td>
  </tr></table>`;
}

function attentionCard(v) {
  const head = [v.label, v.place, v.network.label].filter(Boolean).map(esc).join(' &middot; ');
  const reasons = v.reasons.map((r) => `<li style="margin:0 0 4px;">${esc(r)}</li>`).join('');
  const journey = v.journey.length
    ? `<div style="font-family:${MONO};font-size:11px;color:${SECONDARY};margin-top:8px;">${v.journey.map(esc).join(' &rarr; ')}</div>`
    : '';
  return `<div style="border-left:2px solid ${v.network.confidence === 'HIGH' ? YELLOW : BORDER};padding:2px 0 2px 14px;margin:0 0 22px;">
    <div style="font-family:${SANS};font-size:15px;font-weight:500;color:${PAPER};">${head}</div>
    <ul style="margin:8px 0 0;padding-left:16px;font-family:${SANS};font-size:13px;line-height:1.55;color:${BODY};">${reasons}</ul>
    ${journey}
  </div>`;
}

/** The subject line states the finding, not the product name. */
export function subjectFor(m) {
  const t = m.totals;
  if (m.quiet) return 'Kill Dull Intelligence — no recorded activity';
  const orgs = m.organisations.identified;
  if (orgs.length) {
    const names = orgs.slice(0, 2).map((o) => o.org).join(', ');
    return `Kill Dull Intelligence — ${names}${orgs.length > 2 ? ` +${orgs.length - 2}` : ''}, ${t.visitors} visitor${t.visitors === 1 ? '' : 's'}`;
  }
  if (t.intents > 0) return `Kill Dull Intelligence — ${t.intents} deliberate action${t.intents === 1 ? '' : 's'}, ${t.visitors} visitor${t.visitors === 1 ? '' : 's'}`;
  return `Kill Dull Intelligence — ${t.visitors} visitor${t.visitors === 1 ? '' : 's'}, ${t.views} page view${t.views === 1 ? '' : 's'}`;
}

/** The briefing body. Inline styles only — valid inside an email and on a page. */
export function briefingBody(m, meta = {}) {
  const t = m.totals;
  const parts = [];

  parts.push(`<div style="margin:0 0 36px;">
    <div style="font-family:${SANS};font-size:22px;font-weight:700;letter-spacing:0.02em;color:${PAPER};">KILL DULL INTELLIGENCE<span style="display:inline-block;width:0.6em;height:0.6em;background:${YELLOW};margin-left:6px;"></span></div>
    <div style="font-family:${MONO};font-size:11px;color:${SECONDARY};margin-top:8px;">${esc(m.window.label || '')}</div>
  </div>`);

  if (m.quiet) {
    parts.push(section('WHAT HAPPENED', `
      <p style="${s.body}">No events were recorded in this window.</p>
      <p style="${s.small}">This is a statement about recorded traffic, not about the site. Collection only runs for visitors who have accepted cookies, so a quiet window means either that nobody came, or that those who did declined consent. Both are reported the same way here, because there is no way to tell them apart, and inventing a distinction would be worse than the silence.</p>
    `));
  } else {
    parts.push(section('WHAT HAPPENED', `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;"><tr>
        ${metric('Visitors', m.change.visitors)}
        ${metric('Page views', m.change.views)}
        ${metric('Deliberate actions', m.change.intents)}
        ${metric('Events', m.change.events)}
      </tr></table>
      <p style="${s.small}">${t.new} new &middot; ${t.returning} returning (seen before this window). Change is measured against ${esc(m.window.priorLabel || 'the preceding window')}.</p>
    `));
  }

  if (m.attention.length) {
    parts.push(section('WHAT DESERVES ATTENTION', `
      ${m.attention.map(attentionCard).join('')}
      <p style="${s.small}">Ordered by how much of a decision each visit took, with the reasons shown so the ordering can be disagreed with. An organisation is named only where the network is that organisation's own; everything else says so.</p>
    `));
  }

  const orgIdentified = m.organisations.identified;
  const orgPossible = m.organisations.possible;
  if (orgIdentified.length || orgPossible.length || m.networkStates.length) {
    const idBlock = orgIdentified.length ? `
      <div style="${s.label}">Identified organisations &mdash; the network belongs to the company</div>
      ${list(orgIdentified.map((o) => pair(
        `<span style="color:${PAPER};">${esc(o.org)}</span>${o.places.length ? ` <span style="color:${SECONDARY};font-size:12px;">${esc(o.places.join(', '))}</span>` : ''}`,
        `${o.visitors} visitor${o.visitors === 1 ? '' : 's'}`,
      )))}` : `<p style="${s.body}">No organisation was identified with corroborated evidence in this window.</p>`;

    const possibleBlock = orgPossible.length ? `
      <div style="${s.label}margin:28px 0 14px;">Possible only &mdash; a company name with no corroborating network type</div>
      ${list(orgPossible.map((o) => pair(
        `<span style="color:${BODY};">${esc(o.org)}</span> <span style="color:${SECONDARY};font-size:12px;">ORG POSSIBLE</span>`,
        `${o.visitors} visitor${o.visitors === 1 ? '' : 's'}`,
      )))}
      <p style="${s.small}margin-top:10px;">These are leads, not facts. A company name attached to an address proves who runs the network, never who was using it.</p>` : '';

    const stateBlock = m.networkStates.length ? `
      <div style="${s.label}margin:28px 0 14px;">How visitors connected</div>
      ${list(m.networkStates.map((n) => pair(esc(n.state.replace(/_/g, ' ')), `${n.visitors}`)))}` : '';

    parts.push(section('WHO, AS FAR AS THE EVIDENCE GOES', idBlock + possibleBlock + stateBlock));
  }

  if (m.intents.length || m.readings.length || m.outbound.length) {
    const i = m.intents.length ? `
      <div style="${s.label}">Deliberate actions</div>
      ${list(m.intents.map((x) => pair(esc(x.label), `${x.count} <span style="color:${SECONDARY};">/ ${x.visitors} visitor${x.visitors === 1 ? '' : 's'}</span>`)))}` : '';
    const r = m.readings.length ? `
      <div style="${s.label}margin:28px 0 14px;">Published Readings opened</div>
      ${list(m.readings.map((x) => pair(esc(x.brand), `${x.opens}`)))}` : '';
    const o = m.outbound.length ? `
      <div style="${s.label}margin:28px 0 14px;">Outbound references followed</div>
      ${list(m.outbound.map((x) => pair(esc(x.target), `${x.count}`)))}` : '';
    parts.push(section('WHAT THEY DID', i + r + o));
  }

  if (m.pages.length) {
    parts.push(section('WHAT THEY READ', `
      ${list(m.pages.map((p) => pair(
        `<span style="color:${PAPER};">${esc(p.pageType)}</span>${p.medianDwell ? ` <span style="color:${SECONDARY};font-size:12px;">median ${esc(p.medianDwell)}</span>` : ''}`,
        `${p.views} <span style="color:${SECONDARY};">/ ${p.visitors} visitor${p.visitors === 1 ? '' : 's'}</span>`,
      )))}
      ${m.dwellDist.length ? `<div style="${s.label}margin:28px 0 14px;">Time on page</div>${list(m.dwellDist.map((d) => pair(esc(d.label), `${d.count}`)))}` : ''}
      <p style="${s.small}margin-top:10px;">Time and depth are recorded in buckets by the collector. Nothing finer exists.</p>
    `));
  }

  if (m.places.length || m.referrers.length) {
    const p = m.places.length ? `
      <div style="${s.label}">Where they were</div>
      ${list(m.places.map((x) => pair(esc(x.place), `${x.visitors}`)))}
      <p style="${s.small}margin-top:10px;">City-level, from the CDN's own edge headers. It resolves to a city centroid, never to an address, and the IP address it came from is not stored anywhere.</p>` : '';
    const ref = m.referrers.length ? `
      <div style="${s.label}margin:28px 0 14px;">How they arrived</div>
      ${list(m.referrers.map((x) => pair(esc(x.source), `${x.count}`)))}` : '';
    const camp = m.campaigns.length ? `
      <div style="${s.label}margin:28px 0 14px;">Campaigns</div>
      ${list(m.campaigns.map((x) => pair(esc(x.source), `${x.count}`)))}` : '';
    parts.push(section('WHERE FROM', p + ref + camp));
  }

  if (m.errors.length) {
    parts.push(section('THINGS THAT WENT WRONG', list(m.errors.map((e) => pair(esc(e.what), `${e.count}`)))));
  }

  parts.push(`<div style="border-top:1px solid ${BORDER};padding-top:18px;margin-top:8px;">
    <p style="${s.small}">Built from Kill Dull's own consented analytics. No third-party tracker, no session replay, no autocapture, no form contents. Visitors are browser-level ordinals within this briefing only &mdash; not people, not accounts, and not stable between briefings. No IP address is stored, displayed or reconstructible from anything above.</p>
    ${meta.dashboardURL ? `<p style="${s.small}margin-top:12px;"><a href="${esc(meta.dashboardURL)}" style="color:${YELLOW};text-decoration:none;">Open the full Intelligence page &rarr;</a></p>` : ''}
    ${meta.note ? `<p style="${s.small}margin-top:12px;">${esc(meta.note)}</p>` : ''}
  </div>`);

  return parts.join('');
}

/** Email document: one dark table, inline styles, no stylesheet. */
export function emailHTML(m, meta = {}) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><title>${esc(subjectFor(m))}</title></head>
<body style="margin:0;padding:0;background:${INK};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${INK};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;">
<tr><td>${briefingBody(m, meta)}</td></tr>
</table></td></tr></table></body></html>`;
}

/** Page document: the same body, plus the real webfonts the site already serves. */
export function pageHTML(m, meta = {}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>Intelligence &middot; Kill Dull</title>
<link rel="icon" href="/favicon.ico">
<link rel="stylesheet" href="/assets/fonts.css">
<style>
  html,body{background:${INK};margin:0;padding:0;}
  *{box-sizing:border-box;}
  *{border-radius:0 !important;}
  a:hover{color:${YELLOW};}
  .wrap{max-width:720px;margin:0 auto;padding:48px 20px 96px;}
  .nav{font-family:${MONO};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${SECONDARY};margin:0 0 32px;}
  .nav a{color:${SECONDARY};text-decoration:none;margin-right:16px;}
  .nav a[aria-current]{color:${YELLOW};}
</style></head>
<body><div class="wrap">
<div class="nav">${(meta.ranges || []).map((r) => `<a href="${esc(r.href)}"${r.current ? ' aria-current="page"' : ''}>${esc(r.label)}</a>`).join('')}</div>
${briefingBody(m, meta)}
</div></body></html>`;
}

/** Plain-text alternative. Same facts, same hedges, no markup. */
export function briefingText(m, meta = {}) {
  const L = [];
  L.push('KILL DULL INTELLIGENCE');
  L.push(m.window.label || '');
  L.push('');
  if (m.quiet) {
    L.push('WHAT HAPPENED');
    L.push('No events were recorded in this window. Collection only runs for');
    L.push('visitors who have accepted cookies, so this means either that nobody');
    L.push('came or that those who did declined consent. The two are not');
    L.push('distinguishable, and are not guessed at here.');
  } else {
    const t = m.totals;
    L.push('WHAT HAPPENED');
    L.push(`Visitors: ${t.visitors} (${pct(m.change.visitors)} vs ${m.change.visitors.before})`);
    L.push(`Page views: ${t.views} (${pct(m.change.views)} vs ${m.change.views.before})`);
    L.push(`Deliberate actions: ${t.intents} (${pct(m.change.intents)} vs ${m.change.intents.before})`);
    L.push(`New: ${t.new}  Returning: ${t.returning}`);
    if (m.attention.length) {
      L.push('', 'WHAT DESERVES ATTENTION');
      for (const v of m.attention) {
        L.push(`- ${[v.label, v.place, v.network.label].filter(Boolean).join(' · ')}`);
        for (const r of v.reasons) L.push(`    ${r}`);
        if (v.journey.length) L.push(`    ${v.journey.join(' -> ')}`);
      }
    }
    if (m.organisations.identified.length) {
      L.push('', 'IDENTIFIED ORGANISATIONS');
      for (const o of m.organisations.identified) L.push(`- ${o.org}: ${o.visitors}`);
    }
    if (m.organisations.possible.length) {
      L.push('', 'POSSIBLE ONLY (leads, not facts)');
      for (const o of m.organisations.possible) L.push(`- ${o.org}: ${o.visitors}`);
    }
    if (m.intents.length) {
      L.push('', 'WHAT THEY DID');
      for (const i of m.intents) L.push(`- ${i.label}: ${i.count} (${i.visitors} visitors)`);
    }
    if (m.pages.length) {
      L.push('', 'WHAT THEY READ');
      for (const p of m.pages) L.push(`- ${p.pageType}: ${p.views} views, ${p.visitors} visitors${p.medianDwell ? `, median ${p.medianDwell}` : ''}`);
    }
    if (m.places.length) {
      L.push('', 'WHERE THEY WERE');
      for (const p of m.places) L.push(`- ${p.place}: ${p.visitors}`);
    }
    if (m.errors.length) {
      L.push('', 'THINGS THAT WENT WRONG');
      for (const e of m.errors) L.push(`- ${e.what}: ${e.count}`);
    }
  }
  L.push('', '--');
  L.push('Kill Dull\'s own consented analytics. No third-party tracker, no session');
  L.push('replay, no form contents. Visitors are ordinals within this briefing');
  L.push('only. No IP address is stored or displayed.');
  if (meta.dashboardURL) L.push('', meta.dashboardURL);
  return L.join('\n');
}
