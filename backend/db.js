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
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Renderなどのホスティングサービスで必要
  } : false
});

// 🔍 接続テスト
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client:', err);
  process.exit(-1);
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
