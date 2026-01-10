# Revue complète des fonctionnalités Instagram

## 📋 Vue d'ensemble

Ce document répertorie toutes les fonctionnalités et interactions implémentées pour Instagram dans le plugin X-Instagram-Link-Converter.

---

## 🎯 Fonctionnalités principales

### 1. **Boutons de conversion sous les posts** ✅
**Fichier**: `content-instagram.js` - Fonction `addButtonsToPost()`

**Description**: Ajoute des boutons "kkinstagram" directement sous chaque post dans le feed Instagram.

**Où ça fonctionne**:
- ✅ Timeline principale (`instagram.com`)
- ✅ Pages de profils utilisateurs
- ✅ Pages de hashtags
- ✅ Pages de recherche
- ❌ Pages de reels individuelles (`/reels/ID` ou `/reel/ID`) - **DÉSACTIVÉ**

**Comportement**:
- Bouton avec icône caméra SVG et texte "kkinstagram"
- Style Instagram (dégradé violet-rose-orange)
- Animations hover et click
- Respect des paramètres utilisateur (domaines activés/désactivés)
- Sauvegarde dans l'historique et statistiques

**Détection**:
- Utilise `MutationObserver` pour détecter les nouveaux posts chargés dynamiquement
- Debounce de 300ms pour éviter trop d'exécutions
- Vérifie que l'URL du post est valide avant d'ajouter le bouton

---

### 2. **Bouton dans le menu de partage** ✅
**Fichier**: `content-instagram.js` - Fonction `addKkinstagramToShareMenu()`

**Description**: Ajoute un bouton "kkinstagram" dans le menu de partage Instagram (quand on clique sur "Share").

**Où ça fonctionne**:
- ✅ Timeline principale (`instagram.com`)
- ✅ Pages de posts individuelles (`/p/ID`)
- ✅ Pages de reels individuelles (`/reels/ID` ou `/reel/ID`)
- ✅ Toutes les pages Instagram

**Stratégies de détection** (5 stratégies):
1. Dialog avec `aria-label="Share"`
2. Dialog avec `aria-label` contenant "Share"
3. Dialog contenant "Copy link" ou boutons de partage (Facebook, WhatsApp)
4. Dialog visible avec boutons de partage
5. Recherche directe de "Copy link" avec `TreeWalker`

**Exclusions**:
- ❌ Menu "More" (trois points) dans les reels - **EXCLU**
- Vérifie que le menu contient bien "Copy link" ou des boutons de partage

**Comportement**:
- Détection automatique via `MutationObserver`
- Écoute des clics sur boutons de partage
- Vérification périodique toutes les 2 secondes
- Flag de verrouillage pour éviter les exécutions multiples
- Extraction intelligente de l'URL du post (priorise l'URL de la page sur les pages individuelles)

---

### 3. **Conversion de liens dans les commentaires** ✅
**Fichier**: `content-instagram.js` - Fonction `convertLinkInText()`

**Description**: Détecte les liens Instagram dans les commentaires et affiche un bouton "🔗 Convert" au survol.

**Où ça fonctionne**:
- ✅ Tous les posts (timeline, profils, etc.)
- ✅ Commentaires sous les posts
- ✅ Captions des posts

**Comportement**:
- Bouton apparaît au survol du lien
- Disparaît après 200ms si la souris quitte
- Conversion vers kkinstagram uniquement
- Sauvegarde dans l'historique et statistiques

---

### 4. **Nettoyage et normalisation des URLs** ✅
**Fichier**: `content-instagram.js` - Fonction `cleanInstagramUrl()`

**Description**: Nettoie et normalise les URLs Instagram pour extraire uniquement l'ID du post/reel.

**Fonctionnalités**:
- Supprime les query parameters
- Supprime les chemins supplémentaires (`/liked_by/`, `/saved/`, etc.)
- Normalise `/reels/` vers `/reel/` (pour kkinstagram)
- Gère les URLs avec username (`/username/reel/ID`)
- Priorise `/p/` sur `/reel/` si les deux sont présents
- Ignore les chemins invalides (`audio`, `liked_by`, `saved`, `tagged`, etc.)

