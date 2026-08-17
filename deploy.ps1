# ===================================================
# ECOGASTROFEST 2026 - FIREBASE HOSTING DEPLOY
# ===================================================

Write-Host "`n🚀 Desplegando EcoGastroFest 2026 a Firebase Hosting..." -ForegroundColor Cyan

# 1. Login
Write-Host "1. Verificando autenticación con Google..." -ForegroundColor Yellow
.\firebase.exe login

# 2. Deploy
Write-Host "`n2. Subiendo archivos a la CDN global de Firebase..." -ForegroundColor Yellow
.\firebase.exe deploy --only hosting

Write-Host "`n🎉 ¡DESPLIEGUE FINALIZADO CON ÉXITO!" -ForegroundColor Green
Write-Host "👉 App Visitantes: https://ecogastrofest-2026.web.app" -ForegroundColor Cyan
Write-Host "👉 Panel Operadores: https://ecogastrofest-2026.web.app/admin.html" -ForegroundColor Cyan
