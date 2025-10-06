require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { query, pool, closePool } = require('./db');

const app = express();
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Helmetでセキュリティヘッダーを設定
app.use(helmet());

// 全APIエンドポイントへの一般的なレート制限
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

// ログイン・登録用の厳しいレート制限
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});
const PORT = process.env.PORT || 5000;

// 🔒 セキュリティ: JWT_SECRETは必須、フォールバック禁止
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ FATAL ERROR: JWT_SECRET environment variable is required.');
  console.error('Generate a secret key with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}

// 🔒 セキュリティ: パスワードハッシュのソルトラウンドを12に設定（より安全）
const BCRYPT_SALT_ROUNDS = 12;

// 環境設定
const NODE_ENV = process.env.NODE_ENV || 'development';
const DISABLE_INVITE_CODE = NODE_ENV === 'development';

// 🔒 CORS設定（本番環境用）- より厳格に
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback) {
    // originなしのリクエストを許可（Renderの内部ヘルスチェック、Postman等）
    if (!origin) {
      return callback(null, true);
    }
    
    // 許可されたoriginからのリクエスト
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
// レート制限を適用
app.use('/api/', generalLimiter);
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);
app.use(express.json({ limit: '10mb' })); // リクエストサイズ制限
app.use('/uploads', express.static('uploads'));

// アップロードディレクトリの作成
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// 🔒 Multerの設定（セキュリティ強化）
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // ファイル名をサニタイズ
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedExt = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + sanitizedExt);
  }
});

// 画像ファイルのみ許可
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB制限
});

