@echo off
echo ==============================================
echo       Upload and Update Site Script
echo ==============================================

:: Ask the user for a commit message
set /p msg="Enter what you changed (or press Enter to use 'Site update'): "

:: Default message if the user just presses Enter
if "%msg%"=="" set msg="Site update"

echo.
echo [1/3] Adding changes...
git add .

echo [2/3] Saving changes (Commit)...
git commit -m "%msg%"

echo [3/3] Uploading to GitHub...
git push

echo.
echo ==============================================
echo DONE! 
echo Your changes are now on GitHub.
echo Cloudflare will automatically update your website in 1-2 minutes.
echo ==============================================
pause
