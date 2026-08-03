@echo off
echo Installing requirements...
pip install -r requirements.txt
pip install pyinstaller

echo Building server executable with embedded models...
pyinstaller --clean server.spec

echo Copying executable to src-tauri bin directory...
mkdir ..\bin
copy dist\server.exe ..\bin\server-x86_64-pc-windows-msvc.exe

echo Done! The sidecar is ready.
