# Review: Services configurables par site + support TikTok

- **Verdict**: approve
- **Diff**: `main...working tree (non commité)`
- **Axes run**: code, functional, relevancy
- **Date**: 2026_10_24
- **Findings**: 0 critical, 0 warning, 0 minor

## Phases

### Phase 1 — Modèle de services, stockage sync et migration

- [x] `CONFIG.DEFAULT_SERVICES.tiktok` liste tnk, txk, kk actifs dans cet ordre — config.js:18
- [x] Une install 1.1.0 avec fixvx décoché obtient `vx` désactivé après migration, et sync contient la liste — storage.js `migrateLegacySettings` / `getServices` (test-storage OK)
- [x] Une liste déjà en sync n'est jamais écrasée par la migration — storage.js `getServices` (test-storage OK)
- [x] `validateService` refuse domaine sans point, avec espace, libellé > 4 caractères — storage.js `validateService` (test-storage OK)

### Phase 2 — Rendu in-page : pastilles + menu « ⋯ »

- [x] Au-delà du maximum, une pastille ⋯ liste exactement les services restants — utils.js `renderServiceButtons` (test-render, TikTok et X en navigateur)
- [x] Le menu se ferme au clic extérieur, à Échap et au défilement, sans toucher la mise en page — utils.js `openServiceMenu` (test-render)
- [x] Sur X, x/vx/upx visibles et vxt dans le menu ; le clic copie le bon domaine — content-x.js `addButtonToPost` (navigateur)
- [x] Sur Instagram, le bouton copie le lien du premier service ; le bouton du menu Partager porte son nom — content-instagram.js `addQuickButtons` / `buildKkinstagramButton` (navigateur)
- [x] Sur TikTok, tnk/txk visibles et kk dans le menu — content-tiktok.js `addTikTokQuickButtons` (navigateur, copie kktiktok vérifiée)
- [x] Un changement de services met à jour les onglets ouverts sans rechargement — `Storage.onServicesChanged` dans les trois content scripts

### Phase 3 — Popup : éditeur de services et copie dynamique

- [x] Le popup s'ouvre sans erreur et `popup.js` ne contient plus de liste de domaines — popup.html charge config.js (test-popup)
- [x] Décocher un service retire son bouton Copier immédiatement — popup.js `persistServices` → `renderCopyButtons` (test-popup)
- [x] Sur tiktok.com/foryou, un bouton Copier copie la vidéo à l'écran — popup.js `getDisplayedTikTokUrl` + content-tiktok.js `onMessage` (test-popup avec onglet simulé)
- [x] Un service ajouté et valide est visible sur le site sans recharger — popup.js `commit` → `saveServices` (test-popup) + `onServicesChanged`
- [x] Une saisie invalide affiche une erreur et ne modifie pas la liste sauvegardée — popup.js `commit` (test-popup)
- [x] Valeurs par défaut restaure la liste d'origine — popup.js bouton reset (test-popup)

### Phase 4 — Version 1.2.0, docs et justifications store

- [x] Les trois manifests annoncent 1.2.0 et le lint Firefox est propre — manifest*.json, web-ext lint 0/0/0
- [x] Aucune doc n'affirme que les réglages restent uniquement en local — docs/CHROME_PRIVACY_JUSTIFICATIONS.txt (storage.sync décrit)

## Findings


None.

## Verification

| Metric        | Value |
| ------------- | ----- |
| Verified      | 100% (18/18) |
| Files checked | config.js, storage.js, utils.js, content-x.js, content-instagram.js, content-tiktok.js, popup.html, popup.js, manifest*.json, README.md, CLAUDE.md, docs/* , scripts/package-* |
| Unchecked     | none |
| Unplanned     | popup.js : résumé `(actifs/total)` mis à jour sans re-rendu ; content-tiktok.js : seuls les articles avec lecteur comptent pour la vidéo visible ; storage.js : correction du `ReferenceError` sur `browser` dans l'historique et les stats (bug antérieur révélé par les tests, nécessaire au kit de copie) ; utils.js : détection du thème sombre par la couleur de fond (correction trouvée en navigateur) |
