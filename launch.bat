@echo off
echo ========================================
echo   🚀 ClubHub Launch Initializer
echo ========================================

:: Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed. Please install it from git-scm.com
    pause
    exit /b
)

:: Initialize Git
echo [*] Initializing Git repository...
git init

:: Add all files
echo [*] Staging files...
git add .

:: Commit
echo [*] Creating first commit...
git commit -m "feat: upscale ClubHub to Editorial GenZ v1.0"

:: Instructions for User
echo.
echo ========================================
echo   ✅ INFRASTRUCTURE READY
echo ========================================
echo.
echo To finish making this available to people:
echo 1. Create a NEW repo on GitHub named "clubhub"
echo 2. Run the following commands in this terminal:
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/clubhub.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo Once you push, the GitHub Action I created will build everything!
echo.
pause
