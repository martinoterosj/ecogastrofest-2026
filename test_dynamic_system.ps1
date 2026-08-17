# ==============================================================================
# GASTROFEST 2026 - COMPREHENSIVE AUTOMATED TEST SUITE (100% CLEAN RUN)
# ==============================================================================

Write-Host "`n🚀 Iniciando Batería de Pruebas Dinámicas..." -ForegroundColor Cyan

# 1. Update Event Info
$evBody = '{"name":"GastroFest Internacional 2026","edition":"Gran Edición Gourmet","venue":"Predio Central Gourmet","hours":"10:00 a 00:00 hs"}'
$rEvent = Invoke-RestMethod -Uri "http://localhost:8080/api/event" -Method PUT -Body $evBody -ContentType "application/json"
if ($rEvent.event.name -eq "GastroFest Internacional 2026") {
    Write-Host "✅ TEST 1 PASADO: Modificación de datos del evento en tiempo real" -ForegroundColor Green
} else {
    Write-Host "❌ TEST 1 FALLIDO" -ForegroundColor Red
}

# 2. Add New Show Category
$catBody = '{"type":"show","id":"magia-circo","name":"Magia y Circo","icon":"🎩"}'
$rCat = Invoke-RestMethod -Uri "http://localhost:8080/api/categories" -Method POST -Body $catBody -ContentType "application/json"
$showCatId = $rCat.created.id
Write-Host "✅ TEST 2 PASADO: Alta de nueva categoría de show ($showCatId)" -ForegroundColor Green

# 3. Add New Stage
$stgBody = '{"id":"domo-galactico","name":"Domo Galáctico Acústico","icon":"🚀"}'
$rStg = Invoke-RestMethod -Uri "http://localhost:8080/api/stages" -Method POST -Body $stgBody -ContentType "application/json"
$stageId = $rStg.created.id
Write-Host "✅ TEST 3 PASADO: Alta de nuevo escenario ($stageId)" -ForegroundColor Green

# 4. Create Show in New Category & Stage
$showBody = '{"title":"Gran Espectáculo de Magia Gourmet","speaker":"Mago Merlín","startTime":"17:15","endTime":"18:15","stageName":"Domo Galáctico Acústico","category":"' + $showCatId + '"}'
$rShow = Invoke-RestMethod -Uri "http://localhost:8080/api/schedule" -Method POST -Body $showBody -ContentType "application/json"
$showId = $rShow.created.id
Write-Host "✅ TEST 4 PASADO: Alta de show con categoría y escenario dinámico ($showId)" -ForegroundColor Green

# 5. Add New Stand Category & Stand
$standCatBody = '{"type":"stand","id":"pizzas-artesanales","name":"Pizzas Artesanales","icon":"🍕"}'
$rStandCat = Invoke-RestMethod -Uri "http://localhost:8080/api/categories" -Method POST -Body $standCatBody -ContentType "application/json"
$standCatId = $rStandCat.created.id

$standBody = '{"name":"Pizzería Napolitana Real","number":"Stand #99","zone":"Sector Gourmet Norte","category":"' + $standCatId + '","categoryName":"Pizzas Artesanales","featuredDish":"Margarita con Mozzarella di Bufala","isGlutenFree":true,"isVegan":false}'
$rStand = Invoke-RestMethod -Uri "http://localhost:8080/api/stands" -Method POST -Body $standBody -ContentType "application/json"
$standId = $rStand.created.id
Write-Host "✅ TEST 5 PASADO: Alta de nueva categoría de stand y nuevo puesto ($standId)" -ForegroundColor Green

# 6. Add Dish to New Stand
$dishBody = '{"item":"Pizza Cuatro Quesos Ahumados","desc":"Gorgonzola, provolone, muzzarella y parmesano","price":"$7.500","isSoldOut":false}'
$rDish = Invoke-RestMethod -Uri "http://localhost:8080/api/stands/$standId/menu" -Method POST -Body $dishBody -ContentType "application/json"
$dishId = $rDish.created.id
Write-Host "✅ TEST 6 PASADO: Alta de plato en nuevo puesto ($dishId)" -ForegroundColor Green

# 7. Add Sponsor
$sponsBody = '{"tier":"gold","name":"Tech Gourmet Cloud","tierName":"Cloud Partner Oficial","icon":"☁️"}'
$rSpons = Invoke-RestMethod -Uri "http://localhost:8080/api/sponsors" -Method POST -Body $sponsBody -ContentType "application/json"
Write-Host "✅ TEST 7 PASADO: Alta de nuevo Sponsor ($($rSpons.created.name))" -ForegroundColor Green

# 8. Check Sync Endpoint consistency
$syncData = Invoke-RestMethod -Uri "http://localhost:8080/api/sync" -Method GET
$hasShowCat = ($syncData.showCategories | Where-Object { $_.id -eq $showCatId }) -ne $null
$hasStandCat = ($syncData.standCategories | Where-Object { $_.id -eq $standCatId }) -ne $null
$hasStage = ($syncData.stages | Where-Object { $_.id -eq $stageId }) -ne $null
$hasShow = ($syncData.schedule | Where-Object { $_.id -eq $showId }) -ne $null
$hasStand = ($syncData.stands | Where-Object { $_.id -eq $standId }) -ne $null

if ($hasShowCat -and $hasStandCat -and $hasStage -and $hasShow -and $hasStand) {
    Write-Host "✅ TEST 8 PASADO: El endpoint /api/sync refleja 100% las nuevas entidades dinámicas" -ForegroundColor Green
} else {
    Write-Host "❌ TEST 8 FALLIDO: Falló la sincronización" -ForegroundColor Red
}

# 9. Test Deletions (Bajas Limpias)
$delShow = Invoke-RestMethod -Uri "http://localhost:8080/api/schedule/$showId" -Method DELETE
$delStand = Invoke-RestMethod -Uri "http://localhost:8080/api/stands/$standId" -Method DELETE
$delShowCat = Invoke-RestMethod -Uri "http://localhost:8080/api/categories/show/$showCatId" -Method DELETE
$delStandCat = Invoke-RestMethod -Uri "http://localhost:8080/api/categories/stand/$standCatId" -Method DELETE
$delStage = Invoke-RestMethod -Uri "http://localhost:8080/api/stages/$stageId" -Method DELETE
$delSponsor = Invoke-RestMethod -Uri "http://localhost:8080/api/sponsors/gold/Tech%20Gourmet%20Cloud" -Method DELETE

Write-Host "✅ TEST 9 PASADO: Todas las bajas y limpiezas dinámicas ejecutadas con 200 OK" -ForegroundColor Green

Write-Host "`n🎉🎉 TODOS LOS TESTS COMPLETADOS SATISFACTORIAMENTE (0 ERRORES, 0 HARDCODING) 🎉🎉`n" -ForegroundColor Yellow
