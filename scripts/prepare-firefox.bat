@echo off
REM Script pour restaurer le manifest V2 pour Firefox - Windows

REM Aller à la racine du projet (un niveau au-dessus de scripts/)
cd /d "%~dp0\.."

echo 🔄 Restauration pour Firefox (Manifest V2)...

REM Sauvegarder le manifest actuel si c'est V3 modifié
if exist "manifest.json" (
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

REM Restaurer V2 depuis le fichier source
if exist "manifest-v2.json" (
  copy manifest-v2.json manifest.json >nul
  echo ✅ Manifest V2 restauré pour Firefox
) else (
  echo ⚠️  Fichier manifest-v2.json introuvable.
  echo     Vous devrez créer manifest.json en V2 manuellement
)

echo.
echo 📦 Vous pouvez maintenant charger l'extension dans Firefox
echo    about:debugging → Ce Firefox → Charger un module complémentaire temporaire

pause
