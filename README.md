<p align="center"><img src="store/icon.svg" width="96" alt=""></p>

<h1 align="center">X, Instagram &amp; TikTok Link Converter</h1>

<p align="center"><b>Share links that embed.</b> One click copies an X, Instagram or TikTok post as a link to an existing embed service (vxTwitter, FxEmbed, fxTikTok…), so Discord, Telegram, WhatsApp &amp; co show the real video or picture. The embeds are made by those services, <a href="#credits-who-makes-the-embeds">credited below</a>.</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/ohmjcjchdjkedcmpnefjgffkdolelbih"><b>Add to Chrome</b></a> ·
  <a href="https://addons.mozilla.org/firefox/addon/x-instagram-link-converter/"><b>Add to Firefox</b></a> ·
  <a href="https://lepetitpaco.github.io/X-Instagram-Link-Converter/">Website</a>
</p>

<p align="center"><img src="store/screenshots/1-share-links-that-embed.png" width="760" alt="A Discord chat: the x.com link has no preview, the fixvx.com link shows the video"></p>

## Install

- **Chrome, Edge, Brave…**: [Chrome Web Store](https://chromewebstore.google.com/detail/ohmjcjchdjkedcmpnefjgffkdolelbih)
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/x-instagram-link-converter/)

## How it works

| Site | Where | Default services |
|---|---|---|
| X / Twitter | Chips in the action bar of every post | `x` (clean x.com link), `vx` fixvx, `upx` fixupx, `vxt` vxtwitter |
| Instagram | Link button next to Share, and **kkinstagram** in the Share menu | `kk` kkinstagram |
| TikTok | Chips under Share on every video | `tnk` tnktok, `txk` tiktxk, `kk` kktiktok |

Click a chip and the converted link is in your clipboard. The popup (extension icon) copies the current page in any format; on the TikTok For You feed it uses the video on screen.

**Your own services**: in the popup, open **Services** to add, hide, reorder or reset services per site (a short label + a domain). The first ones become chips, the others go in a **⋯** menu. The list syncs with your browser account.

**Privacy**: no tracking, no analytics, nothing sent anywhere. Links are converted in your browser.

## Credits: who makes the embeds

**This extension does not generate any embed or preview.** It only rewrites the domain of the link you copy (`x.com/…` → `fixvx.com/…`) so that it points to an existing embed service. All the work of fetching the post and building the preview is done by these projects, run by their own authors:

| Service | Project | Maintainers |
|---|---|---|
| `fixvx.com`, `vxtwitter.com` | [vxTwitter (BetterTwitFix)](https://github.com/dylanpdx/BetterTwitFix) | dylanpdx and contributors |
| `fixupx.com` | [FxEmbed (FxTwitter / FixupX)](https://github.com/FxEmbed/FxEmbed) | FxEmbed contributors |
| `tnktok.com` | [fxTikTok](https://github.com/okdargy/fxTikTok) | okdargy and contributors |
| `tiktxk.com` | [tiktxk](https://github.com/Britmoji/tiktxk) | Britmoji |
| `kkinstagram.com` | [kkinstagram.com](https://kkinstagram.com) | independent service, maintainer not published |
| `kktiktok.com` | [kktiktok.com](https://kktiktok.com) | independent service, maintainer not published |

These services are free and cost their maintainers hosting money. If you use them a lot, consider starring or sponsoring their projects. This extension is not affiliated with any of them, nor with X Corp., Meta or TikTok.

## Development

Plain JavaScript, no build step.

- **Chrome**: run `scripts/prepare-chrome.sh` (switches `manifest.json` to Manifest V3), then `chrome://extensions` → Developer mode → **Load unpacked** → this folder
- **Firefox**: run `scripts/prepare-firefox.sh`, then `about:debugging` → This Firefox → **Load Temporary Add-on** → `manifest.json`
- **Store packages**: `scripts/package-chrome.sh` and `scripts/package-firefox.sh` write the zips to `packages/`
- **Store listing**: texts in `store/LISTING.md`; `store/render.sh` regenerates the icons, screenshots and promo tiles (Docker)

Issues and pull requests are welcome.

## Changelog

### Version 1.2.1
- New icon (16 to 128 px) and store visuals
- Removed the unused `clipboardRead` and `scripting` permissions
- Popup texts in English, What's new section in the popup

### Version 1.2.0
- Added TikTok support: chips below Share copy a `tnktok.com`, `tiktxk.com` or `kktiktok.com` link; the popup copies the video on screen, even on the feed
- Link services are now configurable per site from the popup (label, domain, order, shown or hidden), synced with the browser account
- Extra services are grouped in a ⋯ menu so the action bars stay compact

### Version 1.1.0
- One-click chips in the X action bar (x.com, fixvx, fixupx, vxtwitter), no extra row under posts
- Quick link button next to Share on Instagram (feed, posts, reels), in any interface language
- Settings apply to open tabs without reloading

### Version 1.0.4
- Simplified Instagram integration: removed in-page buttons, kept only share menu button
- Improved share menu detection with multiple strategies
- Better post URL extraction from share menu
- Enhanced robustness and performance

### Version 1.0.3
- Improved button visibility on all posts (X/Twitter)
- Buttons now appear on every post in the feed, not just the first one
- Enhanced X/Twitter button design
- Better post URL extraction for accurate link conversion
- Improved dynamic content detection for infinite scroll

### Version 1.0.2
- Added Manifest V3 support
- Added Twitter.com support (in addition to X.com)
- Improved Instagram button detection (more robust)
- Added popup interface
- Refactored code for better maintainability
- Added centralized configuration
- Improved error handling
- Added all X alternatives (fixvx, fixupx, vxtwitter)
