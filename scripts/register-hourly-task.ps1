<#
.SYNOPSIS
    Registers the Hermes 3D GitHub Sync Reminder as a Windows Scheduled Task.
.DESCRIPTION
    Runs git-hourly-sync.ps1 automatically every 1 hour in the background.
#>

$taskName = "Hermes3D-GitHub-Hourly-Sync"
$scriptPath = (Resolve-Path "$PSScriptRoot\git-hourly-sync.ps1").Path
$command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""

Write-Host "Registering scheduled task '$taskName'..." -ForegroundColor Cyan

# Register with schtasks
schtasks /create /tn $taskName /tr $command /sc hourly /mo 1 /f

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully registered scheduled task '$taskName'!" -ForegroundColor Green
    Write-Host "It will check for unsaved changes every 1 hour and prompt you to push to GitHub." -ForegroundColor Green
} else {
    Write-Host "Failed to register scheduled task. Error code: $LASTEXITCODE" -ForegroundColor Red
}
