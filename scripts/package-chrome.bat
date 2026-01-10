@echo off
REM Script pour créer le package Chrome (Manifest V3) prêt à publier - Windows

REM Aller à la racine du projet (un niveau au-dessus de scripts/)
cd /d "%~dp0\.."

echo 📦 Création du package Chrome (Manifest V3)...

set PACKAGE_NAME=x-instagram-link-converter-chrome
set TEMP_DIR=.chrome-package
set ZIP_FILE=packages\%PACKAGE_NAME%.zip

REM Nettoyer les anciens packages
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
if exist "%ZIP_FILE%" del "%ZIP_FILE%"

REM Créer le répertoire temporaire
mkdir "%TEMP_DIR%"

REM Copier tous les fichiers nécessaires
echo 📋 Copie des fichiers...

copy manifest-v3.json "%TEMP_DIR%\manifest.json" >nul
copy background-v3.js "%TEMP_DIR%\" >nul
copy config.js "%TEMP_DIR%\" >nul
copy utils.js "%TEMP_DIR%\" >nul
copy storage.js "%TEMP_DIR%\" >nul
copy content-x.js "%TEMP_DIR%\" >nul
copy content-instagram.js "%TEMP_DIR%\" >nul
copy popup.html "%TEMP_DIR%\" >nul
copy popup.js "%TEMP_DIR%\" >nul

REM Dossier icons
if exist "icons" (
  xcopy /E /I /Y icons "%TEMP_DIR%\icons" >nul
)

REM Créer le dossier packages s'il n'existe pas
if not exist "packages" mkdir packages

REM Créer le ZIP (nécessite PowerShell ou 7-Zip)
echo 🗜️  Création de l'archive...
powershell -Command "Compress-Archive -Path '%TEMP_DIR%\*' -DestinationPath '%ZIP_FILE%' -Force" 2>nul
if %errorlevel% neq 0 (
  echo ⚠️  PowerShell non disponible. Utilisez 7-Zip ou WinRAR pour créer le ZIP manuellement.
  echo     Archivez le contenu de %TEMP_DIR% dans %ZIP_FILE%
  pause
  exit /b
)

REM Nettoyer
rmdir /s /q "%TEMP_DIR%"

echo.
echo ✅ Package créé : %ZIP_FILE%
echo 📦 Prêt à être uploadé sur Chrome Web Store
echo    https://chrome.google.com/webstore/devconsole

pause
