// Rearview / views / breakdown.js
// Horizontal bar rows, one per category. Hover reveals the top sites.
// Bars animate in. Dot opacity scales with category share so the eye reads the
// hierarchy without needing color.

import { categorize, CATEGORIES, CATEGORY_ORDER } from "../data/categories.js";

export function renderBreakdown(visits, container) {
  if (!container) return;

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
    container.innerHTML = `<p class="empty">No visits in this window yet.</p>`;
    return;
  }

  const ordered = CATEGORY_ORDER.slice()
    .filter((cat) => tally[cat].total > 0)
    .sort((a, b) => tally[b].total - tally[a].total);

  const maxPct = (tally[ordered[0]].total / totalAll) * 100;

  const rows = ordered
    .map((cat) => {
      const data = tally[cat];
      const pct = (data.total / totalAll) * 100;
      const dotOpacity = Math.max(0.18, pct / maxPct);
      const fillScale = pct / maxPct;

      const topSites = [...data.sites.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(
          ([host, n]) =>
            `<span class="site"><span class="host">${escapeHtml(host)}</span><span class="n">${n}</span></span>`
        )
        .join("");

      return `
        <div class="cat-row" data-cat="${escapeHtml(cat)}">
          <span class="cat-dot" style="--dot-opacity: ${dotOpacity.toFixed(3)};"></span>
          <span class="cat-name">
            <span>${escapeHtml(cat)}</span>
            <span class="cat-bar-wrap"><span class="cat-bar-fill" data-scale="${fillScale.toFixed(3)}"></span></span>
          </span>
          <span class="cat-pct">${pct.toFixed(1)}%</span>
          <span class="cat-count">${data.total.toLocaleString()}</span>
          <div class="cat-sites">${topSites}</div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = rows;

  // Animate bars in on next frame.
  requestAnimationFrame(() => {
    container.querySelectorAll(".cat-bar-fill").forEach((el) => {
      const scale = parseFloat(el.dataset.scale || "0");
      el.style.transform = `scaleX(${scale})`;
    });
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
