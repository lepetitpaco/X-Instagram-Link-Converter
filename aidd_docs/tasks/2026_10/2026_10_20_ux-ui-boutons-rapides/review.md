# Review: UX/UI des boutons rapides X et Instagram

- **Verdict**: approve
- **Diff**: `main...feat/ux-boutons-rapides (arbre de travail non commité)`
- **Axes run**: code, functional, relevancy
- **Date**: 2026_10_20
- **Findings**: 0 critical, 0 warning, 0 minor (7 corrigés)

## Phases

### Phase 1 — Kit UI partagé

- [x] Une seule balise `#xilc-styles` même après plusieurs appels — utils.js `injectStyles` (vérifié : `styles: 1` sur x.com)
- [x] Toast en bas au centre, un second appel remplace le premier — utils.js `createToast` (capture X et Instagram)
- [x] Menu collé au bouton, fermé au clic extérieur, à Échap, au défilement — utils.js `openQuickMenu` (capture x.com, Échap testé)

### Phase 2 — X : bouton compact + menu

- [x] Lien du post principal avec nom d'utilisateur — content-x.js `getPostUrl` / `cleanXUrl` (post de Kojima citant un autre post : `…573840` copié, pas la citation)
- [x] Une icône par post, hauteur inchangée — content-x.js `addButtonToPost` (67 posts défilés, 0 manquant, 0 doublon, barres à 34 px)
- [x] Menu x.com + alternatives activées, copie + toast — content-x.js `buildMenuItems` (toast `https://x.com/HIDEO_KOJIMA_EN/status/2112177593017573840`)

### Phase 3 — Instagram : bouton rapide partout

- [x] Un bouton par barre d'actions (fil, reels), hauteur inchangée — content-instagram.js `addQuickButtons` (4/4 posts, barres à 40 px, 9 reels)
- [x] Lien du post ou reel cliqué — content-instagram.js `getPostUrlFor` (fil `/p/Det5L90jaSG/`, reels `DerYYBOosNv` puis `Der20xODMuC`)
- [x] Un clic copie kkinstagram et affiche le toast — content-instagram.js `createQuickButton`

## Findings

None. Les 7 points de la première passe sont corrigés : remontée bornée à 3 niveaux, `getPostUrl` réutilisé, CLAUDE.md à jour, logs retirés, libellé kkinstagram sur une ligne (vu à l'écran), menu X remplacé par des pastilles en un clic (demande utilisateur), `/i/web/status/<id>` accepté.

## Verification

| Metric        | Value |
| ------------- | ----- |
| Verified      | 100% (9/9) |
| Files checked | utils.js, config.js, content-x.js, content-instagram.js, popup.js |
| Unchecked     | none |
| Unplanned     | pastilles X en un clic à la place du menu (demande utilisateur en cours de route), case x.com dans le popup, version 1.1.0 + paquets et textes des stores ; popup.js : suppression du rechargement des onglets à chaque réglage (remplacé par lecture au clic sur X et `storage.onChanged` sur Instagram) ; fins de ligne CRLF conservées |
