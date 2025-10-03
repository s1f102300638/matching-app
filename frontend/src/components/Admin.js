import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('codes');
  const [inviteCodes, setInviteCodes] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 招待コード生成フォーム
  const [codeForm, setCodeForm] = useState({
    maxUses: 1,
    expiresInDays: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
    if (activeTab === 'codes') {
      fetchInviteCodes();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab]);

  const checkAdmin = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data.is_admin) {
        navigate('/');
      }
    } catch (error) {
      navigate('/login');
    }
  };

  const fetchInviteCodes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/invite-codes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInviteCodes(response.data);
    } catch (error) {
      setError('招待コードの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      setError('ユーザー一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      setError('統計情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/admin/invite-codes', codeForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(`招待コード「${response.data.code}」を生成しました`);
      setCodeForm({ maxUses: 1, expiresInDays: '' });
      fetchInviteCodes();
    } catch (error) {
      setError('招待コードの生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const deleteInviteCode = async (id) => {
    if (!window.confirm('この招待コードを削除してもよろしいですか？')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/invite-codes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('招待コードを削除しました');
      fetchInviteCodes();
    } catch (error) {
      setError('招待コードの削除に失敗しました');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('招待コードをコピーしました');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>管理画面</h1>
        <button onClick={() => navigate('/')} className="btn-back">
          アプリに戻る
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess('')}>✕</button>
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={activeTab === 'codes' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('codes')}
        >
          招待コード
        </button>
        <button
          className={activeTab === 'users' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('users')}
        >
          ユーザー管理
        </button>
        <button
          className={activeTab === 'stats' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('stats')}
        >
          統計情報
        </button>
      </div>

      <div className="admin-content">
        {/* 招待コードタブ */}
        {activeTab === 'codes' && (
          <div className="admin-section">
            <h2>招待コード生成</h2>
            <form onSubmit={generateInviteCode} className="code-form">
              <div className="form-row">
                <div className="form-group">
                  <label>使用回数制限</label>
                  <input
                    type="number"
                    min="1"
                    value={codeForm.maxUses}
                    onChange={(e) => setCodeForm({...codeForm, maxUses: parseInt(e.target.value)})}
                    placeholder="1"
                  />
                  <small>-1で無制限</small>
                </div>
                <div className="form-group">
                  <label>有効期限（日数）</label>
                  <input
                    type="number"
                    min="1"
                    value={codeForm.expiresInDays}
                    onChange={(e) => setCodeForm({...codeForm, expiresInDays: e.target.value})}
                    placeholder="空欄で無期限"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? '生成中...' : '招待コードを生成'}
              </button>
            </form>

            <h2>招待コード一覧</h2>
            {loading ? (
              <p>読み込み中...</p>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>コード</th>
                      <th>使用状況</th>
                      <th>有効期限</th>
                      <th>作成日</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inviteCodes.map((code) => (
                      <tr key={code.id}>
                        <td>
                          <span className="code-text">{code.code}</span>
                          <button
                            onClick={() => copyToClipboard(code.code)}
                            className="btn-icon"
                            title="コピー"
                          >
                            📋
                          </button>
                        </td>
                        <td>
                          {code.current_uses} / {code.max_uses === -1 ? '∞' : code.max_uses}
                        </td>
                        <td>
                          {code.expires_at 
                            ? new Date(code.expires_at).toLocaleDateString('ja-JP')
                            : '無期限'
                          }
                        </td>
                        <td>{new Date(code.created_at).toLocaleDateString('ja-JP')}</td>
                        <td>
                          <button
                            onClick={() => deleteInviteCode(code.id)}
                            className="btn-danger"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ユーザー管理タブ */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <h2>登録ユーザー一覧</h2>
            {loading ? (
              <p>読み込み中...</p>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>名前</th>
                      <th>メール</th>
                      <th>年齢</th>
                      <th>管理者</th>
                      <th>登録日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.age}</td>
                        <td>{user.is_admin ? '✓' : ''}</td>
                        <td>{new Date(user.created_at).toLocaleDateString('ja-JP')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 統計情報タブ */}
        {activeTab === 'stats' && (
          <div className="admin-section">
            <h2>統計情報</h2>
            {loading ? (
              <p>読み込み中...</p>
            ) : (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.totalUsers || 0}</div>
                  <div className="stat-label">登録ユーザー数</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalMatches || 0}</div>
                  <div className="stat-label">マッチング数</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalMessages || 0}</div>
                  <div className="stat-label">メッセージ数</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalInviteCodes || 0}</div>
                  <div className="stat-label">招待コード総数</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.usedInviteCodes || 0}</div>
                  <div className="stat-label">使用済みコード</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
