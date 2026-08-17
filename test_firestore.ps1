$apiKey = "AIzaSyCd3oq7AWSpwrM5KkDkvvKlXfXLDSUv_ro"
$projectId = "ecogastrofest-2026"
$url = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/festivals/ecogastrofest_2026?key=$apiKey"

try {
    $res = Invoke-RestMethod -Uri $url -Method GET
    Write-Host "Documento existe en Firestore:" -ForegroundColor Green
    $res | ConvertTo-Json -Depth 2 | Write-Host
} catch {
    Write-Host "Estado / Respuesta:" -ForegroundColor Yellow
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $msg = $reader.ReadToEnd()
        Write-Host $msg
    } else {
        Write-Host $_.Exception.Message
    }
}
