#!/bin/bash
# Script pour préparer l'extension pour Chrome (Manifest V3)

# Aller à la racine du projet (un niveau au-dessus de scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

echo "🔄 Préparation pour Chrome (Manifest V3)..."

# Sauvegarder le manifest actuel (peut être V2 ou V3 modifié)
if [ -f "manifest.json" ]; then
  # Vérifier si c'est V2 ou V3 pour sauvegarder au bon endroit
  if grep -q '"manifest_version": 2' manifest.json 2>/dev/null; then
    # Sauvegarder V2 seulement s'il est différent de manifest-v2.json
    if [ -f "manifest-v2.json" ]; then
      if ! cmp -s manifest.json manifest-v2.json 2>/dev/null; then
        cp manifest.json manifest-v2.json.backup
        echo "✅ Manifest V2 modifié sauvegardé"
      fi
    else
      cp manifest.json manifest-v2.json.backup
      echo "✅ Manifest V2 sauvegardé"
    fi
  elif grep -q '"manifest_version": 3' manifest.json 2>/dev/null; then
    # Sauvegarder V3 seulement s'il est différent de manifest-v3.json
    if [ -f "manifest-v3.json" ]; then
      if ! cmp -s manifest.json manifest-v3.json 2>/dev/null; then
        cp manifest.json manifest-v3.json.backup
        echo "✅ Manifest V3 modifié sauvegardé"
      fi
    else
      cp manifest.json manifest-v3.json.backup
      echo "✅ Manifest V3 sauvegardé"
    fi
  fi
fi

# Copier manifest-v3.json vers manifest.json
cp manifest-v3.json manifest.json
echo "✅ Manifest V3 activé pour Chrome"

echo ""
echo "📦 Vous pouvez maintenant charger l'extension dans Chrome"
echo "   chrome://extensions/ → Charger l'extension non empaquetée"
