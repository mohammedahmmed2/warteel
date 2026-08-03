@echo off
echo ===================================================
echo   Siraj App - Build executable
echo ===================================================
echo.
echo Building frontend assets and Tauri executable...
echo This might take a few minutes if it's the first time...
echo.
call npm run tauri build
echo.
echo ===================================================
echo Build complete! You can find the .exe file in:
echo src-tauri\target\release\bundle\msi\
echo src-tauri\target\release\bundle\nsis\
echo src-tauri\target\release\Siraj.exe
echo ===================================================
pause
