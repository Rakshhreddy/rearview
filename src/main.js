// Rearview / main.js
// Orchestration. Pulls history, renders both views, hooks up the range nav.

import { fetchHistory } from "./data/history.js";
import { renderRhythms } from "./views/rhythms.js";
import { renderBreakdown } from "./views/breakdown.js";

const els = {
  status: document.getElementById("status"),
  rhythms: document.getElementById("rhythms"),
  breakdown: document.getElementById("breakdown"),
  rangeButtons: document.querySelectorAll(".range-button"),
};

let currentRange = 30;

function setStatus(text) {
  els.status.textContent = text;
}

async function load(days) {
  setStatus("Reading your history…");
  els.rhythms.innerHTML = "";
  els.breakdown.innerHTML = "";

  try {
    const visits = await fetchHistory({ daysBack: days });

    const rangeLabel = days === 7
      ? "past week"
      : days === 30
      ? "past month"
      : days === 90
      ? "past 90 days"
      : "past year";

    setStatus(
      `${visits.length.toLocaleString()} visits across the ${rangeLabel}.`
    );

    renderRhythms(visits, els.rhythms);
    renderBreakdown(visits, els.breakdown);
  } catch (err) {
    console.error(err);
    setStatus(
      "Could not read history. Make sure Rearview is loaded as an extension and history permission is granted."
    );
  }
}

els.rangeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    els.rangeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentRange = parseInt(btn.dataset.range, 10);
    load(currentRange);
  });
});

load(currentRange);
