// Rearview / main.js
// Orchestrates data + views + range nav + small touches.

import { fetchHistory } from "./data/history.js";
import { buildGrid, findPeak, peakLabel, renderRhythms } from "./views/rhythms.js";
import { renderBreakdown } from "./views/breakdown.js";

const els = {
  status: document.getElementById("status"),
  rhythms: document.getElementById("rhythms"),
  breakdown: document.getElementById("breakdown"),
  rangeButtons: document.querySelectorAll(".range"),
  metaVisits: document.getElementById("meta-visits"),
  metaSites: document.getElementById("meta-sites"),
  peakLabel: document.getElementById("peak-label"),
};

let currentRange = 30;

function setStatus(text) {
  if (els.status) els.status.textContent = text;
}

// Smooth count-up for the top numbers. Stops being clever past ~50k visits
// where the human eye does not really care about each digit.
function countUp(el, target, duration = 700) {
  if (!el) return;
  const start = performance.now();
  const startVal = parseInt(el.textContent.replace(/[^\d]/g, ""), 10) || 0;
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = Math.round(startVal + (target - startVal) * eased);
    el.textContent = val.toLocaleString();
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

async function load(days) {
  setStatus("reading history");
  els.rhythms.innerHTML = "";
  els.breakdown.innerHTML = "";

  try {
    const visits = await fetchHistory({ daysBack: days });

    const uniqueSites = new Set(
      visits.map((v) => v.hostname).filter(Boolean)
    ).size;

    countUp(els.metaVisits, visits.length);
    countUp(els.metaSites, uniqueSites);

    const grid = buildGrid(visits);
    renderRhythms(grid, els.rhythms);
    renderBreakdown(visits, els.breakdown);

    const peak = findPeak(grid);
    if (els.peakLabel) els.peakLabel.textContent = peakLabel(peak);

    const rangeWord =
      days === 7 ? "past 7 days"
      : days === 30 ? "past 30 days"
      : days === 90 ? "past 90 days"
      : "past year";
    setStatus(rangeWord);
  } catch (err) {
    console.error(err);
    setStatus("could not read history");
    els.rhythms.innerHTML = `<p class="empty">Open this page from the extension. The history API is only available there.</p>`;
  }
}

els.rangeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("is-active")) return;
    els.rangeButtons.forEach((b) => {
      b.classList.remove("is-active");
      b.removeAttribute("aria-selected");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");
    currentRange = parseInt(btn.dataset.range, 10);
    load(currentRange);
  });
});

// Light keyboard nav: arrow keys cycle through ranges.
document.addEventListener("keydown", (e) => {
  if (e.target && /input|textarea/i.test(e.target.tagName)) return;
  const order = [...els.rangeButtons];
  const i = order.findIndex((b) => b.classList.contains("is-active"));
  if (i < 0) return;
  if (e.key === "ArrowLeft" && i > 0) {
    e.preventDefault();
    order[i - 1].click();
  } else if (e.key === "ArrowRight" && i < order.length - 1) {
    e.preventDefault();
    order[i + 1].click();
  }
});

load(currentRange);
