/**
 * データベース初期化スクリプト
 * 開発環境でデータベースをリセットし、初期データを投入します
 */

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs = require('fs');

const DB_PATH = './matching.db';
const BCRYPT_SALT_ROUNDS = 12;

// 既存のデータベースを削除
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('🗑️ Existing database deleted');
}

// 新しいデータベースを作成
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Database creation error:', err.message);
    process.exit(1);
  }
  console.log('✅ Database created successfully');
});

// テーブル作成とデータ投入
db.serialize(async () => {
  console.log('\n📊 Creating tables...');

  // ユーザーテーブル
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    age INTEGER CHECK(age >= 18 AND age <= 100),
    bio TEXT,
    photo TEXT,
    is_admin BOOLEAN DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  )`);

  // インデックス
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)`);

  // スワイプテーブル
  db.run(`CREATE TABLE IF NOT EXISTS swipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    target_user_id INTEGER NOT NULL,
    is_like BOOLEAN NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, target_user_id)
  )`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON swipes(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_swipes_target_user_id ON swipes(target_user_id)`);

  // マッチテーブル
  db.run(`CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user1_id, user2_id)
  )`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id)`);

  // メッセージテーブル
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    is_deleted BOOLEAN DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)`);

  // 招待コードテーブル
  db.run(`CREATE TABLE IF NOT EXISTS invite_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT 0,
    used_by INTEGER,
    created_by INTEGER NOT NULL,
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    used_at INTEGER,
    expires_at INTEGER,
    FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code)`);

  console.log('✅ Tables created successfully');

  // ダミーデータ投入（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📝 Inserting sample data...');

    try {
      // 管理者ユーザー
      const adminPassword = await bcrypt.hash('admin123', BCRYPT_SALT_ROUNDS);
      const now = Math.floor(Date.now() / 1000);

      db.run(
        `INSERT INTO users (email, password, name, age, bio, is_admin, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['admin@example.com', adminPassword, 'Admin User', 30, 'System Administrator', 1, now],
        function(err) {
          if (err) {
            console.error('❌ Error creating admin user:', err.message);
          } else {
            console.log('✅ Admin user created (email: admin@example.com, password: admin123)');
            
            const adminId = this.lastID;

            // 招待コード生成
            db.run(
              `INSERT INTO invite_codes (code, created_by, max_uses, created_at) 
               VALUES (?, ?, ?, ?)`,
              ['WELCOME1', adminId, -1, now],
              (err) => {
                if (err) {
                  console.error('❌ Error creating invite code:', err.message);
                } else {
                  console.log('✅ Invite code created: WELCOME1 (unlimited uses)');
                }
              }
            );
          }
        }
      );

      // サンプルユーザー
      const sampleUsers = [
        { email: 'user1@example.com', password: 'password123', name: '田中 花子', age: 25, bio: 'カフェ巡りが趣味です☕' },
        { email: 'user2@example.com', password: 'password123', name: '佐藤 美咲', age: 28, bio: 'ヨガとピラティスのインストラクターしてます🧘‍♀️' },
        { email: 'user3@example.com', password: 'password123', name: '高橋 結衣', age: 26, bio: '都内でマーケターしてます📊' },
        { email: 'user4@example.com', password: 'password123', name: '鈴木 さくら', age: 24, bio: 'パティシエ修行中です🍰' },
        { email: 'user5@example.com', password: 'password123', name: '渡辺 あやか', age: 29, bio: '外資系コンサルで働いています💼' }
      ];

      let insertedUsers = 0;
      for (const user of sampleUsers) {
        const hashedPassword = await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS);
        db.run(
          `INSERT INTO users (email, password, name, age, bio, created_at) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [user.email, hashedPassword, user.name, user.age, user.bio, now],
          (err) => {
            if (err) {
              console.error(`❌ Error creating user ${user.email}:`, err.message);
            } else {
              insertedUsers++;
              console.log(`✅ Sample user created: ${user.email}`);
              
              if (insertedUsers === sampleUsers.length) {
                console.log('\n🎉 Database initialization complete!');
                console.log('\n📋 Summary:');
                console.log('   - Admin user: admin@example.com (password: admin123)');
                console.log('   - Sample users: 5 users created (password: password123)');
                console.log('   - Invite code: WELCOME1 (unlimited uses)');
                console.log('\n🚀 You can now start the server with: npm start');
                
                db.close((err) => {
                  if (err) {
                    console.error('❌ Error closing database:', err.message);
                  }
                  process.exit(0);
                });
              }
            }
          }
        );
      }
    } catch (error) {
      console.error('❌ Error during data insertion:', error.message);
      process.exit(1);
    }
  } else {
    console.log('\n✅ Database initialization complete (production mode - no sample data)');
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      }
      process.exit(0);
    });
  }
});
