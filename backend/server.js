require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
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
    // 本番環境ではoriginなしのリクエストをブロック
    if (!origin && NODE_ENV === 'production') {
      return callback(new Error('Origin header is required'));
    }
    
    // 開発環境のみoriginなしを許可（Postman等のテスト用）
    if (!origin && NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

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

// データベースの初期化
const db = new sqlite3.Database('./matching.db', (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// 🚀 データベーススキーマの初期化（改善版）
db.serialize(() => {
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

  // 📌 インデックス追加（パフォーマンス改善）
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

  // 📌 インデックス追加
  db.run(`CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON swipes(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_swipes_target_user_id ON swipes(target_user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_swipes_created_at ON swipes(created_at)`);

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

  // 📌 インデックス追加
  db.run(`CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at)`);

  // メッセージテーブル（改善版）
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

  // 📌 インデックス追加
  db.run(`CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)`);

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

  // 📌 インデックス追加
  db.run(`CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_invite_codes_created_by ON invite_codes(created_by)`);
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
const authenticateAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    db.get('SELECT is_admin FROM users WHERE id = ?', [req.user.id], (err, user) => {
      if (err) {
        return sendErrorResponse(res, 500, 'Database error', err.message);
      }
      if (!user || !user.is_admin) {
        return sendErrorResponse(res, 403, 'Admin access required');
      }
      next();
    });
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
app.get('/health', (req, res) => {
  // データベース接続をチェック
  db.get('SELECT 1', (err) => {
    if (err) {
      return res.status(503).json({ 
        status: 'error',
        message: 'Database unavailable',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: NODE_ENV,
      database: 'connected'
    });
  });
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
  
  db.run(
    'UPDATE users SET is_admin = 1 WHERE email = ?',
    [email],
    function(err) {
      if (err) {
        return sendErrorResponse(res, 500, 'Database error', err.message);
      }
      
      if (this.changes === 0) {
        return sendErrorResponse(res, 404, 'User not found');
      }
      
      res.json({ success: true, message: 'Admin privileges granted' });
    }
  );
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

  const now = Math.floor(Date.now() / 1000);
  db.get(
    `SELECT * FROM invite_codes 
     WHERE code = ? 
     AND (expires_at IS NULL OR expires_at > ?)
     AND (max_uses = -1 OR current_uses < max_uses)`,
    [code, now],
    (err, inviteCode) => {
      if (err) {
        return sendErrorResponse(res, 500, 'Database error', err.message);
      }

      if (!inviteCode) {
        return sendErrorResponse(res, 400, 'Invalid or expired invite code');
      }

      res.json({ valid: true });
    }
  );
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

  // 開発モード: 招待コードチェックをスキップ
  if (DISABLE_INVITE_CODE) {
    console.log('⚠️ Development mode: Skipping invite code validation');
    
    try {
      const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      
      db.run(
        'INSERT INTO users (email, password, name, age, bio) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, name, age, bio || null],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              return sendErrorResponse(res, 409, 'Email address already registered');
            }
            return sendErrorResponse(res, 500, 'Database error', err.message);
          }

          const userId = this.lastID;
          const token = jwt.sign(
            { id: userId, email }, 
            JWT_SECRET,
            { expiresIn: '7d' } // トークンの有効期限を設定
          );
          res.status(201).json({ 
            token, 
            user: { id: userId, email, name, age, bio: bio || null } 
          });
        }
      );
    } catch (error) {
      return sendErrorResponse(res, 500, 'Server error', error.message);
    }
    return;
  }

  // 本番モード: 招待コードの検証
  if (!inviteCode) {
    return sendErrorResponse(res, 400, 'Invite code is required');
  }

  const now = Math.floor(Date.now() / 1000);
  db.get(
    `SELECT * FROM invite_codes 
     WHERE code = ? 
     AND (expires_at IS NULL OR expires_at > ?)
     AND (max_uses = -1 OR current_uses < max_uses)`,
    [inviteCode, now],
    async (err, code) => {
      if (err) {
        return sendErrorResponse(res, 500, 'Database error', err.message);
      }

      if (!code) {
        return sendErrorResponse(res, 400, 'Invalid or expired invite code');
      }

      try {
        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        
        db.run(
          'INSERT INTO users (email, password, name, age, bio) VALUES (?, ?, ?, ?, ?)',
          [email, hashedPassword, name, age, bio || null],
          function(err) {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed')) {
                return sendErrorResponse(res, 409, 'Email address already registered');
              }
              return sendErrorResponse(res, 500, 'Database error', err.message);
            }

            const userId = this.lastID;

            // 招待コードの使用回数を更新
            db.run(
              'UPDATE invite_codes SET current_uses = current_uses + 1, used_at = ? WHERE code = ?',
              [now, inviteCode],
              (err) => {
                if (err) {
                  return sendErrorResponse(res, 500, 'Database error', err.message);
                }

                const token = jwt.sign(
                  { id: userId, email }, 
                  JWT_SECRET,
                  { expiresIn: '7d' }
                );
                res.status(201).json({ 
                  token, 
                  user: { id: userId, email, name, age, bio: bio || null } 
                });
              }
            );
          }
        );
      } catch (error) {
        return sendErrorResponse(res, 500, 'Server error', error.message);
      }
    }
  );
});

// 🔐 ログイン（改善版）
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // 入力バリデーション
  if (!email || !password) {
    return sendErrorResponse(res, 400, 'Email and password are required');
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return sendErrorResponse(res, 500, 'Database error', err.message);
    }

    if (!user) {
      return sendErrorResponse(res, 401, 'Invalid email or password');
    }

    try {
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
      return sendErrorResponse(res, 500, 'Server error', error.message);
    }
  });
});

