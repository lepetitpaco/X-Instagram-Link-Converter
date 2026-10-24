# Fiches des stores (Chrome Web Store et Firefox Add-ons)

Textes prêts à coller, en anglais. Visuels dans `store/` (régénérés par `store/render.sh`).

| Visuel | Fichier | Où |
|---|---|---|
| Icône 128 | `icons/icon128.png` | Chrome : icône de la fiche ; Firefox : icône |
| Captures 1280x800 | `store/screenshots/1..5-*.png` | Chrome : captures (5 max) ; Firefox : captures |
| Petite tuile 440x280 | `store/promo-small-440x280.png` | Chrome : « Small promo tile » |
| Bannière 1400x560 | `store/promo-marquee-1400x560.png` | Chrome : « Marquee promo tile » |

---

## Nom (les deux stores)

```
X, Instagram & TikTok Link Converter
```

## Résumé

Chrome lit `description` du manifest (132 caractères max). Firefox : champ « Summary » (250 max).

Chrome (126 caractères, déjà dans le manifest) :
```
Copy X, Instagram and TikTok links that embed well in Discord and chats (fixvx, vxtwitter, kkinstagram, tnktok…) in one click.
```

Firefox (200 caractères) :
```
One click copies X, Instagram and TikTok posts as links to embed services (vxTwitter, FxEmbed, fxTikTok…) that show a real preview in Discord, Telegram or WhatsApp. Add your own services, no tracking.
```

## Description (Chrome, champ « Description »)

```
Share links that actually embed.

Paste an x.com, instagram.com or tiktok.com link in Discord, Telegram or WhatsApp and your friends often get… a bare link. This extension copies the same post as a link to an existing embed service (vxTwitter, FxEmbed, fxTikTok…), and that service makes the chat show the video or picture.

★ ONE CLICK, RIGHT ON THE POST
• X / Twitter: chips in the action bar of every post: vx (fixvx), upx (fixupx), vxt (vxtwitter), x (clean original link)
• Instagram: a link button next to Share on every post and reel, plus kkinstagram in the Share menu, in any interface language
• TikTok: chips under Share on every video: tnktok, tiktxk, kktiktok
• Popup: copy the current page in any format; on the TikTok For You feed it picks the video on screen

★ YOUR SERVICES, YOUR RULES
An embed site goes down, a new one appears? Add it yourself in the popup: a short label and a domain. Hide, reorder or reset services per site. The first ones become chips, the rest wait in a compact ⋯ menu so the page stays clean. Your list follows your browser account.

★ PRIVATE BY DESIGN
• No tracking, no analytics, no account
• Links are converted locally, nothing is sent anywhere
• Open source: github.com/lepetitpaco/X-Instagram-Link-Converter

Works on x.com, twitter.com, instagram.com and tiktok.com.

★ CREDITS: WHO MAKES THE EMBEDS
This extension does not generate any preview. It only rewrites the link to point to free embed services built and hosted by others:
• fixvx.com, vxtwitter.com: vxTwitter (github.com/dylanpdx/BetterTwitFix)
• fixupx.com: FxEmbed (github.com/FxEmbed/FxEmbed)
• tnktok.com: fxTikTok (github.com/okdargy/fxTikTok)
• tiktxk.com: tiktxk (github.com/Britmoji/tiktxk)
• kkinstagram.com, kktiktok.com: independent services
If you use them a lot, consider supporting their maintainers.

This extension is not affiliated with these services, nor with X Corp., Meta or TikTok.
```

## Description (Firefox, champ « Description », Markdown limité)

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
- fixupx.com: [FxEmbed](https://github.com/FxEmbed/FxEmbed)
- tnktok.com: [fxTikTok](https://github.com/okdargy/fxTikTok)
- tiktxk.com: [tiktxk](https://github.com/Britmoji/tiktxk)
- kkinstagram.com, kktiktok.com: independent services

If you use them a lot, consider supporting their maintainers. This add-on is not affiliated with these services, nor with X Corp., Meta or TikTok.
```

## Notes de version 1.2.1

Firefox : « Release notes » de la version. Chrome : pas de champ, rien à faire.

```
- TikTok support: chips under Share copy a tnktok, tiktxk or kktiktok link; the popup copies the video on screen, even on the For You feed
- Link services are configurable per site from the popup (label, domain, order, shown or hidden), synced with your browser account
- Extra services are grouped in a ⋯ menu so action bars stay compact
- New icon, fewer permissions (no clipboard reading), What's new section in the popup
```

Notes aux testeurs (Firefox) :

```
Plain JavaScript, no build step, no minification: the package is the source code (https://github.com/lepetitpaco/X-Instagram-Link-Converter). Content scripts for x.com, twitter.com, instagram.com and tiktok.com add copy buttons. Permissions: activeTab, clipboardWrite, storage (storage.sync holds only the user's list of link services: label + domain). No remote code, no network requests.
```

## Catégorie et métadonnées

| Champ | Chrome | Firefox |
|---|---|---|
| Catégorie | Social & Communication | Social & Communication |
| Langue | English | English |
| Site web | https://lepetitpaco.github.io/X-Instagram-Link-Converter/ | idem (« Homepage ») |
| Assistance | https://github.com/lepetitpaco/X-Instagram-Link-Converter/issues | idem (« Support site ») |
| Tags Firefox | — | twitter, instagram, tiktok, discord, embed, links, privacy |

## Confidentialité (Chrome, onglet « Pratiques de confidentialité »)

Objectif unique :
```
Copy X/Twitter, Instagram and TikTok post links converted to embed services (fixvx, vxtwitter, kkinstagram, tnktok… editable by the user) so they show a preview when shared.
```

Justifications : voir `docs/CHROME_PRIVACY_JUSTIFICATIONS.txt` (activeTab, clipboardWrite, storage, accès aux sites). Code distant : non. Données collectées : aucune (ne cocher aucune case), puis cocher les trois certifications.
