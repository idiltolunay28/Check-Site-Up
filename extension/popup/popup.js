const badgeEl = document.getElementById("status-badge");
const scoreEl = document.getElementById("risk-score");
const countEl = document.getElementById("finding-count");
const signalsListEl = document.getElementById("signals-list");
const timeEl = document.getElementById("scan-time");
const rescanBtn = document.getElementById("rescan-btn");

function renderReport(report) {
  if (!report) {
    badgeEl.textContent = "No Data";
    badgeEl.className = "badge badge-neutral";
    scoreEl.textContent = "—";
    countEl.textContent = "—";
    signalsListEl.innerHTML =
      '<li class="empty">Cannot scan this page (e.g., browser internal page or restricted URL).</li>';
    timeEl.textContent = "";
    return;
  }

  const levelMap = {
    safe: { text: "Safe", cls: "badge-safe" },
    medium: { text: "Suspicious", cls: "badge-medium" },
    high: { text: "BitB Alert", cls: "badge-high" }
  };
  const levelInfo = levelMap[report.riskLevel] || { text: "Unknown", cls: "badge-neutral" };

  badgeEl.textContent = levelInfo.text;
  badgeEl.className = `badge ${levelInfo.cls}`;
  scoreEl.textContent = `${report.highestScore} / 100`;
  countEl.textContent = String(report.findingCount);

  signalsListEl.innerHTML = "";
  if (!report.findings || report.findings.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No suspicious BitB patterns detected on this page.";
    signalsListEl.appendChild(li);
  } else {
    report.findings.forEach((finding, index) => {
      finding.signals.forEach((signal) => {
        const li = document.createElement("li");
        li.textContent = report.findings.length > 1 ? `[#${index + 1}] ${signal}` : signal;
        signalsListEl.appendChild(li);
      });
    });
  }

  const date = new Date(report.scannedAt);
  timeEl.textContent = isNaN(date.getTime()) ? "" : `Scanned ${date.toLocaleTimeString()}`;
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function loadInitialReport() {
  const tab = await getActiveTab();
  if (!tab || tab.id === undefined) {
    renderReport(null);
    return;
  }

  chrome.runtime.sendMessage({ type: "GET_TAB_REPORT", tabId: tab.id }, (response) => {
    if (chrome.runtime.lastError || !response) {
      renderReport(null);
      return;
    }
    renderReport(response.report);
  });
}

rescanBtn.addEventListener("click", async () => {
  const tab = await getActiveTab();
  if (!tab || tab.id === undefined) {
    return;
  }

  chrome.tabs.sendMessage(tab.id, { type: "BITB_RESCAN" }, (response) => {
    if (chrome.runtime.lastError || !response) {
      renderReport(null);
      return;
    }
    renderReport(response.report);
  });
});

loadInitialReport();
