@echo off
title Hermes 3D - GitHub Hourly Sync Reminder
echo Starting GitHub Hourly Sync Reminder...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0git-hourly-sync.ps1" -Loop
pause
