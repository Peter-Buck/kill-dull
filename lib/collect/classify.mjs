// Network classification — the line between fact and inference.
//
// Pure and dependency-free so every branch (VPN, mobile, private relay, unknown,
// consumer ISP) is unit-testable without a network. The IO wrapper lives in
// network.ts; this file only decides what a set of facts is allowed to claim.
//
// The governing rule: a network operator is not an employer. Knowing a visitor
// came through Comcast tells us nothing about who they are, so Comcast must never
// be surfaced where a company name would be read as one.

/** @typedef {"ORG_IDENTIFIED"|"ORG_POSSIBLE"|"RESIDENTIAL"|"MOBILE"|"VPN_PROXY"|"PRIVATE_RELAY"|"DATACENTER"|"UNKNOWN"} NetState */

/**
 * Facts as reported by the enrichment provider. Every field is optional: the
 * classifier must behave when the provider is absent, partial, or unreachable.
 * @typedef {Object} NetworkFacts
 * @property {number|null} [asn]
 * @property {string|null} [asName]        AS organization name
 * @property {string|null} [isp]           network / connection organization
 * @property {string|null} [companyName]
 * @property {string|null} [companyDomain]
 * @property {string|null} [companyType]   business | isp | education | government | hosting
 * @property {string|null} [connectionType] isp | business | hosting | education | government
 * @property {string|null} [carrier]       mobile carrier name, when present
 * @property {boolean} [isVpn]
 * @property {boolean} [isProxy]
 * @property {boolean} [isTor]
 * @property {boolean} [isRelay]
 * @property {boolean} [isHosting]
 * @property {boolean} [isAnonymous]
 */

/**
 * @typedef {Object} NetworkSignal
 * @property {NetState} net_state
 * @property {number|null} net_asn
 * @property {string|null} net_name     the network's own name — always safe to show
 * @property {string|null} net_org      a company, ONLY when genuinely identified
 * @property {string|null} net_domain
 * @property {string|null} net_type
 */

const norm = (v) => (typeof v === "string" ? v.trim().toLowerCase() : "");

const matches = (value, patterns) => {
  const v = norm(value);
  if (!v) return false;
  return patterns.some((p) => v.includes(p));
};

// Relay detection. Kept narrow on purpose: the provider's is_relay flag is the
// primary signal, and these only catch a relay the flag missed. "apple inc" is
// deliberately NOT here — Apple's corporate network is a real employer, and
// matching it as a relay would suppress a true identification.
const RELAY = ["icloud private relay", "apple private relay", "private relay"];

// Once a relay is confirmed, these say whose it is. Safe inside that branch:
// we already know the traffic is relayed, so an Apple name identifies the relay
// rather than the visitor.
const APPLE_RELAY = ["icloud", "apple", "private relay"];

const VPN = [
  "nordvpn", "expressvpn", "mullvad", "surfshark", "private internet access",
  "proton ag", "protonvpn", "cyberghost", "ipvanish", "windscribe", "tunnelbear",
  "hide.me", "purevpn", "vpn", "torguard", "perfect privacy",
];

// Clouds, CDNs and hosts. Traffic from these is infrastructure, not a workplace.
const HOSTING = [
  "amazon", "aws", "google cloud", "google llc", "microsoft", "azure",
  "cloudflare", "akamai", "fastly", "digitalocean", "linode", "hetzner", "ovh",
  "vultr", "oracle cloud", "alibaba", "tencent", "scaleway", "contabo",
  "leaseweb", "choopa", "quadranet", "m247", "datacamp", "hosting", "datacenter",
  "data center", "colocation", "server", "cdn",
];

// Mobile network operators.
const MOBILE = [
  "t-mobile", "at&t mobility", "verizon wireless", "cellco", "sprint",
  "vodafone", "orange", "telefonica", "movistar", "o2 ", "ee limited",
  "three uk", "telstra", "optus", "rogers", "bell mobility", "telus",
  "jio", "airtel", "softbank", "kddi", "ntt docomo", "china mobile",
  "mobile", "wireless", "cellular", "gsm", "lte",
];

// Consumer access networks. A real person, but the network says nothing about
// their employer — this is precisely the "Verizon Fios · ORG UNKNOWN" case.
const CONSUMER_ISP = [
  "comcast", "xfinity", "verizon", "fios", "at&t", "spectrum", "charter",
  "cox communications", "centurylink", "frontier", "optimum", "altice",
  "cablevision", "mediacom", "windstream", "suddenlink", "wow internet",
  "rcn", "starlink", "google fiber", "virgin media", "british telecom",
  "bt group", "sky broadband", "talktalk", "plusnet", "deutsche telekom",
  "telekom", "kpn", "ziggo", "telenor", "telia", "swisscom", "bouygues",
  "sfr", "free sas", "videotron", "shaw ", "telecom", "broadband", "cable",
  "communications", "internet services", "isp",
];

