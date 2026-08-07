@echo off
title ShopSmart RAG Launcher
echo ===================================================
echo Starting ShopSmart AI E-Commerce & RAG Platform
echo ===================================================
echo.

echo [1/2] Starting Python FastAPI backend on port 8000...
start "ShopSmart Backend" cmd /k "backend\.venv\Scripts\python -m uvicorn backend.app.main:app --reload --port 8000"

echo [2/2] Starting React Vite frontend on port 5173...
start "ShopSmart Frontend" cmd /k "npm run dev"

echo.
echo ===================================================
echo Platform is launching! 
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000/docs
echo ===================================================
pause
