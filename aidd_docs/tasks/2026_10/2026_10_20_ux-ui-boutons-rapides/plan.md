---
objective: "Sur X et Instagram, chaque post offre un bouton compact intégré à sa barre d'actions qui copie le lien voulu sans ajouter de ligne ni faire bouger la mise en page."
status: reviewed
---

# Plan: UX/UI des boutons rapides X et Instagram

## Overview

| Field      | Value |
| ---------- | ----- |
| **Goal**   | Boutons compacts, sans décalage visuel, avec copie du lien x.com d'origine et bouton kkinstagram rapide partout |
| **Source** | Demande utilisateur (texte, /forge, 2026-10-20) |

## Phases

| #   | Phase                              | File                         |
| --- | ---------------------------------- | ---------------------------- |
| 1   | Kit UI partagé (styles, toast, menu) | [`phase-1.md`](./phase-1.md) |
| 2   | X : bouton compact + menu          | [`phase-2.md`](./phase-2.md) |
| 3   | Instagram : bouton rapide partout  | [`phase-3.md`](./phase-3.md) |

## Decisions

| Decision | Why |
| -------- | --- |
| Bouton icône intégré dans la barre d'actions native (X `role=group`, Instagram barre like/commenter/partager) au lieu d'une ligne de boutons sous le post | Aucune hauteur ajoutée, donc pas de saut du fil quand le bouton apparaît |
| Sur X, un clic ouvre un petit menu flottant (x.com, fixvx, fixupx, vxtwitter) positionné en `fixed` sur `document.body` | Plusieurs choix sans élargir la barre ; le menu ne touche pas au flux de la page |
| Sur Instagram, un clic copie directement kkinstagram | Une seule alternative : la copie en un geste est le « bouton rapide » demandé |
| Styles injectés une fois via une balise `<style>` à classes préfixées `xilc-` | Supporte thèmes clair/sombre et `:hover` sans styles inline, aucune modification des manifests |
| Suppression du bouton flottant « 🔗 Convert » au survol des liens | Source principale des déplacements bizarres (bouton `fixed` qui ne suit pas le défilement) |
