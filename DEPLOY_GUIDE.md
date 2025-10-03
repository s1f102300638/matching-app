# マッチングアプリ - デプロイガイド

## 🎯 実装完了機能

✅ **招待コード制**
- メンバー限定の登録システム
- 招待コードがないと登録不可
- 管理画面でコード生成・管理

✅ **スマホ対応**
- レスポンシブデザイン
- タッチ操作最適化
- PWA対応準備済み

✅ **管理画面**
- 招待コード生成・削除
- ユーザー一覧表示
- 統計情報ダッシュボード

---

## 🚀 デプロイ手順（無料プラン）

### 準備

#### 1. 環境変数の設定
バックエンドの`server.js`で以下を設定：
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const PORT = process.env.PORT || 5000;
```

### フロントエンド（Vercel）

#### 1. Gitリポジトリ作成
```bash
cd C:\Users\iniad\Documents\matching-app
git init
git add .
git commit -m "Initial commit"
```

#### 2. GitHubにプッシュ
- GitHub.comで新規リポジトリ作成
- ローカルからプッシュ

#### 3. Vercelでデプロイ
1. https://vercel.com にアクセス
2. GitHubアカウントで登録
3. "New Project"をクリック
4. リポジトリを選択
5. 設定:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. "Deploy"をクリック

完了！フロントエンドのURLが発行されます（例: `https://your-app.vercel.app`）

---

### バックエンド（Render）

#### 1. Renderアカウント作成
https://render.com にアクセスして登録

#### 2. 新規Webサービス作成
1. "New +" → "Web Service"
2. リポジトリを接続
3. 設定:
   - **Name**: matching-app-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### 3. 環境変数の設定
Renderダッシュボードで以下を追加:
```
JWT_SECRET=your-very-secure-random-secret-key-here-change-this
NODE_ENV=production
```

#### 4. デプロイ
"Create Web Service"をクリック

完了！バックエンドのURLが発行されます（例: `https://your-app.onrender.com`）

---

### データベース（Supabase）

#### 1. Supabaseプロジェクト作成
1. https://supabase.com にアクセス
2. 新規プロジェクトを作成
3. PostgreSQL接続情報を取得

#### 2. バックエンドの修正
`server.js`のSQLiteをPostgreSQLに変更（または次のステップで実装）

**簡易版**: 現状のままSQLiteを使用
- Renderは無料プランでもディスク永続化可能
- 小規模（200-300人）なら十分

---

### フロントエンドとバックエンドの接続

#### 1. フロントエンドの環境変数
Vercelダッシュボード → Settings → Environment Variables

```
REACT_APP_API_URL=https://your-app.onrender.com
```

#### 2. `package.json`の更新
`frontend/package.json`から以下を削除:
```json
"proxy": "http://localhost:5000"
```

#### 3. Axiosの設定を変更
すべてのaxiosリクエストに`REACT_APP_API_URL`を使用:

```javascript
// 例
axios.post(`${process.env.REACT_APP_API_URL}/api/register`, data)
```

または、`src/api.js`を作成:
```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
});

export default API;
```

#### 4. CORS設定の確認
`backend/server.js`で:
```javascript
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

#### 5. 再デプロイ
- フロントエンド: Vercelで自動デプロイ
- バックエンド: Renderで自動デプロイ

---

## 👨‍💼 初期管理者の設定

### 方法1: データベースから直接設定

#### SQLiteの場合
```bash
cd backend
sqlite3 matching.db
```

```sql
-- ユーザー登録後、そのユーザーを管理者に
UPDATE users SET is_admin = 1 WHERE email = 'your-email@example.com';
```

#### PostgreSQLの場合（Supabase）
Supabaseダッシュボード → SQL Editor

```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

### 方法2: 初回起動時に自動作成

`server.js`に追加:
```javascript
// 初期管理者アカウントの作成（初回のみ）
db.get('SELECT * FROM users WHERE is_admin = 1', async (err, admin) => {
  if (!admin && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    db.run(
      'INSERT INTO users (email, password, name, age, is_admin) VALUES (?, ?, ?, ?, ?)',
      [process.env.ADMIN_EMAIL, hashedPassword, 'Admin', 30, 1]
    );
  }
});
```

環境変数:
```
ADMIN_EMAIL=admin@yourapp.com
ADMIN_PASSWORD=secure-password-here
```

---

## 📱 スマホでの使い方

### ホーム画面に追加（PWA）

#### iOS (Safari)
1. アプリを開く
2. 共有ボタンをタップ
3. "ホーム画面に追加"を選択

#### Android (Chrome)
1. アプリを開く
2. メニュー(⋮)をタップ
3. "ホーム画面に追加"を選択

---

## 🎯 管理者の操作手順

### 1. 管理画面へのアクセス
`https://your-app.vercel.app/admin`

### 2. 招待コード生成
1. "招待コード"タブを選択
2. 使用回数と有効期限を設定
3. "招待コードを生成"をクリック
4. 生成されたコードをメンバーに共有

### 3. ユーザー管理
- "ユーザー管理"タブで登録者を確認

### 4. 統計確認
- "統計情報"タブで利用状況を確認

---

## 💰 コスト試算（200-300人想定）

### 無料プラン（推奨）
- **Vercel**: 無料（商用利用可）
- **Render**: 無料（750時間/月）
- **合計**: **0円/月**

### 注意点
- Renderの無料プランは15分間非アクティブでスリープ
- 最初のアクセス時に起動に数秒かかる
- 200-300人規模なら問題なし

### 有料プランに移行する場合
- **Render**: $7/月（スリープなし）
- **Supabase Pro**: $25/月（PostgreSQL、1GB）

---

## 🔒 セキュリティ対策

### 本番環境で必須
1. **JWT_SECRETの変更**
   - 推奨: 32文字以上のランダム文字列
   - 生成方法: `openssl rand -base64 32`

2. **HTTPS強制**
   - VercelとRenderは自動でHTTPS

3. **CORS設定の厳密化**
   - 本番環境のURLのみ許可

4. **環境変数の管理**
   - .envファイルは`.gitignore`に追加
   - 機密情報をGitにコミットしない

---

## 📝 次のステップ（オプション）

### 画像ストレージをCloudinaryに移行
無料枠: 25GB/月

### PWA対応の強化
- マニフェストファイル作成
- サービスワーカー登録
- オフライン対応

### プッシュ通知
- Firebase Cloud Messaging
- 新しいマッチやメッセージの通知

### 分析ツール
- Google Analytics
- ユーザー行動の追跡

---

## ❓ トラブルシューティング

### Q: バックエンドに接続できない
A: CORS設定を確認、環境変数`REACT_APP_API_URL`が正しいか確認

### Q: 招待コードが無効と表示される
A: データベースを確認、コードが正しく生成されているか確認

### Q: 管理画面にアクセスできない
A: ユーザーの`is_admin`フラグを確認

### Q: Renderのサービスがスリープする
A: 有料プラン($7/月)に移行、またはcronジョブで定期的にアクセス

---

## 📞 サポート

問題が発生した場合:
1. ブラウザのコンソールでエラーを確認
2. RenderとVercelのログを確認
3. データベースの状態を確認

---

## 🎉 完成！

これで、特定のコミュニティ向けの招待制マッチングアプリが完成しました。
PC/スマホの両方から管理・利用が可能です。

デプロイ後の運用を楽しんでください！
