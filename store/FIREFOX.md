# Firefox Add-ons (AMO)

Developer page: https://addons.mozilla.org/developers/addon/x-instagram-link-converter/edit
Public page: https://addons.mozilla.org/firefox/addon/x-instagram-link-converter/

Default locale English (US), with a French translation of the listing. Visuals are rebuilt by
`store/render.sh` from the real captures in `store/captures/`.

---

## Package

Upload `packages/x-instagram-link-converter-firefox.zip` (`scripts/package-firefox.sh`).

## Describe Add-on

**Name**: `Embed Link Copier: X, Instagram, TikTok`

**Summary** (200/250):
```
One click copies X, Instagram and TikTok posts as links to embed services (vxTwitter, FxEmbed, fxTikTok…) that show a real preview in Discord, Telegram or WhatsApp. Add your own services, no tracking.
```

**Description** (limited Markdown):
```
**Share links that actually embed.**

Paste an x.com, instagram.com or tiktok.com link in Discord, Telegram or WhatsApp and your friends often get… a bare link. This add-on copies the same post as a link to an existing embed service (vxTwitter, FxEmbed, fxTikTok…), and that service makes the chat show the video or picture.

**One click, right on the post**

- **X / Twitter**: chips in the action bar of every post: vx (fixvx), upx (fixupx), vxt (vxtwitter), x (clean original link)
- **Instagram**: a link button next to Share on every post and reel, plus kkinstagram in the Share menu, in any interface language
- **TikTok**: chips under Share on every video: tnktok, tiktxk, kktiktok
- **Popup**: copy the current page in any format; on the TikTok For You feed it picks the video on screen

**Your services, your rules**

An embed site goes down, a new one appears? Add it yourself in the popup: a short label and a domain. Hide, reorder or reset services per site. The first ones become chips, the rest wait in a compact ⋯ menu so the page stays clean. Your list syncs with your Firefox account.

**Private by design**

- No tracking, no analytics, no account
- Links are converted locally, nothing is sent anywhere
- Open source: https://github.com/lepetitpaco/X-Instagram-Link-Converter

**Credits: who makes the embeds**

This add-on does not generate any preview. It only rewrites the link to point to free embed services built and hosted by others:

- fixvx.com, vxtwitter.com: [vxTwitter](https://github.com/dylanpdx/BetterTwitFix)
- fixupx.com: [FxEmbed](https://github.com/FxEmbed/FxEmbed), formerly FxTwitter
- tnktok.com: [fxTikTok](https://github.com/okdargy/fxTikTok)
- tiktxk.com: [tiktxk](https://github.com/Britmoji/tiktxk)
- kkinstagram.com, kktiktok.com: [kkScript](https://kkscript.com)

If you use them a lot, consider supporting their maintainers. This add-on is not affiliated with these services, nor with X Corp., Meta or TikTok.
```

**Categories**: Social & Communication
**Homepage**: `https://lepetitpaco.github.io/X-Instagram-Link-Converter/`
**Support site**: `https://github.com/lepetitpaco/X-Instagram-Link-Converter/issues`
**Privacy policy**: the text of `site/privacy.html` (AMO wants the text, not a link)

## Images

- **Add-on icon**: `icons/icon128.png`
- **Screenshots**: `store/screenshots/1..6-*.png` (the 6th is Firefox and site only), with these captions:
  1. In Discord: a plain x.com link vs the same post copied with Embed Link Copier
  2. X: chips in the action bar of every post, more services in the ⋯ menu
  3. TikTok: chips under Share on every video
  4. Instagram: a button next to Share, and kkinstagram in the Share menu
  5. Add, hide or reorder your own link services
  6. In Discord: an Instagram link with no preview vs the kkinstagram link

To refresh the screenshots of the live listing: Edit Product Page → Images → Edit, remove the old
ones, add the new ones with their captions, Save Changes. No new version needed.

## Version notes (1.2.1)

```
- TikTok support: chips under Share copy a tnktok, tiktxk or kktiktok link; the popup copies the video on screen, even on the For You feed
- Link services are configurable per site from the popup (label, domain, order, shown or hidden), synced with your browser account
- Extra services are grouped in a ⋯ menu so action bars stay compact
- New icon, fewer permissions (no clipboard reading), What's new section in the popup
```

The version notes field can be hidden on AMO: fill it through the page if needed.

## Notes to Reviewer

```
Plain JavaScript, no build step, no minification: the package is the source code (https://github.com/lepetitpaco/X-Instagram-Link-Converter). Content scripts for x.com, twitter.com, instagram.com and tiktok.com add copy buttons. Permissions: activeTab, clipboardWrite, storage (storage.sync holds only the user's list of link services: label + domain). No remote code, no network requests.
```
