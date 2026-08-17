# ==============================================================================
# TEST ECO SPONSORS & LOGOS
# ==============================================================================

Write-Host "🌿 Probando creación de Sponsor con Logo..." -ForegroundColor Cyan

$sponsBody = '{"tier":"gold","name":"Compost & EcoPack","tierName":"Packaging Biodegradable","logoUrl":"https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=200","icon":"🌱"}'
$res = Invoke-RestMethod -Uri "http://localhost:8080/api/sponsors" -Method POST -Body $sponsBody -ContentType "application/json"

if ($res.created.logoUrl -eq "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=200") {
    Write-Host "✅ TEST SPONSOR LOGO PASADO: El logo se guardó correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ TEST SPONSOR LOGO FALLIDO" -ForegroundColor Red
}

$sync = Invoke-RestMethod -Uri "http://localhost:8080/api/sync" -Method GET
$found = $sync.sponsors.gold | Where-Object { $_.name -eq "Compost & EcoPack" }

if ($found -and $found.logoUrl) {
    Write-Host "✅ TEST SYNC LOGO PASADO: /api/sync entrega el logo ($($found.logoUrl))" -ForegroundColor Green
} else {
    Write-Host "❌ TEST SYNC LOGO FALLIDO" -ForegroundColor Red
}

# Cleanup
Invoke-RestMethod -Uri "http://localhost:8080/api/sponsors/gold/Compost%20%26%20EcoPack" -Method DELETE
Write-Host "✅ Limpieza de sponsor de prueba completada" -ForegroundColor Green
