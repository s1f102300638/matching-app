import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // バックエンドAPIへの接続を試みる
      try {
        const response = await axios.post('http://localhost:5000/api/login', {
          email,
          password,
        });

        login(response.data.token, response.data.user);
        navigate('/');
        return;
      } catch (apiError) {
        // APIが利用できない場合はダミー認証を使用
        console.log('API not available, using dummy authentication');
        
        // ダミー認証（デモ用）
        if (email && password) {
          const dummyUser = {
            id: 1,
            name: email.split('@')[0],
            email: email,
            age: 25,
            bio: 'マッチングアプリを楽しんでいます！',
            photo: null
          };
          
          // ダミートークンとユーザー情報を保存
          const dummyToken = 'dummy-token-' + Date.now();
          login(dummyToken, dummyUser);
          
          // ホーム画面に遷移
          setTimeout(() => {
            navigate('/');
          }, 500);
        } else {
          setError('メールアドレスとパスワードを入力してください');
        }
      }
    } catch (error) {
      setError('ログインに失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // デモ用クイックログイン
  const handleDemoLogin = () => {
    setEmail('demo@example.com');
    setPassword('demo123');
    
    // 自動的にフォームを送信
    setTimeout(() => {
      const form = document.querySelector('.auth-form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  return (
    <div className="auth-container">
      <div className="auth-logo">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      
      <form onSubmit={handleSubmit} className="auth-form">
        <h1 className="auth-title">おかえりなさい</h1>
        <p className="auth-subtitle">アカウントにログインしてください</p>
        
        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            required
            className="form-input"
            autoComplete="email"
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            required
            className="form-input"
            autoComplete="current-password"
          />
        </div>
        
        {error && (
          <div style={{ 
            color: '#fff',
            background: 'rgba(220, 53, 69, 0.9)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="btn btn-secondary"
          style={{ 
            marginTop: '24px',
            background: 'rgba(255, 255, 255, 0.95)',
            color: 'var(--tinder-primary)'
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span className="loading-spinner" style={{ width: '16px', height: '16px' }}></span>
              ログイン中...
            </span>
          ) : (
            'ログイン'
          )}
        </button>
        
        {/* デモログインボタン */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="btn btn-secondary"
          style={{
            marginTop: '12px',
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            border: 'none',
            color: 'white'
          }}
        >
          🚀 デモアカウントでログイン
        </button>
        
        <div style={{ 
          marginTop: '32px', 
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '14px'
        }}>
          アカウントをお持ちでない方は
        </div>
        
        <Link
          to="/register"
          className="btn btn-secondary"
          style={{
            display: 'block',
            marginTop: '12px',
            background: 'transparent',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            color: 'rgba(255, 255, 255, 0.9)',
            textDecoration: 'none'
          }}
        >
          新規登録
        </Link>
      </form>
      
      {/* デコレーション */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        opacity: 0.3
      }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: i === 1 ? '#fff' : 'rgba(255, 255, 255, 0.5)'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Login;
