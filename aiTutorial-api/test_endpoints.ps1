#!/usr/bin/env powershell
# AI Tutor API - Interactive Test Script
# Usage: .\test_endpoints.ps1

$api = "http://localhost:5001"

function Show-Menu {
    Clear-Host
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "  AI Tutor API - Interactive Test Tool" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Available Tests:" -ForegroundColor Yellow
    Write-Host '1. Health Check (/health)' -ForegroundColor Green
    Write-Host '2. Audio Generation (/api/audio)' -ForegroundColor Green
    Write-Host '3. Explanation Generation (/api/explain)' -ForegroundColor Red
    Write-Host '4. Quiz Generation (/api/quiz)' -ForegroundColor Red
    Write-Host '5. Video Generation (/api/video)' -ForegroundColor Yellow
    Write-Host '6. Upload and Process PDF (/api/upload-pdf)' -ForegroundColor Green
    Write-Host "7. List Generated Files" -ForegroundColor Cyan
    Write-Host "8. Exit" -ForegroundColor White
    Write-Host ""
    Write-Host "Legend: [READY] | [PARTIAL] | [NEEDS SETUP]" -ForegroundColor DarkGray
    Write-Host ""
}

function Test-Health {
    Write-Host "[*] Testing Health Endpoint..." -ForegroundColor Cyan
    try {
        $r = Invoke-WebRequest -Uri "$api/health" -Method GET -UseBasicParsing
        Write-Host "[OK] Status: $($r.StatusCode)" -ForegroundColor Green
        $r.Content | ConvertFrom-Json | Format-Table -AutoSize
        Write-Host ""
        Read-Host "Press Enter to continue"
    }
    catch {
        Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
        Read-Host "Press Enter to continue"
    }
}

function Test-Audio {
    Write-Host "[*] Testing Audio Generation..." -ForegroundColor Cyan
    Write-Host "Sample text: 'Hello! Today we will learn about photosynthesis.'" -ForegroundColor DarkGray
    
    try {
        $body = @{
            text = "Hello! Today we will learn about photosynthesis. Plants use sunlight to make energy."
            language = "en"
            speed = 1.0
        } | ConvertTo-Json
        
        $r = Invoke-WebRequest -Uri "$api/api/audio" `
            -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body $body `
            -UseBasicParsing
        
        Write-Host "[OK] Status: $($r.StatusCode)" -ForegroundColor Green
        $json = $r.Content | ConvertFrom-Json
        Write-Host "Audio URL: $($json.audioUrl)" -ForegroundColor Yellow
        Write-Host "Duration: $($json.duration) seconds" -ForegroundColor Yellow
        Write-Host "Format: $($json.format)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Access at: http://localhost:5001$($json.audioUrl)" -ForegroundColor Cyan
        Write-Host ""
        Read-Host "Press Enter to continue"
    }
    catch {
        Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
        Read-Host "Press Enter to continue"
    }
}

function Test-Explanation {
    Write-Host "[!] Testing Explanation Generation..." -ForegroundColor Yellow
    Write-Host "[!] Requires OpenRouter API Key in .env" -ForegroundColor Red
    Write-Host ""
    
    try {
        $body = @{
            courseId = "bio-101"
            courseTitle = "Photosynthesis"
            content = "Photosynthesis is the process where plants convert sunlight into chemical energy. The light reactions occur in thylakoid membranes producing ATP and NADPH. The Calvin cycle occurs in the stroma producing glucose from carbon dioxide."
            learnerProfile = @{
                age = 10
                level = "beginner"
                language = "en"
                condition = $null
            }
        } | ConvertTo-Json
        
        $r = Invoke-WebRequest -Uri "$api/api/explain" `
            -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body $body `
            -UseBasicParsing
        
        Write-Host "[OK] Status: $($r.StatusCode)" -ForegroundColor Green
        $json = $r.Content | ConvertFrom-Json
        Write-Host "Explanation:" -ForegroundColor Yellow
        Write-Host $json.explanation -ForegroundColor White
        Write-Host ""
        Write-Host "Key Points:" -ForegroundColor Yellow
        $json.keyPoints | ForEach-Object { Write-Host "  * $_" }
        Write-Host ""
        Read-Host "Press Enter to continue"
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 500) {
            Write-Host "[ERROR] API returned 500 - Check if OpenRouter API key is set" -ForegroundColor Red
        } else {
            Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
        }
        Read-Host "Press Enter to continue"
    }
}