// 👤 プロフィール取得
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, email, name, age, bio, photo, is_admin, created_at FROM users WHERE id = ?', 
    [req.user.id], 
    (err, user) => {
      if (err) {
        return sendErrorResponse(res, 500, 'Database error', err.message);
      }
      if (!user) {
        return sendErrorResponse(res, 404, 'User not found');
      }
      res.json(user);
    }
  );
});

// ✏️ プロフィール更新
app.put('/api/profile', authenticateToken, (req, res) => {
  const { name, age, bio } = req.body;
  
  // バリデーション
  if (age && (age < 18 || age > 100)) {
    return sendErrorResponse(res, 400, 'Age must be between 18 and 100');
  }
  
  const now = Math.floor(Date.now() / 1000);
  db.run(
    'UPDATE users SET name = ?, age = ?, bio = ?, updated_at = ? WHERE id = ?',
    [name, age, bio || null, now, req.user.id],
    function(err) {
      if (err) {
        return sendErrorResponse(res, 500, 'Database error', err.message);
      }
      if (this.changes === 0) {
        return sendErrorResponse(res, 404, 'User not found');
      }
      res.json({ success: true, message: 'Profile updated successfully' });
    }
  );
});

// 📸 プロフィール写真アップロード
app.post('/api/upload-photo', authenticateToken, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return sendErrorResponse(res, 400, 'No file uploaded');
  }

  const photoUrl = `/uploads/${req.file.filename}`;
  const now = Math.floor(Date.now() / 1000);
  
  db.run(
    'UPDATE users SET photo = ?, updated_at = ? WHERE id = ?',
    [photoUrl, now, req.user.id],
    function(err) {
      if (err) {
        // ファイルを削除
        fs.unlinkSync(req.file.path);
        return sendErrorResponse(res, 500, 'Database error', err.message);
      }
      res.json({ photoUrl, message: 'Photo uploaded successfully' });
    }
  );
});

// 🔍 候補ユーザー取得（ページネーション対応）
app.get('/api/candidates', authenticateToken, (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  
  if (limit > 50) {
    return sendErrorResponse(res, 400, 'Limit cannot exceed 50');
  }

  const query = `
    SELECT id, name, age, bio, photo 
    FROM users 
    WHERE id != ? 
    AND id NOT IN (
      SELECT target_user_id FROM swipes WHERE user_id = ?
    )
    ORDER BY RANDOM()
    LIMIT ? OFFSET ?
  `;
  
  db.all(query, [req.user.id, req.user.id, limit, offset], (err, users) => {
    if (err) {
      return sendErrorResponse(res, 500, 'Database error', err.message);
    }
    res.json({ users, limit, offset, count: users.length });
  });
});