/** Names that are never an employer, whatever field they arrive in. */
function isGenericNetwork(name) {
  return (
    matches(name, RELAY) ||
    matches(name, VPN) ||
    matches(name, HOSTING) ||
    matches(name, MOBILE) ||
    matches(name, CONSUMER_ISP)
  );
}

/**
 * Decide what these facts genuinely support.
 * @param {NetworkFacts|null|undefined} f
 * @returns {NetworkSignal}
 */
export function classify(f) {
  /** @type {NetworkSignal} */
  const base = {
    net_state: "UNKNOWN",
    net_asn: null,
    net_name: null,
    net_org: null,
    net_domain: null,
    net_type: null,
  };
  if (!f) return base;

  // The network's own name is always safe to display — it describes the pipe,
  // not the person. Prefer the most specific label available.
  const netName = f.isp || f.asName || f.companyName || null;
  const asn = typeof f.asn === "number" && Number.isFinite(f.asn) ? f.asn : null;

  const out = {
    ...base,
    net_asn: asn,
    net_name: netName,
    net_domain: f.companyDomain ?? null,
    net_type: f.connectionType ?? f.companyType ?? null,
  };

  const everyName = [f.companyName, f.isp, f.asName].filter(Boolean).join(" | ");

  // Precedence runs most-specific first. Each branch below is a reason NOT to
  // name a company, so all of them are checked before any org claim is made.

  if (f.isRelay === true || matches(everyName, RELAY)) {
    // Name it Apple's only when the facts say Apple. Other relays exist, and
    // "Apple Private Relay" on a relay that isn't Apple's is a fabricated detail.
    const apple = matches(everyName, APPLE_RELAY);
    return {
      ...out,
      net_state: "PRIVATE_RELAY",
      net_name: apple ? "Apple Private Relay" : netName,
    };
  }
  if (f.isTor === true) return { ...out, net_state: "VPN_PROXY", net_name: netName || "Tor" };
  if (f.isVpn === true || f.isProxy === true || f.isAnonymous === true || matches(everyName, VPN)) {
    return { ...out, net_state: "VPN_PROXY" };
  }
  if (f.isHosting === true || norm(f.connectionType) === "hosting" ||
      norm(f.companyType) === "hosting" || matches(everyName, HOSTING)) {
    return { ...out, net_state: "DATACENTER" };
  }
  if (f.carrier || matches(everyName, MOBILE)) {
    return { ...out, net_state: "MOBILE", net_name: f.carrier || netName };
  }

  // Only now may a company be claimed — and only if the name is a real company
  // rather than a network operator wearing the company field.
  const company = typeof f.companyName === "string" ? f.companyName.trim() : "";
  if (company && !isGenericNetwork(company)) {
    const orgType = norm(f.companyType);
    const connType = norm(f.connectionType);
    const corporate = ["business", "education", "government"];
    // Both signals agreeing that this is an organisation's own network is the
    // only thing that earns an unhedged claim.
    if (corporate.includes(orgType) || corporate.includes(connType)) {
      return { ...out, net_state: "ORG_IDENTIFIED", net_org: company };
    }
    // A company name with no corroborating network type is a lead, not a fact.
    return { ...out, net_state: "ORG_POSSIBLE", net_org: company };
  }

  if (matches(everyName, CONSUMER_ISP)) return { ...out, net_state: "RESIDENTIAL" };

  return out; // UNKNOWN — facts present, but none of them support a claim.
}

/**
 * The organisation half of the display line. Returns the company when one is
 * genuinely known, otherwise the network plus an explicit statement of ignorance.
 * @param {NetworkSignal} s
 * @returns {string}
 */
export function orgLabel(s) {
  switch (s.net_state) {
    case "ORG_IDENTIFIED":
      return s.net_org || "ORG UNKNOWN";
    case "ORG_POSSIBLE":
      return `${s.net_org} · ORG POSSIBLE`;
    case "PRIVATE_RELAY":
      return s.net_name === "Apple Private Relay"
        ? "Apple Private Relay · ORG UNKNOWN"
        : `${s.net_name ? `${s.net_name} · ` : ""}PRIVATE RELAY · ORG UNKNOWN`;
    case "VPN_PROXY":
      return `${s.net_name ? `${s.net_name} · ` : ""}VPN / PROXY · ORG UNKNOWN`;
    case "DATACENTER":
      return `${s.net_name ? `${s.net_name} · ` : ""}DATACENTER · ORG UNKNOWN`;
    case "MOBILE":
      return `${s.net_name ? `${s.net_name} · ` : ""}MOBILE · ORG UNKNOWN`;
    case "RESIDENTIAL":
      return `${s.net_name ? `${s.net_name} · ` : ""}ORG UNKNOWN`;
    default:
      return "ORG UNKNOWN";
  }
}
