// Vercel-native geography. Read from the CDN's own request headers — no external
// call, no cost, no latency, and nothing here ever touches the IP address.
//
// Every value is server-derived. None of it is accepted from the client, and none
// of it goes through sanitizeProps(): a browser must never be able to claim a
// location it isn't in.
//
// Ported from peter-buck.com's geo.ts. The logic is unchanged; the TypeScript
// types are gone, and readGeo() now takes either a WHATWG Headers or the plain
// object a Node-style Vercel function receives, because this site's functions
// are CommonJS handlers rather than Next.js routes.

export const EMPTY_GEO = {
  geo_city: null,
  geo_region: null,
  geo_country: null,
  geo_latitude: null,
  geo_longitude: null,
  geo_timezone: null,
  geo_postal: null,
};

// IP geolocation resolves to a city centroid, not to a person. Two decimals
// (~1.1km) preserves that honestly; more digits would imply a precision the
// underlying data does not have.
const COORD_PRECISION = 2;

/**
 * One accessor for both header shapes. Node lowercases incoming header names,
 * and Headers.get() is already case-insensitive, so a lowercase lookup is
 * correct for both.
 * @param {Headers|Record<string,string|string[]>} h
 * @returns {(key: string) => string | null}
 */
function getter(h) {
  if (h && typeof h.get === 'function') return (k) => h.get(k);
  if (h && typeof h === 'object') {
    return (k) => {
      const v = h[k] ?? h[k.toLowerCase()];
      // Node gives an array for repeated headers; none of these ever repeat,
      // but taking the first is the honest reading if one somehow does.
      return Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
    };
  }
  return () => null;
}

function text(get, key) {
  const raw = get(key);
  if (!raw) return null;
  const v = String(raw).trim();
  if (!v || v.length > 64) return null;
  return v;
}

// Vercel RFC3986-encodes city names, so "New%20York" and "Z%C3%BCrich" arrive
// encoded. Decode defensively: a malformed escape must not throw mid-request.
function decoded(get, key) {
  const v = text(get, key);
  if (v == null) return null;
  try {
    const out = decodeURIComponent(v).trim();
    return out || null;
  } catch {
    return v;
  }
}

function coord(get, key) {
  const v = text(get, key);
  if (v == null) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const f = 10 ** COORD_PRECISION;
  return Math.round(n * f) / f;
}

/** Extract geography from Vercel's edge headers. Absent headers → nulls, never throws. */
export function readGeo(h) {
  const get = getter(h);
  return {
    geo_city: decoded(get, 'x-vercel-ip-city'),
    geo_region: text(get, 'x-vercel-ip-country-region'),
    geo_country: text(get, 'x-vercel-ip-country'),
    geo_latitude: coord(get, 'x-vercel-ip-latitude'),
    geo_longitude: coord(get, 'x-vercel-ip-longitude'),
    geo_timezone: text(get, 'x-vercel-ip-timezone'),
    geo_postal: text(get, 'x-vercel-ip-postal-code'),
  };
}

/** "New York, NY" / "London, GB" / null — the location half of the display line. */
export function geoLabel(g) {
  const region = g.geo_region ?? g.geo_country;
  if (g.geo_city && region) return `${g.geo_city}, ${region}`;
  return g.geo_city ?? g.geo_country ?? null;
}
