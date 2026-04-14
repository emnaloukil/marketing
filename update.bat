@echo off
echo 🚀 EduKids Development Workflow
echo.

echo 📋 Checking Git status...
git status --short
echo.

echo 🔄 Pulling latest changes safely...
git stash push -m "Auto-stash before pull %date% %time%"
git pull origin main
git stash pop 2>nul || echo ✅ No stashed changes to restore
echo.

echo 📦 Installing dependencies...
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
echo.

echo ✅ Ready to develop!
echo 💡 Tips:
echo   - Work on feature branches: git checkout -b feature/your-feature
echo   - Commit regularly: git add . && git commit -m "your message"
echo   - Push when ready: git push origin your-branch