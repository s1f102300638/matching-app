/**
 * パスワードリセットツール（PostgreSQL版）
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const readline = require('readline');
const { query, closePool } = require('./db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║          🔑 パスワードリセットツール                ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

async function resetPassword() {
  try {
    // ユーザー一覧を表示
    const usersResult = await query('SELECT id, email, name FROM users ORDER BY id');
    const users = usersResult.rows;

    if (users.length === 0) {
      console.log('ユーザーが見つかりません。');
      await closePool();
      rl.close();
      process.exit(0);
      return;
    }

    console.log('📋 登録ユーザー一覧:\n');
    users.forEach(user => {
      console.log(`  ${user.id}. ${user.email} (${user.name})`);
    });

    console.log('\n');

    // ユーザーIDを入力
    rl.question('リセットするユーザーのID番号を入力してください: ', (userId) => {
      const user = users.find(u => u.id === parseInt(userId));

      if (!user) {
        console.log('❌ 無効なIDです。');
        closePool().then(() => {
          rl.close();
          process.exit(0);
        });
        return;
      }

      console.log(`\n選択されたユーザー: ${user.email} (${user.name})`);

      // 新しいパスワードを入力
      rl.question('\n新しいパスワードを入力してください: ', async (newPassword) => {
        if (newPassword.length < 6) {
          console.log('❌ パスワードは6文字以上である必要があります。');
          await closePool();
          rl.close();
          process.exit(0);
          return;
        }

        try {
          // パスワードをハッシュ化
          const hashedPassword = await bcrypt.hash(newPassword, 12);

          // データベースを更新
          const result = await query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, userId]
          );

          if (result.rowCount === 0) {
            console.error('❌ パスワード更新エラー: ユーザーが見つかりませんでした。');
          } else {
            console.log('\n✅ パスワードが正常にリセットされました！');
            console.log(`\n📧 メール: ${user.email}`);
            console.log(`🔑 新しいパスワード: ${newPassword}`);
            console.log('\nこの情報を安全な場所に保存してください。');
          }

          await closePool();
          rl.close();
          process.exit(0);
        } catch (error) {
          console.error('❌ エラー:', error.message);
          await closePool();
          rl.close();
          process.exit(1);
        }
      });
    });
  } catch (error) {
    console.error('❌ エラー:', error.message);
    await closePool();
    rl.close();
    process.exit(1);
  }
}

resetPassword();
