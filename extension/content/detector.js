/**
 * BitB Guard — Core DOM Heuristic Detector
 *
 * Inspects the active document's DOM hierarchy for indicators of
 * Browser-in-the-Browser (BitB) phishing overlays:
 *   1. Floating window container bounded within the viewport (fake window chrome)
 *   2. Fake DOM address bar / spoofed HTTPS URL mismatching real origin
 *   3. Embedded iframe or credential-harvesting inputs inside a fake window
 *
 * Designed as a clean, extensible baseline for BIL 420/520 research & iteration.
 */

window.BitBDetector = (function () {
  const URL_REGEX = /\bhttps?:\/\/([a-z0-9.-]+\.[a-z]{2,})(?:\/[^\s]*)?/i;
  const WINDOW_CONTROL_CHARS = /[−–—─_]|□|▢|🗖|🗕|×|✕|✖/;

  const WEIGHTS = {
    FAKE_ADDRESS_BAR_URL: 45,
    CROSS_ORIGIN_SPOOFED_URL: 25,
    WINDOW_CHROME_CONTROLS: 25,
    EMBEDDED_IFRAME: 20,
    PASSWORD_INPUT: 15,
    VIEWPORT_BOUND_FLOATING: 10
  };

  function isVisible(el) {
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) === 0) {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width >= 200 && rect.height >= 150;
  }

  /**
   * Identifies floating elements that resemble a popup window inside the viewport.
   */
  function getFloatingCandidates() {
    const candidates = [];
    const allElements = document.querySelectorAll("div, section, article, dialog, aside");

    for (const el of allElements) {
      if (el.id === "bitb-guard-banner" || el.closest("#bitb-guard-banner")) {
        continue;
      }

      const style = window.getComputedStyle(el);
      const isFloating = style.position === "fixed" || style.position === "absolute";
      if (!isFloating || !isVisible(el)) {
        continue;
      }

      const rect = el.getBoundingClientRect();
      const withinViewport =
        rect.width < window.innerWidth * 0.98 &&
        rect.height < window.innerHeight * 0.98 &&
        rect.left >= -20 &&
        rect.top >= -20 &&
        rect.right <= window.innerWidth + 20 &&
        rect.bottom <= window.innerHeight + 20;

      const zIndex = parseInt(style.zIndex, 10) || 0;
      const hasShadowOrBorder =
        style.boxShadow !== "none" ||
        (style.borderStyle !== "none" && parseFloat(style.borderWidth) > 0);

      if (withinViewport && (zIndex >= 10 || hasShadowOrBorder)) {
        candidates.push(el);
      }
    }

    // Filter out parent wrappers if a tighter child candidate already represents the fake window
    return candidates.filter((el) => !candidates.some((other) => other !== el && el.contains(other)));
  }

  /**
   * Checks the upper area of a candidate element for text/inputs mimicking a browser address bar.
   */
  function inspectFakeAddressBar(el) {
    const rect = el.getBoundingClientRect();
    const headerCutoffY = rect.top + Math.min(120, rect.height * 0.35);
    const currentHost = window.location.hostname.toLowerCase();

    let foundUrl = null;
    let mismatchesOrigin = false;

    const nodes = el.querySelectorAll("input, span, div, p, code, label");
    for (const node of nodes) {
      const nRect = node.getBoundingClientRect();
      if (nRect.width === 0 || nRect.height === 0 || nRect.top > headerCutoffY) {
        continue;
      }

      const text =
        node.tagName === "INPUT"
          ? (node.value || node.placeholder || "").trim()
          : (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE
              ? node.textContent
              : ""
            ).trim();

      const match = text.match(URL_REGEX);
      if (match) {
        foundUrl = match[0];
        const claimedHost = match[1].toLowerCase();
        if (claimedHost !== currentHost) {
          mismatchesOrigin = true;
        }
        break;
      }
    }

    return { foundUrl, mismatchesOrigin };
  }

  /**
   * Checks for simulated OS window controls (min/max/close buttons or macOS traffic lights).
   */
  function inspectWindowChrome(el) {
    const rect = el.getBoundingClientRect();
    const titleBarCutoffY = rect.top + 60;

    let controlGlyphHits = 0;
    const controls = el.querySelectorAll("button, span, div, a");

    for (const ctrl of controls) {
      const cRect = ctrl.getBoundingClientRect();
      if (cRect.width === 0 || cRect.height === 0 || cRect.top > titleBarCutoffY) {
        continue;
      }
      if (cRect.width > 48 || cRect.height > 48) {
        continue;
      }

      const text = (ctrl.textContent || "").trim();
      if (text.length > 0 && text.length <= 2 && WINDOW_CONTROL_CHARS.test(text)) {
        controlGlyphHits += 1;
      }
    }

    // Multiple window control buttons (e.g., minimize + maximize + close) strongly indicate fake OS chrome.
    // A single close button ("×") is common in benign modals and is intentionally ignored here.
    return controlGlyphHits >= 2;
  }

  /**
   * Evaluates a single floating container and returns its score and matched signals.
   */
  function analyzeCandidate(el) {
    let score = 0;
    const signals = [];

    // 1. Viewport-bounded floating container
    score += WEIGHTS.VIEWPORT_BOUND_FLOATING;
    signals.push("Viewport-bounded floating container detected");

    // 2. Fake address bar inspection
    const addr = inspectFakeAddressBar(el);
    if (addr.foundUrl) {
      score += WEIGHTS.FAKE_ADDRESS_BAR_URL;
      signals.push(`DOM text/input mimics URL bar (${addr.foundUrl})`);

      if (addr.mismatchesOrigin) {
        score += WEIGHTS.CROSS_ORIGIN_SPOOFED_URL;
        signals.push(
          `Displayed URL host differs from actual origin (${window.location.hostname || "local file"})`
        );
      }
    }

    // 3. Simulated OS window controls
    if (inspectWindowChrome(el)) {
      score += WEIGHTS.WINDOW_CHROME_CONTROLS;
      signals.push("Simulated OS/browser window control buttons detected in header");
    }

    // 4. Embedded iframe inspection
    const iframe = el.querySelector("iframe");
    if (iframe) {
      score += WEIGHTS.EMBEDDED_IFRAME;
      signals.push(`Embedded iframe inside floating window (src: ${iframe.getAttribute("src") || "inline/srcdoc"})`);
    }

    // 5. Credential input inspection
    const hasPasswordInput = Boolean(el.querySelector('input[type="password"]'));
    if (hasPasswordInput) {
      score += WEIGHTS.PASSWORD_INPUT;
      signals.push("Password input field present inside floating container");
    }

    // TODO (BIL 420/520 Extension Point):
    // - Add SVG padlock/TLS icon proximity checks
    // - Add macOS traffic-light dot cluster detection (3 small circular spans in header)
    // - Add drag-handle / viewport-clamping behavioral detection

    return {
      element: el,
      score: Math.min(score, 100),
      signals
    };
  }

  /**
   * Runs a full scan of the current document.
   */
  function scanDocument() {
    const candidates = getFloatingCandidates();
    const findings = candidates
      .map(analyzeCandidate)
      .filter((item) => item.score >= 45)
      .sort((a, b) => b.score - a.score);

    const highestScore = findings.length > 0 ? findings[0].score : 0;
    let riskLevel = "safe";
    if (highestScore >= 70) {
      riskLevel = "high";
    } else if (highestScore >= 45) {
      riskLevel = "medium";
    }

    return {
      url: window.location.href,
      origin: window.location.origin,
      scannedAt: new Date().toISOString(),
      riskLevel,
      highestScore,
      findingCount: findings.length,
      findings
    };
  }

  return { scanDocument };
})();
