const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./matching.db');

console.log('=== データベース内容確認 ===\n');

// ユーザー数
db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
  if (err) {
    console.error('ユーザー数取得エラー:', err);
  } else {
    console.log(`📊 ユーザー数: ${row.count}`);
  }
  
  // ユーザー一覧
  db.all('SELECT id, email, name, age, is_admin, created_at FROM users', [], (err, users) => {
    if (err) {
      console.error('ユーザー取得エラー:', err);
    } else {
      console.log('\n👥 ユーザー一覧:');
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Age: ${user.age}, Admin: ${user.is_admin ? 'はい' : 'いいえ'}, 作成日: ${user.created_at}`);
      });
    }
    
    // 招待コード数
    db.get('SELECT COUNT(*) as count FROM invite_codes', [], (err, row) => {
      if (err) {
        console.error('招待コード数取得エラー:', err);
      } else {
        console.log(`\n🎫 招待コード数: ${row.count}`);
      }
      
      // 招待コード一覧
      db.all('SELECT code, is_used, max_uses, current_uses, created_at FROM invite_codes', [], (err, codes) => {
        if (err) {
          console.error('招待コード取得エラー:', err);
        } else {
          console.log('\n🎟️  招待コード一覧:');
          codes.forEach(code => {
            console.log(`  - コード: ${code.code}, 使用状況: ${code.current_uses}/${code.max_uses}, 作成日: ${code.created_at}`);
          });
        }
        
        // マッチ数
        db.get('SELECT COUNT(*) as count FROM matches', [], (err, row) => {
          if (err) {
            console.error('マッチ数取得エラー:', err);
          } else {
            console.log(`\n💕 マッチ数: ${row.count}`);
          }
          
          // メッセージ数
          db.get('SELECT COUNT(*) as count FROM messages', [], (err, row) => {
            if (err) {
              console.error('メッセージ数取得エラー:', err);
            } else {
              console.log(`💬 メッセージ数: ${row.count}`);
            }
            
            console.log('\n=== 確認完了 ===');
            db.close();
          });
        });
      });
    });
  });
});
