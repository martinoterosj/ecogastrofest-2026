# Check Local Server
try {
    $loc = Invoke-WebRequest -Uri "http://localhost:8080/index.html" -UseBasicParsing
    Write-Host "✅ Servidor Local (http://localhost:8080/): ACTIVO (Status $($loc.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor Local: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

# Check Firebase Hosting Production URL
try {
    $prod = Invoke-WebRequest -Uri "https://ecogastrofest-2026.web.app/" -UseBasicParsing
    Write-Host "✅ Producción Firebase (https://ecogastrofest-2026.web.app/): ACTIVO (Status $($prod.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Producción Firebase: Aún no se han subido los archivos (Error 404 - Site Not Found)" -ForegroundColor Yellow
}
