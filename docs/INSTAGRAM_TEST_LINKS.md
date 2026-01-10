# Guide de test des liens Instagram

## 📍 Où apparaît le bouton "kkinstagram" ?

### **Bouton dans le menu de partage** (Partout)
**Apparence**: Bouton "kkinstagram" dans le menu qui s'ouvre quand on clique sur "Share"

**Où**:
- ✅ Timeline principale (`instagram.com`)
- ✅ Pages de posts individuelles (`/p/ID`)
- ✅ Pages de reels individuelles (`/reels/ID` ou `/reel/ID`)
- ✅ Toutes les pages Instagram

**Comment tester**: Cliquer sur le bouton "Share" d'un post → Le bouton "kkinstagram" apparaît dans le menu

**Note**: Depuis la version 1.0.4, les boutons sous les posts ont été supprimés. Seul le menu de partage est disponible.

---

### **Bouton dans les commentaires** (Au survol)
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
- [1] Bouton dans le menu de partage fonctionne
- [2] Liens dans les commentaires sont convertibles au survol

---

### Test 2: Post individuel
**URL**: `https://www.instagram.com/p/DTNnuzxjgIK/`

**À vérifier**:
- [3] Bouton dans le menu de partage fonctionne
- [4] L'URL convertie est correcte: `https://kkinstagram.com/p/DTNnuzxjgIK/`
- [5] Liens dans les commentaires sont convertibles

**Variantes à tester**:
- [6] `https://www.instagram.com/p/DTNnuzxjgIK` (sans slash final)
- [7] `https://www.instagram.com/p/DTNnuzxjgIK/?utm_source=ig_web_copy_link` (avec query params)
- [8] `https://www.instagram.com/p/DTNnuzxjgIK/liked_by/` (avec chemin supplémentaire)

---

### Test 3: Reel individuel
**URL**: `https://www.instagram.com/reel/DTTCxeXjHbj/`

**À vérifier**:
- [9] Bouton dans le menu de partage fonctionne
- [10] L'URL convertie est correcte: `https://kkinstagram.com/reel/DTTCxeXjHbj/`

**Variantes à tester**:
- [11] `https://www.instagram.com/reels/DTTCxeXjHbj/` (avec 's')
- [12] `https://www.instagram.com/reel/DTTCxeXjHbj` (sans slash final)
- [13] `https://www.instagram.com/username/reel/DTTCxeXjHbj/` (avec username)

---

### Test 4: Reel avec username
**URL**: `https://www.instagram.com/chasedelrosario/reel/DMss84surIn/`

**À vérifier**:
- [14] L'URL est correctement nettoyée: `https://www.instagram.com/reel/DMss84surIn/` 
- [15] L'URL convertie est correcte: `https://kkinstagram.com/reel/DMss84surIn/`

---

### Test 5: Menu "More" (trois points)
**URL**: N'importe quelle page de reel

**À vérifier**:
- [ ] ❌ Le bouton "kkinstagram" n'apparaît PAS dans le menu "More"
- [ ] ✅ Le bouton apparaît uniquement dans le menu "Share"

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
- [ ] `https://www.instagram.com/reels/DTTCxeXjHbj/` → Converti en `https://kkinstagram.com/reel/DTTCxeXjHbj/`
- [ ] Le 's' est bien supprimé pour kkinstagram

---

## 📋 Checklist de test rapide

### Sur la timeline (`instagram.com`)
- [ ] Menu de partage contient "kkinstagram"
- [ ] Bouton cliquable et fonctionnel
- [ ] Liens dans commentaires convertibles

### Sur un post individuel (`/p/ID`)
- [ ] Menu de partage contient "kkinstagram"
- [ ] URL convertie correcte
- [ ] Liens dans commentaires convertibles

### Sur un reel individuel (`/reel/ID` ou `/reels/ID`)
- [ ] Menu de partage contient "kkinstagram"
- [ ] URL convertie correcte (avec `/reel/` sans 's')

### Menu "More" (trois points)
- [ ] ❌ Pas de bouton "kkinstagram" dans ce menu

---

## 🎯 Résultat attendu pour le post de référence

**Post**: `https://www.instagram.com/p/DTNnuzxjgIK/`

**URL convertie attendue**: `https://kkinstagram.com/p/DTNnuzxjgIK/`

**Où tester**:
1. **Timeline**: Si ce post apparaît dans votre feed → Menu de partage
2. **Page individuelle**: Ouvrir `https://www.instagram.com/p/DTNnuzxjgIK/` → Menu de partage
3. **Commentaires**: Si ce lien apparaît dans un commentaire → Survoler le lien

---

## 🔍 Détection des problèmes

### Si le bouton n'apparaît pas dans le menu de partage:
1. Ouvrir la console (F12)
2. Chercher les logs `[kkinstagram]`
3. Vérifier les erreurs JavaScript
4. Vérifier que le menu de partage est bien ouvert

### Si l'URL convertie est incorrecte:
1. Vérifier que l'URL originale est valide
2. Vérifier les logs de `cleanInstagramUrl()`
3. Vérifier que les chemins invalides sont bien ignorés

---

## 📝 Notes importantes

1. **Boutons sous les posts**: Supprimés depuis la version 1.0.4. Seul le menu de partage est disponible.

2. **Menu "More"**: Le bouton n'apparaît PAS dans ce menu, uniquement dans le menu "Share".

3. **Normalisation**: `/reels/` est automatiquement converti en `/reel/` pour kkinstagram.

4. **Chemins invalides**: Les chemins comme `/liked_by/`, `/saved/`, `/audio/` sont automatiquement supprimés.
