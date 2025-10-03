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
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';

// 本番用: 招待コードチェックを有効化
const DISABLE_INVITE_CODE = false;

// CORS設定（本番環境用）
const allowedOrigins = [
  'http://localhost:3000',
  'https://matching-app-wheat.vercel.app',
  'https://matching-app-git-main-ss-projects-671e106f.vercel.app',
  'https://matching-4h3u7urh4-ss-projects-671e106f.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // originがundefinedの場合（Postmanなど）も許可
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// アップロードディレクトリの作成
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Multerの設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// データベースの初期化
const db = new sqlite3.Database('./matching.db');

db.serialize(() => {
  // ユーザーテーブル
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    age INTEGER,
    bio TEXT,
    photo TEXT,
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // スワイプテーブル
  db.run(`CREATE TABLE IF NOT EXISTS swipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    target_user_id INTEGER NOT NULL,
    is_like BOOLEAN NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (target_user_id) REFERENCES users(id),
    UNIQUE(user_id, target_user_id)
  )`);

  // マッチテーブル
  db.run(`CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id),
    FOREIGN KEY (user2_id) REFERENCES users(id)
  )`);

  // メッセージテーブル
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
  )`);

  // 招待コードテーブル
  db.run(`CREATE TABLE IF NOT EXISTS invite_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT 0,
    used_by INTEGER,
    created_by INTEGER NOT NULL,
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_at DATETIME,
    expires_at DATETIME,
    FOREIGN KEY (used_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`);
});

// 認証ミドルウェア
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// 管理者認証ミドルウェア
const authenticateAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    db.get('SELECT is_admin FROM users WHERE id = ?', [req.user.id], (err, user) => {
      if (err || !user || !user.is_admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      next();
    });
  });
};

// 招待コード生成用のヘルパー関数
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// API エンドポイント

// 招待コード検証
app.post('/api/verify-invite-code', async (req, res) => {
  if (DISABLE_INVITE_CODE) {
    return res.json({ valid: true });
  }
  
  const { code } = req.body;

  db.get(
    `SELECT * FROM invite_codes 
     WHERE code = ? 
     AND (expires_at IS NULL OR expires_at > datetime('now'))
     AND (max_uses = -1 OR current_uses < max_uses)`,
    [code],
    (err, inviteCode) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!inviteCode) {
        return res.status(400).json({ error: '無効な招待コードです' });
      }

      res.json({ valid: true });
    }
  );
});

// ユーザー登録（本番モードでは招待コード必須）
app.post('/api/register', async (req, res) => {
  const { email, password, name, age, bio, inviteCode } = req.body;

  // 開発モード: 招待コードチェックをスキップ
  if (DISABLE_INVITE_CODE) {
    console.log('⚠️ 開発モード: 招待コードチェックをスキップしました');
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      db.run(
        'INSERT INTO users (email, password, name, age, bio) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, name, age, bio],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(400).json({ error: 'このメールアドレスは既に登録されています' });
            }
            return res.status(500).json({ error: err.message });
          }

          const userId = this.lastID;
          const token = jwt.sign({ id: userId, email }, JWT_SECRET);
          res.json({ token, user: { id: userId, email, name, age, bio } });
        }
      );
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
    return;
  }

  // 本番モード: 招待コードの検証
  db.get(
    `SELECT * FROM invite_codes 
     WHERE code = ? 
     AND (expires_at IS NULL OR expires_at > datetime('now'))
     AND (max_uses = -1 OR current_uses < max_uses)`,
    [inviteCode],
    async (err, code) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!code) {
        return res.status(400).json({ error: '無効な招待コードです' });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run(
          'INSERT INTO users (email, password, name, age, bio) VALUES (?, ?, ?, ?, ?)',
          [email, hashedPassword, name, age, bio],
          function(err) {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'このメールアドレスは既に登録されています' });
              }
              return res.status(500).json({ error: err.message });
            }

            const userId = this.lastID;

            // 招待コードの使用回数を更新
            db.run(
              'UPDATE invite_codes SET current_uses = current_uses + 1, used_at = datetime(\'now\') WHERE code = ?',
              [inviteCode],
              (err) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }

                const token = jwt.sign({ id: userId, email }, JWT_SECRET);
                res.json({ token, user: { id: userId, email, name, age, bio } });
              }
            );
          }
        );
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );
});

// ログイン
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが間違っています' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが間違っています' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    delete user.password;
    res.json({ token, user });
  });
});

// プロフィール取得
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get('SELECT id, email, name, age, bio, photo, is_admin FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(user);
  });
});

// プロフィール更新
app.put('/api/profile', authenticateToken, (req, res) => {
  const { name, age, bio } = req.body;
  
  db.run(
    'UPDATE users SET name = ?, age = ?, bio = ? WHERE id = ?',
    [name, age, bio, req.user.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
});

// プロフィール写真アップロード
app.post('/api/upload-photo', authenticateToken, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const photoUrl = `/uploads/${req.file.filename}`;
  
  db.run(
    'UPDATE users SET photo = ? WHERE id = ?',
    [photoUrl, req.user.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ photoUrl });
    }
  );
});

// 候補ユーザー取得
app.get('/api/candidates', authenticateToken, (req, res) => {
  const query = `
    SELECT id, name, age, bio, photo 
    FROM users 
    WHERE id != ? 
    AND id NOT IN (
      SELECT target_user_id FROM swipes WHERE user_id = ?
    )
    LIMIT 10
  `;
  
  db.all(query, [req.user.id, req.user.id], (err, users) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(users);
  });
});

// スワイプ（Like/Pass）
app.post('/api/swipe', authenticateToken, (req, res) => {
  const { targetUserId, isLike } = req.body;
  
  db.run(
    'INSERT INTO swipes (user_id, target_user_id, is_like) VALUES (?, ?, ?)',
    [req.user.id, targetUserId, isLike],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // マッチング確認
      if (isLike) {
        db.get(
          'SELECT * FROM swipes WHERE user_id = ? AND target_user_id = ? AND is_like = 1',
          [targetUserId, req.user.id],
          (err, mutualLike) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            if (mutualLike) {
              // マッチング成立
              const user1_id = Math.min(req.user.id, targetUserId);
              const user2_id = Math.max(req.user.id, targetUserId);
              
              db.run(
                'INSERT INTO matches (user1_id, user2_id) VALUES (?, ?)',
                [user1_id, user2_id],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: err.message });
                  }
                  res.json({ matched: true });
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

// マッチリスト取得
app.get('/api/matches', authenticateToken, (req, res) => {
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
  `;
  
  db.all(query, [req.user.id, req.user.id, req.user.id, req.user.id], (err, matches) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(matches);
  });
});

