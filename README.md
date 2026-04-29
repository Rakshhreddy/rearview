# Rearview

A Chrome extension that shows where my last two weeks of browser time went.

## Install

1. Clone or download this repo.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Click "Load unpacked" and pick this folder.
5. Click the Rearview icon in the toolbar.

Runs on built-in demo data, so it works as soon as it's loaded.

## Files

```
manifest.json         MV3 manifest
background.js         opens the dashboard on icon click
archive.html          dashboard page
styles/main.css       styles
src/main.js           entry
src/data/demo.js      sample dataset
src/data/time.js      duration helpers
src/views/rhythms.js  grid + hover tooltip
```

## Stack

Vanilla HTML, CSS, JS. No build step, no dependencies.

## License

MIT.
