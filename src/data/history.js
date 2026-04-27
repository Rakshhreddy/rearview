// Rearview / data / history.js
// Wraps the chrome.history API into a clean, normalized dataset.
//
// Every record we hand back to the rest of the app looks like:
//   { url, title, hostname, visitTime, transition }
//
// All work happens in the user's browser. Nothing is sent over the network.

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Fetch every visit in the requested window.
 * @param {Object} opts
 * @param {number} opts.daysBack - how far back to look, in days
 * @returns {Promise<Array>}
 */
export async function fetchHistory({ daysBack = 30 } = {}) {
  if (typeof chrome === "undefined" || !chrome.history) {
    throw new Error(
      "chrome.history API is not available. Open this page from the extension, not as a regular file."
    );
  }

  const startTime = Date.now() - daysBack * DAY_MS;

  // chrome.history.search returns one row per URL with lastVisitTime.
  // We need every visit, so we then call getVisits per URL.
  const items = await chrome.history.search({
    text: "",
    startTime,
    maxResults: 100000,
  });

  // Run getVisits in batches so we do not slam the API.
  const BATCH = 50;
  const visits = [];

  for (let i = 0; i < items.length; i += BATCH) {
    const slice = items.slice(i, i + BATCH);
    const results = await Promise.all(
      slice.map((item) =>
        chrome.history
          .getVisits({ url: item.url })
          .then((vs) => ({ item, vs }))
          .catch(() => ({ item, vs: [] }))
      )
    );

    for (const { item, vs } of results) {
      const hostname = extractHostname(item.url);
      for (const v of vs) {
        if (v.visitTime >= startTime) {
          visits.push({
            url: item.url,
            title: item.title || "",
            hostname,
            visitTime: v.visitTime,
            transition: v.transition,
          });
        }
      }
    }
  }

  // Sort chronologically just in case.
  visits.sort((a, b) => a.visitTime - b.visitTime);
  return visits;
}

export function extractHostname(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
