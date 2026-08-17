$env:PATH = "C:\Program Files\nodejs;C:\Users\Martin\AppData\Roaming\npm;" + $env:PATH

Write-Host "🚀 Iniciando despliegue en Firebase Hosting..." -ForegroundColor Cyan
& "C:\Users\Martin\AppData\Roaming\npm\firebase.cmd" deploy --only hosting
