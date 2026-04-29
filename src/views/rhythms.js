// Rearview / views / rhythms.js
// v0.14: persistent tooltip that tweens its values as you sweep between cells.

import { formatDuration } from "../data/time.js";

const DEMO_ROWS = [
  { key: "Making",      label: "Making" },
  { key: "Reading",     label: "Reading" },
  { key: "Researching", label: "Researching" },
  { key: "Watching",    label: "Watching" },
  { key: "Drifting",    label: "Browsing" },
];

export function rowsFor() {
  return DEMO_ROWS;
}

export function buildDays(endDate) {
  const days = [];
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  for (let i = 13; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    days.push({
      dateMs: d.getTime(),
      date: d,
      day: d.getDate(),
      monthShort: d.toLocaleDateString(undefined, { month: "short" }),
      dayShort: d.toLocaleDateString(undefined, { weekday: "short" }),
    });
  }
  return days;
}

export function computeTopHost(byCatDaySites, days, rows) {
  const winStart = days[0].dateMs;
  const winEnd = days[days.length - 1].dateMs;

  const hostTotals = new Map();
  let totalMs = 0;

  for (const row of rows) {
    const dayMap = byCatDaySites.get(row.key);
    if (!dayMap) continue;
    for (const [dayKey, sites] of dayMap) {
      if (dayKey < winStart || dayKey > winEnd) continue;
      for (const [host, ms] of sites) {
        hostTotals.set(host, (hostTotals.get(host) || 0) + ms);
        totalMs += ms;
      }
    }
  }

  let top = null;
  for (const [host, ms] of hostTotals) {
    if (!top || ms > top.ms) top = { host, ms };
  }
  return { top, totalMs };
}

