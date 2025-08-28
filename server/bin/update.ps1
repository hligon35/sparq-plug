# Rebuild and restart the stack with build metadata (Windows PowerShell)
$ErrorActionPreference = 'Stop'
Push-Location (Split-Path $MyInvocation.MyCommand.Path)
Set-Location ..

# Compute metadata
$COMMIT = git rev-parse --short HEAD
$BUILD_TIME = (Get-Date).ToUniversalTime().ToString('s') + 'Z'

Write-Host "Building with COMMIT=$COMMIT BUILD_TIME=$BUILD_TIME"

# Export for compose build args
$env:COMMIT = $COMMIT
$env:BUILD_TIME = $BUILD_TIME

# Rebuild images and restart
Write-Host "docker compose build --no-cache"
docker compose build --no-cache

Write-Host "docker compose up -d"
docker compose up -d

Pop-Location
