/**
 * データベース接続設定
 * PostgreSQLへの接続を管理するモジュール
 */

require('dotenv').config();
const { Pool } = require('pg');

// 🌍 環境変数からDATABASE_URLを取得
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ FATAL ERROR: DATABASE_URL environment variable is required.');
  console.error('Please set DATABASE_URL in your .env file or environment variables.');
  process.exit(1);
}

// 🔧 PostgreSQL接続プールの作成
const pool = new Pool({
  connectionString: DATABASE_URL,
  
  // 🔒 SSL設定（本番環境で証明書検証を有効化）
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true, // ✅ セキュアに変更
  } : false,

  // 🔧 接続プール設定を追加
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 🔍 接続テスト
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client:', err);
  
  // ✅ プロセスを終了させない（ログ記録のみ）
  // 単一のエラーでサービス全体を停止させるべきではない
  // process.exit(-1); // ❌ 危険！使用しない
  
  // 🔔 本番環境では、ここでアラートを送信することを推奨
  // 例: Sentry.captureException(err), PagerDuty, Slack通知等
});

/**
 * クエリ実行のヘルパー関数
 * @param {string} text - SQLクエリ
 * @param {array} params - パラメータ
 * @returns {Promise} - クエリ結果
 */
const query = (text, params) => pool.query(text, params);

/**
 * トランザクション開始
 */
const beginTransaction = async () => {
  const client = await pool.connect();
  await client.query('BEGIN');
  return client;
};

/**
 * トランザクションコミット
 */
const commitTransaction = async (client) => {
  await client.query('COMMIT');
  client.release();
};

/**
 * トランザクションロールバック
 */
const rollbackTransaction = async (client) => {
  await client.query('ROLLBACK');
  client.release();
};

/**
 * データベース接続を閉じる
 */
const closePool = async () => {
  await pool.end();
  console.log('✅ Database pool closed');
};

module.exports = {
  query,
  pool,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  closePool
};
