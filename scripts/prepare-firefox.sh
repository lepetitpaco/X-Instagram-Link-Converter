#!/bin/bash
# Script pour restaurer le manifest V2 pour Firefox

# Aller à la racine du projet (un niveau au-dessus de scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

echo "🔄 Restauration pour Firefox (Manifest V2)..."

# Sauvegarder le manifest actuel (au cas où c'est V3 modifié)
if [ -f "manifest.json" ]; then
  if grep -q '"manifest_version": 3' manifest.json 2>/dev/null; then
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

# Restaurer V2 depuis le fichier source
if [ -f "manifest-v2.json" ]; then
  cp manifest-v2.json manifest.json
  echo "✅ Manifest V2 restauré pour Firefox"
else
  echo "⚠️  Fichier manifest-v2.json introuvable."
  echo "    Vous devrez créer manifest.json en V2 manuellement"
fi

echo ""
echo "📦 Vous pouvez maintenant charger l'extension dans Firefox"
echo "   about:debugging → Ce Firefox → Charger un module complémentaire temporaire"
