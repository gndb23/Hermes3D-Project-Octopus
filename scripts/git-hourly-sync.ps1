<#
.SYNOPSIS
    Hourly GitHub Sync Reminder for Hermes 3D - Project Octopus
.DESCRIPTION
    Checks every hour for uncommitted changes or unpushed commits in the repository.
    If changes are detected, displays a Windows popup asking if you want to push to GitHub.
    If you choose "Yes", it stages all changes, commits them with a timestamp, and pushes to origin main.
#>

param(
    [int]$IntervalSeconds = 3600,
    [switch]$Loop,
    [string]$RepoPath = "$PSScriptRoot\.."
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

function Show-Dialog {
    param(
        [string]$Message,
        [string]$Title = "Hermes 3D - GitHub Sync Reminder",
        [System.Windows.Forms.MessageBoxButtons]$Buttons = [System.Windows.Forms.MessageBoxButtons]::YesNo,
        [System.Windows.Forms.MessageBoxIcon]$Icon = [System.Windows.Forms.MessageBoxIcon]::Question
    )

    return [System.Windows.Forms.MessageBox]::Show(
        $Message,
        $Title,
        $Buttons,
        $Icon,
        [System.Windows.Forms.MessageBoxDefaultButton]::Button1,
        [System.Windows.Forms.MessageBoxOptions]::DefaultDesktopOnly
    )
}

function Show-Notification {
    param(
        [string]$Message,
        [string]$Title = "Hermes 3D Sync",
        [System.Windows.Forms.ToolTipIcon]$Icon = [System.Windows.Forms.ToolTipIcon]::Info
    )
    
    try {
        $notification = New-Object System.Windows.Forms.NotifyIcon
        $notification.Icon = [System.Drawing.SystemIcons]::Information
        $notification.BalloonTipTitle = $Title
        $notification.BalloonTipText = $Message
        $notification.BalloonTipIcon = $Icon
        $notification.Visible = $true
        $notification.ShowBalloonTip(4000)
        Start-Sleep -Seconds 4
        $notification.Dispose()
    } catch {
        # Fallback to silent or simple message box if notification icons fail
    }
}

function Invoke-GitSyncCheck {
    Push-Location $RepoPath
    try {
        $isGit = & git rev-parse --is-inside-work-tree 2>$null
        if ($LASTEXITCODE -ne 0 -or $isGit -ne "true") {
            Write-Host "Not a valid Git repository: $RepoPath"
            return
        }

        # Check for uncommitted changes (staged or unstaged)
        $statusLines = & git status --porcelain
        $hasUncommitted = ($null -ne $statusLines -and $statusLines.Count -gt 0)

        # Check for unpushed commits
        $unpushed = & git log origin/main..HEAD --oneline 2>$null
        $hasUnpushed = ($null -ne $unpushed -and $unpushed.Count -gt 0)

        if (-not $hasUncommitted -and -not $hasUnpushed) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] No unsaved changes or unpushed commits detected. Repository is clean."
            return
        }

        # Build prompt message
        $promptMsg = "Hermes 3D - Project Octopus:`n`n"
        if ($hasUncommitted) {
            $changeCount = if ($statusLines -is [array]) { $statusLines.Count } else { 1 }
            $promptMsg += "Detected $changeCount uncommitted change(s).`n"
        }
        if ($hasUnpushed) {
            $commitCount = if ($unpushed -is [array]) { $unpushed.Count } else { 1 }
            $promptMsg += "Detected $commitCount unpushed commit(s).`n"
        }
        $promptMsg += "`nWould you like to save and push your updates to GitHub now?"

        $decision = Show-Dialog -Message $promptMsg

        if ($decision -eq [System.Windows.Forms.DialogResult]::Yes) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] User confirmed sync. Starting commit and push..."

            if ($hasUncommitted) {
                & git add .
                $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
                & git commit -m "chore(sync): automated update $timestamp"
            }

            $pushOutput = & git push origin main 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Push to GitHub succeeded!"
                Show-Notification -Message "Your Hermes 3D updates were successfully pushed to GitHub!"
            } else {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Push failed: $pushOutput"
                [System.Windows.Forms.MessageBox]::Show(
                    "Failed to push to GitHub:`n$pushOutput",
                    "Hermes 3D Sync Error",
                    [System.Windows.Forms.MessageBoxButtons]::OK,
                    [System.Windows.Forms.MessageBoxIcon]::Error,
                    [System.Windows.Forms.MessageBoxDefaultButton]::Button1,
                    [System.Windows.Forms.MessageBoxOptions]::DefaultDesktopOnly
                ) | Out-Null
            }
        } else {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] User chose not to sync now. Postponing for next interval."
        }
    } finally {
        Pop-Location
    }
}

# Main execution
if ($Loop) {
    Write-Host "======================================================"
    Write-Host " Hermes 3D Hourly GitHub Sync Reminder (Loop Active)  "
    Write-Host " Interval: $IntervalSeconds seconds ($([math]::Round($IntervalSeconds / 60)) minutes)"
    Write-Host " Press Ctrl+C in this console to stop.               "
    Write-Host "======================================================"
    
    while ($true) {
        Invoke-GitSyncCheck
        Start-Sleep -Seconds $IntervalSeconds
    }
} else {
    Invoke-GitSyncCheck
}
