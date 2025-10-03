@echo off
echo ====================================
echo マッチングアプリを起動しています...
echo ====================================
echo.

echo Node.jsのバージョンを確認しています...
node --version
if %errorlevel% neq 0 (
    echo.
    echo [エラー] Node.jsがインストールされていません。
    echo https://nodejs.org/ からNode.jsをダウンロードしてインストールしてください。
    echo.
    pause
    exit /b 1
)

echo.
echo [1/2] バックエンドサーバーを起動しています...
cd backend
if not exist node_modules (
    echo 依存関係をインストールしています...
    call npm install
)
start "Backend Server - Port 5000" cmd /k npm start
timeout /t 5 /nobreak > nul

echo.
echo [2/2] フロントエンドアプリケーションを起動しています...
cd ../frontend
if not exist node_modules (
    echo 依存関係をインストールしています...
    call npm install  
)
start "Frontend App - Port 3000" cmd /k npm start

echo.
echo ====================================
echo アプリケーションの起動が完了しました！
echo.
echo ブラウザで http://localhost:3000 を開いてください。
echo 自動的に開かない場合は、手動でアクセスしてください。
echo ====================================
echo.
echo 終了するには、開いているコマンドプロンプトウィンドウを閉じてください。
echo.
pause
