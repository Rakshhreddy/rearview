// Rearview / data / categories.js
// A starter rule set for grouping hostnames into categories.
//
// Design note: hardcoded categories will always feel slightly wrong
// because the same site can mean different things to different people
// (youtube can be entertainment or learning, etc.). v1 ships sensible
// defaults; v2 will expose user overrides via chrome.storage.local.

export const CATEGORIES = {
  WORK: "Work",
  LEARNING: "Learning",
  SOCIAL: "Social",
  ENTERTAINMENT: "Entertainment",
  UTILITY: "Utility",
  OTHER: "Other",
};

export const CATEGORY_ORDER = [
  CATEGORIES.WORK,
  CATEGORIES.LEARNING,
  CATEGORIES.SOCIAL,
  CATEGORIES.ENTERTAINMENT,
  CATEGORIES.UTILITY,
  CATEGORIES.OTHER,
];

// Exact-host rules. Keys are normalized hostnames (no www).
const HOST_RULES = {
  // Work / tools
  "github.com": CATEGORIES.WORK,
  "gitlab.com": CATEGORIES.WORK,
  "bitbucket.org": CATEGORIES.WORK,
  "figma.com": CATEGORIES.WORK,
  "framer.com": CATEGORIES.WORK,
  "notion.so": CATEGORIES.WORK,
  "linear.app": CATEGORIES.WORK,
  "asana.com": CATEGORIES.WORK,
  "trello.com": CATEGORIES.WORK,
  "monday.com": CATEGORIES.WORK,
  "atlassian.net": CATEGORIES.WORK,
  "slack.com": CATEGORIES.WORK,
  "zoom.us": CATEGORIES.WORK,
  "meet.google.com": CATEGORIES.WORK,
  "calendar.google.com": CATEGORIES.WORK,
  "mail.google.com": CATEGORIES.WORK,
  "drive.google.com": CATEGORIES.WORK,
  "docs.google.com": CATEGORIES.WORK,
  "sheets.google.com": CATEGORIES.WORK,
  "slides.google.com": CATEGORIES.WORK,
  "outlook.live.com": CATEGORIES.WORK,
  "outlook.office.com": CATEGORIES.WORK,
  "office.com": CATEGORIES.WORK,
  "vercel.com": CATEGORIES.WORK,
  "netlify.com": CATEGORIES.WORK,
  "render.com": CATEGORIES.WORK,
  "supabase.com": CATEGORIES.WORK,
  "firebase.google.com": CATEGORIES.WORK,

  // Learning / reference
  "stackoverflow.com": CATEGORIES.LEARNING,
  "developer.mozilla.org": CATEGORIES.LEARNING,
  "wikipedia.org": CATEGORIES.LEARNING,
  "en.wikipedia.org": CATEGORIES.LEARNING,
  "medium.com": CATEGORIES.LEARNING,
  "dev.to": CATEGORIES.LEARNING,
  "hackernoon.com": CATEGORIES.LEARNING,
  "substack.com": CATEGORIES.LEARNING,
  "coursera.org": CATEGORIES.LEARNING,
  "udemy.com": CATEGORIES.LEARNING,
  "edx.org": CATEGORIES.LEARNING,
  "khanacademy.org": CATEGORIES.LEARNING,
  "arxiv.org": CATEGORIES.LEARNING,
  "scholar.google.com": CATEGORIES.LEARNING,
  "claude.ai": CATEGORIES.LEARNING,
  "chatgpt.com": CATEGORIES.LEARNING,
  "chat.openai.com": CATEGORIES.LEARNING,
  "perplexity.ai": CATEGORIES.LEARNING,

  // Social
  "twitter.com": CATEGORIES.SOCIAL,
  "x.com": CATEGORIES.SOCIAL,
  "facebook.com": CATEGORIES.SOCIAL,
  "instagram.com": CATEGORIES.SOCIAL,
  "linkedin.com": CATEGORIES.SOCIAL,
  "reddit.com": CATEGORIES.SOCIAL,
  "old.reddit.com": CATEGORIES.SOCIAL,
  "discord.com": CATEGORIES.SOCIAL,
  "web.whatsapp.com": CATEGORIES.SOCIAL,
  "messenger.com": CATEGORIES.SOCIAL,
  "telegram.org": CATEGORIES.SOCIAL,
  "web.telegram.org": CATEGORIES.SOCIAL,
  "threads.net": CATEGORIES.SOCIAL,
  "bsky.app": CATEGORIES.SOCIAL,
  "tiktok.com": CATEGORIES.SOCIAL,
  "snapchat.com": CATEGORIES.SOCIAL,

  // Entertainment
  "youtube.com": CATEGORIES.ENTERTAINMENT,
  "music.youtube.com": CATEGORIES.ENTERTAINMENT,
  "netflix.com": CATEGORIES.ENTERTAINMENT,
  "primevideo.com": CATEGORIES.ENTERTAINMENT,
  "hulu.com": CATEGORIES.ENTERTAINMENT,
  "disneyplus.com": CATEGORIES.ENTERTAINMENT,
  "hotstar.com": CATEGORIES.ENTERTAINMENT,
  "spotify.com": CATEGORIES.ENTERTAINMENT,
  "open.spotify.com": CATEGORIES.ENTERTAINMENT,
  "soundcloud.com": CATEGORIES.ENTERTAINMENT,
  "twitch.tv": CATEGORIES.ENTERTAINMENT,
  "imdb.com": CATEGORIES.ENTERTAINMENT,

  // Utility / commerce
  "amazon.com": CATEGORIES.UTILITY,
  "amazon.in": CATEGORIES.UTILITY,
  "amazon.co.uk": CATEGORIES.UTILITY,
  "ebay.com": CATEGORIES.UTILITY,
  "etsy.com": CATEGORIES.UTILITY,
  "maps.google.com": CATEGORIES.UTILITY,
  "translate.google.com": CATEGORIES.UTILITY,
  "weather.com": CATEGORIES.UTILITY,
  "paypal.com": CATEGORIES.UTILITY,
  "stripe.com": CATEGORIES.UTILITY,
  "uber.com": CATEGORIES.UTILITY,
  "lyft.com": CATEGORIES.UTILITY,
  "doordash.com": CATEGORIES.UTILITY,
  "zomato.com": CATEGORIES.UTILITY,
  "swiggy.com": CATEGORIES.UTILITY,
  "airbnb.com": CATEGORIES.UTILITY,
};