// 💖 スワイプ（Like/Pass）
app.post('/api/swipes', authenticateToken, (req, res) => {
  const { targetUserId, isLike } = req.body;
  
  if (!targetUserId || typeof isLike !== 'boolean') {
    return sendErrorResponse(res, 400, 'targetUserId and isLike are required');
  }

  // 自分自身へのスワイプを防ぐ
  if (targetUserId === req.user.id) {
    return sendErrorResponse(res, 400, 'Cannot swipe on yourself');
  }

  const now = Math.floor(Date.now() / 1000);
  
  db.run(
    'INSERT INTO swipes (user_id, target_user_id, is_like, created_at) VALUES (?, ?, ?, ?)',
    [req.user.id, targetUserId, isLike ? 1 : 0, now],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return sendErrorResponse(res, 409, 'Already swiped on this user');
        }
        return sendErrorResponse(res, 500, 'Database error', err.message);
      }

      // マッチング確認
      if (isLike) {
        db.get(
          'SELECT * FROM swipes WHERE user_id = ? AND target_user_id = ? AND is_like = 1',
          [targetUserId, req.user.id],
          (err, mutualLike) => {
            if (err) {
              return sendErrorResponse(res, 500, 'Database error', err.message);
            }

            if (mutualLike) {
              // マッチング成立
              const user1_id = Math.min(req.user.id, targetUserId);
              const user2_id = Math.max(req.user.id, targetUserId);
              
              db.run(
                'INSERT INTO matches (user1_id, user2_id, created_at) VALUES (?, ?, ?)',
                [user1_id, user2_id, now],
                (err) => {
                  if (err) {
                    return sendErrorResponse(res, 500, 'Database error', err.message);
                  }
                  res.json({ matched: true, message: 'It\'s a match!' });
                }
              );
            } else {
              res.json({ matched: false });
            }
          }
        );
      } else {
        res.json({ matched: false });
      }
    }
  );
});

