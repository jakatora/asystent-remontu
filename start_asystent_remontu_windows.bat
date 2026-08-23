@echo off
setlocal

rem Uruchamia APKĘ Asystent Remontu na Windowsie (wersja webowa eksportu Expo).
rem Apka jest Expo (iOS/Android) — nie ma natywnego .exe. To ten sam kod, renderowany
rem przez react-native-web, czyli najbliższa Windowsowi forma tej aplikacji.

set "ROOT=%~dp0"
cd /d "%ROOT%artifacts\mobile"

set "PATH=C:\Program Files\nodejs;%PATH%"

if not exist "web-build\index.html" (
  echo Brak web-build - buduje apke, to potrwa okolo minuty...
  call npx expo export --platform web --output-dir web-build
)

echo Asystent Remontu startuje na http://127.0.0.1:4174
start "" http://127.0.0.1:4174
node server\web.js

endlocal