// Pattern rules. Run after host lookups fail.
const PATTERN_RULES = [
  { test: /\.edu$/, category: CATEGORIES.LEARNING },
  { test: /\.gov$/, category: CATEGORIES.UTILITY },
  { test: /^docs\./, category: CATEGORIES.WORK },
  { test: /^learn\./, category: CATEGORIES.LEARNING },
  { test: /^news\./, category: CATEGORIES.LEARNING },
  { test: /\.atlassian\.net$/, category: CATEGORIES.WORK },
  { test: /\.slack\.com$/, category: CATEGORIES.WORK },
];

/**
 * Resolve a hostname to a category.
 * Falls back to OTHER if nothing matches.
 */
export function categorize(hostname) {
  if (!hostname) return CATEGORIES.OTHER;

  // 1. Exact host match.
  if (HOST_RULES[hostname]) return HOST_RULES[hostname];

  // 2. Parent domain match. example: m.youtube.com -> youtube.com
  const parts = hostname.split(".");
  for (let i = 1; i < parts.length - 1; i++) {
    const parent = parts.slice(i).join(".");
    if (HOST_RULES[parent]) return HOST_RULES[parent];
  }

  // 3. Pattern match.
  for (const rule of PATTERN_RULES) {
    if (rule.test.test(hostname)) return rule.category;
  }

  return CATEGORIES.OTHER;
}
