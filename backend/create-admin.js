const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./matching.db');

// 管理者情報（ここを変更してください）
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'password123';
const ADMIN_NAME = '管理者';
const ADMIN_AGE = 25;

async function createAdmin() {
  try {
    // 既存のユーザーを確認
    db.get('SELECT * FROM users WHERE email = ?', [ADMIN_EMAIL], async (err, user) => {
      if (err) {
        console.error('エラー:', err);
        return;
      }

      if (user) {
        // 既にユーザーが存在する場合、管理者権限を付与
        db.run('UPDATE users SET is_admin = 1 WHERE email = ?', [ADMIN_EMAIL], (err) => {
          if (err) {
            console.error('エラー:', err);
          } else {
            console.log('✅ 既存のユーザーを管理者にしました！');
            console.log(`   メール: ${ADMIN_EMAIL}`);
            db.close();
          }
        });
      } else {
        // 新規管理者を作成
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        
        db.run(
          'INSERT INTO users (email, password, name, age, is_admin) VALUES (?, ?, ?, ?, 1)',
          [ADMIN_EMAIL, hashedPassword, ADMIN_NAME, ADMIN_AGE],
          function(err) {
            if (err) {
              console.error('エラー:', err);
            } else {
              console.log('✅ 管理者アカウントを作成しました！');
              console.log(`   メール: ${ADMIN_EMAIL}`);
              console.log(`   パスワード: ${ADMIN_PASSWORD}`);
              console.log(`   ID: ${this.lastID}`);
            }
            db.close();
          }
        );
      }
    });
  } catch (error) {
    console.error('エラー:', error);
    db.close();
  }
}

createAdmin();
