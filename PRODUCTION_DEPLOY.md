# 本番環境デプロイ完全ガイド

## 🎯 現在の状況
- **フロントエンド**: Vercel (https://matching-app-wheat.vercel.app)
- **バックエンド**: Render (https://matching-app-4mba.onrender.com)

## ✅ 完了した作業

### 1. バックエンドの修正
- ✅ CORS設定を本番環境用に更新
- ✅ Vercelのドメインを許可リストに追加

### 2. フロントエンドの準備
- ✅ API設定ファイルの作成 (`src/config/api.js`)
- ✅ 環境変数ファイルの作成 (`.env`)
- ⚠️  各コンポーネントの修正が必要

## 📋 次のステップ

### ステップ1: Vercelの環境変数を設定

1. **Vercelダッシュボードにログイン**
   - https://vercel.com にアクセス

2. **プロジェクトを選択**
   - `matching-app` プロジェクトを選択

3. **環境変数を追加**
   - Settings → Environment Variables
   - 以下を追加:
     ```
     Name: REACT_APP_API_URL
     Value: https://matching-app-4mba.onrender.com
     ```
   - **すべての環境** (Production, Preview, Development) にチェック

4. **保存**

### ステップ2: バックエンドをデプロイ

#### 方法A: Git経由
```bash
cd C:\Users\iniad\Documents\matching-app
git add backend/server.js
git commit -m "Update CORS for production"
git push origin main
```

#### 方法B: 手動デプロイ
1. Renderダッシュボードで "Manual Deploy" → "Deploy latest commit"

### ステップ3: フロントエンドをデプロイ

#### 3-1. パッケージjsonのproxyを削除
`frontend/package.json` を編集して、以下の行を削除:
```json
"proxy": "http://localhost:5000"
```

#### 3-2. 各コンポーネントを修正

**修正が必要なファイル:**
- `src/components/Login.js`
- `src/components/Register.js`
- `src/components/Profile.js`
- `src/components/Swipe.js`
- `src/components/Matches.js`
- `src/components/Chat.js`
- `src/components/Admin.js`

**修正方法:**

```javascript
// 修正前
import axios from 'axios';
const response = await axios.post('/api/login', data);

// 修正後
import api from '../config/api';
const response = await api.post('/api/login', data);
```

または

```javascript
// 修正前
import axios from 'axios';
const response = await axios.post('http://localhost:5000/api/login', data);

// 修正後
import api from '../config/api';
const response = await api.post('/api/login', data);
```

#### 3-3. Gitにプッシュ
```bash
cd C:\Users\iniad\Documents\matching-app
git add .
git commit -m "Configure production environment"
git push origin main
```

Vercelは自動的に新しいデプロイを開始します。

### ステップ4: 動作確認

1. **バックエンドの確認**
   ```bash
   curl https://matching-app-4mba.onrender.com/api/candidates
   ```
   → 401エラーが返ればOK（認証が必要なため）

2. **フロントエンドの確認**
   - https://matching-app-wheat.vercel.app にアクセス
   - ログイン画面が表示されるか確認
   - 新規登録→ログインの流れをテスト

3. **CORS確認**
   - ブラウザの開発者ツール（F12）を開く
   - Consoleタブで "CORS" エラーがないか確認

## 🐛 トラブルシューティング

### エラー1: CORS error
**原因**: バックエンドの許可リストにフロントエンドのURLがない

**解決方法**:
1. `backend/server.js`の`allowedOrigins`配列を確認
2. Vercelの実際のURLを追加
3. バックエンドを再デプロイ

### エラー2: Network Error / Cannot connect
**原因**: 環境変数が設定されていない

**解決方法**:
1. Vercelの環境変数を確認
2. フロントエンドを再デプロイ
3. ブラウザのキャッシュをクリア

### エラー3: 画像が表示されない
**原因**: 画像URLがlocalhostを参照している

**解決方法**:
すべての画像URLを環境変数を使用するように修正:
```javascript
// 修正前
`http://localhost:5000${user.photo}`

// 修正後
`${process.env.REACT_APP_API_URL}${user.photo}`
```

## 📝 チェックリスト

### デプロイ前
- [ ] `package.json`から`proxy`を削除
- [ ] すべてのコンポーネントでAPI設定を使用
- [ ] 環境変数ファイル(`.env`)を作成
- [ ] `.gitignore`に`.env`を追加（既にあるか確認）

### デプロイ後
- [ ] バックエンドが起動しているか確認
- [ ] フロントエンドが起動しているか確認
- [ ] ログイン機能が動作するか確認
- [ ] 新規登録機能が動作するか確認
- [ ] 画像アップロードが動作するか確認

### 本番環境設定
- [ ] Renderの環境変数に`JWT_SECRET`を設定
- [ ] Vercelの環境変数に`REACT_APP_API_URL`を設定
- [ ] データベースのバックアップを取得
- [ ] 管理者アカウントを作成

## 🔐 セキュリティチェック

- [ ] JWT_SECRETを強力なランダム文字列に変更
- [ ] CORS設定が本番環境のみを許可
- [ ] `.env`ファイルがGitに含まれていない
- [ ] APIキーやパスワードがコードに含まれていない

## 🚀 パフォーマンス最適化（オプション）

### 1. 画像最適化
- Cloudinaryなどの画像CDNを使用
- 画像を自動的にリサイズ・圧縮

### 2. キャッシング
- React Queryなどを使用してAPIレスポンスをキャッシュ

### 3. コード分割
- React.lazyを使用してコンポーネントを遅延読み込み

## 📞 サポート

問題が発生した場合:
1. ブラウザの開発者ツール(F12)でエラーを確認
2. Renderのログを確認
3. Vercelのデプロイログを確認

---

**最終更新**: 2025年10月3日
