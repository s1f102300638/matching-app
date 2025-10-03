import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    inviteCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (step === 1) {
      // 招待コードのバリデーション
      if (!formData.inviteCode) {
        setError('招待コードを入力してください');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      // アカウント情報のバリデーション
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('すべての項目を入力してください');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('パスワードが一致しません');
        return;
      }
      if (formData.password.length < 6) {
        setError('パスワードは6文字以上で設定してください');
        return;
      }
      setError('');
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age) {
      setError('すべての項目を入力してください');
      return;
    }
    
    if (formData.age < 18) {
      setError('18歳以上である必要があります');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/register', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        age: formData.age,
        inviteCode: formData.inviteCode,
      });

      login(response.data.token, response.data.user);
      navigate('/');
    } catch (error) {
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('登録に失敗しました。もう一度お試しください。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-logo">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      
      <form onSubmit={handleSubmit} className="auth-form">
        <h1 className="auth-title">新規登録</h1>
        
        {/* ステップインジケーター */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '24px'
        }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{
              width: '40px',
              height: '4px',
              borderRadius: '2px',
              background: step >= s ? '#fff' : 'rgba(255, 255, 255, 0.3)'
            }}></div>
          ))}
        </div>
        
        {/* ステップ1: 招待コード */}
        {step === 1 && (
          <>
            <p className="auth-subtitle">招待コードを入力</p>
            
            <div className="form-group">
              <input
                type="text"
                name="inviteCode"
                value={formData.inviteCode}
                onChange={handleChange}
                placeholder="招待コード（例: ABC12345）"
                required
                className="form-input"
                style={{ textTransform: 'uppercase' }}
                maxLength={8}
              />
            </div>
            
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              <p style={{ margin: 0 }}>
                ℹ️ このアプリはメンバー限定です。<br/>
                招待コードをお持ちでない方は、管理者にお問い合わせください。
              </p>
            </div>
            
            {error && (
              <div style={{ 
                color: '#fff',
                background: 'rgba(220, 53, 69, 0.9)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                marginTop: '16px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
            
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-secondary"
              style={{ 
                marginTop: '24px',
                background: 'rgba(255, 255, 255, 0.95)',
                color: 'var(--tinder-primary)'
              }}
            >
              次へ
            </button>
          </>
        )}

        {/* ステップ2: アカウント情報 */}
        {step === 2 && (
          <>
            <p className="auth-subtitle">アカウント情報を入力</p>
            
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="メールアドレス"
                required
                className="form-input"
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="パスワード（6文字以上）"
                required
                className="form-input"
                autoComplete="new-password"
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="パスワード（確認）"
                required
                className="form-input"
                autoComplete="new-password"
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
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-secondary"
                style={{ 
                  flex: 1,
                  background: 'transparent',
                  border: '2px solid rgba(255, 255, 255, 0.9)',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                戻る
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-secondary"
                style={{ 
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: 'var(--tinder-primary)'
                }}
              >
                次へ
              </button>
            </div>
          </>
        )}

        {/* ステップ3: プロフィール情報 */}
        {step === 3 && (
          <>
            <p className="auth-subtitle">プロフィール情報を入力</p>
            
            <div className="form-group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="名前"
                required
                className="form-input"
                autoComplete="name"
              />
            </div>
            
            <div className="form-group">
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="年齢（18歳以上）"
                min="18"
                max="100"
                required
                className="form-input"
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
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-secondary"
                style={{ 
                  flex: 1,
                  background: 'transparent',
                  border: '2px solid rgba(255, 255, 255, 0.9)',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-secondary"
                style={{ 
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: 'var(--tinder-primary)'
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span className="loading-spinner" style={{ width: '16px', height: '16px' }}></span>
                    登録中...
                  </span>
                ) : (
                  '登録する'
                )}
              </button>
            </div>
          </>
        )}
        
        {step === 1 && (
          <>
            <div style={{ 
              marginTop: '32px', 
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px'
            }}>
              すでにアカウントをお持ちの方は
            </div>
            
            <Link
              to="/login"
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
              ログイン
            </Link>
          </>
        )}
      </form>
    </div>
  );
};

export default Register;