**Exemples**:
- `https://www.instagram.com/p/DTT1sPBCD3K/liked_by/` → `https://www.instagram.com/p/DTT1sPBCD3K/`
- `https://www.instagram.com/reels/DTTCxeXjHbj/` → `https://www.instagram.com/reel/DTTCxeXjHbj/`
- `https://www.instagram.com/chasedelrosario/reel/DMss84surIn/` → `https://www.instagram.com/reel/DMss84surIn/`

---

### 5. **Extraction d'URL depuis le menu de partage** ✅
**Fichier**: `content-instagram.js` - Fonction `extractPostUrlFromShareMenu()`

**Description**: Extrait l'URL du post depuis le menu de partage de manière fiable.

**Stratégies**:
1. **Priorité**: URL de la page actuelle (sur pages individuelles `/p/ID` ou `/reel/ID`)
2. **Fallback**: Extraction depuis les liens de partage (Facebook, WhatsApp, Mailto)
   - Facebook: paramètre `u=` ou `link=`
   - WhatsApp: paramètre `text=` (décodé)
   - Mailto: paramètre `body=` (décodé)
3. **Dernier recours**: URL de la page actuelle

**Pourquoi cette approche**:
- Sur la timeline, `window.location.href` est juste `instagram.com`
- Les liens de partage contiennent l'URL complète du post dans leurs paramètres
- Sur les pages individuelles, l'URL de la page est toujours correcte

---

## 🔧 Interactions et observateurs

### 1. **MutationObserver principal** ✅
**Ligne**: 509-528

**Rôle**: Détecte les nouveaux posts chargés dynamiquement dans le feed.

**Comportement**:
- Observe `document.body` avec `childList: true, subtree: true`
- Debounce de 300ms
- Appelle `addButtonsToAllPosts()` et `convertLinkInText()`

---

### 2. **ShareMenuObserver** ✅
**Ligne**: 1644-1714

**Rôle**: Détecte l'ouverture du menu de partage.

**Comportement**:
- Observe les changements DOM pour détecter "Copy link"
- Ignore les mutations causées par l'ajout de notre bouton
- Déclenche immédiatement si "Copy link" est détecté
- Debounce de 200ms pour les autres changements
- Observe aussi les changements de texte et d'attributs

---

### 3. **Écouteur de clics sur boutons de partage** ✅
**Ligne**: 1725-1743

**Rôle**: Détecte les clics sur les boutons de partage pour déclencher immédiatement la recherche.

**Comportement**:
- Capture les événements tôt (capture phase)
- Détecte les boutons avec `aria-label` contenant "Share"
- Déclenche la recherche à 200ms, 500ms et 1000ms après le clic

---

### 4. **Vérification périodique** ✅
**Ligne**: 1755-1769

**Rôle**: Vérifie périodiquement si le menu de partage est ouvert.

**Comportement**:
- Intervalle de 2 secondes
- Ignore si le bouton existe déjà et est visible
- Ignore si on est en train d'ajouter le bouton

---

## 🚫 Exclusions et limitations

### Pages de reels individuelles
**Ligne**: 474-478

**Comportement**: 
- ❌ Aucun bouton sous les posts sur `/reels/ID` ou `/reel/ID`
- ✅ Bouton dans le menu de partage fonctionne

**Raison**: L'utilisateur a demandé de ne pas ajouter de boutons directement sur ces pages.

---

### Menu "More" (trois points)
**Ligne**: 1010-1024, 1046-1058, 1150-1163

**Comportement**:
- ❌ Le bouton n'est pas ajouté dans le menu "More" des reels
- Vérifie que le menu contient "Copy link" ou des boutons de partage avant d'ajouter

**Détection**:
- Vérifie `aria-label` contenant "more" ou "options"
- Vérifie l'absence de contenu de partage

---

## 📊 Intégration avec le système de stockage

### Historique des conversions
- Sauvegarde: `window.Storage.saveToHistory(originalUrl, convertedUrl, domain, platform)`
- Utilisé dans: Boutons sous posts, menu de partage, liens dans commentaires

### Statistiques
- Incrémentation: `window.Storage.incrementStats(platform, domain)`
- Utilisé dans: Toutes les conversions

