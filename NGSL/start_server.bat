@echo off
echo ローカルサーバーを起動しています...
echo ブラウザで http://localhost:8000 を開いてください
echo サーバーを停止するには Ctrl+C を押してください
echo.
python -m http.server 8000
pause