// 🚀 データベーススキーマの初期化（改善版）
async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database schema...');

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

    // 📌 インデックス追加（パフォーマンス改善）
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

    // 📌 インデックス追加
    await query(`CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON swipes(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_swipes_target_user_id ON swipes(target_user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_swipes_created_at ON swipes(created_at)`);

    // マッチテーブル
    await query(`CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      UNIQUE(user1_id, user2_id)
    )`);

    // 📌 インデックス追加
    await query(`CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at)`);

    // メッセージテーブル（改善版）
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

    // 📌 インデックス追加
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)`);

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

    // 📌 インデックス追加
    await query(`CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_invite_codes_created_by ON invite_codes(created_by)`);

    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// データベーススキーマの初期化を実行
initializeDatabase().catch(err => {
  console.error('Fatal error during database initialization:', err);
  process.exit(1);
});

// 🛡️ ヘルパー関数: エラーレスポンスを統一
const sendErrorResponse = (res, statusCode, message, details = null) => {
  const response = { error: message };
  if (details && NODE_ENV === 'development') {
    response.details = details;
  }
  return res.status(statusCode).json(response);
};

// 🔒 認証ミドルウェア（改善版）
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendErrorResponse(res, 401, 'Authentication token required');
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return sendErrorResponse(res, 401, 'Token expired');
      }
      return sendErrorResponse(res, 403, 'Invalid token');
    }
    req.user = user;
    next();
  });
};

// 🔒 管理者認証ミドルウェア
const authenticateAdmin = async (req, res, next) => {
  authenticateToken(req, res, async () => {
    try {
      const result = await query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
      if (result.rows.length === 0 || !result.rows[0].is_admin) {
        return sendErrorResponse(res, 403, 'Admin access required');
      }
      next();
    } catch (error) {
      return sendErrorResponse(res, 500, 'Database error', error.message);
    }
  });
};

// 🎲 招待コード生成用のヘルパー関数
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 🔍 入力バリデーション関数
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

// ================================
// 🌐 API エンドポイント
// ================================

// ❤️ ヘルスチェックエンドポイント（改善版）
app.get('/health', async (req, res) => {
  try {
    // データベース接続をチェック
    await query('SELECT 1');
    
    res.status(200).json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: NODE_ENV,
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error',
      message: 'Database unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// ⚠️ TEMP ADMIN SETUP ENDPOINT - 本番では削除すること
app.post('/api/setup-admin', async (req, res) => {
  const { email, secretKey } = req.body;
  
  if (!email || !secretKey) {
    return sendErrorResponse(res, 400, 'Email and secret key are required');
  }
  
  const ADMIN_SETUP_SECRET = process.env.ADMIN_SETUP_SECRET;
  if (!ADMIN_SETUP_SECRET) {
    return sendErrorResponse(res, 500, 'Admin setup is not configured');
  }
  
  if (secretKey !== ADMIN_SETUP_SECRET) {
    return sendErrorResponse(res, 403, 'Invalid secret key');
  }
  
  try {
    const result = await query(
      'UPDATE users SET is_admin = TRUE WHERE email = $1',
      [email]
    );
    
    if (result.rowCount === 0) {
      return sendErrorResponse(res, 404, 'User not found');
    }
    
    res.json({ success: true, message: 'Admin privileges granted' });
  } catch (error) {
    return sendErrorResponse(res, 500, 'Database error', error.message);
  }
});

// 📧 招待コード検証
app.post('/api/verify-invite-code', async (req, res) => {
  if (DISABLE_INVITE_CODE) {
    return res.json({ valid: true, message: 'Invite code check disabled (development mode)' });
  }
  
  const { code } = req.body;

  if (!code) {
    return sendErrorResponse(res, 400, 'Invite code is required');
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const result = await query(
      `SELECT * FROM invite_codes 
       WHERE code = $1 
       AND (expires_at IS NULL OR expires_at > $2)
       AND (max_uses = -1 OR current_uses < max_uses)`,
      [code, now]
    );

    if (result.rows.length === 0) {
      return sendErrorResponse(res, 400, 'Invalid or expired invite code');
    }

    res.json({ valid: true });
  } catch (error) {
    return sendErrorResponse(res, 500, 'Database error', error.message);
  }
});

// 📝 ユーザー登録（改善版）
app.post('/api/register', async (req, res) => {
  const { email, password, name, age, bio, inviteCode } = req.body;

  // 🔍 入力バリデーション
  if (!email || !password || !name || !age) {
    return sendErrorResponse(res, 400, 'Email, password, name, and age are required');
  }

  if (!validateEmail(email)) {
    return sendErrorResponse(res, 400, 'Invalid email format');
  }

  if (!validatePassword(password)) {
    return sendErrorResponse(res, 400, 'Password must be at least 6 characters');
  }

  if (age < 18 || age > 100) {
    return sendErrorResponse(res, 400, 'Age must be between 18 and 100');
  }

  try {
    // 開発モード: 招待コードチェックをスキップ
    if (DISABLE_INVITE_CODE) {
      console.log('⚠️ Development mode: Skipping invite code validation');
      
      const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      
      const result = await query(
        'INSERT INTO users (email, password, name, age, bio) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [email, hashedPassword, name, age, bio || null]
      );

      const userId = result.rows[0].id;
      const token = jwt.sign(
        { id: userId, email }, 
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.status(201).json({ 
        token, 
        user: { id: userId, email, name, age, bio: bio || null } 
      });
    }

    // 本番モード: 招待コードの検証
    if (!inviteCode) {
      return sendErrorResponse(res, 400, 'Invite code is required');
    }

    const now = Math.floor(Date.now() / 1000);
    const codeResult = await query(
      `SELECT * FROM invite_codes 
       WHERE code = $1 
       AND (expires_at IS NULL OR expires_at > $2)
       AND (max_uses = -1 OR current_uses < max_uses)`,
      [inviteCode, now]
    );

    if (codeResult.rows.length === 0) {
      return sendErrorResponse(res, 400, 'Invalid or expired invite code');
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    
    const result = await query(
      'INSERT INTO users (email, password, name, age, bio) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [email, hashedPassword, name, age, bio || null]
    );

    const userId = result.rows[0].id;

    // 招待コードの使用回数を更新
    await query(
      'UPDATE invite_codes SET current_uses = current_uses + 1, used_at = $1 WHERE code = $2',
      [now, inviteCode]
    );

    const token = jwt.sign(
      { id: userId, email }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ 
      token, 
      user: { id: userId, email, name, age, bio: bio || null } 
    });
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return sendErrorResponse(res, 409, 'Email address already registered');
    }
    return sendErrorResponse(res, 500, 'Database error', error.message);
  }
});

// 🔐 ログイン（改善版）
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // 入力バリデーション
  if (!email || !password) {
    return sendErrorResponse(res, 400, 'Email and password are required');
  }

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return sendErrorResponse(res, 401, 'Invalid email or password');
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return sendErrorResponse(res, 401, 'Invalid email or password');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    delete user.password; // パスワードハッシュを除外
    res.json({ token, user });
  } catch (error) {
    return sendErrorResponse(res, 500, 'Database error', error.message);
  }
});

// 👤 プロフィール取得
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, name, age, bio, photo, is_admin, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return sendErrorResponse(res, 404, 'User not found');
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    return sendErrorResponse(res, 500, 'Database error', error.message);
  }
});

// ✏️ プロフィール更新
app.put('/api/profile', authenticateToken, async (req, res) => {
  const { name, age, bio } = req.body;
  
  // バリデーション
  if (age && (age < 18 || age > 100)) {
    return sendErrorResponse(res, 400, 'Age must be between 18 and 100');
  }
  
  try {
    const now = Math.floor(Date.now() / 1000);
    const result = await query(
      'UPDATE users SET name = $1, age = $2, bio = $3, updated_at = $4 WHERE id = $5',
      [name, age, bio || null, now, req.user.id]
    );
    
    if (result.rowCount === 0) {
      return sendErrorResponse(res, 404, 'User not found');
    }
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    return sendErrorResponse(res, 500, 'Database error', error.message);
  }
});

// 📸 プロフィール写真アップロード
app.post('/api/upload-photo', authenticateToken, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return sendErrorResponse(res, 400, 'No file uploaded');
  }

  const photoUrl = `/uploads/${req.file.filename}`;
  const now = Math.floor(Date.now() / 1000);
  
  try {
    await query(
      'UPDATE users SET photo = $1, updated_at = $2 WHERE id = $3',
      [photoUrl, now, req.user.id]
    );
    
    res.json({ photoUrl, message: 'Photo uploaded successfully' });
  } catch (error) {
    // ファイルを削除
    fs.unlinkSync(req.file.path);
    return sendErrorResponse(res, 500, 'Database error', error.message);
  }
});

// 🔍 候補ユーザー取得（ページネーション対応）
app.get('/api/candidates', authenticateToken, async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  
  if (limit > 50) {
    return sendErrorResponse(res, 400, 'Limit cannot exceed 50');
  }

  try {
    const result = await query(`
      SELECT id, name, age, bio, photo 
      FROM users 
      WHERE id != $1 
      AND id NOT IN (
        SELECT target_user_id FROM swipes WHERE user_id = $1
      )
      ORDER BY RANDOM()
      LIMIT $2 OFFSET $3
    `, [req.user.id, limit, offset]);
    
    res.json({ users: result.rows, limit, offset, count: result.rows.length });
  } catch (error) {
    return sendErrorResponse(res, 500, 'Database error', error.message);
  }
});

// 💖 スワイプ（Like/Pass）
app.post('/api/swipes', authenticateToken, async (req, res) => {
  const { targetUserId, isLike } = req.body;
  
  if (!targetUserId || typeof isLike !== 'boolean') {
    return sendErrorResponse(res, 400, 'targetUserId and isLike are required');
  }

  // 自分自身へのスワイプを防ぐ
  if (targetUserId === req.user.id) {
    return sendErrorResponse(res, 400, 'Cannot swipe on yourself');
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    
    await query(
      'INSERT INTO swipes (user_id, target_user_id, is_like, created_at) VALUES ($1, $2, $3, $4)',
      [req.user.id, targetUserId, isLike, now]
    );

    // マッチング確認
    if (isLike) {
      const mutualLikeResult = await query(
        'SELECT * FROM swipes WHERE user_id = $1 AND target_user_id = $2 AND is_like = TRUE',
        [targetUserId, req.user.id]
      );

      if (mutualLikeResult.rows.length > 0) {
        // マッチング成立
        const user1_id = Math.min(req.user.id, targetUserId);
        const user2_id = Math.max(req.user.id, targetUserId);
        
        await query(
          'INSERT INTO matches (user1_id, user2_id, created_at) VALUES ($1, $2, $3)',
          [user1_id, user2_id, now]
        );
        
        return res.json({ matched: true, message: 'It\'s a match!' });
      }
    }
    
    res.json({ matched: false });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return sendErrorResponse(res, 409, 'Already swiped on this user');
    }
    return sendErrorResponse(res, 500, 'Database error', error.message);
  }
});

// 💬 マッチリスト取得（ページネーション対応）
app.get('/api/matches', authenticateToken, async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  
  if (limit > 100) {
    return sendErrorResponse(res, 400, 'Limit cannot exceed 100');
  }

  try {
    const result = await query(`
      SELECT 
        m.id as match_id,
        u.id as user_id,
        u.name,
        u.age,
        u.bio,
        u.photo,
        m.created_at
      FROM matches m
      JOIN users u ON (
        CASE 
          WHEN m.user1_id = $1 THEN m.user2_id = u.id
          WHEN m.user2_id = $1 THEN m.user1_id = u.id
        END
      )
      WHERE m.user1_id = $1 OR m.user2_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, limit, offset]);
    
    res.json({ matches: result.rows, limit, offset, count: result.rows.length });
  } catch (error) {
    return sendErrorResponse(res, 500, 'Database error', error.message);
  }
});

