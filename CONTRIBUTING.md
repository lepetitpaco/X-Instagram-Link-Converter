# Contributing

Plain JavaScript, no build step.

- **Chrome**: run `scripts/prepare-chrome.sh` (switches `manifest.json` to Manifest V3), then `chrome://extensions` → Developer mode → **Load unpacked** → this folder
- **Firefox**: run `scripts/prepare-firefox.sh`, then `about:debugging` → This Firefox → **Load Temporary Add-on** → `manifest.json`
- **Store packages**: `scripts/package-chrome.sh` and `scripts/package-firefox.sh` write the zips to `packages/`
- **Store listing**: texts in `store/LISTING.md`; `store/render.sh` regenerates the icons, screenshots and promo tiles (Docker)

Issues and pull requests are welcome. Code comments are in French; every text the user sees is in English. More details for contributors and AI agents in `CLAUDE.md`.
