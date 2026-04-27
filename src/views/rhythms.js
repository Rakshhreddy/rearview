// Rearview / views / rhythms.js
// 7 x 24 heatmap of browsing intensity.
// Rows are days of the week (Mon first, like a real calendar week).
// Columns are hours of the day, 0 to 23.

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Day-of-week index in our grid: Mon=0 ... Sun=6.
// JavaScript getDay returns Sun=0 ... Sat=6, so remap.
function gridDayIndex(date) {
  const js = date.getDay();
  return js === 0 ? 6 : js - 1;
}

export function renderRhythms(visits, container) {
  if (!container) return;

  // Bucket visits into the grid.
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const v of visits) {
    const d = new Date(v.visitTime);
    grid[gridDayIndex(d)][d.getHours()]++;
  }

  const max = Math.max(1, ...grid.flat());

  // SVG layout.
  const cellW = 26;
  const cellH = 26;
  const gap = 3;
  const labelLeft = 48;
  const labelTop = 28;
  const padR = 8;
  const padB = 12;

  const innerW = 24 * cellW + 23 * gap;
  const innerH = 7 * cellH + 6 * gap;

  const width = labelLeft + innerW + padR;
  const height = labelTop + innerH + padB;

  const cells = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const v = grid[d][h];
      // Slight floor so non-zero cells are always visible.
      const t = v === 0 ? 0 : 0.08 + 0.92 * (v / max);
      const x = labelLeft + h * (cellW + gap);
      const y = labelTop + d * (cellH + gap);
      cells.push(
        `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="3" ` +
          `fill="var(--accent)" fill-opacity="${t.toFixed(3)}">` +
          `<title>${DAYS[d]} ${formatHour(h)} · ${v} visit${v === 1 ? "" : "s"}</title>` +
          `</rect>`
      );
    }
  }

  // Day labels (left).
  const dayLabels = DAYS.map(
    (d, i) =>
      `<text x="${labelLeft - 12}" y="${
        labelTop + i * (cellH + gap) + cellH / 2 + 4
      }" text-anchor="end" class="rv-axis-label">${d}</text>`
  ).join("");

  // Hour labels (top), every 3 hours.
  const hourLabels = [];
  for (let h = 0; h < 24; h += 3) {
    const x = labelLeft + h * (cellW + gap) + cellW / 2;
    hourLabels.push(
      `<text x="${x}" y="${labelTop - 10}" text-anchor="middle" class="rv-axis-label">${formatHour(h, true)}</text>`
    );
  }

  const svg = `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" class="rhythms-svg" role="img" aria-label="Heatmap of browsing activity by hour and day">
      ${hourLabels.join("")}
      ${dayLabels}
      ${cells.join("")}
    </svg>
  `;

  // Quick narrative under the chart, e.g. "Most active: Tue 22:00".
  let peakValue = 0;
  let peak = { day: 0, hour: 0 };
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      if (grid[d][h] > peakValue) {
        peakValue = grid[d][h];
        peak = { day: d, hour: h };
      }
    }
  }

  const total = grid.flat().reduce((a, b) => a + b, 0);
  const note =
    total === 0
      ? `<p class="chart-note">No visits in this window yet.</p>`
      : `<p class="chart-note">Peak: <strong>${DAYS[peak.day]} at ${formatHour(peak.hour)}</strong>, with ${peakValue} visits in that hour.</p>`;

  container.innerHTML = svg + note;
}

function formatHour(h, short = false) {
  if (h === 0) return short ? "12a" : "12 AM";
  if (h === 12) return short ? "12p" : "12 PM";
  if (h < 12) return short ? `${h}a` : `${h} AM`;
  return short ? `${h - 12}p` : `${h - 12} PM`;
}
