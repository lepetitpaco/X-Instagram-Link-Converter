# Firefox Add-ons (AMO)

Developer page: https://addons.mozilla.org/developers/addon/x-instagram-link-converter/edit
Public page: https://addons.mozilla.org/firefox/addon/x-instagram-link-converter/

Default locale English (US), with a French translation of the listing. Visuals are rebuilt by
`store/render.sh` from the real captures in `store/captures/`.

## Checklist for 1.2.3 (simpler listing)

Chrome rejected 1.2.2 for keyword spam because of the list of embed domains in the description:
both listings are now kept short, without domains or service names. Credits stay on the website.

1. Upload New Version: `packages/embed-link-copier-firefox.zip` (1.2.3) with the version notes below.
2. Edit Product Page → Describe Add-on: summary and description below, in English and in the
   French translation.
3. Images: update the caption of screenshot 4.

---

## Package

Upload `packages/embed-link-copier-firefox.zip` (`scripts/package-firefox.sh`).

## Describe Add-on

**Name**: `Embed Link Copier: X, Instagram, TikTok`

**Summary** (156/250):
```
One click copies X, Instagram and TikTok posts as links that show a real preview in Discord, Telegram or WhatsApp. Add your own embed services, no tracking.
```

**Description** (limited Markdown):
```
**Share links that actually embed.**

Paste an X, Instagram or TikTok link in Discord, Telegram or WhatsApp and your friends often see a bare link. This add-on copies the same post as a link to an embed service, so the chat shows the video or picture.

**How it works**

- **X / Twitter**: copy buttons in the action bar of every post
- **Instagram**: a copy button next to Share on posts and reels
- **TikTok**: copy buttons under Share on every video
- **Popup**: copy the link of the page you are on

**Your services**

Add, hide or reorder embed services from the popup. Your list syncs with your Firefox account.

**Private**

No tracking, no account. Links are converted on your device and nothing is sent anywhere. Open source: https://github.com/lepetitpaco/Embed-Link-Copier

The previews are made by free embed services run by other people: credits are on the [extension's website](https://lepetitpaco.github.io/Embed-Link-Copier/). Not affiliated with X Corp., Meta or TikTok.
```

**Categories**: Social & Communication
**Homepage**: `https://lepetitpaco.github.io/Embed-Link-Copier/`
**Support site**: `https://github.com/lepetitpaco/Embed-Link-Copier/issues`
**Privacy policy**: the text of `site/privacy.html` (AMO wants the text, not a link)

## Images

- **Add-on icon**: `icons/icon128.png`
- **Screenshots**: `store/screenshots/1..5-*.png` (5, as on Chrome), with these captions:
  1. In Discord: a plain x.com link vs the same post copied with Embed Link Copier
  2. X: chips in the action bar of every post, more services in the ⋯ menu
  3. TikTok: chips under Share on every video
  4. Instagram: a copy button next to Share, and another in the Share menu
  5. Add, hide or reorder your own link services

To refresh the screenshots of the live listing: Edit Product Page → Images → Edit, remove the old
ones, add the new ones with their captions, Save Changes. No new version needed.

## Version notes (1.2.3)

```
- Shorter store summary and description
```

Previous version notes (1.2.2):

```
- The add-on is called Embed Link Copier everywhere
- Refreshed popup: dark theme matching the icon, clearer services editor
```

Older version notes (1.2.1):

```
- TikTok support: chips under Share copy a tnktok, tiktxk or kktiktok link; the popup copies the video on screen, even on the For You feed
- Link services are configurable per site from the popup (label, domain, order, shown or hidden), synced with your browser account
- Extra services are grouped in a ⋯ menu so action bars stay compact
- New icon, fewer permissions (no clipboard reading), What's new section in the popup
```

The version notes field can be hidden on AMO: fill it through the page if needed.

## Notes to Reviewer

```
Plain JavaScript, no build step, no minification: the package is the source code (https://github.com/lepetitpaco/Embed-Link-Copier). Content scripts for x.com, twitter.com, instagram.com and tiktok.com add copy buttons. Permissions: activeTab, clipboardWrite, storage (storage.sync holds only the user's list of link services: label + domain). No remote code, no network requests.
```
