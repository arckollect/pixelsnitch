chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html?firstrun=1') });
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'pixelsnitch:open-options') {
    chrome.runtime.openOptionsPage(() => sendResponse({ ok: true }));
    return true; // keep channel open for async sendResponse
  }
});
