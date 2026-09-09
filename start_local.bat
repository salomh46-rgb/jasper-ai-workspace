@echo off
echo ========================================================
echo   🚀 JASPER AI WORKSPACE (LOCAL DEV MODE)
echo ========================================================
echo.

start cmd /k "title Jasper Backend && cd /d D:\ALLProjects\jasper-ai-workspace\backend && python -m uvicorn main:app --reload --port 8000"
start cmd /k "title Jasper Frontend (Mini App) && cd /d D:\ALLProjects\jasper-ai-workspace\frontend && npm run dev"

echo Backend:  http://localhost:8000
echo Swagger:  http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo.
echo Barcha oynalar ishga tushdi! Brauzerda http://localhost:3000 ni oching.
