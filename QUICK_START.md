# 🚀 本番環境起動 - クイックガイド

## ✅ 既に完了している作業
1. ✅ バックエンド: CORS設定を本番環境用に更新済み
2. ✅ フロントエンド: API設定ファイル作成済み (`src/config/api.js`)
3. ✅ 環境変数ファイル作成済み (`.env`)

## 🎯 今すぐやるべき3ステップ

### ステップ1: Vercel環境変数を設定 (2分)

1. https://vercel.com/dashboard にログイン
2. プロジェクト `matching-app` を選択
3. Settings → Environment Variables
4. 追加:
   ```
   Name: REACT_APP_API_URL
   Value: https://matching-app-4mba.onrender.com
   ```
5. Production, Preview, Development すべてにチェック
6. Save

### ステップ2: バックエンドをデプロイ (3分)

**方法A: Git経由（推奨）**
```bash
cd C:\Users\iniad\Documents\matching-app
git add backend/server.js
git commit -m "Update CORS settings for production"
git push origin main
```

**方法B: Renderダッシュボード**
- https://dashboard.render.com にログイン
- matching-app-backend を選択
- "Manual Deploy" → "Deploy latest commit"

### ステップ3: フロントエンドをデプロイ (5分)

**3-1. Login.jsは既に修正済み**

**3-2. 残りのコンポーネントを修正**

以下のコマンドで一括置換:

```bash
cd C:\Users\iniad\Documents\matching-app\frontend\src\components

# Register.jsを修正
# 手動で以下を変更:
# - import axios from 'axios' → import api from '../config/api'
# - axios.post('/api/register' → api.post('/api/register'
```

**または、個別に修正:**

各ファイルで:
```javascript
// 変更前
import axios from 'axios';
await axios.post('/api/xxx', data);

// 変更後
import api from '../config/api';
await api.post('/api/xxx', data);
```

**修正が必要なファイル:**
- Register.js
- Profile.js (if using API calls)
- Swipe.js
- Matches.js  
- Chat.js
- Admin.js

**3-3. package.jsonからproxyを削除**

`frontend/package.json`を開いて、以下の行を削除:
```json
"proxy": "http://localhost:5000"
```

**3-4. Gitにプッシュ**
```bash
cd C:\Users\iniad\Documents\matching-app
git add .
git commit -m "Configure for production deployment"
git push origin main
```

Vercelが自動的にデプロイを開始します（約2分）。

## 🧪 動作確認 (3分)

### 1. バックエンドの確認
ブラウザで開く: https://matching-app-4mba.onrender.com

→ "Cannot GET /" と表示されればOK

### 2. フロントエンドの確認
ブラウザで開く: https://matching-app-wheat.vercel.app

→ ログイン画面が表示されればOK

### 3. ログインテスト
1. 新規登録を試す（招待コードが必要）
2. 管理者でログイン
3. スワイプ画面を確認

### 4. エラー確認
- F12で開発者ツールを開く
- Consoleタブでエラーがないか確認
- "CORS error" が出ていないか確認

## ❌ エラーが出たら

### CORSエラーの場合
```
Access to XMLHttpRequest at 'https://matching-app-4mba.onrender.com/api/login' 
from origin 'https://matching-app-wheat.vercel.app' has been blocked by CORS policy
```

**原因**: バックエンドのallowedOriginsにフロントエンドURLがない

**解決**:
1. `backend/server.js` の `allowedOrigins` 配列を確認
2. Vercelの実際のURLを追加
3. バックエンドを再デプロイ

### Network Error の場合
```
Network Error
```

**原因**: 環境変数が設定されていない、またはバックエンドが起動していない

**解決**:
1. Vercelの環境変数 `REACT_APP_API_URL` を確認
2. Renderでバックエンドが起動しているか確認
3. フロントエンドを再デプロイ

### 画像が表示されない場合

**原因**: 画像URLが `localhost` を参照している

**解決**: 後で修正 (優先度低)

## 📋 最終チェックリスト

デプロイ前:
- [ ] `frontend/.env` ファイル作成済み
- [ ] Vercel環境変数設定済み
- [ ] `package.json`から`proxy`削除済み
- [ ] コンポーネントでapi設定を使用

デプロイ後:
- [ ] バックエンドアクセス可能
- [ ] フロントエンドアクセス可能  
- [ ] ログイン機能動作
- [ ] CORSエラーなし

## 🎉 成功！

すべて正常に動作したら、アプリは本番環境で稼働しています！

**アクセスURL**: https://matching-app-wheat.vercel.app

---

**所要時間**: 合計 約13分
**難易度**: ⭐⭐☆☆☆

質問があれば、エラーメッセージを教えてください！
