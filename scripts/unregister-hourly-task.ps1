<#
.SYNOPSIS
    Unregisters the Hermes 3D GitHub Sync Reminder Windows Scheduled Task.
#>

$taskName = "Hermes3D-GitHub-Hourly-Sync"
Write-Host "Unregistering scheduled task '$taskName'..." -ForegroundColor Cyan

schtasks /delete /tn $taskName /f

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully removed scheduled task '$taskName'." -ForegroundColor Green
} else {
    Write-Host "Could not remove task (it may not exist)." -ForegroundColor Yellow
}
