# Guide de test des liens Instagram

## 📍 Où apparaissent les boutons "kkinstagram" ?

### 1. **Boutons sous les posts** (Timeline uniquement)
**Apparence**: Bouton avec icône caméra et texte "kkinstagram" sous chaque post

**Où**:
- ✅ Timeline principale (`instagram.com`)
- ✅ Pages de profils utilisateurs
- ✅ Pages de hashtags
- ✅ Pages de recherche
- ❌ Pages de reels individuelles (`/reels/ID` ou `/reel/ID`) - **DÉSACTIVÉ**

**Style**: Dégradé Instagram (violet-rose-orange) avec animations hover

---

### 2. **Bouton dans le menu de partage** (Partout)
**Apparence**: Bouton "kkinstagram" dans le menu qui s'ouvre quand on clique sur "Share"

**Où**:
- ✅ Timeline principale (`instagram.com`)
- ✅ Pages de posts individuelles (`/p/ID`)
- ✅ Pages de reels individuelles (`/reels/ID` ou `/reel/ID`)
- ✅ Toutes les pages Instagram

**Comment tester**: Cliquer sur le bouton "Share" d'un post → Le bouton "kkinstagram" apparaît dans le menu

---

### 3. **Bouton dans les commentaires** (Au survol)
**Apparence**: Bouton "🔗 Convert" qui apparaît au survol des liens Instagram

**Où**:
- ✅ Commentaires sous les posts
- ✅ Captions des posts
- ✅ Tous les endroits où il y a des liens Instagram

**Comment tester**: Survoler un lien Instagram dans un commentaire → Le bouton apparaît à côté

---

## 🔗 Types de liens Instagram supportés

Basé sur le post de référence: `https://www.instagram.com/p/DTNnuzxjgIK/`

### Type 1: Posts standard (`/p/ID`)
**Format**: `https://www.instagram.com/p/[ID]/`

**Exemples à tester**:
```
✅ https://www.instagram.com/p/DTNnuzxjgIK/
✅ https://www.instagram.com/p/DTNnuzxjgIK
✅ https://www.instagram.com/p/DTNnuzxjgIK/?utm_source=ig_web_copy_link
✅ https://instagram.com/p/DTNnuzxjgIK/
✅ https://www.instagram.com/p/DTNnuzxjgIK/?hl=en

Pas de boutons kkinstagram visible ici KO
Présent dans le menu share OK
```

**Avec chemins supplémentaires** (seront nettoyés automatiquement):
```
✅ https://www.instagram.com/p/DTNnuzxjgIK/liked_by/
✅ https://www.instagram.com/p/DTNnuzxjgIK/saved/
✅ https://www.instagram.com/p/DTNnuzxjgIK/tagged/

Rien de spécial a tester, on ne va jamais dans ces liens
```

**Avec username**:
```
✅ https://www.instagram.com/the_frog_mage/p/DTNnuzxjgIK/
✅ https://www.instagram.com/the_frog_mage/p/DTNnuzxjgIK

Pas de boutons kkinstagram visible ici KO
Présent dans le menu share OK
```

---

### Type 2: Reels (`/reel/ID` ou `/reels/ID`)
**Format**: `https://www.instagram.com/reel/[ID]/` ou `https://www.instagram.com/reels/[ID]/`

**Exemples à tester**:
```
✅ https://www.instagram.com/reel/DTTCxeXjHbj/
✅ https://www.instagram.com/reels/DTTCxeXjHbj/
✅ https://www.instagram.com/reel/DTTCxeXjHbj
✅ https://www.instagram.com/reels/DTTCxeXjHbj/?utm_source=ig_web_copy_link

Menu share OK
Pas dans 3 petits point plus d'options OK
```

**Avec username**:
```
✅ https://www.instagram.com/the_frog_mage/reel/DTTCxeXjHbj/
✅ https://www.instagram.com/chasedelrosario/reel/DMss84surIn/
✅ https://www.instagram.com/_fxxtcandy_/reel/DTNyzuMjp2U/
```

**Note**: `/reels/` sera automatiquement normalisé vers `/reel/` pour kkinstagram

---

### Type 3: URLs avec chemins invalides (seront ignorés)
**Ces chemins seront automatiquement supprimés**:
```
❌ /audio/ - Ignoré
❌ /liked_by/ - Ignoré
❌ /saved/ - Ignoré
❌ /tagged/ - Ignoré
❌ /followers/ - Ignoré
❌ /following/ - Ignoré
```

**Exemples**:
```
✅ https://www.instagram.com/p/DTNnuzxjgIK/liked_by/ → Nettoyé en: https://www.instagram.com/p/DTNnuzxjgIK/
✅ https://www.instagram.com/reel/audio/ → Ignoré (audio n'est pas un ID valide)
```

---

## 🧪 Plan de test complet

### Test 1: Timeline principale
**URL**: `https://www.instagram.com/`

