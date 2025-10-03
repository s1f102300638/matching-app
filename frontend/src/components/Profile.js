import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNavigation from './BottomNavigation';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('edit');
  const [profile, setProfile] = useState({
    name: 'ユーザー',
    age: '25',
    bio: '',
    photos: [null, null, null, null, null, null],
    interests: [],
    job: '',
    school: '',
    location: '東京',
    height: ''
  });
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || 'ユーザー',
        age: user.age || '25'
      }));
    }
  }, [user]);

  const getCompleteness = () => {
    let score = 0;
    if (profile.name) score += 20;
    if (profile.photos[0]) score += 20;
    if (profile.bio) score += 20;
    if (profile.job) score += 10;
    if (profile.school) score += 10;
    if (profile.interests.length > 0) score += 10;
    if (profile.height) score += 10;
    return Math.min(score, 100);
  };

  const completeness = getCompleteness();

  return (
    <div className="container">
      <div style={{ 
        padding: '16px',
        paddingBottom: '80px',
        minHeight: '100vh',
        background: '#f5f7fa'
      }}>
        {/* ヘッダー */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: 0,
              color: '#2d3436'
            }}>
              プロフィール
            </h1>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid #e0e0e0',
                borderRadius: '16px',
                color: '#636e72',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#fd5068';
                e.currentTarget.style.color = '#fd5068';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.color = '#636e72';
              }}
            >
              ログアウト
            </button>
          </div>

          {/* プロフィール完成度 */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '13px', color: '#636e72' }}>プロフィール完成度</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#fd5068' }}>
                {completeness}%
              </span>
            </div>
            <div style={{
              height: '6px',
              background: '#e0e0e0',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${completeness}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #fd5068, #ff6036)',
                transition: 'width 0.3s ease'
              }}/>
            </div>
            {completeness < 100 && (
              <p style={{ fontSize: '11px', color: '#999', marginTop: '8px', margin: 0 }}>
                プロフィールを充実させてマッチ率UP！
              </p>
            )}
          </div>

          {/* タブ */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('edit')}
              style={{
                flex: 1,
                padding: '8px',
                background: activeTab === 'edit' ? '#fd5068' : 'transparent',
                color: activeTab === 'edit' ? 'white' : '#636e72',
                border: 'none',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              編集
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              style={{
                flex: 1,
                padding: '8px',
                background: activeTab === 'preview' ? '#fd5068' : 'transparent',
                color: activeTab === 'preview' ? 'white' : '#636e72',
                border: 'none',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              プレビュー
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              style={{
                flex: 1,
                padding: '8px',
                background: activeTab === 'settings' ? '#fd5068' : 'transparent',
                color: activeTab === 'settings' ? 'white' : '#636e72',
                border: 'none',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              設定
            </button>
          </div>
        </div>

        {/* 編集タブ */}
        {activeTab === 'edit' && (
          <>
            {/* 写真セクション */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#2d3436',
                marginBottom: '12px'
              }}>
                写真
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px'
              }}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div
                    key={index}
                    style={{
                      aspectRatio: '3/4',
                      borderRadius: '12px',
                      background: '#f5f7fa',
                      border: '2px dashed #e0e0e0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#fd5068';
                      e.currentTarget.style.background = '#fef5f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e0e0e0';
                      e.currentTarget.style.background = '#f5f7fa';
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#ccc">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    {index === 0 && (
                      <span style={{
                        fontSize: '10px',
                        color: '#999',
                        marginTop: '4px'
                      }}>
                        メイン写真
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 基本情報 */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#2d3436',
                marginBottom: '16px'
              }}>
                基本情報
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '12px',
                  color: '#636e72',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  名前
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#fd5068'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '12px',
                  color: '#636e72',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  年齢
                </label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#fd5068'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '12px',
                  color: '#636e72',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  自己紹介
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="あなたについて教えてください..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#fd5068'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              <button
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(90deg, #fd5068, #ff6036)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                保存する
              </button>
            </div>
          </>
        )}

        {/* プレビュータブ */}
        {activeTab === 'preview' && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              aspectRatio: '3/4',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)'
              }}/>
              <div style={{
                position: 'relative',
                color: 'white',
                width: '100%'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  margin: '0 0 4px 0'
                }}>
                  {profile.name}, {profile.age}
                </h2>
                <p style={{
                  fontSize: '14px',
                  opacity: 0.9,
                  margin: 0
                }}>
                  {profile.location}
                </p>
                {profile.bio && (
                  <p style={{
                    fontSize: '13px',
                    marginTop: '8px',
                    opacity: 0.9,
                    lineHeight: '1.4'
                  }}>
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
            
            <p style={{
              textAlign: 'center',
              fontSize: '13px',
              color: '#636e72'
            }}>
              これがあなたのプロフィールの表示です
            </p>
          </div>
        )}

        {/* 設定タブ */}
        {activeTab === 'settings' && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#2d3436',
              marginBottom: '16px'
            }}>
              アカウント設定
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <button
                style={{
                  padding: '12px',
                  background: '#f5f7fa',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#2d3436',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#eef2f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f5f7fa'}
              >
                通知設定
              </button>
              
              <button
                style={{
                  padding: '12px',
                  background: '#f5f7fa',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#2d3436',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#eef2f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f5f7fa'}
              >
                プライバシー設定
              </button>
              
              <button
                style={{
                  padding: '12px',
                  background: '#f5f7fa',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#2d3436',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#eef2f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f5f7fa'}
              >
                ヘルプとサポート
              </button>
              
              <button
                onClick={handleLogout}
                style={{
                  padding: '12px',
                  background: '#fff',
                  border: '1px solid #fd5068',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#fd5068',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  marginTop: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fd5068';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = '#fd5068';
                }}
              >
                ログアウト
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
