@echo off
setlocal

cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File ".\requerimientos\generar_excel_requerimientos.ps1"

echo.
echo Archivo generado en la carpeta requerimientos.
pause