@echo off
title Love Experience - Local Development
color 0C

echo.
echo  ============================================
echo   Love Experience - Local Startup Script
echo  ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js is not installed or not in PATH.
    echo  Please install Node.js 18+ from https://nodejs.org
    echo  Or install Bun from https://bun.sh
    pause
    exit /b 1
)

REM Check if Bun is installed (preferred)
where bun >nul 2>nul
if %errorlevel% neq 0 (
    echo  [INFO] Bun not found. Using npm instead.
    echo  [INFO] For faster performance, install Bun: https://bun.sh
    echo.

    REM Install dependencies
    echo  [1/4] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo  [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )

    REM Generate Prisma client
    echo  [2/4] Generating database client...
    call npx prisma generate
    if %errorlevel% neq 0 (
        echo  [ERROR] Failed to generate Prisma client.
        pause
        exit /b 1
    )

    REM Push database schema
    echo  [3/4] Setting up database...
    call npx prisma db push
    if %errorlevel% neq 0 (
        echo  [ERROR] Failed to set up database.
        pause
        exit /b 1
    )

    REM Start dev server
    echo  [4/4] Starting development server...
    echo.
    echo  ============================================
    echo   Server starting at http://localhost:3000
    echo   Press Ctrl+C to stop
    echo  ============================================
    echo.
    call npm run dev
    pause
    exit /b 0
)

REM Bun is installed — use it (faster)
echo  [INFO] Bun detected. Using Bun for faster performance.
echo.

REM Install dependencies
echo  [1/4] Installing dependencies...
call bun install
if %errorlevel% neq 0 (
    echo  [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)

REM Generate Prisma client
echo  [2/4] Generating database client...
call bun run db:generate
if %errorlevel% neq 0 (
    echo  [ERROR] Failed to generate Prisma client.
    pause
    exit /b 1
)

REM Push database schema
echo  [3/4] Setting up database...
call bun run db:push
if %errorlevel% neq 0 (
    echo  [ERROR] Failed to set up database.
    pause
    exit /b 1
)

REM Start dev server
echo  [4/4] Starting development server...
echo.
echo  ============================================
echo   Server starting at http://localhost:3000
echo   Press Ctrl+C to stop
echo  ============================================
echo.
call bun run dev
pause
