$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Join-Path $PSScriptRoot 'Frontend')

# Estas variables solo afectan este proceso y al servidor que inicia.
# Next respeta las variables ya definidas por encima de sus archivos .env.
$env:NEXT_PUBLIC_API_URL = 'http://127.0.0.1:8081'
$env:SILABUS_DEV_LOCAL = 'true'
$env:NEXT_TELEMETRY_DISABLED = '1'
Write-Host 'Frontend local: http://localhost:3001 - Backend: http://127.0.0.1:8081'
& npm.cmd run dev -- --hostname=127.0.0.1 --port=3001
exit $LASTEXITCODE
