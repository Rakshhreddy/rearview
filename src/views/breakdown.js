// Rearview / views / breakdown.js
// Shows where attention went, grouped by category.
// One slim stacked bar at the top, then a typographic legend underneath
// with the top sites in each category.

import { categorize, CATEGORIES, CATEGORY_ORDER } from "../data/categories.js";

export function renderBreakdown(visits, container) {
  if (!container) return;

  // Tally by category and by hostname inside each category.
  const tally = {};
  for (const cat of CATEGORY_ORDER) {
    tally[cat] = { total: 0, sites: new Map() };
  }

  for (const v of visits) {
    const cat = categorize(v.hostname);
    const bucket = tally[cat];
    bucket.total += 1;
    bucket.sites.set(v.hostname, (bucket.sites.get(v.hostname) || 0) + 1);
  }

  const totalAll = Object.values(tally).reduce((s, b) => s + b.total, 0);

  if (totalAll === 0) {
    container.innerHTML = `<p class="chart-note">No visits in this window yet.</p>`;
    return;
  }

  // Sort categories by their total, descending.
  const ordered = CATEGORY_ORDER.slice().sort(
    (a, b) => tally[b].total - tally[a].total
  );

  // Stacked bar.
  const segments = ordered
    .filter((cat) => tally[cat].total > 0)
    .map((cat) => {
      const pct = (tally[cat].total / totalAll) * 100;
      return `<div class="stack-segment cat-${slug(cat)}" style="flex: ${tally[cat].total};" title="${cat}: ${pct.toFixed(1)}%"></div>`;
    })
    .join("");

  // Legend rows.
  const legend = ordered
    .filter((cat) => tally[cat].total > 0)
    .map((cat) => {
      const data = tally[cat];
      const pct = (data.total / totalAll) * 100;

      const topSites = [...data.sites.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(
          ([host, n]) =>
            `<span class="site"><span class="site-host">${escapeHtml(host)}</span><span class="site-count">${n}</span></span>`
        )
        .join("");

      return `
        <div class="legend-row">
          <div class="legend-header">
            <span class="legend-dot cat-${slug(cat)}"></span>
            <span class="legend-name">${cat}</span>
            <span class="legend-pct">${pct.toFixed(1)}%</span>
            <span class="legend-count">${data.total.toLocaleString()} visits</span>
          </div>
          <div class="legend-sites">${topSites}</div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="breakdown">
      <div class="stack-bar" role="img" aria-label="Stacked bar of category share">
        ${segments}
      </div>
      <div class="legend">
        ${legend}
      </div>
      <p class="chart-note">
        Sites not yet recognized show up as <em>Other</em>.
        A future version will let you reassign them.
      </p>
    </div>
  `;
}

function slug(s) {
  return s.toLowerCase().replace(/\s+/g, "-");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
