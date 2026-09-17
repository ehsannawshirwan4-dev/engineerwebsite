@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Install Node.js LTS first.&pause&exit /b 1)
where docker >nul 2>nul || (echo Install and start Docker Desktop first.&pause&exit /b 1)
if not exist node_modules call npm install
call npm run db:up || goto error
call npm run db:setup || goto error
call npm run dev
goto :eof
:error
echo Startup failed. Check the message above.
pause
