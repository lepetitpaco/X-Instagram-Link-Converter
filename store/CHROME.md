# Chrome Web Store

Dashboard: https://chrome.google.com/webstore/devconsole · public page:
https://chromewebstore.google.com/detail/ohmjcjchdjkedcmpnefjgffkdolelbih

Follows the dashboard tabs in order. Labels in **bold** are the field names as the French
dashboard shows them; the text to paste is in the code blocks. Visuals are rebuilt by
`store/render.sh` from the real captures in `store/captures/`.

---

## 1. Package

Upload `packages/x-instagram-link-converter-chrome.zip` (`scripts/package-chrome.sh`).

---

## 2. Fiche Play Store (Store listing)

**Titre / Résumé issus du package**: from `manifest-v3.json`, nothing to do. Summary (126/132):
`Copy X, Instagram and TikTok links that embed well in Discord and chats (fixvx, vxtwitter, kkinstagram, tnktok…) in one click.`

**Description**:
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
• fixupx.com: FxEmbed, formerly FxTwitter (github.com/FxEmbed/FxEmbed)
• tnktok.com: fxTikTok (github.com/okdargy/fxTikTok)
• tiktxk.com: tiktxk (github.com/Britmoji/tiktxk)
• kkinstagram.com, kktiktok.com: kkScript (kkscript.com)
If you use them a lot, consider supporting their maintainers.

This extension is not affiliated with these services, nor with X Corp., Meta or TikTok.
```

**Catégorie**: Social & Communication (`Réseaux sociaux et communication`)

**Langue**: `anglais` (English)

### Éléments graphiques (Graphic assets)

| Field | File |
|---|---|
| **Icône du magasin** (128 x 128) | `icons/icon128.png` |
| **Captures d'écran** (1280 x 800, in this order) | `store/screenshots/1-share-links-that-embed.png`<br>`store/screenshots/2-x-twitter.png`<br>`store/screenshots/3-tiktok.png`<br>`store/screenshots/4-instagram.png`<br>`store/screenshots/5-custom-services.png` |
| **Petite image promotionnelle** (440 x 280) | `store/promo-small-440x280.png` |
| **Image promotionnelle en haut de la page** (1400 x 560) | `store/promo-marquee-1400x560.png` |

All are 24-bit PNG without alpha, as Chrome requires. The screenshots are real captures of
public NASA posts with the extension installed.

To replace the screenshots of the live listing: delete the old ones in "Captures d'écran",
drop the new ones in order, then "Envoyer pour examen". No new package needed.

### Champs supplémentaires (Additional fields)

**URL de la page d'accueil**:
```
https://lepetitpaco.github.io/X-Instagram-Link-Converter/
```

**URL de l'assistance**:
```
https://github.com/lepetitpaco/X-Instagram-Link-Converter/issues
```

---

## 3. Confidentialité (Privacy)

**Description de l'objectif unique**:
```
Copy X/Twitter, Instagram and TikTok post links converted to embed services (fixvx, vxtwitter, kkinstagram, tnktok… editable by the user) so they show a preview when shared.
```

**Justification de l'autorisation activeTab**:
```
The popup reads the address of the current tab to convert it when the user opens it, and nothing else. The extension only acts on the active tab when the user interacts with it.
```

**Justification de l'autorisation clipboardWrite**:
```
After converting a link, the extension copies the converted URL to the clipboard so the user can paste it directly. This is the core feature: one click on a button and the converted link is ready to paste.
```

**Justification de l'autorisation storage**:
```
The list of link services (short label, domain, shown or hidden, order) is saved with storage.sync, so the browser's own sync can share it across the user's devices; it contains no personal data. The history of the last 20 converted links shown in the popup stays in the browser's local extension storage. The extension itself sends nothing to any server.
```

**Justification de l'autorisation Autorisation d'accès à l'hôte**:
```
The content scripts add copy buttons to posts and videos on x.com, twitter.com, instagram.com and tiktok.com, and read the post address to convert it. Without access to these sites, the buttons cannot be displayed. The extension runs on no other site.
```

**Utilisez-vous code distant ?**: `Non, je n'utilise pas "Code distant"`.

**Consommation des données**: check **none** of the data types, then the three certifications.

**URL des règles de confidentialité**:
```
https://lepetitpaco.github.io/X-Instagram-Link-Converter/privacy.html
```

---

## 4. Distribution

Sans frais · Public · Toutes les régions.
