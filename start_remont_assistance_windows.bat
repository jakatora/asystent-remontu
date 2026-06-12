@echo off
setlocal

set "ROOT=%~dp0"
cd /d "%ROOT%"

set "PATH=C:\Program Files\nodejs;%PATH%"

echo Starting Remont Assistance on http://127.0.0.1:4173
start "" http://127.0.0.1:4173
call corepack pnpm --filter @workspace/asystent-remontu-web exec vite preview --config vite.config.ts --host 127.0.0.1 --port 4173

endlocal