@echo off
setlocal

cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File ".\generar_excel_requerimientos.ps1"

echo.
echo Archivo generado en esta carpeta.
pause