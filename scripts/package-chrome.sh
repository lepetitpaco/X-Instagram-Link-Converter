#!/bin/bash
# Script pour créer le package Chrome (Manifest V3) prêt à publier

# Aller à la racine du projet (un niveau au-dessus de scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

echo "📦 Création du package Chrome (Manifest V3)..."

PACKAGE_NAME="x-instagram-link-converter-chrome"
TEMP_DIR=".chrome-package"
ZIP_FILE="packages/${PACKAGE_NAME}.zip"

# Nettoyer les anciens packages
rm -rf "$TEMP_DIR" "$ZIP_FILE"

# Créer le répertoire temporaire
mkdir -p "$TEMP_DIR"

# Copier tous les fichiers nécessaires
echo "📋 Copie des fichiers..."

# Fichiers essentiels
cp manifest-v3.json "$TEMP_DIR/manifest.json"
cp background-v3.js "$TEMP_DIR/"
cp config.js "$TEMP_DIR/"
cp utils.js "$TEMP_DIR/"
cp storage.js "$TEMP_DIR/"
cp content-x.js "$TEMP_DIR/"
cp content-instagram.js "$TEMP_DIR/"
cp popup.html "$TEMP_DIR/"
cp popup.js "$TEMP_DIR/"

# Dossier icons
if [ -d "icons" ]; then
  cp -r icons "$TEMP_DIR/"
fi

# Créer le ZIP
echo "🗜️  Création de l'archive..."

# Créer le dossier packages s'il n'existe pas
mkdir -p packages

# Vérifier si zip est disponible
if command -v zip &> /dev/null; then
  cd "$TEMP_DIR"
  zip -r "../$ZIP_FILE" . > /dev/null
  cd ..
elif command -v tar &> /dev/null; then
  # Alternative: utiliser tar avec compression gzip
  cd "$TEMP_DIR"
  tar -czf "../${ZIP_FILE%.zip}.tar.gz" . > /dev/null 2>&1
  cd ..
  ZIP_FILE="packages/${ZIP_FILE%.zip}.tar.gz"
  echo "⚠️  zip non disponible, création d'un .tar.gz à la place"
  echo "    Vous pouvez le renommer en .zip ou utiliser tar pour l'extraire"
else
  echo "❌ Erreur: zip ou tar non disponible"
  echo "    Installez zip avec: sudo apt-get install zip (Debian/Ubuntu)"
  echo "    ou: sudo yum install zip (RedHat/CentOS)"
  echo "    ou: brew install zip (macOS)"
  echo ""
  echo "    Le package est dans: $TEMP_DIR"
  echo "    Vous pouvez créer le ZIP manuellement"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# Nettoyer
rm -rf "$TEMP_DIR"

echo ""
if [[ "$ZIP_FILE" == *.tar.gz ]]; then
  echo "✅ Package créé : $ZIP_FILE"
  echo "⚠️  Note: C'est un .tar.gz, vous devrez le convertir en .zip pour Chrome"
  echo "    Commande: tar -xzf $ZIP_FILE && zip -r ${ZIP_FILE%.tar.gz}.zip * && rm -rf $ZIP_FILE"
else
  echo "✅ Package créé : $ZIP_FILE"
  echo "📦 Prêt à être uploadé sur Chrome Web Store"
  echo "   https://chrome.google.com/webstore/devconsole"
fi