**À vérifier**:
- [V] Boutons "kkinstagram" apparaissent sous chaque post
- [V] Bouton dans le menu de partage fonctionne
- [ ] Liens dans les commentaires sont convertibles au survol (j'ai pas trouvé de liens, je verrai quand je tomberai dessus)

---

### Test 2: Post individuel
**URL**: `https://www.instagram.com/p/DTNnuzxjgIK/`

**À vérifier**:
- [V] Bouton dans le menu de partage fonctionne
- [V] L'URL convertie est correcte: `https://kkinstagram.com/p/DTNnuzxjgIK/`
- [ ] Liens dans les commentaires sont convertibles

**Variantes à tester**:
- [V] `https://www.instagram.com/p/DTNnuzxjgIK` (sans slash final)
- [V] `https://www.instagram.com/p/DTNnuzxjgIK/?utm_source=ig_web_copy_link` (avec query params)
- [V] `https://www.instagram.com/p/DTNnuzxjgIK/liked_by/` (avec chemin supplémentaire)

---

### Test 3: Reel individuel
**URL**: `https://www.instagram.com/reel/DTTCxeXjHbj/`

**À vérifier**:
- [V] ❌ Aucun bouton sous le reel (désactivé)
- [V] ✅ Bouton dans le menu de partage fonctionne
- [V] L'URL convertie est correcte: `https://kkinstagram.com/reel/DTTCxeXjHbj/`

**Variantes à tester**:
- [ ] `https://www.instagram.com/reels/DTTCxeXjHbj/` (avec 's')
- [ ] `https://www.instagram.com/reel/DTTCxeXjHbj` (sans slash final)
- [ ] `https://www.instagram.com/username/reel/DTTCxeXjHbj/` (avec username)

---

### Test 4: Reel avec username
**URL**: `https://www.instagram.com/chasedelrosario/reel/DMss84surIn/`

**À vérifier**:
- [V] L'URL est correctement nettoyée: `https://www.instagram.com/reel/DMss84surIn/` 
- [V] L'URL convertie est correcte: `https://kkinstagram.com/reel/DMss84surIn/`

---

### Test 5: Menu "More" (trois points)
**URL**: N'importe quelle page de reel

**À vérifier**:
- [V] ❌ Le bouton "kkinstagram" n'apparaît PAS dans le menu "More"
- [V] ✅ Le bouton apparaît uniquement dans le menu "Share"

---

### Test 6: Liens dans les commentaires
**Où**: N'importe quel post avec des liens Instagram dans les commentaires

**À vérifier**:
- [ ] Survoler un lien Instagram → Bouton "🔗 Convert" apparaît
- [ ] Cliquer sur le bouton → URL convertie copiée
- [ ] Le bouton disparaît après 200ms si la souris quitte

**Exemples de liens à tester dans les commentaires**:
```
https://www.instagram.com/p/DTNnuzxjgIK/
https://www.instagram.com/reel/DTTCxeXjHbj/
https://www.instagram.com/username/p/DTNnuzxjgIK/
```

---

### Test 7: URLs avec chemins invalides
**À vérifier**:
- [ ] `https://www.instagram.com/p/DTNnuzxjgIK/liked_by/` → Nettoyé correctement
- [ ] `https://www.instagram.com/p/DTNnuzxjgIK/saved/` → Nettoyé correctement
- [ ] `https://www.instagram.com/reel/audio/` → Ignoré (audio n'est pas un ID)

---

### Test 8: Normalisation `/reels/` → `/reel/`
**À vérifier**:
- [V] `https://www.instagram.com/reels/DTTCxeXjHbj/` → Converti en `https://kkinstagram.com/reel/DTTCxeXjHbj/` -> https://kkinstagram.com/reel/DTTCxeXjHbj/
- [V] Le 's' est bien supprimé pour kkinstagram

---

## 📋 Checklist de test rapide

### Sur la timeline (`instagram.com`)
- [V] Boutons sous les posts visibles
- [V] Boutons cliquables et fonctionnels
- [V] Menu de partage contient "kkinstagram"
- [je sais pas] Liens dans commentaires convertibles

### Sur un post individuel (`/p/ID`)
- [V] Menu de partage contient "kkinstagram"
- [V] URL convertie correcte
- [V] Liens dans commentaires convertibles

### Sur un reel individuel (`/reel/ID` ou `/reels/ID`)
- [V] ❌ Pas de bouton sous le reel -> je veux un bouton pour `/reel/ID` mais pas pour `/reels/ID`
- [V] ✅ Menu de partage contient "kkinstagram"
- [V] URL convertie correcte (avec `/reel/` sans 's')

### Menu "More" (trois points)
- [V] ❌ Pas de bouton "kkinstagram" dans ce menu

---

## 🎯 Résultat attendu pour le post de référence

**Post**: `https://www.instagram.com/p/DTNnuzxjgIK/`

**URL convertie attendue**: `https://kkinstagram.com/p/DTNnuzxjgIK/`

**Où tester**:
1. **Timeline**: Si ce post apparaît dans votre feed → Bouton sous le post
2. **Page individuelle**: Ouvrir `https://www.instagram.com/p/DTNnuzxjgIK/` → Menu de partage
3. **Commentaires**: Si ce lien apparaît dans un commentaire → Survoler le lien

---

## 🔍 Détection des problèmes

### Si les boutons n'apparaissent pas:
1. Ouvrir la console (F12)
2. Chercher les logs `[kkinstagram]`
3. Vérifier les erreurs JavaScript

### Si l'URL convertie est incorrecte:
1. Vérifier que l'URL originale est valide
2. Vérifier les logs de `cleanInstagramUrl()`
3. Vérifier que les chemins invalides sont bien ignorés

---

## 📝 Notes importantes

1. **Pages de reels individuelles**: Les boutons ne sont PAS ajoutés directement sur ces pages, seulement dans le menu de partage.

2. **Menu "More"**: Le bouton n'apparaît PAS dans ce menu, uniquement dans le menu "Share".

3. **Normalisation**: `/reels/` est automatiquement converti en `/reel/` pour kkinstagram.

4. **Chemins invalides**: Les chemins comme `/liked_by/`, `/saved/`, `/audio/` sont automatiquement supprimés.
