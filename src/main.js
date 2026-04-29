// Rearview / main.js
// v0.14: portfolio mode only. Curated data, no chrome.history.

import { buildDemoData } from "./data/demo.js";
import {
  buildDays,
  renderDevice,
  rowsFor,
  computeTopHost,
  stripTld,
} from "./views/rhythms.js";

const els = {
  device: document.getElementById("device"),
  tooltip: document.getElementById("tooltip"),
  range: document.getElementById("range"),
  heroBead: document.getElementById("hero-bead"),
  heroPct: document.getElementById("hero-pct"),
  prev: document.getElementById("prev-btn"),
  next: document.getElementById("next-btn"),
};

let dataset = null;
let weekOffset = 0;

function fmtRange(end) {
  const start = new Date(end);
  start.setDate(start.getDate() - 13);
  const m = (d) => d.toLocaleDateString(undefined, { month: "short" });
  const dn = (d) => d.getDate();
  if (start.getMonth() === end.getMonth()) {
    return `${m(start)} ${dn(start)} to ${dn(end)}`;
  }
  return `${m(start)} ${dn(start)} to ${m(end)} ${dn(end)}`;
}

function endDateForOffset(offset) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset * 14);
  return d;
}

function tweenPct(el, target, duration = 700) {
  if (!el) return;
  const start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased) + "%";
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ---- letter scramble for hero bead ----

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CYCLE_INTERVAL_MS = 50;

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

function setHeroBead(host) {
  if (!els.heroBead) return;

  if (!host) {
    els.heroBead.innerHTML = `<span class="hero-empty">no data</span>`;
    return;
  }

  const root = stripTld(host).slice(0, 10).toUpperCase();
  if (root.length === 0) {
    els.heroBead.innerHTML = `<span class="hero-empty">—</span>`;
    return;
  }

  const targets = root.split("");
  const existing = els.heroBead.querySelectorAll(".bead-letter");

  let beadEls;
  if (existing.length === targets.length) {
    beadEls = existing;
  } else {
    els.heroBead.innerHTML = `<span class="bead">${
      targets
        .map((_, i) => {
          const carry = existing[i] ? existing[i].textContent : randomChar();
          return `<span class="bead-letter bead-letter--lg is-cycling">${escapeChar(carry)}</span>`;
        })
        .join("")
    }</span>`;
    beadEls = els.heroBead.querySelectorAll(".bead-letter");
  }

  scrambleTo(beadEls, targets);
}

function scrambleTo(beadEls, targets, duration = 900) {
  const start = performance.now();
  let lastCycle = 0;

  const settleTimes = targets.map((_, i) =>
    duration * (0.32 + 0.68 * (i / Math.max(1, targets.length - 1)))
  );

  function tick(now) {
    const elapsed = now - start;
    const shouldCycle = now - lastCycle >= CYCLE_INTERVAL_MS;
    let allSettled = true;

    targets.forEach((target, i) => {
      const el = beadEls[i];
      if (!el) return;

      if (elapsed >= settleTimes[i]) {
        if (el.textContent !== target) {
          el.textContent = target;
          el.classList.remove("is-cycling");
        }
      } else {
        allSettled = false;
        el.classList.add("is-cycling");
        if (shouldCycle) el.textContent = randomChar();
      }
    });

    if (shouldCycle) lastCycle = now;
    if (!allSettled) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function escapeChar(c) {
  return String(c).replace(/[<>&"']/g, "");
}

// ---- render ----

function renderForOffset() {
  const end = endDateForOffset(weekOffset);
  const days = buildDays(end);
  const rows = rowsFor();

  if (els.range) els.range.textContent = fmtRange(end);

  const winStart = days[0].dateMs;
  const winEnd = days[days.length - 1].dateMs;

  const slicedByCatDay = new Map();
  for (const row of rows) {
    const src = dataset.byCatDay.get(row.key);
    if (!src) continue;
    const m = new Map();
    for (const [k, v] of src) {
      if (k >= winStart && k <= winEnd) m.set(k, v);
    }
    slicedByCatDay.set(row.key, m);
  }

  const { top, totalMs } = computeTopHost(dataset.byCatDaySites, days, rows);
  if (top && totalMs > 0) {
    const pct = Math.round((top.ms / totalMs) * 100);
    setHeroBead(top.host);
    tweenPct(els.heroPct, pct);
  } else {
    setHeroBead(null);
    if (els.heroPct) els.heroPct.textContent = "—";
  }

  renderDevice(
    slicedByCatDay,
    dataset.byCatDaySites,
    days,
    rows,
    els.device,
    els.tooltip
  );

  if (els.next) {
    els.next.disabled = weekOffset >= 0;
    els.next.classList.toggle("is-disabled", weekOffset >= 0);
  }
  if (els.prev) {
    const limit = -2;
    els.prev.disabled = weekOffset <= limit;
    els.prev.classList.toggle("is-disabled", weekOffset <= limit);
  }
}

dataset = buildDemoData();
renderForOffset();

if (els.prev) {
  els.prev.addEventListener("click", () => {
    if (els.prev.disabled) return;
    weekOffset -= 1;
    renderForOffset();
  });
}
if (els.next) {
  els.next.addEventListener("click", () => {
    if (els.next.disabled) return;
    weekOffset += 1;
    renderForOffset();
  });
}
