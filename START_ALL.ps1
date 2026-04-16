#!/usr/bin/env powershell
# EduKids - Start All Services
# This script launches Backend, Frontend, and AI Tutor API in separate terminals

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EduKids Project - Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting services on:" -ForegroundColor Yellow
Write-Host "  - Frontend:     http://localhost:3000" -ForegroundColor Green
Write-Host "  - Backend API:  http://localhost:5000" -ForegroundColor Green
Write-Host "  - AI Tutor API: http://localhost:5001" -ForegroundColor Green
Write-Host ""

# Define root path
$root = "C:\Users\LENOVO\EduKids"

# Terminal 1 - Backend Server (Port 5000)
Write-Host "[1/3] Starting Backend API (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; Write-Host 'Starting Backend...' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# Terminal 2 - Frontend Server (Port 3000)
Write-Host "[2/3] Starting Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; Write-Host 'Starting Frontend...' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# Terminal 3 - AI Tutor API (Port 5001)
Write-Host "[3/3] Starting AI Tutor API (Port 5001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\aiTutorial-api'; Write-Host 'Starting AI Tutor API...' -ForegroundColor Green; python main.py" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[OK] All services launched!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait 10-15 seconds for all services to be ready, then:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Open browser: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test AI endpoints: " -NoNewline -ForegroundColor White
Write-Host ".\test_endpoints.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor DarkGray
Read-Host
