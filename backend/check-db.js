/**
 * データベース内容確認ツール（PostgreSQL版）
 */

require('dotenv').config();
const { query, closePool } = require('./db');

async function checkDatabase() {
  try {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║        📊 データベース内容確認（PostgreSQL）         ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // ユーザー数
    const userCountResult = await query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 ユーザー数: ${userCountResult.rows[0].count}`);

    // ユーザー一覧
    const usersResult = await query('SELECT id, email, name, age, is_admin, created_at FROM users ORDER BY created_at DESC');
    console.log('\n👥 ユーザー一覧:');
    usersResult.rows.forEach(user => {
      const date = new Date(user.created_at * 1000).toLocaleString('ja-JP');
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Age: ${user.age}, Admin: ${user.is_admin ? 'はい' : 'いいえ'}, 作成日: ${date}`);
    });

    // 招待コード数
    const codeCountResult = await query('SELECT COUNT(*) as count FROM invite_codes');
    console.log(`\n🎫 招待コード数: ${codeCountResult.rows[0].count}`);

    // 招待コード一覧
    const codesResult = await query('SELECT code, is_used, max_uses, current_uses, created_at FROM invite_codes ORDER BY created_at DESC');
    console.log('\n🎟️  招待コード一覧:');
    codesResult.rows.forEach(code => {
      const date = new Date(code.created_at * 1000).toLocaleString('ja-JP');
      console.log(`  - コード: ${code.code}, 使用状況: ${code.current_uses}/${code.max_uses === -1 ? '無制限' : code.max_uses}, 作成日: ${date}`);
    });

    // マッチ数
    const matchCountResult = await query('SELECT COUNT(*) as count FROM matches');
    console.log(`\n💕 マッチ数: ${matchCountResult.rows[0].count}`);

    // メッセージ数
    const messageCountResult = await query('SELECT COUNT(*) as count FROM messages');
    console.log(`💬 メッセージ数: ${messageCountResult.rows[0].count}`);

    console.log('\n=== 確認完了 ===');

    await closePool();
    process.exit(0);
  } catch (error) {
    console.error('❌ エラー:', error.message);
    await closePool();
    process.exit(1);
  }
}

checkDatabase();
