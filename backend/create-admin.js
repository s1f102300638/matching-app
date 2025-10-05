/**
 * 管理者作成ツール（PostgreSQL版）
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query, closePool } = require('./db');

// 管理者情報（ここを変更してください）
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'password123';
const ADMIN_NAME = '管理者';
const ADMIN_AGE = 25;

async function createAdmin() {
  try {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║            🔑 管理者アカウント作成ツール             ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // 既存のユーザーを確認
    const userResult = await query('SELECT * FROM users WHERE email = $1', [ADMIN_EMAIL]);

    if (userResult.rows.length > 0) {
      // 既にユーザーが存在する場合、管理者権限を付与
      await query('UPDATE users SET is_admin = TRUE WHERE email = $1', [ADMIN_EMAIL]);
      
      console.log('✅ 既存のユーザーを管理者にしました！');
      console.log(`   メール: ${ADMIN_EMAIL}`);
    } else {
      // 新規管理者を作成
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
      const now = Math.floor(Date.now() / 1000);

      const result = await query(
        'INSERT INTO users (email, password, name, age, is_admin, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [ADMIN_EMAIL, hashedPassword, ADMIN_NAME, ADMIN_AGE, true, now]
      );

      console.log('✅ 管理者アカウントを作成しました！');
      console.log(`   メール: ${ADMIN_EMAIL}`);
      console.log(`   パスワード: ${ADMIN_PASSWORD}`);
      console.log(`   ID: ${result.rows[0].id}`);
    }

    await closePool();
    process.exit(0);
  } catch (error) {
    console.error('❌ エラー:', error.message);
    await closePool();
    process.exit(1);
  }
}

createAdmin();
