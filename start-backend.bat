@echo off
setlocal

set "PROJECT_ROOT=%~dp0"
set "APP_DIR=%PROJECT_ROOT%"
set "NPM_CLI=C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js"

if not exist "%APP_DIR%" (
    echo Project root not found: %APP_DIR%
    exit /b 1
)

if not exist "%NPM_CLI%" (
    echo npm CLI not found at: %NPM_CLI%
    echo Install or repair Node.js, then try again.
    exit /b 1
)

cd /d "%APP_DIR%"

if not exist "node_modules" (
    echo Installing app dependencies...
    node "%NPM_CLI%" install
    if errorlevel 1 exit /b 1
)

echo Starting ExamVerse AI app server...
node "%NPM_CLI%" run dev

endlocal