function Test-Quiz {
    Write-Host "[!] Testing Quiz Generation..." -ForegroundColor Yellow
    Write-Host "[!] Requires OpenRouter API Key in .env" -ForegroundColor Red
    Write-Host ""
    
    try {
        $body = @{
            content = "Photosynthesis uses light energy to convert water and carbon dioxide into glucose and oxygen. The light reactions happen in the thylakoid membranes. The Calvin cycle happens in the stroma."
            difficulty = "easy"
            numQuestions = 2
        } | ConvertTo-Json
        
        $r = Invoke-WebRequest -Uri "$api/api/quiz" `
            -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body $body `
            -UseBasicParsing
        
        Write-Host "[OK] Status: $($r.StatusCode)" -ForegroundColor Green
        $json = $r.Content | ConvertFrom-Json
        Write-Host "Total Questions: $($json.totalQuestions)" -ForegroundColor Yellow
        Write-Host ""
        $json.quiz | ForEach-Object {
            Write-Host "Q: $($_.question)" -ForegroundColor Cyan
            Write-Host "A: $($_.correctAnswer)" -ForegroundColor Green
            Write-Host "Ex: $($_.explanation)" -ForegroundColor DarkGray
            Write-Host ""
        }
        Read-Host "Press Enter to continue"
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 500) {
            Write-Host "[ERROR] API returned 500 - Check if OpenRouter API key is set" -ForegroundColor Red
        } else {
            Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
        }
        Read-Host "Press Enter to continue"
    }
}

function Test-Video {
    Write-Host "[!] Testing Video Generation..." -ForegroundColor Yellow
    Write-Host "[!] Requires ffmpeg installed" -ForegroundColor Red
    Write-Host ""
    
    try {
        $body = @{
            text = "Plants use sunlight to make energy. Sunlight shines on green leaves. Inside the leaves, chloroplasts capture this energy. This amazing process is called photosynthesis."
            avatar = "student"
            duration = $null
        } | ConvertTo-Json
        
        $r = Invoke-WebRequest -Uri "$api/api/video" `
            -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body $body `
            -UseBasicParsing
        
        Write-Host "[OK] Status: $($r.StatusCode)" -ForegroundColor Green
        $json = $r.Content | ConvertFrom-Json
        Write-Host "Video URL: $($json.videoUrl)" -ForegroundColor Yellow
        Write-Host "Duration: $($json.duration) seconds" -ForegroundColor Yellow
        Write-Host "Format: $($json.format)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Access at: http://localhost:5001$($json.videoUrl)" -ForegroundColor Cyan
        Write-Host ""
        Read-Host "Press Enter to continue"
    }
    catch {
        if ($_.Exception.Message -like "*ffmpeg*") {
            Write-Host "[ERROR] ffmpeg not found - Install with: choco install ffmpeg" -ForegroundColor Red
        } elseif ($_.Exception.Response.StatusCode -eq 500) {
            Write-Host "[ERROR] Video generation failed - Check ffmpeg installation" -ForegroundColor Red
        } else {
            Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
        }
        Read-Host "Press Enter to continue"
    }
}

function Test-PDF {
    Write-Host "[*] Testing PDF Upload..." -ForegroundColor Cyan
    $file = Read-Host "Enter path to PDF file (or leave blank to skip)"
    
    if ([string]::IsNullOrWhiteSpace($file)) {
        Write-Host "Skipped" -ForegroundColor DarkGray
        Read-Host "Press Enter to continue"
        return
    }
    
    if (-not (Test-Path $file)) {
        Write-Host "[ERROR] File not found: $file" -ForegroundColor Red
        Read-Host "Press Enter to continue"
        return
    }
    
    try {
        $fileItem = Get-Item $file
        $r = Invoke-WebRequest -Uri "$api/api/upload-pdf" `
            -Method POST `
            -Form @{file=$fileItem} `
            -UseBasicParsing
        
        Write-Host "[OK] Status: $($r.StatusCode)" -ForegroundColor Green
        $json = $r.Content | ConvertFrom-Json
        Write-Host "Filename: $($json.filename)" -ForegroundColor Yellow
        Write-Host "Pages: $($json.pageCount)" -ForegroundColor Yellow
        Write-Host "Characters: $($json.characterCount)" -ForegroundColor Yellow
        Write-Host "Chunks: $($json.chunkCount)" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter to continue"
    }
    catch {
        Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
        Read-Host "Press Enter to continue"
    }
}

function Show-Files {
    Write-Host "[*] Generated Files:" -ForegroundColor Cyan
    $dir = "C:\Users\LENOVO\EduKids\aiTutorial-api\files"
    
    if (Test-Path $dir) {
        $files = Get-ChildItem $dir -ErrorAction SilentlyContinue
        if ($files) {
            $files | ForEach-Object {
                $size = "{0:N2}" -f ($_.Length/1MB)
                Write-Host "  * $($_.Name) ($size MB)" -ForegroundColor Yellow
            }
            Write-Host ""
            Write-Host "Access at: http://localhost:5001/files/" -ForegroundColor Cyan
        } else {
            Write-Host "  No files generated yet" -ForegroundColor DarkGray
        }
    } else {
        Write-Host "  Files directory not found" -ForegroundColor Red
    }
    Write-Host ""
    Read-Host "Press Enter to continue"
}

# Main Loop
do {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-8)"
    
    switch ($choice) {
        "1" { Test-Health }
        "2" { Test-Audio }
        "3" { Test-Explanation }
        "4" { Test-Quiz }
        "5" { Test-Video }
        "6" { Test-PDF }
        "7" { Show-Files }
        "8" { 
            Write-Host "`nGoodbye!" -ForegroundColor Green
            exit
        }
        default { 
            Write-Host "`n[ERROR] Invalid choice. Please try again." -ForegroundColor Red
            Read-Host "Press Enter to continue"
        }
    }
} while ($true)
