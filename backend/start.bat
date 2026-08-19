@echo off
setlocal enabledelayedexpansion

echo ================================================
echo   MeetingMind Backend - Starting...
echo ================================================

:: Add bundled Maven to PATH for this session
set "PATH=D:\E\MeetingMind\maven\bin;%PATH%"

:: Load .env file variables
echo Loading .env...
for /f "usebackq tokens=1,* delims==" %%A in ("D:\E\MeetingMind\.env") do (
    set "key=%%A"
    set "val=%%B"
    if not "!key:~0,1!"=="#" if not "!key!"=="" (
        set "!key!=!val!"
    )
)

echo   MONGODB_DATABASE : %MONGODB_DATABASE%
echo   SERVER_PORT      : %SERVER_PORT%
echo   ASR_PROVIDER     : %ASR_PROVIDER%
echo.
echo Starting Spring Boot...
echo.

cd /d "D:\E\MeetingMind\backend"
mvn spring-boot:run

pause
