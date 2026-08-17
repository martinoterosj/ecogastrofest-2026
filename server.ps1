# ==============================================================================
# GASTROFEST 2026 - BACKEND REST API SERVER (100% DYNAMIC & NO HARDCODING)
# ==============================================================================

$port = 8080
$dbPath = Join-Path $PSScriptRoot "data\db.json"

if (-not (Test-Path $dbPath)) {
    Write-Error "Database file not found at: $dbPath"
    exit 1
}

function Get-Database {
    $raw = [System.IO.File]::ReadAllText($dbPath, [System.Text.Encoding]::UTF8)
    return ConvertFrom-Json $raw
}

function Save-Database($data) {
    $json = ConvertTo-Json $data -Depth 10
    [System.IO.File]::WriteAllText($dbPath, $json, [System.Text.Encoding]::UTF8)
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "🍔 GastroFest API Server (Dynamic Engine) running on http://localhost:$port/"

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".csv"  = "text/csv; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".svg"  = "image/svg+xml"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # CORS Headers
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.OutputStream.Close()
            continue
        }

        $urlPath = $request.Url.LocalPath

        # ----------------------------------------------------------------------
        # REST API ROUTING
        # ----------------------------------------------------------------------
        if ($urlPath.StartsWith("/api/")) {
            $response.ContentType = "application/json; charset=utf-8"
            $method = $request.HttpMethod
            $body = ""

            if ($request.HasEntityBody) {
                $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
                $body = $reader.ReadToEnd()
                $reader.Close()
            }

            try {
                $db = Get-Database

                # 1. GET /api/sync (Returns 100% Dynamic State)
                if ($urlPath -eq "/api/sync" -and $method -eq "GET") {
                    $resObj = @{
                        event = $db.event
                        showCategories = $db.showCategories
                        standCategories = $db.standCategories
                        stages = $db.stages
                        zones = $db.zones
                        sponsors = $db.sponsors
                        announcements = $db.announcements
                        schedule = $db.schedule
                        stands = $db.stands
                        participantsCount = $db.participants.Count
                        timestamp = (Get-Date).ToString("HH:mm:ss")
                    }
                    $jsonOut = ConvertTo-Json $resObj -Depth 8
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                # 2. POST /api/auth/login
                elseif ($urlPath -eq "/api/auth/login" -and $method -eq "POST") {
                    $payload = ConvertFrom-Json $body
                    $pin = "$($payload.pin)"

                    $role = $null
                    if ($pin -eq "1234") { $role = "admin"; $name = "Organizador Principal" }
                    elseif ($pin -eq "2026") { $role = "stage_manager"; $name = "Coordinador de Escenarios" }
                    elseif ($pin -eq "7777") { $role = "stand_operator"; $name = "Operador de Stand" }

                    if ($role) {
                        $resObj = @{ success = $true; role = $role; name = $name; token = "tk_$pin" }
                    } else {
                        $response.StatusCode = 401
                        $resObj = @{ success = $false; message = "PIN incorrecto" }
                    }
                    $jsonOut = ConvertTo-Json $resObj
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                # 3. PUT /api/event (Update General Event Config)
                elseif ($urlPath -eq "/api/event" -and $method -eq "PUT") {
                    $payload = ConvertFrom-Json $body
                    if ($payload.name) { $db.event.name = $payload.name }
                    if ($payload.edition) { $db.event.edition = $payload.edition }
                    if ($payload.date) { $db.event.date = $payload.date }
                    if ($payload.hours) { $db.event.hours = $payload.hours }
                    if ($payload.venue) { $db.event.venue = $payload.venue }
                    if ($payload.address) { $db.event.address = $payload.address }
                    if ($payload.mapsUrl) { $db.event.mapsUrl = $payload.mapsUrl }
                    if ($payload.wazeUrl) { $db.event.wazeUrl = $payload.wazeUrl }
                    if ($payload.parkingInfo) { $db.event.parkingInfo = $payload.parkingInfo }
                    if ($payload.paymentInfo) { $db.event.paymentInfo = $payload.paymentInfo }
                    if ($payload.firstAidInfo) { $db.event.firstAidInfo = $payload.firstAidInfo }

                    Save-Database $db
                    $resObj = @{ success = $true; event = $db.event }
                    $jsonOut = ConvertTo-Json $resObj -Depth 5
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                # 4. CATEGORIES CRUD (POST & DELETE)
                elseif ($urlPath -eq "/api/categories" -and $method -eq "POST") {
                    $payload = ConvertFrom-Json $body
                    $type = $payload.type # "show" or "stand"
                    $newCat = @{
                        id = if ($payload.id) { $payload.id } else { $payload.name.ToLower().Replace(" ", "-") }
                        name = $payload.name
                        icon = if ($payload.icon) { $payload.icon } else { "✨" }
                    }

                    if ($type -eq "show") {
                        $db.showCategories += $newCat
                    } else {
                        $db.standCategories += $newCat
                    }
                    Save-Database $db

                    $resObj = @{ success = $true; created = $newCat; type = $type }
                    $jsonOut = ConvertTo-Json $resObj
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                elseif ($urlPath -match "^/api/categories/([^/]+)/([^/]+)$" -and $method -eq "DELETE") {
                    $type = $Matches[1]
                    $catId = $Matches[2]

                    if ($type -eq "show") {
                        $db.showCategories = @($db.showCategories | Where-Object { $_.id -ne $catId })
                    } else {
                        $db.standCategories = @($db.standCategories | Where-Object { $_.id -ne $catId })
                    }
                    Save-Database $db

                    $resObj = @{ success = $true; message = "Categoría eliminada" }
                    $jsonOut = ConvertTo-Json $resObj
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                # 5. STAGES CRUD (POST & DELETE)
                elseif ($urlPath -eq "/api/stages" -and $method -eq "POST") {
                    $payload = ConvertFrom-Json $body
                    $newStage = @{
                        id = if ($payload.id) { $payload.id } else { "stg-" + (Get-Random -Minimum 10 -Maximum 99) }
                        name = $payload.name
                        icon = if ($payload.icon) { $payload.icon } else { "🎤" }
                    }
                    $db.stages += $newStage
                    Save-Database $db

                    $resObj = @{ success = $true; created = $newStage }
                    $jsonOut = ConvertTo-Json $resObj
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                elseif ($urlPath.StartsWith("/api/stages/") -and $method -eq "DELETE") {
                    $stgId = $urlPath.Substring("/api/stages/".Length)
                    $db.stages = @($db.stages | Where-Object { $_.id -ne $stgId })
                    Save-Database $db

                    $resObj = @{ success = $true; message = "Escenario eliminado" }
                    $jsonOut = ConvertTo-Json $resObj
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                # 6. SPONSORS CRUD (POST & DELETE)
                elseif ($urlPath -eq "/api/sponsors" -and $method -eq "POST") {
                    $payload = ConvertFrom-Json $body
                    $tier = if ($payload.tier -eq "silver") { "silver" } else { "gold" }
                    $newSponsor = @{
                        name = $payload.name
                        tier = $payload.tierName
                        icon = if ($payload.icon) { $payload.icon } else { "🤝" }
                        logoUrl = if ($payload.logoUrl) { $payload.logoUrl } else { "" }
                    }

                    if ($tier -eq "gold") {
                        $db.sponsors.gold += $newSponsor
                    } else {
                        $db.sponsors.silver += $newSponsor
                    }
                    Save-Database $db

                    $resObj = @{ success = $true; created = $newSponsor; tier = $tier }
                    $jsonOut = ConvertTo-Json $resObj
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                elseif ($urlPath -match "^/api/sponsors/([^/]+)/([^/]+)$" -and $method -eq "DELETE") {
                    $tier = $Matches[1]
                    $nameDecoded = [System.Uri]::UnescapeDataString($Matches[2])

                    if ($tier -eq "gold") {
                        $db.sponsors.gold = @($db.sponsors.gold | Where-Object { $_.name -ne $nameDecoded })
                    } else {
                        $db.sponsors.silver = @($db.sponsors.silver | Where-Object { $_.name -ne $nameDecoded })
                    }
                    Save-Database $db

                    $resObj = @{ success = $true; message = "Sponsor eliminado" }
                    $jsonOut = ConvertTo-Json $resObj
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                # 7. SCHEDULE CRUD
                elseif ($urlPath -eq "/api/schedule" -and $method -eq "GET") {
                    $jsonOut = ConvertTo-Json $db.schedule -Depth 5
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                elseif ($urlPath -eq "/api/schedule" -and $method -eq "POST") {
                    $payload = ConvertFrom-Json $body
                    $newId = "ev-" + (Get-Random -Minimum 100 -Maximum 999)
                    
                    $newShow = @{
                        id = $newId
                        startTime = $payload.startTime
                        endTime = $payload.endTime
                        stageId = if ($payload.stageId) { $payload.stageId } else { "main" }
                        stageName = if ($payload.stageName) { $payload.stageName } else { "Escenario Principal" }
                        category = if ($payload.category) { $payload.category } else { "masterclass" }
                        title = $payload.title
                        speaker = $payload.speaker
                        speakerAvatar = if ($payload.speakerAvatar) { $payload.speakerAvatar } else { "👨‍🍳" }
                        description = $payload.description
                        badge = if ($payload.badge) { $payload.badge } else { "Show Especial" }
                        status = if ($payload.status) { $payload.status } else { "scheduled" }
                    }

                    $db.schedule += $newShow
                    Save-Database $db

                    $resObj = @{ success = $true; created = $newShow }
                    $jsonOut = ConvertTo-Json $resObj -Depth 5
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                elseif ($urlPath.StartsWith("/api/schedule/") -and $method -eq "PUT") {
                    $evId = $urlPath.Substring("/api/schedule/".Length)
                    $payload = ConvertFrom-Json $body

                    $item = $db.schedule | Where-Object { $_.id -eq $evId }
                    if ($item) {
                        if ($payload.title) { $item.title = $payload.title }
                        if ($payload.speaker) { $item.speaker = $payload.speaker }
                        if ($payload.speakerAvatar) { $item.speakerAvatar = $payload.speakerAvatar }
                        if ($payload.startTime) { $item.startTime = $payload.startTime }
                        if ($payload.endTime) { $item.endTime = $payload.endTime }
                        if ($payload.stageName) { $item.stageName = $payload.stageName }
                        if ($payload.stageId) { $item.stageId = $payload.stageId }
                        if ($payload.category) { $item.category = $payload.category }
                        if ($payload.badge) { $item.badge = $payload.badge }
                        if ($payload.description) { $item.description = $payload.description }
                        if ($payload.status) { $item.status = $payload.status }
                        
                        Save-Database $db
                        $resObj = @{ success = $true; updated = $item }
                    } else {
                        $response.StatusCode = 404
                        $resObj = @{ success = $false; message = "Show no encontrado" }
                    }
                    $jsonOut = ConvertTo-Json $resObj -Depth 5
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                elseif ($urlPath.StartsWith("/api/schedule/") -and $method -eq "DELETE") {
                    $evId = $urlPath.Substring("/api/schedule/".Length)
                    $db.schedule = @($db.schedule | Where-Object { $_.id -ne $evId })
                    Save-Database $db

                    $resObj = @{ success = $true; message = "Show eliminado correctamente" }
                    $jsonOut = ConvertTo-Json $resObj
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                # 8. STANDS & MENUS CRUD
                elseif ($urlPath -eq "/api/stands" -and $method -eq "GET") {
                    $jsonOut = ConvertTo-Json $db.stands -Depth 5
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                elseif ($urlPath -eq "/api/stands" -and $method -eq "POST") {
                    $payload = ConvertFrom-Json $body
                    $newId = "st-" + (Get-Random -Minimum 10 -Maximum 99)
                    
                    $newStand = @{
                        id = $newId
                        number = $payload.number
                        name = $payload.name
                        category = if ($payload.category) { $payload.category } else { "carnes" }
                        categoryName = if ($payload.categoryName) { $payload.categoryName } else { "Gastronomía General" }
                        zone = if ($payload.zone) { $payload.zone } else { "Sector Central" }
                        priceRange = if ($payload.priceRange) { $payload.priceRange } else { "$$" }
                        rating = "5.0 ⭐"
                        image = if ($payload.image) { $payload.image } else { "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600" }
                        fallbackEmoji = if ($payload.fallbackEmoji) { $payload.fallbackEmoji } else { "🍽️" }
                        featuredDish = $payload.featuredDish
                        tags = if ($payload.tags) { $payload.tags } else { @("Especialidad Gourmet") }
                        isGlutenFree = [bool]$payload.isGlutenFree
                        isVegan = [bool]$payload.isVegan
                        menu = @()
                    }

                    $db.stands += $newStand
                    Save-Database $db

                    $resObj = @{ success = $true; created = $newStand }
                    $jsonOut = ConvertTo-Json $resObj -Depth 5
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                elseif ($urlPath.StartsWith("/api/stands/") -and -not $urlPath.Contains("/menu") -and $method -eq "PUT") {
                    $stId = $urlPath.Substring("/api/stands/".Length)
                    $payload = ConvertFrom-Json $body

                    $stand = $db.stands | Where-Object { $_.id -eq $stId }
                    if ($stand) {
                        if ($payload.name) { $stand.name = $payload.name }
                        if ($payload.number) { $stand.number = $payload.number }
                        if ($payload.category) { $stand.category = $payload.category }
                        if ($payload.categoryName) { $stand.categoryName = $payload.categoryName }
                        if ($payload.zone) { $stand.zone = $payload.zone }
                        if ($payload.featuredDish) { $stand.featuredDish = $payload.featuredDish }
                        if ($payload.fallbackEmoji) { $stand.fallbackEmoji = $payload.fallbackEmoji }
                        if ($payload.PSObject.Properties['isGlutenFree'] -ne $null) { $stand.isGlutenFree = [bool]$payload.isGlutenFree }
                        if ($payload.PSObject.Properties['isVegan'] -ne $null) { $stand.isVegan = [bool]$payload.isVegan }
                        
                        Save-Database $db
                        $resObj = @{ success = $true; updated = $stand }
                    } else {
                        $response.StatusCode = 404
                        $resObj = @{ success = $false; message = "Stand no encontrado" }
                    }
                    $jsonOut = ConvertTo-Json $resObj -Depth 5
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                elseif ($urlPath.StartsWith("/api/stands/") -and -not $urlPath.Contains("/menu") -and $method -eq "DELETE") {
                    $stId = $urlPath.Substring("/api/stands/".Length)
                    $db.stands = @($db.stands | Where-Object { $_.id -ne $stId })
                    Save-Database $db

                    $resObj = @{ success = $true; message = "Stand eliminado correctamente" }
                    $jsonOut = ConvertTo-Json $resObj
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                elseif ($urlPath -match "^/api/stands/([^/]+)/menu$" -and $method -eq "POST") {
                    $stId = $Matches[1]
                    $payload = ConvertFrom-Json $body

                    $stand = $db.stands | Where-Object { $_.id -eq $stId }
                    if ($stand) {
                        $newMenuId = "m-" + (Get-Random -Minimum 100 -Maximum 999)
                        $newDish = @{
                            id = $newMenuId
                            item = $payload.item
                            desc = $payload.desc
                            price = $payload.price
                            isSoldOut = [bool]$payload.isSoldOut
                        }
                        $stand.menu += $newDish
                        Save-Database $db
                        $resObj = @{ success = $true; stand = $stand; created = $newDish }
                    } else {
                        $response.StatusCode = 404
                        $resObj = @{ success = $false; message = "Stand no encontrado" }
                    }
                    $jsonOut = ConvertTo-Json $resObj -Depth 5
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                elseif ($urlPath -match "^/api/stands/([^/]+)/menu$" -and $method -eq "PUT") {
                    $stId = $Matches[1]
                    $payload = ConvertFrom-Json $body

                    $stand = $db.stands | Where-Object { $_.id -eq $stId }
                    if ($stand) {
                        $menuItem = $stand.menu | Where-Object { $_.id -eq $payload.menuId -or $_.item -eq $payload.item }
                        if ($menuItem) {
                            if ($payload.item) { $menuItem.item = $payload.item }
                            if ($payload.desc) { $menuItem.desc = $payload.desc }
                            if ($payload.price) { $menuItem.price = $payload.price }
                            if ($payload.PSObject.Properties['isSoldOut'] -ne $null) { $menuItem.isSoldOut = [bool]$payload.isSoldOut }
                            
                            Save-Database $db
                            $resObj = @{ success = $true; stand = $stand; updated = $menuItem }
                        } else {
                            $response.StatusCode = 404
                            $resObj = @{ success = $false; message = "Plato no encontrado" }
                        }
                    } else {
                        $response.StatusCode = 404
                        $resObj = @{ success = $false; message = "Stand no encontrado" }
                    }
                    $jsonOut = ConvertTo-Json $resObj -Depth 5
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                elseif ($urlPath -match "^/api/stands/([^/]+)/menu/([^/]+)$" -and $method -eq "DELETE") {
                    $stId = $Matches[1]
                    $menuId = $Matches[2]

                    $stand = $db.stands | Where-Object { $_.id -eq $stId }
                    if ($stand) {
                        $stand.menu = @($stand.menu | Where-Object { $_.id -ne $menuId -and $_.item -ne $menuId })
                        Save-Database $db
                        $resObj = @{ success = $true; message = "Plato eliminado"; stand = $stand }
                    } else {
                        $response.StatusCode = 404
                        $resObj = @{ success = $false; message = "Stand no encontrado" }
                    }
                    $jsonOut = ConvertTo-Json $resObj -Depth 5
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                # 9. ANNOUNCEMENTS CRUD
                elseif ($urlPath -eq "/api/announcements" -and $method -eq "POST") {
                    $payload = ConvertFrom-Json $body
                    $newAnn = @{
                        id = "ann-" + (Get-Random -Minimum 1000 -Maximum 9999)
                        type = if ($payload.type) { $payload.type } else { "alert" }
                        icon = if ($payload.icon) { $payload.icon } else { "📢" }
                        title = $payload.title
                        message = $payload.message
                        createdAt = (Get-Date).ToString("HH:mm")
                        active = $true
                    }
                    $db.announcements += $newAnn
                    Save-Database $db

                    $resObj = @{ success = $true; announcement = $newAnn }
                    $jsonOut = ConvertTo-Json $resObj
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                elseif ($urlPath.StartsWith("/api/announcements/") -and $method -eq "DELETE") {
                    $annId = $urlPath.Substring("/api/announcements/".Length)
                    $db.announcements = @($db.announcements | Where-Object { $_.id -ne $annId })
                    Save-Database $db

                    $resObj = @{ success = $true; message = "Aviso eliminado" }
                    $jsonOut = ConvertTo-Json $resObj
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                # 10. RAFFLE & CSV
                elseif ($urlPath -eq "/api/raffle/register" -and $method -eq "POST") {
                    $payload = ConvertFrom-Json $body
                    $randomNum = Get-Random -Minimum 1000 -Maximum 9999
                    $code = "GF-$randomNum"

                    $entry = @{
                        code = $code
                        name = $payload.name
                        phone = $payload.phone
                        stand = if ($payload.stand) { $payload.stand } else { "GastroFest 2026" }
                        issuedAt = (Get-Date).ToString("HH:mm")
                    }

                    $db.participants += $entry
                    Save-Database $db

                    $resObj = @{ success = $true; ticket = $entry }
                    $jsonOut = ConvertTo-Json $resObj
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                elseif ($urlPath.StartsWith("/api/raffle/participants/") -and $method -eq "DELETE") {
                    $code = $urlPath.Substring("/api/raffle/participants/".Length)
                    $db.participants = @($db.participants | Where-Object { $_.code -ne $code })
                    Save-Database $db

                    $resObj = @{ success = $true; message = "Participante eliminado" }
                    $jsonOut = ConvertTo-Json $resObj
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                elseif ($urlPath -eq "/api/raffle/participants" -and $method -eq "GET") {
                    $jsonOut = ConvertTo-Json $db.participants -Depth 5
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                elseif ($urlPath -eq "/api/raffle/export" -and $method -eq "GET") {
                    $response.ContentType = "text/csv; charset=utf-8"
                    $response.AddHeader("Content-Disposition", "attachment; filename=gastrofest_participantes.csv")

                    $csvLines = @("Codigo,Nombre,Telefono,Stand_Favorito,Hora_Registro")
                    foreach ($p in $db.participants) {
                        $csvLines += "$($p.code),`"$($p.name)`",`"$($p.phone)`",`"$($p.stand)`",$($p.issuedAt)"
                    }
                    $csvText = [string]::Join("`r`n", $csvLines)
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($csvText)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                else {
                    $response.StatusCode = 404
                    $resObj = @{ error = "Endpoint no encontrado: $urlPath" }
                    $jsonOut = ConvertTo-Json $resObj
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }

            } catch {
                $response.StatusCode = 500
                $errObj = @{ error = $_.Exception.Message }
                $errJson = ConvertTo-Json $errObj
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($errJson)
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }

            $response.OutputStream.Close()
            continue
        }

        # ----------------------------------------------------------------------
        # STATIC FILES ROUTING
        # ----------------------------------------------------------------------
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }

        $localPath = Join-Path $PSScriptRoot ($urlPath.TrimStart('/').Replace('/', '\'))

        if (Test-Path $localPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $mime = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { "application/octet-stream" }
            $response.ContentType = $mime
            
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
}
