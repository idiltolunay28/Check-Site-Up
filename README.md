# BitB Guard — Browser-in-the-Browser (BitB) Phishing Analysis & Detection

**Course:** BIL 420/520 — Introduction to Cybersecurity (Siber Güvenliğe Giriş)  
**Project Type:** Defense-Oriented Practical Application

## Overview

This repository contains a client-side **Manifest V3** browser extension (**BitB Guard**) that inspects the active DOM hierarchy to detect Browser-in-the-Browser (BitB) phishing overlays, a **brand-free synthetic HTML5/CSS3 test suite**, and structured Turkish threat/defense analysis reports.

## Repository Structure

```text
.
├── extension/                              # Manifest V3 browser extension (plain JS, zero build step)
│   ├── manifest.json                       # MV3 manifest (activeTab, service worker, content scripts, popup)
│   ├── background.js                       # Per-tab risk state & toolbar badge updates (! / ?)
│   ├── content/
│   │   ├── detector.js                     # Weighted DOM heuristics (fake URL bar, Windows & macOS chrome, iframe, password)
│   │   ├── overlay.js                      # In-page warning banner & dashed outline highlight
│   │   └── main.js                         # Initial scan + MutationObserver for dynamically injected overlays
│   ├── popup/                              # Toolbar popup displaying risk score, signals, and manual Rescan button
│   └── styles/alert.css                    # In-page defensive alert styling
├── test-pages/                             # Brand-free, logo-free synthetic HTML5/CSS3 test suite (*.example.test)
│   ├── index.html                          # Test suite dashboard
│   ├── common.css                          # Shared styles for synthetic scenarios
│   ├── bitb-windows.html                   # Positive Test 1: Draggable Windows-style BitB popup
│   ├── bitb-iframe-macos.html              # Positive Test 2: macOS traffic-light dots + embedded <iframe> BitB
│   ├── bitb-dark-2fa.html                  # Positive Test 3: Hover-spoofed link + delayed dark-mode 2FA BitB
│   ├── bitb-evasion-schemeless.html        # Positive Test 4 (Edge): Scheme-less URL bar (no https://)
│   └── benign-modal.html                   # Negative Control: Standard floating login modal (false-positive check)
└── docs/                                   # Turkish technical analysis & evaluation reports
    ├── 01-tehdit-ve-aldanma-analizi.md     # BitB & fake OpenID flow, visual deception, STRIDE & MITRE ATT&CK
    ├── 02-tespit-mimarisi.md               # Manifest V3 architecture, heuristic weights, and limitations
    ├── 03-test-ve-dogrulama.md             # Synthetic + real login-page evaluation matrix (TP/TN/FP/FN)
    └── 04-fido2-passkey-analizi.md         # Origin-bound FIDO2 / WebAuthn / Passkey defense analysis
```

## Quick Start

### 1. Load the Extension (Chrome / Edge / Brave)
1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `extension/` folder.
4. *(Optional)* Enable **Allow access to file URLs** in the extension details if opening `.html` files directly without a local server.

### 2. Run the Synthetic Test Suite
Serve `test-pages/` locally so the pages run over `http://localhost:8080`:

```powershell
python -m http.server 8080 --directory test-pages
```

Open `http://localhost:8080` and trigger each scenario while checking the extension badge, popup signals, and browser DevTools (`F12`).

## Ethical Scope

All files in `test-pages/` are strictly synthetic, contain **zero third-party brands or logos**, use reserved RFC 2606 domains (`*.example.test`), and never transmit form input.
