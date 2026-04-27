// Rearview background service worker.
// When the user clicks the extension icon, open the archive page in a new tab.

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("archive.html") });
});
