Ghost Browser 👻
================

A tiny Chrome extension that acts like a “ghost” using your browser:
it automatically opens, switches, and closes tabs according to a preset
sequence, perfect for a harmless prank.

Features
--------
- Opens specific URLs after configurable delays
- Switches between the tabs it created
- Can close its own tabs mid‑haunt
- Simple popup to start/stop the ghost

Install (Unpacked)
------------------
1. Open `chrome://extensions/` in Chrome.
2. Enable **Developer mode** (top‑right).
3. Click **Load unpacked** and select the `ghost-extension` folder.
4. Click the ghost icon in the toolbar, then **Unleash Ghost**.

Customize the Prank
-------------------
Edit the `GHOST_SEQUENCE` array at the top of `background.js` to change:

- **action**: `"open"`, `"switch"`, or `"close"`.
- **url**: URL to open (for `"open"` actions).
- **tabIndex**: which ghost‑created tab to switch/close (0‑based).
- **delay**: time in milliseconds to wait before running that step.

