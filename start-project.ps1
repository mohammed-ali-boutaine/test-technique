# Start backend and frontend servers

Write-Host "Multi-Tenant Document System - Starting..." -ForegroundColor Cyan
Write-Host ""

# Install backend dependencies
Write-Host "[1/4] Installing backend dependencies..." -ForegroundColor Yellow
Push-Location backend
pip install -r requirements.txt --quiet
Pop-Location

# Install frontend dependencies  
Write-Host "[2/4] Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location frontend
npm install --silent
Pop-Location

# Start backend server
Write-Host "[3/4] Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; uvicorn app.main:app --reload"
Start-Sleep -Seconds 2

# Start frontend server
Write-Host "[4/4] Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "Servers started successfully!" -ForegroundColor Green
Write-Host "Backend: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Keys: tenantA_key or tenantB_key" -ForegroundColor Yellow
Write-Host ""