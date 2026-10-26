# Chrome Web Store

Dashboard: https://chrome.google.com/webstore/devconsole · public page:
https://chromewebstore.google.com/detail/ohmjcjchdjkedcmpnefjgffkdolelbih

Follows the dashboard tabs in order. Labels in **bold** are the field names as the French
dashboard shows them; the text to paste is in the code blocks. Visuals are rebuilt by
`store/render.sh` from the real captures in `store/captures/`.

## Checklist for 1.2.2 (rename to Embed Link Copier)

1. GitHub, in this order: rename the repository to `Embed-Link-Copier` (Settings → General),
   update the local remote (`git remote set-url origin https://github.com/lepetitpaco/Embed-Link-Copier.git`),
   then push, and check that Pages publishes at https://lepetitpaco.github.io/Embed-Link-Copier/
   (re-run the Pages workflow if needed). Pushing before the rename would publish links that 404.
2. Package: upload `packages/embed-link-copier-chrome.zip` (version 1.2.2). Chrome takes the store
   name from the package: this replaces "X, Instagram & TikTok Link Converter".
3. Store listing: description below, the 5 screenshots, the 2 promo images, homepage and support URLs.
4. Privacy: privacy policy URL below (new address).
5. "Envoyer pour examen".

---

## 1. Package

Upload `packages/embed-link-copier-chrome.zip` (`scripts/package-chrome.sh`).

---

## 2. Fiche Play Store (Store listing)

**Titre / Résumé issus du package**: from `manifest-v3.json`, nothing to do. Summary (100/132):
`Copy X, Instagram and TikTok links that show the full post in Discord and other chats, in one click.`

**Description**:
```
Share links that actually embed.

Paste an X, Instagram or TikTok link in Discord, Telegram or WhatsApp and your friends often see a bare link. This extension copies the same post as a link to an embed service, so the chat shows the video or picture.

HOW IT WORKS
• X / Twitter: copy buttons in the action bar of every post
• Instagram: a copy button next to Share on posts and reels
• TikTok: copy buttons under Share on every video
• Popup: copy the link of the page you are on

YOUR SERVICES
Add, hide or reorder embed services from the popup. Your list syncs with your browser account.

PRIVATE
No tracking, no account. Links are converted on your device and nothing is sent anywhere. Open source: github.com/lepetitpaco/Embed-Link-Copier

The previews are made by free embed services run by other people: credits are on the extension's website. Not affiliated with X Corp., Meta or TikTok.
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
public NASA posts with the extension installed; the first one compares the same post pasted in
Discord as a plain link and as a converted link.

To replace the screenshots of the live listing: delete the old ones in "Captures d'écran",
drop the new ones in order, then "Envoyer pour examen". No new package needed.

### Champs supplémentaires (Additional fields)

**URL de la page d'accueil**:
```
https://lepetitpaco.github.io/Embed-Link-Copier/
```

**URL de l'assistance**:
```
https://github.com/lepetitpaco/Embed-Link-Copier/issues
```

---

## 3. Confidentialité (Privacy)

**Description de l'objectif unique**:
```
Copy X/Twitter, Instagram and TikTok post links converted to embed services (editable by the user) so they show a preview when shared.
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
https://lepetitpaco.github.io/Embed-Link-Copier/privacy.html
```

---

## 4. Distribution

Sans frais · Public · Toutes les régions.