// 💌 メッセージ送信
app.post('/api/messages', authenticateToken, async (req, res) => {
  const { matchId, content } = req.body;
  
  if (!matchId || !content) {
    return sendErrorResponse(res, 400, 'matchId and content are required');
  }

  if (content.length > 1000) {
    return sendErrorResponse(res, 400, 'Message content too long (max 1000 characters)');
  }
  
  try {
    // マッチの確認
    const matchResult = await query(
      'SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [matchId, req.user.id]
    );
    
    if (matchResult.rows.length === 0) {
      return sendErrorResponse(res, 403, 'You are not part of this match');
    }
    
    const now = Math.floor(Date.now() / 1000);
    const result = await query(
      'INSERT INTO messages (match_id, sender_id, content, created_at) VALUES ($1, $2, $3, $4) RETURNING id',
      [matchId, req.user.id, content, now]
    );
    
    res.status(201).json({ 
      id: result.rows[0].id, 
      matchId, 
      senderId: req.user.id, 
      content,
      createdAt: now,
      message: 'Message sent successfully'
    });
  } catch (error) {
    return sendErrorResponse(res, 500, 'Database error', error.message);
  }
});

// 📨 メッセージ取得（ページネーション対応）
app.get('/api/messages/:matchId', authenticateToken, async (req, res) => {
  const { matchId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  if (limit > 100) {
    return sendErrorResponse(res, 400, 'Limit cannot exceed 100');
  }
  
  try {
    // マッチの確認
    const matchResult = await query(
      'SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [matchId, req.user.id]
    );
    
    if (matchResult.rows.length === 0) {
      return sendErrorResponse(res, 403, 'You are not part of this match');
    }
    
    const messagesResult = await query(
      `SELECT id, sender_id, content, is_read, created_at 
       FROM messages 
       WHERE match_id = $1 AND is_deleted = FALSE 
       ORDER BY created_at ASC
       LIMIT $2 OFFSET $3`,
      [matchId, limit, offset]
    );
    
    res.json({ messages: messagesResult.rows, limit, offset, count: messagesResult.rows.length });
  } catch (error) {
    return sendErrorResponse(res, 500, 'Database error', error.message);
  }
});

// ================================
// 🔐 管理者用エンドポイント
// ================================

// 🎟️ 招待コード生成
app.post('/api/admin/invite-codes', authenticateAdmin, async (req, res) => {
  const { maxUses = 1, expiresInDays = null } = req.body;
  const code = generateInviteCode();
  
  let expiresAt = null;
  if (expiresInDays) {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + expiresInDays);
    expiresAt = Math.floor(expireDate.getTime() / 1000);
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const result = await query(
      'INSERT INTO invite_codes (code, created_by, max_uses, expires_at, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [code, req.user.id, maxUses, expiresAt, now]
    );
    
    res.status(201).json({ 
      id: result.rows[0].id, 
      code, 
      maxUses, 
      expiresAt,
      message: 'Invite code generated successfully' 
    });
  } catch (error) {
    return sendErrorResponse(res, 500, 'Database error', error.message);
  }
});

