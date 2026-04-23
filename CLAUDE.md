# CLAUDE.md — X-Instagram-Link-Converter

Extension navigateur qui convertit les liens X/Twitter et Instagram vers des frontends alternatifs.

## Fonctionnalités

| Plateforme | Source | Destination |
|---|---|---|
| X / Twitter | `x.com`, `twitter.com` | `fixvx.com`, `fixupx.com`, `vxtwitter.com` |
| Instagram | `instagram.com` | `kkinstagram.com` |

**Méthodes de conversion :**
1. Boutons injectés directement sur les posts X/Twitter (`content-x.js`)
2. Bouton dans le menu de partage Instagram (`content-instagram.js`)
3. Interface popup de l'extension (`popup.html` / `popup.js`)

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
├── popup.html             # UI de l'extension
├── popup.js               # Logique popup
├── config.js              # Config centralisée : domaines, frontends alternatifs
├── utils.js               # Utilitaires partagés
├── storage.js             # Helpers localStorage
├── icons/
│   └── icon128.png
├── scripts/               # Préparation + packaging par navigateur
├── packages/              # ZIPs générés (ne pas commiter)
└── docs/                  # Store descriptions, review notes
```

## Développement

Pas de build step — c'est du JavaScript vanilla.

**Tester en local :**
- Firefox : `about:debugging` → "Load Temporary Add-on" → sélectionner `manifest.json`
- Chrome : `chrome://extensions` → "Load unpacked" → après `prepare-chrome.sh`

**Modifier la config** (domaines, URLs alternatives) : éditer `config.js` uniquement — `content-x.js` et `content-instagram.js` l'importent.

## Règles

- Toujours modifier `config.js` pour les URLs/domaines, pas les content scripts directement
- Toujours tester les deux manifests avant une publication
- Le dossier `packages/` est généré — ne pas le commiter
- Ne pas mélanger les APIs V2/V3 dans le même fichier background (deux fichiers séparés)
- `manifest.json` est le fichier actif modifié par les scripts — ne pas l'éditer manuellement
