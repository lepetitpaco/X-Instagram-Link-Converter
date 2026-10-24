---
objective: "Sur X, Instagram et TikTok, l'utilisateur choisit depuis le popup quels services d'embed afficher (libellé, domaine, ordre, activé), sans mise à jour de l'extension, et la barre d'actions reste propre grâce à un menu « ⋯ » au-delà de quelques pastilles."
status: reviewed
---

# Plan: Services configurables par site + support TikTok

## Overview

| Field      | Value |
| ---------- | ----- |
| **Goal**   | Remplacer les domaines codés en dur par une liste de services modifiable par site (X, Instagram, TikTok), synchronisée, avec un menu de débordement in-page |
| **Source** | Demande utilisateur (texte, /forge « tout ça », 2026-10-24) + issue GitHub #1 (kktiktok) déjà implémentée sans commit |

## Phases

| #   | Phase | File |
| --- | ----- | ---- |
| 1   | Modèle de services, stockage sync et migration | [`phase-1.md`](./phase-1.md) |
| 2   | Rendu in-page : pastilles + menu « ⋯ » sur X, Instagram, TikTok | [`phase-2.md`](./phase-2.md) |
| 3   | Popup : éditeur de services et boutons de copie dynamiques | [`phase-3.md`](./phase-3.md) |
| 4   | Version 1.2.0, docs et justifications store | [`phase-4.md`](./phase-4.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync | `storage.sync` : 8 Ko par élément, 100 Ko au total, aucune permission en plus de `storage` ; une liste de ~20 services tient largement |
| https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/sync | Firefox : `storage.sync` disponible en MV2, nécessite un ID d'extension (présent dans `browser_specific_settings.gecko.id`) |
| curl en User-Agent Discordbot sur tnktok.com, tiktxk.com, kktiktok.com (2026-10-24) | tnktok et tiktxk renvoient `og:video` ; kktiktok renvoie 504 (gardé, actif par défaut à la demande de Paco) |

## Decisions

| Decision | Why |
| -------- | --- |
| Un service = `{ label, domain, enabled }`, l'ordre de la liste fait foi ; conversion = remplacement du hostname uniquement | Tous les services actuels gardent le chemin d'origine ; pas de modèle d'URL tant qu'aucun service ne l'exige |
| Liste des services dans `storage.sync` (clé `services`), historique et stats restent dans `storage.local` | Config partagée entre appareils sans faire sortir l'historique de la machine |
| Valeurs par défaut uniquement dans `config.js` (`CONFIG.DEFAULT_SERVICES`), chargé aussi par le popup | Une seule source ; le popup ne duplique plus sa propre config inline |
| Pastilles visibles : X 3, TikTok 2, Instagram 1 (bouton icône), le reste dans un menu `⋯` posé en `position: fixed` sur `document.body` | Ne touche jamais la mise en page du site ; la barre verticale de TikTok et la barre d'icônes d'Instagram restent compactes |
| Le lien x.com d'origine devient un service normal (`x` → `x.com`) | Un seul mécanisme ; l'utilisateur peut le désactiver ou le déplacer comme les autres |