export function renderDevice(byCatDay, byCatDaySites, days, rows, container, tooltip) {
  if (!container) return;

  let maxMs = 0;
  for (const row of rows) {
    const dm = byCatDay.get(row.key);
    if (!dm) continue;
    for (const d of days) {
      const v = dm.get(d.dateMs) || 0;
      if (v > maxMs) maxMs = v;
    }
  }
  if (maxMs === 0) maxMs = 1;

  const N_COLS = days.length;
  const N_ROWS = rows.length;

  const cellSize = 42;
  const cellGap = 6;
  const pad = 10;

  const innerW = N_COLS * cellSize + (N_COLS - 1) * cellGap;
  const innerH = N_ROWS * cellSize + (N_ROWS - 1) * cellGap;

  const width = innerW + pad * 2;
  const height = innerH + pad * 2;

  const cells = [];
  rows.forEach((row, ri) => {
    const dayMap = byCatDay.get(row.key) || new Map();
    days.forEach((d, ci) => {
      const ms = dayMap.get(d.dateMs) || 0;
      const lit = ms > 0;
      const intensity = lit ? 0.18 + 0.82 * Math.min(1, ms / maxMs) : 0;

      const x = pad + ci * (cellSize + cellGap);
      const y = pad + ri * (cellSize + cellGap);
      const animDelay = 80 + ci * 22 + ri * 36;

      cells.push(
        `<rect class="cell ${lit ? "cell-lit" : "cell-dim"}" data-c="${ci}" data-r="${ri}" x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="5" fill-opacity="${lit ? intensity : 1}" style="animation-delay:${animDelay}ms"/>`
      );
    });
  });

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" class="screen-svg">
      ${cells.join("")}
    </svg>
  `;

  if (tooltip) wireTooltip(container, tooltip, byCatDay, byCatDaySites, days, rows);
}

// ---- persistent tooltip with tweened values ----

function ensureTooltipStructure(tooltip) {
  if (tooltip.dataset.ready === "1") return;
  tooltip.innerHTML = `
    <div class="tt-head">
      <span class="tt-date">&nbsp;</span>
      <span class="tt-dot">/</span>
      <span class="tt-cat">&nbsp;</span>
    </div>
    <div class="tt-time">—</div>
    <div class="tt-sites"></div>
  `;
  tooltip.dataset.ready = "1";
}

// Module-level tween state. We persist it across re-renders so a
// re-render does not snap the displayed value.
let tweenFrame = null;
let displayedMs = 0;

function wireTooltip(container, tooltip, byCatDay, byCatDaySites, days, rows) {
  const svg = container.querySelector("svg");
  if (!svg) return;

  ensureTooltipStructure(tooltip);

  const ttDate = tooltip.querySelector(".tt-date");
  const ttCat = tooltip.querySelector(".tt-cat");
  const ttTime = tooltip.querySelector(".tt-time");
  const ttSites = tooltip.querySelector(".tt-sites");

  function tweenTime(target, duration = 320) {
    if (tweenFrame) cancelAnimationFrame(tweenFrame);
    const startVal = displayedMs;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = startVal + (target - startVal) * eased;
      displayedMs = cur;
      ttTime.textContent = cur > 0 ? formatDuration(cur) : "—";
      if (t < 1) tweenFrame = requestAnimationFrame(tick);
      else tweenFrame = null;
    }
    tweenFrame = requestAnimationFrame(tick);
  }

  function update(cell) {
    const ci = +cell.dataset.c;
    const ri = +cell.dataset.r;
    const row = rows[ri];
    const day = days[ci];

    const dayMap = byCatDay.get(row.key);
    const ms = (dayMap && dayMap.get(day.dateMs)) || 0;

    const dateStr = day.date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    ttDate.textContent = dateStr;
    ttCat.textContent = row.label;

    tweenTime(ms);

    // Top sites — replace (we don't tween the chip set).
    const sitesMap = byCatDaySites.get(row.key) && byCatDaySites.get(row.key).get(day.dateMs);
    const topSites = sitesMap
      ? [...sitesMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
      : [];

    ttSites.innerHTML = topSites.length > 0
      ? topSites.map(([host, hms]) => `
          <div class="tt-site">
            ${beadChip(host, "sm")}
            <span class="tt-ms">${formatDuration(hms)}</span>
          </div>
        `).join("")
      : `<div class="tt-empty">Nothing here</div>`;

    tooltip.classList.add("is-on");
    positionTooltip(cell, tooltip);
  }

  svg.addEventListener("mouseover", (e) => {
    const cell = e.target.closest(".cell");
    if (!cell) return;
    update(cell);
  });

  // Hide only when the cursor leaves the whole grid.
  svg.addEventListener("mouseleave", () => {
    tooltip.classList.remove("is-on");
  });
}

function positionTooltip(cell, tooltip) {
  requestAnimationFrame(() => {
    const cellRect = cell.getBoundingClientRect();
    const wrap = tooltip.parentElement;
    if (!wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    const ttW = tooltip.offsetWidth || 240;
    const ttH = tooltip.offsetHeight || 100;

    let cx = cellRect.left - wrapRect.left + cellRect.width / 2 - ttW / 2;
    let cy = cellRect.top - wrapRect.top - ttH - 14;

    cx = Math.max(8, Math.min(wrap.offsetWidth - ttW - 8, cx));
    if (cy < 8) cy = cellRect.bottom - wrapRect.top + 14;

    tooltip.style.transform = `translate(${cx}px, ${cy}px)`;
  });
}

// ---- bead chip helper (also used for hero) ----

export function beadChip(host, size = "sm") {
  const root = stripTld(host).slice(0, 10);
  const sizeClass = size === "lg" ? "bead-letter--lg" : "";
  const letters = root.toUpperCase().split("").map(
    (c) => `<span class="bead-letter ${sizeClass}">${escapeHtml(c)}</span>`
  ).join("");
  return `<span class="bead">${letters}</span>`;
}

export function stripTld(host) {
  if (!host) return "";
  return host.replace(/\.(com|org|net|io|co|ai|app|dev|so|me|tv|us|in|uk|edu|gov)$/i, "")
             .replace(/^www\./, "");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
