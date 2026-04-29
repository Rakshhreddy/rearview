// Rearview / data / demo.js
// Curated demo dataset for portfolio screenshots. 42 days, three windows.
//
// Walking back through windows reveals different top sites:
//   Window 0 (current 14d):  Researching peaks  -> top site: claude.ai
//   Window -1 (prev 14d):    Reading peaks      -> top site: medium.com
//   Window -2 (oldest 14d):  Drifting peaks     -> top site: reddit.com

const CATS = ["Making", "Reading", "Researching", "Watching", "Drifting"];

const SITES_BY_CAT = {
  Making:      ["github.com", "figma.com", "vercel.com", "linear.app", "framer.com"],
  Reading:     ["medium.com", "theverge.com", "are.na", "sidebar.io", "kottke.org"],
  Researching: ["claude.ai", "perplexity.ai", "wikipedia.org", "news.ycombinator.com", "arxiv.org"],
  Watching:    ["youtube.com", "vimeo.com"],
  Drifting:    ["reddit.com", "twitter.com", "instagram.com"],
};

// 42-day templates, oldest first.
// Days 0-13 = oldest window (-2), Drifting peaks.
// Days 14-27 = previous window (-1), Reading peaks.
// Days 28-41 = current window (0), Researching peaks.
const TEMPLATES = {
  Making: [
     8,  4, 12, 16, 10,  6,  4, 14,  8, 18, 10,  6,  4, 12,
    24, 12, 28, 32, 26, 18,  8, 30, 22, 34, 18, 14, 10, 30,
    22,  6, 18, 30, 24, 14,  4, 28, 20, 32, 16, 10,  6, 28,
  ],
  Reading: [
    24, 18, 32, 26, 20, 12, 30, 36, 22, 28, 16, 18, 32, 38,
    80, 65, 92,105, 88, 72, 48, 96,102,110, 86, 74, 60, 96,
    24, 18, 32, 26, 20, 12, 30, 36, 22, 28, 16, 18, 32, 38,
  ],
  Researching: [
     8,  6, 14, 12, 10,  8,  4, 12, 16, 18, 10,  6,  4, 14,
    22, 16, 26, 30, 24, 20, 12, 28, 32, 34, 26, 18, 10, 30,
    98, 76,122,134,118,104, 64,124,132,138,116, 92, 78,130,
  ],
  Watching: [
     8,  4, 12,  6, 10,  8,  6,  4, 14,  8,  6, 10,  4,  6,
    12,  4,  8,  6,  4, 10,  8,  4, 12,  8,  6,  4,  8, 12,
     8,  4, 12,  6, 10,  8,  6,  4, 14,  8,  6, 10,  4,  6,
  ],
  Drifting: [
    78, 62, 96,104, 88, 70, 50, 92,100,108, 84, 72, 58, 92,
     8,  4, 10,  6,  8, 12,  4,  8, 10,  4,  8, 10,  4,  8,
     6,  4,  8,  4,  6, 10,  4,  6,  8,  4,  6,  8,  4,  6,
  ],
};

const N_TEMPLATE_DAYS = 42;

function startOfDayMs(ms) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function buildDemoData() {
  const byCatDay = new Map();
  const byCatDaySites = new Map();
  const byHost = new Map();
  const byDay = new Map();
  let total = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const cat of CATS) {
    const sites = SITES_BY_CAT[cat];
    const tpl = TEMPLATES[cat];
    if (!byCatDay.has(cat)) byCatDay.set(cat, new Map());
    if (!byCatDaySites.has(cat)) byCatDaySites.set(cat, new Map());

    for (let i = 0; i < N_TEMPLATE_DAYS; i++) {
      const day = new Date(today);
      day.setDate(day.getDate() - (N_TEMPLATE_DAYS - 1 - i));
      const dayKey = startOfDayMs(day.getTime());

      const minutes = tpl[i];
      if (!minutes) continue;
      const ms = minutes * 60 * 1000;

      // Distribute across sites for this category, weighted toward the first.
      const dayHostMap = new Map();
      let allocated = 0;
      const weights = sites.map((_, j) => 1 / (j + 1));
      const wTotal = weights.reduce((a, b) => a + b, 0);
      sites.forEach((s, j) => {
        const share = j === sites.length - 1
          ? ms - allocated
          : Math.round((weights[j] / wTotal) * ms);
        const safe = Math.max(0, share);
        dayHostMap.set(s, safe);
        allocated += safe;
        byHost.set(s, (byHost.get(s) || 0) + safe);
      });

      byCatDay.get(cat).set(dayKey, ms);
      byCatDaySites.get(cat).set(dayKey, dayHostMap);
      byDay.set(dayKey, (byDay.get(dayKey) || 0) + ms);
      total += ms;
    }
  }

  return { byHost, byDay, total, byCatDay, byCatDaySites };
}
