$body1 = '{"title":"Show de Magia Gastronomica","speaker":"Mago Gourmet","startTime":"16:00","endTime":"17:00","stageName":"Espacio Mini Chefs"}'
$r1 = Invoke-RestMethod -Uri "http://localhost:8080/api/schedule" -Method POST -Body $body1 -ContentType "application/json"
Write-Host "1. ALTA SHOW CREADO:" $r1.created.id $r1.created.title

$showId = $r1.created.id
$body2 = '{"title":"Show de Magia y Chocolate MODIFICADO"}'
$r2 = Invoke-RestMethod -Uri "http://localhost:8080/api/schedule/$showId" -Method PUT -Body $body2 -ContentType "application/json"
Write-Host "2. MODIFICACION SHOW:" $r2.updated.title

$r3 = Invoke-RestMethod -Uri "http://localhost:8080/api/schedule/$showId" -Method DELETE
Write-Host "3. BAJA SHOW:" $r3.message

# Test Stand Dish CRUD
$bodyDish = '{"item":"Super Hamburguesa Volcanica","desc":"Queso fundido y bacon crocante","price":"$6.900","isSoldOut":false}'
$r4 = Invoke-RestMethod -Uri "http://localhost:8080/api/stands/st-1/menu" -Method POST -Body $bodyDish -ContentType "application/json"
Write-Host "4. ALTA PLATO EN STAND st-1:" $r4.created.id $r4.created.item

$dishId = $r4.created.id
$r5 = Invoke-RestMethod -Uri "http://localhost:8080/api/stands/st-1/menu/$dishId" -Method DELETE
Write-Host "5. BAJA PLATO EN STAND st-1:" $r5.message
