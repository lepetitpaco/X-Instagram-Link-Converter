@echo off
REM Script pour préparer l'extension pour Chrome (Manifest V3) - Windows

REM Aller à la racine du projet (un niveau au-dessus de scripts/)
cd /d "%~dp0\.."

echo 🔄 Préparation pour Chrome (Manifest V3)...

REM Sauvegarder le manifest actuel (V2 ou V3 modifié)
if exist "manifest.json" (
  findstr /C:"\"manifest_version\": 2" manifest.json >nul 2>&1
  if %errorlevel% equ 0 (
    REM Sauvegarder V2 seulement s'il est différent de manifest-v2.json
    if exist "manifest-v2.json" (
      fc manifest.json manifest-v2.json >nul 2>&1
      if %errorlevel% neq 0 (
        copy manifest.json manifest-v2.json.backup >nul
        echo ✅ Manifest V2 modifié sauvegardé
      )
    ) else (
      copy manifest.json manifest-v2.json.backup >nul
      echo ✅ Manifest V2 sauvegardé
    )
  ) else (
    findstr /C:"\"manifest_version\": 3" manifest.json >nul 2>&1
    if %errorlevel% equ 0 (
      REM Sauvegarder V3 seulement s'il est différent de manifest-v3.json
      if exist "manifest-v3.json" (
        fc manifest.json manifest-v3.json >nul 2>&1
        if %errorlevel% neq 0 (
          copy manifest.json manifest-v3.json.backup >nul
          echo ✅ Manifest V3 modifié sauvegardé
        )
      ) else (
        copy manifest.json manifest-v3.json.backup >nul
        echo ✅ Manifest V3 sauvegardé
      )
    )
  )
)

REM Copier manifest-v3.json vers manifest.json
copy manifest-v3.json manifest.json >nul
echo ✅ Manifest V3 activé pour Chrome

echo.
echo 📦 Vous pouvez maintenant charger l'extension dans Chrome
echo    chrome://extensions/ → Charger l'extension non empaquetée

pause
