/**
 * データベース初期化スクリプト（PostgreSQL版）
 * 開発環境でデータベースをリセットし、初期データを投入します
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query, closePool } = require('./db');

const BCRYPT_SALT_ROUNDS = 12;

/**
 * テーブル削除（リセット用）
 */
async function dropTables() {
  console.log('\n🗑️ Dropping existing tables...');
  
  try {
    await query('DROP TABLE IF EXISTS messages CASCADE');
    await query('DROP TABLE IF EXISTS matches CASCADE');
    await query('DROP TABLE IF EXISTS swipes CASCADE');
    await query('DROP TABLE IF EXISTS invite_codes CASCADE');
    await query('DROP TABLE IF EXISTS users CASCADE');
    
    console.log('✅ Tables dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping tables:', error.message);
    throw error;
  }
}

/**
 * テーブル作成
 */
async function createTables() {
  console.log('\n📊 Creating tables...');

  try {
    // ユーザーテーブル
    await query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      age INTEGER CHECK(age >= 18 AND age <= 100),
      bio TEXT,
      photo VARCHAR(500),
      is_admin BOOLEAN DEFAULT FALSE,
      created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    )`);

    // インデックス
    await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)`);

    // スワイプテーブル
    await query(`CREATE TABLE IF NOT EXISTS swipes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      is_like BOOLEAN NOT NULL,
      created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      UNIQUE(user_id, target_user_id)
    )`);

    await query(`CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON swipes(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_swipes_target_user_id ON swipes(target_user_id)`);

    // マッチテーブル
    await query(`CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      UNIQUE(user1_id, user2_id)
    )`);

    await query(`CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id)`);

    // メッセージテーブル
    await query(`CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    )`);

    await query(`CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)`);

    // 招待コードテーブル
    await query(`CREATE TABLE IF NOT EXISTS invite_codes (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      is_used BOOLEAN DEFAULT FALSE,
      used_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      max_uses INTEGER DEFAULT 1,
      current_uses INTEGER DEFAULT 0,
      created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      used_at BIGINT,
      expires_at BIGINT
    )`);

    await query(`CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code)`);

    console.log('✅ Tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  }
}

/**
 * サンプルデータ投入
 */
async function insertSampleData() {
  console.log('\n📝 Inserting sample data...');

  try {
    const now = Math.floor(Date.now() / 1000);

    // 管理者ユーザー
    const adminPassword = await bcrypt.hash('admin123', BCRYPT_SALT_ROUNDS);
    const adminResult = await query(
      `INSERT INTO users (email, password, name, age, bio, is_admin, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      ['admin@example.com', adminPassword, 'Admin User', 30, 'System Administrator', true, now]
    );

    const adminId = adminResult.rows[0].id;
    console.log('✅ Admin user created (email: admin@example.com, password: admin123)');

    // 招待コード生成
    await query(
      `INSERT INTO invite_codes (code, created_by, max_uses, created_at) 
       VALUES ($1, $2, $3, $4)`,
      ['WELCOME1', adminId, -1, now]
    );
    console.log('✅ Invite code created: WELCOME1 (unlimited uses)');

    // サンプルユーザー
    const sampleUsers = [
      { email: 'user1@example.com', password: 'password123', name: '田中 花子', age: 25, bio: 'カフェ巡りが趣味です☕' },
      { email: 'user2@example.com', password: 'password123', name: '佐藤 美咲', age: 28, bio: 'ヨガとピラティスのインストラクターしてます🧘‍♀️' },
      { email: 'user3@example.com', password: 'password123', name: '高橋 結衣', age: 26, bio: '都内でマーケターしてます📊' },
      { email: 'user4@example.com', password: 'password123', name: '鈴木 さくら', age: 24, bio: 'パティシエ修行中です🍰' },
      { email: 'user5@example.com', password: 'password123', name: '渡辺 あやか', age: 29, bio: '外資系コンサルで働いています💼' }
    ];

    for (const user of sampleUsers) {
      const hashedPassword = await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS);
      await query(
        `INSERT INTO users (email, password, name, age, bio, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.email, hashedPassword, user.name, user.age, user.bio, now]
      );
      console.log(`✅ Sample user created: ${user.email}`);
    }

    console.log('\n🎉 Database initialization complete!');
    console.log('\n📋 Summary:');
    console.log('   - Admin user: admin@example.com (password: admin123)');
    console.log('   - Sample users: 5 users created (password: password123)');
    console.log('   - Invite code: WELCOME1 (unlimited uses)');
    console.log('\n🚀 You can now start the server with: npm start');
  } catch (error) {
    console.error('❌ Error inserting sample data:', error.message);
    throw error;
  }
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     🔄 PostgreSQL データベース初期化スクリプト       ║');
    console.log('╚════════════════════════════════════════════════════════╝');

    // テーブル削除（リセット）
    await dropTables();

    // テーブル作成
    await createTables();

    // サンプルデータ投入（開発環境のみ）
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
      await insertSampleData();
    } else {
      console.log('\n✅ Database initialization complete (production mode - no sample data)');
    }

    // 接続終了
    await closePool();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error during database initialization:', error);
    await closePool();
    process.exit(1);
  }
}

// スクリプト実行
main();
