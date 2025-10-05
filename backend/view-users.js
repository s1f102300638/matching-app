/**
 * ユーザー一覧表示ツール（PostgreSQL版）
 */

require('dotenv').config();
const { query, closePool } = require('./db');

async function viewUsers() {
  try {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║        📊 マッチングアプリ データベース確認          ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // ユーザー一覧を詳細表示
    const usersResult = await query('SELECT * FROM users ORDER BY created_at DESC');
    const users = usersResult.rows;

    console.log('👥 登録ユーザー一覧\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (users.length === 0) {
      console.log('ユーザーが登録されていません。');
    } else {
      users.forEach((user, index) => {
        const createdDate = new Date(user.created_at * 1000).toLocaleString('ja-JP');

        console.log(`\n【ユーザー ${index + 1}】`);
        console.log(`  🆔 ID: ${user.id}`);
        console.log(`  📧 メール: ${user.email}`);
        console.log(`  👤 名前: ${user.name}`);
        console.log(`  🎂 年齢: ${user.age}歳`);
        console.log(`  📝 自己紹介: ${user.bio || '未設定'}`);
        console.log(`  📷 写真: ${user.photo || '未設定'}`);
        console.log(`  🔐 管理者: ${user.is_admin ? '✅ はい' : '❌ いいえ'}`);
        console.log(`  📅 登録日時: ${createdDate}`);
      });

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ 合計: ${users.length}人のユーザーが登録されています\n`);
    }

    // 統計情報
    const adminCountResult = await query('SELECT COUNT(*) as admin_count FROM users WHERE is_admin = TRUE');
    const matchCountResult = await query('SELECT COUNT(*) as count FROM matches');
    const messageCountResult = await query('SELECT COUNT(*) as count FROM messages');
    const codeCountResult = await query('SELECT COUNT(*) as count FROM invite_codes');

    console.log('📊 統計情報');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  👤 一般ユーザー: ${users.length - parseInt(adminCountResult.rows[0].admin_count)}人`);
    console.log(`  🔑 管理者: ${adminCountResult.rows[0].admin_count}人`);
    console.log(`  💕 マッチ数: ${matchCountResult.rows[0].count}件`);
    console.log(`  💬 メッセージ数: ${messageCountResult.rows[0].count}件`);
    console.log(`  🎫 招待コード数: ${codeCountResult.rows[0].count}件`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 招待コード一覧
    const codesResult = await query('SELECT * FROM invite_codes ORDER BY created_at DESC');
    const codes = codesResult.rows;

    if (codes.length > 0) {
      console.log('🎟️  招待コード一覧\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      codes.forEach((code, index) => {
        const expireDate = code.expires_at
          ? new Date(code.expires_at * 1000).toLocaleString('ja-JP')
          : '無期限';
        const createdDate = code.created_at
          ? new Date(code.created_at * 1000).toLocaleString('ja-JP')
          : '不明';

        console.log(`\n【コード ${index + 1}】`);
        console.log(`  🔑 コード: ${code.code}`);
        console.log(`  📊 使用状況: ${code.current_uses}/${code.max_uses === -1 ? '無制限' : code.max_uses}`);
        console.log(`  ⏰ 有効期限: ${expireDate}`);
        console.log(`  📅 作成日時: ${createdDate}`);
      });

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    await closePool();
    process.exit(0);
  } catch (error) {
    console.error('❌ エラー:', error.message);
    await closePool();
    process.exit(1);
  }
}

viewUsers();
