#!/bin/bash

# Register.js
cat > frontend/src/components/Register.js << 'COMP_EOF'
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (formData.password.length < 6) {
      setError('パスワードは6文字以上である必要があります');
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    
    if (result.success) {
      navigate('/profile');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>新規登録</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">パスワード確認</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">名前</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="age">年齢</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="18"
              max="100"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="bio">自己紹介</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="趣味や興味のあることを書いてください"
              rows="4"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit">登録</button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          すでにアカウントをお持ちの場合は{' '}
          <Link to="/login" style={{ color: '#ff4458' }}>
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
COMP_EOF

echo "Components created successfully!"
