/**
 * BitB Guard — Content Script Entry Point
 *
 * Runs an initial DOM scan, monitors dynamic DOM mutations (for delayed BitB modals),
 * and responds to manual re-scan requests from the extension popup.
 */

(function () {
  let debounceTimer = null;

  function serializeReport(report) {
    return {
      url: report.url,
      origin: report.origin,
      scannedAt: report.scannedAt,
      riskLevel: report.riskLevel,
      highestScore: report.highestScore,
      findingCount: report.findingCount,
      findings: report.findings.map((f) => ({
        score: f.score,
        signals: f.signals
      }))
    };
  }

  function runScan() {
    const report = window.BitBDetector.scanDocument();
    window.BitBOverlay.render(report);

    const serializable = serializeReport(report);
    chrome.runtime.sendMessage({
      type: "BITB_SCAN_RESULT",
      report: serializable
    });

    return serializable;
  }

  function scheduleScan() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runScan, 350);
  }

  // Initial scan on load
  runScan();

  // Observe dynamic DOM changes (e.g., fake login popup injected after button click)
  const observer = new MutationObserver((mutations) => {
    const relevant = mutations.some(
      (m) =>
        m.target.id !== "bitb-guard-banner" &&
        !(m.target.closest && m.target.closest("#bitb-guard-banner"))
    );
    if (relevant) {
      scheduleScan();
    }
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class", "hidden"]
  });

  // Allow popup to trigger an immediate rescan
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "BITB_RESCAN") {
      const report = runScan();
      sendResponse({ report });
      return true;
    }
    return false;
  });
})();
