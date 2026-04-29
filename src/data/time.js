// Rearview / data / time.js
// Estimates time spent from visit gaps. Each visit runs until the next
// visit anywhere, capped at SESSION_GAP_MS. Lone visits get a default.

const SESSION_GAP_MS = 5 * 60 * 1000;
const SINGLE_VISIT_MS = 60 * 1000;

/**
 * @returns {{ byHost, byDay, total, byCatDay, byCatDaySites }}
 *  byCatDay: Map<category, Map<dayStartMs, ms>>
 *  byCatDaySites: Map<category, Map<dayStartMs, Map<host, ms>>>
 */
export function estimateTime(visits, categorize) {
  const sorted = [...visits].sort((a, b) => a.visitTime - b.visitTime);

  const byHost = new Map();
  const byDay = new Map();
  const byCatDay = new Map();
  const byCatDaySites = new Map();
  let total = 0;

  for (let i = 0; i < sorted.length; i++) {
    const v = sorted[i];
    const next = sorted[i + 1];
    const gap = next ? next.visitTime - v.visitTime : SESSION_GAP_MS + 1;
    const duration = gap < SESSION_GAP_MS ? gap : SINGLE_VISIT_MS;
    total += duration;

    if (v.hostname) {
      byHost.set(v.hostname, (byHost.get(v.hostname) || 0) + duration);
    }

    const dayKey = startOfDayMs(v.visitTime);
    byDay.set(dayKey, (byDay.get(dayKey) || 0) + duration);

    if (categorize && v.hostname) {
      const cat = categorize(v.hostname);

      if (!byCatDay.has(cat)) byCatDay.set(cat, new Map());
      const catMap = byCatDay.get(cat);
      catMap.set(dayKey, (catMap.get(dayKey) || 0) + duration);

      if (!byCatDaySites.has(cat)) byCatDaySites.set(cat, new Map());
      const catSitesMap = byCatDaySites.get(cat);
      if (!catSitesMap.has(dayKey)) catSitesMap.set(dayKey, new Map());
      const dayHostMap = catSitesMap.get(dayKey);
      dayHostMap.set(v.hostname, (dayHostMap.get(v.hostname) || 0) + duration);
    }
  }

  return { byHost, byDay, total, byCatDay, byCatDaySites };
}

export function startOfDayMs(ms) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function formatDuration(ms) {
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "less than a minute";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDurationShort(ms) {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const h = minutes / 60;
  if (h < 10) return `${h.toFixed(1)}h`;
  return `${Math.round(h)}h`;
}
