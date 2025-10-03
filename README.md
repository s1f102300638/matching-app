# マッチングアプリ

Tinderライクなマッチングアプリケーション

## 機能

- ユーザープロフィールの作成・編集
- スワイプによるLike/Pass機能
- マッチング機能
- マッチしたユーザーとのチャット
- プロフィール写真のアップロード

## 必要な環境

- Node.js (v14以上)
- npm

## インストール方法

1. このフォルダを`C:\Users\iniad\Documents\matching-app`に配置してください

2. バックエンドの依存関係をインストール：
```bash
cd C:\Users\iniad\Documents\matching-app\backend
npm install
```

3. フロントエンドの依存関係をインストール：
```bash
cd C:\Users\iniad\Documents\matching-app\frontend
npm install
```

## 起動方法

### 方法1: start.batを使用（推奨）
`start.bat`をダブルクリックするだけで、バックエンドとフロントエンドが自動的に起動します。

### 方法2: 手動起動

バックエンドサーバー（ターミナル1）：
```bash
cd C:\Users\iniad\Documents\matching-app\backend
npm start
```

フロントエンド（ターミナル2）：
```bash
cd C:\Users\iniad\Documents\matching-app\frontend
npm start
```

## 使用方法

1. ブラウザで http://localhost:3000 にアクセス
2. 新規登録でアカウントを作成
3. プロフィールを設定
4. スワイプ画面で他のユーザーを見る
5. お互いにLikeするとマッチ成立
6. マッチしたユーザーとチャットできます

## トラブルシューティング

### "npm is not recognized" エラー
Node.jsが正しくインストールされていません。https://nodejs.org/ からNode.jsをダウンロードしてインストールしてください。

### ポートが使用中エラー
他のアプリケーションがポート3000または5000を使用しています。それらのアプリケーションを終了してから再度起動してください。

### 依存関係のエラー
```bash
npm cache clean --force
npm install
```

## 技術スタック

### フロントエンド
- React
- React Router
- Axios

### バックエンド
- Node.js
- Express
- SQLite
- JWT認証
- Multer（画像アップロード）

## ファイル構造

```
matching-app/
├── backend/
│   ├── server.js           # Expressサーバー
│   ├── package.json        # バックエンド依存関係
│   ├── matching.db         # SQLiteデータベース（自動生成）
│   └── uploads/            # アップロード画像（自動生成）
├── frontend/
│   ├── public/
│   │   └── index.html      # HTMLテンプレート
│   ├── src/
│   │   ├── index.js        # エントリーポイント
│   │   ├── App.js          # メインアプリケーション
│   │   ├── App.css         # スタイルシート
│   │   ├── components/     # Reactコンポーネント
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Profile.js
│   │   │   ├── Swipe.js
│   │   │   ├── Matches.js
│   │   │   ├── Chat.js
│   │   │   └── PrivateRoute.js
│   │   └── contexts/       # Reactコンテキスト
│   │       └── AuthContext.js
│   └── package.json        # フロントエンド依存関係
├── README.md               # このファイル
└── start.bat               # 起動スクリプト
```