// 📋 招待コード一覧取得
app.get('/api/admin/invite-codes', authenticateAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        ic.*,
        u.name as created_by_name
      FROM invite_codes ic
      LEFT JOIN users u ON ic.created_by = u.id
      ORDER BY ic.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    return sendErrorResponse(res, 500, 'Database error', error.message);
  }
});

// 🗑️ 招待コード削除
app.delete('/api/admin/invite-codes/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await query('DELETE FROM invite_codes WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return sendErrorResponse(res, 404, 'Invite code not found');
    }
    
    res.json({ success: true, message: 'Invite code deleted successfully' });
  } catch (error) {
    return sendErrorResponse(res, 500, 'Database error', error.message);
  }
});

// 👥 ユーザー一覧取得
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, name, age, bio, photo, is_admin, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json(result.rows);
  } catch (error) {
    return sendErrorResponse(res, 500, 'Database error', error.message);
  }
});

// 📊 統計情報取得
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const [usersResult, matchesResult, messagesResult, codesResult, usedCodesResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users'),
      query('SELECT COUNT(*) as count FROM matches'),
      query('SELECT COUNT(*) as count FROM messages'),
      query('SELECT COUNT(*) as count FROM invite_codes'),
      query('SELECT COUNT(*) as count FROM invite_codes WHERE current_uses > 0')
    ]);
    
    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalMatches: parseInt(matchesResult.rows[0].count),
      totalMessages: parseInt(messagesResult.rows[0].count),
      totalInviteCodes: parseInt(codesResult.rows[0].count),
      usedInviteCodes: parseInt(usedCodesResult.rows[0].count)
    });
  } catch (error) {
    return sendErrorResponse(res, 500, 'Database error', error.message);
  }
});

// 🚫 404エラーハンドラー
app.use((req, res) => {
  sendErrorResponse(res, 404, 'Endpoint not found');
});

// ⚠️ グローバルエラーハンドラー
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  sendErrorResponse(res, 500, 'Internal server error', err.message);
});

// 🚀 サーバー起動
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${NODE_ENV}`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
  if (DISABLE_INVITE_CODE) {
    console.log('⚠️ WARNING: Invite code check is disabled (development mode)');
  } else {
    console.log('✅ Invite code check is enabled (production mode)');
  }
});

// 🛑 Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  try {
    await closePool();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});
