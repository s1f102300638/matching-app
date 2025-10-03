// Renderで実行: 管理者フラグを設定
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./matching.db');

const email = 'magic.0923@icloud.com';

db.run(
  'UPDATE users SET is_admin = 1 WHERE email = ?',
  [email],
  function(err) {
    if (err) {
      console.error('エラー:', err.message);
      process.exit(1);
    }
    
    if (this.changes === 0) {
      console.error(`ユーザーが見つかりません: ${email}`);
      process.exit(1);
    }
    
    console.log(`✅ ${email} を管理者に設定しました`);
    
    // 確認
    db.get(
      'SELECT id, email, name, is_admin FROM users WHERE email = ?',
      [email],
      (err, user) => {
        if (err) {
          console.error('確認エラー:', err);
        } else {
          console.log('確認:', user);
        }
        db.close();
      }
    );
  }
);
