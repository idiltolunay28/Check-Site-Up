# BIL 420/520 — BitB Phishing Analysis & Detection Extension

Starter repository for the **Browser-in-the-Browser (BitB) Threat Analysis and Client-Side Detection Extension** term project.

## Structure

```text
.
├── extension/      # Manifest V3 browser extension base (plain JS)
├── test-pages/     # Brand-free synthetic HTML5/CSS3 test pages
└── docs/           # Turkish report and analysis notes
```

## Loading the Extension (Chrome / Edge)

1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `extension/` folder.
4. *(Optional)* Enable **Allow access to file URLs** in the extension details if testing local `.html` files directly.