// 💬 マッチリスト取得（ページネーション対応）
app.get('/api/matches', authenticateToken, (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  
  if (limit > 100) {
    return sendErrorResponse(res, 400, 'Limit cannot exceed 100');
  }

  const query = `
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
        WHEN m.user1_id = ? THEN m.user2_id = u.id
        WHEN m.user2_id = ? THEN m.user1_id = u.id
      END
    )
    WHERE m.user1_id = ? OR m.user2_id = ?
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  db.all(
    query, 
    [req.user.id, req.user.id, req.user.id, req.user.id, limit, offset], 
    (err, matches) => {
      if (err) {
        return sendErrorResponse(res, 500, 'Database error', err.message);
      }
      res.json({ matches, limit, offset, count: matches.length });
    }
  );
});

// 💌 メッセージ送信
app.post('/api/messages', authenticateToken, (req, res) => {
  const { matchId, content } = req.body;
  
  if (!matchId || !content) {
    return sendErrorResponse(res, 400, 'matchId and content are required');
  }

  if (content.length > 1000) {
    return sendErrorResponse(res, 400, 'Message content too long (max 1000 characters)');
  }
  
  // マッチの確認
  db.get(
    'SELECT * FROM matches WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
    [matchId, req.user.id, req.user.id],
    (err, match) => {
      if (err) {
        return sendErrorResponse(res, 500, 'Database error', err.message);
      }
      
      if (!match) {
        return sendErrorResponse(res, 403, 'You are not part of this match');
      }
      
      const now = Math.floor(Date.now() / 1000);
      db.run(
        'INSERT INTO messages (match_id, sender_id, content, created_at) VALUES (?, ?, ?, ?)',
        [matchId, req.user.id, content, now],
        function(err) {
          if (err) {
            return sendErrorResponse(res, 500, 'Database error', err.message);
          }
          res.status(201).json({ 
            id: this.lastID, 
            matchId, 
            senderId: req.user.id, 
            content,
            createdAt: now,
            message: 'Message sent successfully'
          });
        }
      );
    }
  );
});

// 📨 メッセージ取得（ページネーション対応）
app.get('/api/messages/:matchId', authenticateToken, (req, res) => {
  const { matchId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  if (limit > 100) {
    return sendErrorResponse(res, 400, 'Limit cannot exceed 100');
  }
  
  // マッチの確認
  db.get(
    'SELECT * FROM matches WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
    [matchId, req.user.id, req.user.id],
    (err, match) => {
      if (err) {
        return sendErrorResponse(res, 500, 'Database error', err.message);
      }
      
      if (!match) {
        return sendErrorResponse(res, 403, 'You are not part of this match');
      }
      
      db.all(
        `SELECT id, sender_id, content, is_read, created_at 
         FROM messages 
         WHERE match_id = ? AND is_deleted = 0 
         ORDER BY created_at ASC
         LIMIT ? OFFSET ?`,
        [matchId, limit, offset],
        (err, messages) => {
          if (err) {
            return sendErrorResponse(res, 500, 'Database error', err.message);
          }
          res.json({ messages, limit, offset, count: messages.length });
        }
      );
    }
  );
});

// ================================
// 🔐 管理者用エンドポイント
// ================================

// 🎟️ 招待コード生成
app.post('/api/admin/invite-codes', authenticateAdmin, (req, res) => {
  const { maxUses = 1, expiresInDays = null } = req.body;
  const code = generateInviteCode();
  
  let expiresAt = null;
  if (expiresInDays) {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + expiresInDays);
    expiresAt = Math.floor(expireDate.getTime() / 1000);
  }

  const now = Math.floor(Date.now() / 1000);
  db.run(
    'INSERT INTO invite_codes (code, created_by, max_uses, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
    [code, req.user.id, maxUses, expiresAt, now],
    function(err) {
      if (err) {
        return sendErrorResponse(res, 500, 'Database error', err.message);
      }
      res.status(201).json({ 
        id: this.lastID, 
        code, 
        maxUses, 
        expiresAt,
        message: 'Invite code generated successfully' 
      });
    }
  );
});

// 📋 招待コード一覧取得
app.get('/api/admin/invite-codes', authenticateAdmin, (req, res) => {
  db.all(
    `SELECT 
      ic.*,
      u.name as created_by_name
     FROM invite_codes ic
     LEFT JOIN users u ON ic.created_by = u.id
     ORDER BY ic.created_at DESC`,
    [],
    (err, codes) => {
      if (err) {
        return sendErrorResponse(res, 500, 'Database error', err.message);
      }
      res.json(codes);
    }
  );
});

// 🗑️ 招待コード削除
app.delete('/api/admin/invite-codes/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM invite_codes WHERE id = ?', [id], function(err) {
    if (err) {
      return sendErrorResponse(res, 500, 'Database error', err.message);
    }
    if (this.changes === 0) {
      return sendErrorResponse(res, 404, 'Invite code not found');
    }
    res.json({ success: true, message: 'Invite code deleted successfully' });
  });
});

// 👥 ユーザー一覧取得
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
  db.all(
    'SELECT id, email, name, age, bio, photo, is_admin, created_at FROM users ORDER BY created_at DESC',
    [],
    (err, users) => {
      if (err) {
        return sendErrorResponse(res, 500, 'Database error', err.message);
      }
      res.json(users);
    }
  );
});

// 📊 統計情報取得
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
  const stats = {};
  
  Promise.all([
    new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users', [], (err, result) => {
        if (err) reject(err);
        else resolve({ totalUsers: result.count });
      });
    }),
    new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM matches', [], (err, result) => {
        if (err) reject(err);
        else resolve({ totalMatches: result.count });
      });
    }),
    new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM messages', [], (err, result) => {
        if (err) reject(err);
        else resolve({ totalMessages: result.count });
      });
    }),
    new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM invite_codes', [], (err, result) => {
        if (err) reject(err);
        else resolve({ totalInviteCodes: result.count });
      });
    }),
    new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM invite_codes WHERE current_uses > 0', [], (err, result) => {
        if (err) reject(err);
        else resolve({ usedInviteCodes: result.count });
      });
    })
  ])
  .then(results => {
    results.forEach(result => Object.assign(stats, result));
    res.json(stats);
  })
  .catch(err => {
    return sendErrorResponse(res, 500, 'Database error', err.message);
  });
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
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});
