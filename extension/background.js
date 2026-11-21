/**
 * BitB Guard — Background Service Worker (Manifest V3)
 *
 * Tracks the latest scan report per tab and updates the extension toolbar badge.
 */

const tabReports = new Map();

function updateBadge(tabId, report) {
  if (!report || report.riskLevel === "safe") {
    chrome.action.setBadgeText({ tabId, text: "" });
    return;
  }

  if (report.riskLevel === "high") {
    chrome.action.setBadgeText({ tabId, text: "!" });
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#dc2626" });
  } else if (report.riskLevel === "medium") {
    chrome.action.setBadgeText({ tabId, text: "?" });
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#d97706" });
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "BITB_SCAN_RESULT" && sender.tab && sender.tab.id !== undefined) {
    const tabId = sender.tab.id;
    tabReports.set(tabId, message.report);
    updateBadge(tabId, message.report);
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === "GET_TAB_REPORT") {
    const report = tabReports.get(message.tabId) || null;
    sendResponse({ report });
    return true;
  }

  return false;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabReports.delete(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    tabReports.delete(tabId);
    chrome.action.setBadgeText({ tabId, text: "" });
  }
});