### Paramètres utilisateur
- Chargement: `window.Storage.getSettings()`
- Utilisé dans: `createButtonsWithSettings()` pour afficher/masquer les domaines

---

## 🎨 Styles et UI

### Boutons sous les posts
- Dégradé Instagram: `linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)`
- Icône SVG caméra (3 paths)
- Animations hover (scale 1.05) et click (scale 0.98)
- Ombre portée avec couleur Instagram

### Bouton dans le menu de partage
- Structure identique aux autres boutons Instagram
- Classes CSS Instagram pour l'intégration
- Icône SVG Instagram (path complet)
- Texte "kkinstagram"

### Bouton dans les commentaires
- Style minimaliste
- Position fixe au survol
- Dégradé Instagram
- Texte "🔗 Convert"

---

## 🔍 Points d'attention et améliorations possibles

### 1. Performance
- ✅ Debounce sur les observers (300ms, 200ms)
- ✅ Flag de verrouillage pour éviter les exécutions multiples
- ✅ Vérification de l'existence avant d'ajouter
- ⚠️ `TreeWalker` peut être coûteux sur de grandes pages (utilisé seulement si nécessaire)

### 2. Robustesse
- ✅ 5 stratégies de détection pour le menu de partage
- ✅ 6 stratégies pour trouver le conteneur des boutons
- ✅ 4 stratégies d'insertion du bouton
- ✅ Fallbacks multiples à chaque étape

### 3. Compatibilité
- ✅ Supporte `/reels/` et `/reel/` (normalise vers `/reel/`)
- ✅ Supporte les URLs avec username
- ✅ Gère les query parameters
- ✅ Ignore les chemins invalides

### 4. Logs de débogage
- ✅ Logs détaillés avec préfixe `[kkinstagram]`
- ✅ Logs pour chaque stratégie de détection
- ✅ Logs d'erreurs avec stack trace

---

## 📝 Résumé des interactions

| Fonctionnalité | Timeline | Post individuel | Reel individuel | Commentaires |
|---------------|----------|-----------------|-----------------|--------------|
| Boutons sous posts | ✅ | ✅ | ❌ | N/A |
| Menu de partage | ✅ | ✅ | ✅ | N/A |
| Liens dans commentaires | ✅ | ✅ | ✅ | ✅ |

---

## 🐛 Problèmes connus et solutions

### 1. Boucle infinie (RÉSOLU)
**Problème**: Le code s'exécutait en boucle lors de l'ajout du bouton.

**Solution**:
- Flag `isAddingKkinstagramButton` pour éviter les exécutions multiples
- MutationObserver ignore les mutations causées par notre bouton
- Intervalle réduit à 2 secondes avec vérification de l'existence

### 2. Menu "More" détecté comme menu de partage (RÉSOLU)
**Problème**: Le menu "More" était parfois détecté comme menu de partage.

**Solution**:
- Vérification de l'`aria-label` contenant "more" ou "options"
- Vérification de l'absence de contenu de partage
- Exclusion à plusieurs niveaux (stratégies 2, 3, 4, et vérification finale)

### 3. URL incorrecte sur pages de posts (RÉSOLU)
**Problème**: URLs avec `/liked_by/` ou `/audio/` étaient générées.

**Solution**:
- `cleanInstagramUrl()` ignore les chemins invalides
- Priorise `/p/` sur `/reel/`
- Cherche tous les matches et sélectionne le premier valide

---

## 🎯 État actuel

✅ **Tout fonctionne correctement**:
- Boutons sous les posts (timeline uniquement)
- Bouton dans le menu de partage (partout)
- Conversion de liens dans les commentaires
- Exclusion du menu "More"
- Pas de boutons sur pages de reels individuelles

---

## 📌 Notes importantes

1. **Pages de reels individuelles**: Les boutons ne sont PAS ajoutés directement sur ces pages, seulement dans le menu de partage.

2. **Menu "More"**: Exclu de manière robuste à plusieurs niveaux.

3. **Performance**: Les observers sont optimisés avec debounce et flags de verrouillage.

4. **Robustesse**: Multiples stratégies de fallback à chaque étape.

5. **Compatibilité**: Supporte toutes les variantes d'URLs Instagram.
