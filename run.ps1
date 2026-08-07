Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting ShopSmart AI E-Commerce & RAG Platform" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Starting Python FastAPI backend on port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "backend\.venv\Scripts\python -m uvicorn backend.app.main:app --reload --port 8000"

Write-Host "[2/2] Starting React Vite frontend on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Yellow
Write-Host "Platform is launching!" -ForegroundColor Yellow
Write-Host "Frontend:    http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend API: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Yellow
