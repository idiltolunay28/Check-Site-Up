/**
 * BitB Guard — In-Page Warning Overlay
 *
 * Displays a dismissible top warning banner and outlines suspected
 * fake browser windows directly in the DOM.
 */

window.BitBOverlay = (function () {
  const BANNER_ID = "bitb-guard-banner";
  const FLAG_CLASS = "bitb-guard-flagged";

  function clearHighlights() {
    document.querySelectorAll(`.${FLAG_CLASS}`).forEach((el) => {
      el.classList.remove(FLAG_CLASS);
    });
  }

  function removeBanner() {
    const existing = document.getElementById(BANNER_ID);
    if (existing) {
      existing.remove();
    }
  }

  function render(report) {
    clearHighlights();
    removeBanner();

    if (!report || report.riskLevel === "safe" || report.findings.length === 0) {
      return;
    }

    report.findings.forEach((finding) => {
      if (finding.element && finding.element.classList) {
        finding.element.classList.add(FLAG_CLASS);
      }
    });

    const banner = document.createElement("div");
    banner.id = BANNER_ID;
    if (report.riskLevel === "medium") {
      banner.classList.add("bitb-guard-medium");
    }

    const message = document.createElement("div");
    const label = report.riskLevel === "high" ? "BitB Phishing Alert" : "Suspicious Overlay Detected";
    message.innerHTML =
      `<strong>${label} (Score: ${report.highestScore}/100):</strong> ` +
      `A simulated browser window was detected inside this page's DOM. ` +
      `Real browser popups can be dragged outside this tab and display your browser's native address bar.`;

    const dismissBtn = document.createElement("button");
    dismissBtn.type = "button";
    dismissBtn.textContent = "Dismiss";
    dismissBtn.addEventListener("click", () => {
      removeBanner();
    });

    banner.appendChild(message);
    banner.appendChild(dismissBtn);
    document.documentElement.appendChild(banner);
  }

  return { render, clearHighlights, removeBanner };
})();
