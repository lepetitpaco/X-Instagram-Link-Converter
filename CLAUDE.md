# CLAUDE.md — X-Instagram-Link-Converter

Extension navigateur qui convertit les liens X/Twitter, Instagram et TikTok vers des frontends alternatifs.

## Fonctionnalités

| Plateforme | Source | Destination |
|---|---|---|
| X / Twitter | `x.com`, `twitter.com` | `fixvx.com`, `fixupx.com`, `vxtwitter.com` |
| Instagram | `instagram.com` | `kkinstagram.com` |
| TikTok | `tiktok.com` | `tnktok.com`, `tiktxk.com`, `kktiktok.com` |

Ces destinations sont les **services par défaut** (`CONFIG.DEFAULT_SERVICES`) : l'utilisateur les modifie dans le popup.

**Méthodes de conversion :**
1. X/Twitter (`content-x.js`) : une pastille par type de lien activé dans la barre d'actions de chaque post (`x` = lien x.com d'origine, `vx` = fixvx, `upx` = fixupx, `vxt` = vxtwitter) ; un clic copie le lien
2. Instagram (`content-instagram.js`) : bouton rapide après Partager dans les barres d'actions (fil, page d'un post, reels) qui copie le lien kkinstagram, et bouton kkinstagram juste après « Copier le lien » dans le menu Partager
3. TikTok (`content-tiktok.js`) : une pastille par service activé sous Partager (`[data-e2e="share-icon"]`) dans la barre d'actions de chaque vidéo (`tnk`, `txk`, `kk`) ; l'URL est reconstruite depuis l'id du lecteur (`xgwrapper-<n>-<id>`) et le lien `/@auteur` de l'article
4. Interface popup de l'extension (`popup.html` / `popup.js`) : boutons de copie et éditeur des services ; sur le fil TikTok, le popup demande au content script la vidéo affichée (message `xilc-current-url`)

**Services** : un service = `{ label, domain, enabled }`, l'ordre de la liste fait foi, la conversion remplace seulement le domaine. Liste dans `storage.sync` (clé `services`, API `Storage.getServices`/`saveServices`/`resetServices`/`onServicesChanged`), migrée au premier lancement depuis l'ancien `enabledDomains` (local). Historique et stats restent en local. Les content scripts rendent les boutons via `renderServiceButtons` (utils.js) : `CONFIG.MAX_VISIBLE` pastilles par plateforme, le reste dans un menu `⋯` en `position: fixed` sur `document.body`.

**Repérage du DOM** (X, Instagram et TikTok changent souvent leur HTML) : ne jamais dépendre des classes CSS générées ni de textes en anglais. Instagram : menu Partager repéré par ses liens `wa.me`/Threads/Facebook, bouton Partager par `CONFIG.INSTAGRAM_SHARE_LABELS`. Styles injectés une fois (`injectStyles`, classes `xilc-*`) ; un seul `MutationObserver` débouncé par frame, pas de `setInterval`.

**Langue** : tout texte visible par l'utilisateur (popup, boutons, infobulles, messages, erreurs) est en anglais ; les commentaires du code restent en français.

## Manifests

L'extension supporte deux versions de manifest selon le navigateur :

| Fichier | Version | Navigateur |
|---|---|---|
| `manifest.json` | Actif (V2 par défaut) | Firefox |
| `manifest-v3.json` | Chrome/Edge | Chrome, Edge |
| `manifest-v2.json` | Backup V2 | Firefox |

## Préparer et packager pour publication

```sh
# Firefox (Manifest V2)
scripts/prepare-firefox.sh    # ou prepare-firefox.bat sur Windows
scripts/package-firefox.sh    # génère packages/firefox.zip

# Chrome/Edge (Manifest V3)
scripts/prepare-chrome.sh     # ou prepare-chrome.bat sur Windows
scripts/package-chrome.sh     # génère packages/chrome.zip
```

Les scripts `prepare-*` switchent le `manifest.json` actif automatiquement.

## Structure

```
X-Instagram-Link-Converter/
├── manifest.json          # Manifest actif (copié par les scripts prepare-*)
├── manifest-v2.json       # Source V2 (Firefox)
├── manifest-v3.json       # Source V3 (Chrome)
├── background.js          # V2 background script
├── background-v3.js       # V3 service worker
├── content-x.js           # Injection sur X/Twitter
├── content-instagram.js   # Injection sur Instagram
├── content-tiktok.js      # Injection sur TikTok
├── popup.html             # UI de l'extension
├── popup.js               # Logique popup
├── config.js              # Config centralisée : domaines, frontends alternatifs
├── utils.js               # Utilitaires partagés : styles, toast, icônes
├── storage.js             # Helpers localStorage
├── icons/                 # icon16/32/48/128.png générées depuis store/icon.svg
├── store/                 # Textes des fiches (LISTING.md), icône source, visuels ; store/render.sh régénère tout (Docker)
├── site/                  # Page GitHub Pages (.github/workflows/pages.yml)
├── scripts/               # Préparation + packaging par navigateur
├── packages/              # ZIPs générés (ne pas commiter)
└── docs/                  # Store descriptions, review notes
```

## Développement

Pas de build step — c'est du JavaScript vanilla.

**Tester en local :**
- Firefox : `about:debugging` → "Load Temporary Add-on" → sélectionner `manifest.json`
- Chrome : `chrome://extensions` → "Load unpacked" → après `prepare-chrome.sh`

**Modifier la config** (services par défaut, limites) : éditer `config.js` uniquement — les content scripts et le popup le chargent.

## Règles

- Toujours modifier `config.js` pour les services par défaut, pas les content scripts directement
- Toujours tester les deux manifests avant une publication
- Le dossier `packages/` est généré — ne pas le commiter
- Ne pas mélanger les APIs V2/V3 dans le même fichier background (deux fichiers séparés)
- `manifest.json` est le fichier actif modifié par les scripts — ne pas l'éditer manuellement
