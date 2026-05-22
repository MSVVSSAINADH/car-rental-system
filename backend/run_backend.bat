@echo off
echo Starting Car Rental System Backend...
echo.

REM Try Method 1: Maven Wrapper (if exists)
if exist mvnw.cmd (
    echo [Method 1] Using Maven Wrapper...
    call mvnw.cmd spring-boot:run
    goto :end
)

REM Try Method 2: Maven command
where mvn >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [Method 2] Using Maven...
    call mvn spring-boot:run
    goto :end
)

REM Try Method 3: Direct JAR execution
if exist target\backend-0.0.1-SNAPSHOT.jar (
    echo [Method 3] Running JAR directly...
    java -jar target\backend-0.0.1-SNAPSHOT.jar
    goto :end
)

REM If all methods fail
echo.
echo ERROR: Could not start backend!
echo.
echo Please ensure one of the following:
echo 1. Maven is installed and in PATH
echo 2. JAR file exists at: target\backend-0.0.1-SNAPSHOT.jar
echo.
echo To build the JAR manually, run your IDE's build/package command
echo.

:end
pause
