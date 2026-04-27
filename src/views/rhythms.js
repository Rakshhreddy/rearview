// Rearview / views / rhythms.js
// 7 x 24 heatmap. Compact, fits inside a card body without scrolling.
// Uses viewBox so it scales to fit its container both ways.

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function gridDayIndex(date) {
  const js = date.getDay();
  return js === 0 ? 6 : js - 1;
}

export function buildGrid(visits) {
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const v of visits) {
    const d = new Date(v.visitTime);
    grid[gridDayIndex(d)][d.getHours()]++;
  }
  return grid;
}

export function findPeak(grid) {
  let peak = { day: 0, hour: 0, value: 0 };
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      if (grid[d][h] > peak.value) {
        peak = { day: d, hour: h, value: grid[d][h] };
      }
    }
  }
  return peak;
}

export function peakLabel(peak) {
  if (!peak.value) return "no data yet";
  return `${DAYS[peak.day]} ${formatHour(peak.hour)} · ${peak.value} visits`;
}

export function renderRhythms(grid, container) {
  if (!container) return;

  const max = Math.max(1, ...grid.flat());

  // Layout. Use a clean grid with consistent gaps.
  const cellW = 22;
  const cellH = 22;
  const gap = 3;
  const labelLeft = 36;
  const labelTop = 22;
  const padR = 8;
  const padB = 6;

  const innerW = 24 * cellW + 23 * gap;
  const innerH = 7 * cellH + 6 * gap;
  const width = labelLeft + innerW + padR;
  const height = labelTop + innerH + padB;

  const cells = [];
  let staggerIndex = 0;
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const v = grid[d][h];
      const t = v === 0 ? 0.04 : 0.1 + 0.9 * (v / max);
      const x = labelLeft + h * (cellW + gap);
      const y = labelTop + d * (cellH + gap);
      const delay = 8 * staggerIndex;
      cells.push(
        `<rect class="rhythms-cell" x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="3" ` +
          `fill-opacity="${t.toFixed(3)}" style="animation-delay:${delay}ms;">` +
          `<title>${DAYS[d]} ${formatHour(h)} — ${v} visit${v === 1 ? "" : "s"}</title>` +
          `</rect>`
      );
      staggerIndex++;
    }
  }

  // Day labels (left).
  const dayLabels = DAYS.map(
    (d, i) =>
      `<text x="${labelLeft - 10}" y="${
        labelTop + i * (cellH + gap) + cellH / 2 + 3
      }" text-anchor="end" class="rhythms-axis ${i === 0 || i === 6 ? "rhythms-axis-bold" : ""}">${d.slice(0, 1)}</text>`
  ).join("");

  // Hour labels (top), every 4 hours.
  const hourLabels = [];
  for (let h = 0; h < 24; h += 4) {
    const x = labelLeft + h * (cellW + gap) + cellW / 2;
    hourLabels.push(
      `<text x="${x}" y="${labelTop - 10}" text-anchor="middle" class="rhythms-axis">${formatHour(h, true)}</text>`
    );
  }

  const svg = `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Heatmap of browsing activity by hour and day">
      ${hourLabels.join("")}
      ${dayLabels}
      ${cells.join("")}
    </svg>
  `;

  container.innerHTML = svg;
}

function formatHour(h, short = false) {
  if (h === 0) return short ? "12a" : "12 AM";
  if (h === 12) return short ? "12p" : "12 PM";
  if (h < 12) return short ? `${h}a` : `${h} AM`;
  return short ? `${h - 12}p` : `${h - 12} PM`;
}
