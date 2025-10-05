# 🚀 Quick Start Guide

このガイドに従って、5分でマッチングアプリを起動できます！

---

## 📋 前提条件

以下がインストールされていることを確認してください：

- **Node.js** v14以上
- **npm** v6以上

確認コマンド：
```bash
node --version
npm --version
```

---

## ⚡ クイックスタート（5分）

### ステップ1: プロジェクトをクローン

```bash
git clone https://github.com/s1f102300638/matching-app.git
cd matching-app
```

### ステップ2: バックエンドのセットアップ

```bash
cd backend

# 依存関係をインストール
npm install

# 環境変数ファイルを作成
cp .env.example .env

# JWT_SECRETを生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# ↑ 出力された値を.envのJWT_SECRETにコピー

# ADMIN_SETUP_SECRETを生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# ↑ 出力された値を.envのADMIN_SETUP_SECRETにコピー

# データベースを初期化（サンプルデータ付き）
npm run init-db
```

### ステップ3: フロントエンドのセットアップ

```bash
cd ../frontend

# 依存関係をインストール
npm install

# 環境変数ファイルを作成（デフォルト設定でOK）
cp .env.example .env.local
```

### ステップ4: アプリを起動

**ターミナル1（バックエンド）：**
```bash
cd backend
npm run dev
```

**ターミナル2（フロントエンド）：**
```bash
cd frontend
npm start
```

### ステップ5: ブラウザでアクセス

1. ブラウザで http://localhost:3000 を開く
2. 以下のアカウントでログイン：

**管理者アカウント:**
- メール: `admin@example.com`
- パスワード: `admin123`

**サンプルユーザー:**
- メール: `user1@example.com` ~ `user5@example.com`
- パスワード: `password123`

---

## 🎉 完了！

これで以下のことができます：

- ✅ ユーザー登録・ログイン
- ✅ プロフィール編集
- ✅ ユーザーのスワイプ
- ✅ マッチング
- ✅ チャット機能
- ✅ 管理者ダッシュボード（adminアカウントのみ）

---

## 📚 次に読むべきドキュメント

- **詳細なセットアップ**: [README.md](./README.md)
- **API仕様**: [README.md#api-documentation](./README.md#api-documentation)
- **セキュリティ**: [SECURITY.md](./SECURITY.md)
- **貢献方法**: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 🐛 トラブルシューティング

### ポートが既に使用されている

**エラー:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**解決策:**
```bash
# ポート5000を使用しているプロセスを確認
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# プロセスを終了するか、.envでPORTを変更
PORT=5001 npm run dev
```

### データベースエラー

**エラー:**
```
Error: SQLITE_CANTOPEN: unable to open database file
```

**解決策:**
```bash
cd backend
npm run init-db
```

### npm installエラー

**エラー:**
```
npm ERR! code EACCES
```

**解決策:**
```bash
# 権限の問題の場合
sudo npm install

# または、npmのパーミッションを修正
# https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
```

---

## 🆘 ヘルプが必要ですか？

- 📖 [完全なREADME](./README.md)を読む
- 🐛 [GitHubでIssueを作成](https://github.com/s1f102300638/matching-app/issues)
- 💬 コミュニティに質問する

---

**Happy Coding! 💻❤️**