// メッセージ送信
app.post('/api/messages', authenticateToken, (req, res) => {
  const { matchId, content } = req.body;
  
  // マッチの確認
  db.get(
    'SELECT * FROM matches WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
    [matchId, req.user.id, req.user.id],
    (err, match) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!match) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      db.run(
        'INSERT INTO messages (match_id, sender_id, content) VALUES (?, ?, ?)',
        [matchId, req.user.id, content],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ id: this.lastID, matchId, senderId: req.user.id, content });
        }
      );
    }
  );
});

// メッセージ取得
app.get('/api/messages/:matchId', authenticateToken, (req, res) => {
  const { matchId } = req.params;
  
  // マッチの確認
  db.get(
    'SELECT * FROM matches WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
    [matchId, req.user.id, req.user.id],
    (err, match) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!match) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      db.all(
        'SELECT * FROM messages WHERE match_id = ? ORDER BY created_at ASC',
        [matchId],
        (err, messages) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json(messages);
        }
      );
    }
  );
});

// ===== 管理者用エンドポイント =====

// 招待コード生成
app.post('/api/admin/invite-codes', authenticateAdmin, (req, res) => {
  const { maxUses = 1, expiresInDays = null } = req.body;
  const code = generateInviteCode();
  
  let expiresAt = null;
  if (expiresInDays) {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + expiresInDays);
    expiresAt = expireDate.toISOString();
  }

  db.run(
    'INSERT INTO invite_codes (code, created_by, max_uses, expires_at) VALUES (?, ?, ?, ?)',
    [code, req.user.id, maxUses, expiresAt],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        id: this.lastID, 
        code, 
        maxUses, 
        expiresAt,
        message: '招待コードを生成しました' 
      });
    }
  );
});

// 招待コード一覧取得
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
        return res.status(500).json({ error: err.message });
      }
      res.json(codes);
    }
  );
});

// 招待コード削除
app.delete('/api/admin/invite-codes/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM invite_codes WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Invite code not found' });
    }
    res.json({ message: '招待コードを削除しました' });
  });
});

// ユーザー一覧取得
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
  db.all(
    'SELECT id, email, name, age, bio, photo, is_admin, created_at FROM users ORDER BY created_at DESC',
    [],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(users);
    }
  );
});

// 統計情報取得
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
  const stats = {};
  
  // ユーザー数
  db.get('SELECT COUNT(*) as count FROM users', [], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.totalUsers = result.count;
    
    // マッチ数
    db.get('SELECT COUNT(*) as count FROM matches', [], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.totalMatches = result.count;
      
      // メッセージ数
      db.get('SELECT COUNT(*) as count FROM messages', [], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.totalMessages = result.count;
        
        // 招待コード数
        db.get('SELECT COUNT(*) as count FROM invite_codes', [], (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          stats.totalInviteCodes = result.count;
          
          // 使用済み招待コード数
          db.get('SELECT COUNT(*) as count FROM invite_codes WHERE current_uses > 0', [], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.usedInviteCodes = result.count;
            
            res.json(stats);
          });
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  if (DISABLE_INVITE_CODE) {
    console.log('⚠️ 警告: 招待コードチェックが無効化されています（開発モード）');
  } else {
    console.log('✅ 招待コードチェックが有効です（本番モード）');
  }
});
