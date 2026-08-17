try {
    $r = Invoke-WebRequest -Uri "https://martinoterosj.github.io/ecogastrofest-2026/" -UseBasicParsing
    Write-Host "✅ GITHUB PAGES ACTIVO Y EN VIVO!" -ForegroundColor Green
    Write-Host "Status: $($r.StatusCode)" -ForegroundColor Green
    if ($r.Content -match "<title>(.*?)</title>") {
        Write-Host "Título de la web: $($Matches[1])" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⏳ GitHub Pages procesando el primer despliegue (demora ~30 segundos)..." -ForegroundColor Yellow
}
