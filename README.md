# Rearview

> An editorial look at your browser history. A quiet year-in-review for your attention.

Rearview is a Chrome extension that reads your local browsing history and shows it back to you as a small, considered piece of design. It runs entirely in your browser. Nothing is uploaded, nothing is tracked, nothing is sold. When you close the tab, the data is gone from memory.

This is a personal project exploring what reflective tools could feel like if they were designed for curiosity instead of for shame.

## What you see in v0.1

Two views. Both work over your past week, past month, past 90 days, or past year.

**I. Your rhythms.** A 7 by 24 heatmap showing when you actually browse. Day of week down, hour of day across. Most tools show you "this week." Rearview shows you the shape of your attention across longer arcs.

**II. Where your attention goes.** A typographic breakdown of how visits split across Work, Learning, Social, Entertainment, Utility, and Other. Includes the top sites in each bucket so the numbers feel grounded.

## Why this exists

Most browser-history tools are either spyware or productivity-shaming dashboards. Neither feels good to open. The category is missing the version that feels like a quiet conversation with yourself: "Here is what your week actually looked like," not "Here is how you wasted your time."

The design problem behind v1 was choosing what to surface. A list of top sites is boring. A thousand charts are noise. Two views is enough to tell a real story.

## Install (developer mode)

Until this is on the Chrome Web Store you can run it locally:

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome.
3. Toggle **Developer mode** (top right).
4. Click **Load unpacked** and select this folder.
5. The Rearview icon appears in your toolbar. Click it. A new tab opens with your history visualized.

If the page says it cannot read your history, make sure you granted the **history** permission when loading the extension.

## Project structure

```
rearview/
  manifest.json         Chrome extension manifest (MV3)
  background.js         Service worker. Opens the archive page on icon click.
  archive.html          The full-page view.
  styles/
    main.css            Editorial / minimal styling.
  src/
    main.js             Entry. Wires data + views + range toggle.
    data/
      history.js        chrome.history wrapper, returns normalized visits.
      categories.js     Hostname to category rules.
    views/
      rhythms.js        Heatmap.
      breakdown.js      Categorized time view.
```

## Privacy

Rearview reads your local Chrome history through the official `chrome.history` API. Everything happens inside the extension tab. There is no server, no analytics, no remote logging. The code is small enough that you can read all of it in 10 minutes and verify this for yourself.

## Roadmap (loose)

These are not promises, just notes-to-self:

- User-editable categorization rules (drag a domain into a different bucket)
- Export your rhythms heatmap as an image you can keep
- A "first time visits" feed showing new sites you discovered each month
- A "ghosts" view showing sites you stopped visiting
- Firefox port (`browser.history` is mostly compatible)

## Stack

Vanilla HTML, CSS, and JavaScript. No build step. No framework. SVG charts are hand-built so the project stays tiny and readable. The whole thing is meant to be inspectable end-to-end.

## License

MIT. See `LICENSE`.

## Notes from the build

I am keeping a public dev journal in the commit history. Each meaningful change has a longer commit message describing the product decision behind it. The code is the artifact, the commits are the case study.
