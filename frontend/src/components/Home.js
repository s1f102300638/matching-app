import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNavigation from './BottomNavigation';

const Home = () => {
  const [stats, setStats] = useState({
    profileViews: 24,
    likes: 15,
    matches: 7,
    superLikes: 3
  });
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // 最近のアクティビティを取得
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = () => {
    // ダミーデータ
    setActivities([
      { id: 1, type: 'profile_view', name: '田中さん', time: '5分前', icon: '👀' },
      { id: 2, type: 'like', name: '佐藤さん', time: '30分前', icon: '❤️' },
      { id: 3, type: 'match', name: '鈴木さん', time: '1時間前', icon: '🎉' }
    ]);
  };

  return (
    <div className="container">
      <div style={{ 
        padding: '20px', 
        paddingBottom: '80px',
        background: '#f5f7fa',
        minHeight: '100vh'
      }}>
        {/* ウェルカムヘッダー */}
        <div style={{
          background: 'linear-gradient(135deg, #fd5068 0%, #ff6036 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(253, 80, 104, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '700',
              margin: 0
            }}>
              こんにちは、{user?.name || 'ゲスト'}さん！
            </h1>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              👤
            </div>
          </div>
          <p style={{ 
            fontSize: '14px',
            opacity: 0.9,
            margin: 0
          }}>
            今日も素敵な出会いを見つけましょう
          </p>

          {/* 統計カード */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginTop: '20px'
          }}>
            {[
              { icon: '👀', value: stats.profileViews, label: 'プロフィール閲覧', color: 'rgba(255,255,255,0.2)' },
              { icon: '❤️', value: stats.likes, label: 'Likes', color: 'rgba(255,255,255,0.25)' },
              { icon: '💬', value: stats.matches, label: 'マッチ', color: 'rgba(255,255,255,0.3)' },
              { icon: '⭐', value: stats.superLikes, label: 'Super Likes', color: 'rgba(255,255,255,0.35)' }
            ].map((stat, index) => (
              <div key={index} style={{
                background: stat.color,
                borderRadius: '12px',
                padding: '16px 8px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{stat.icon}</div>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>{stat.value}</div>
                <div style={{ fontSize: '10px', opacity: 0.9 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近のアクティビティ */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600',
              margin: 0,
              color: '#2d3436'
            }}>
              📊 最近のアクティビティ
            </h2>
          </div>

          {activities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activities.map(activity => (
                <div key={activity.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#f5f7fa',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eef2f6';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f5f7fa';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {activity.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#2d3436', fontWeight: '500' }}>
                      {activity.name}が
                      {activity.type === 'profile_view' && 'あなたのプロフィールを見ました'}
                      {activity.type === 'like' && 'あなたをLikeしました'}
                      {activity.type === 'match' && 'マッチしました！'}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#636e72' }}>
                      {activity.time}
                    </p>
                  </div>
                  <button style={{
                    padding: '6px 12px',
                    background: activity.type === 'match' ? '#44d8ff' : '#fd5068',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    {activity.type === 'match' ? 'メッセージ' : '見る'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '32px',
              color: '#636e72'
            }}>
              <p>まだアクティビティはありません</p>
            </div>
          )}
        </div>

        {/* クイックアクション */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          <button
            onClick={() => navigate('/swipe')}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>❤️</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>スワイプを続ける</div>
            <div style={{ fontSize: '12px', color: '#636e72' }}>新しい出会いを探す</div>
          </button>

          <button
            onClick={() => navigate('/likes')}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.2s',
              position: 'relative'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {stats.likes > 0 && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: '#fd5068',
                color: 'white',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {stats.likes}
              </div>
            )}
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>Likesを見る</div>
            <div style={{ fontSize: '12px', color: '#636e72' }}>{stats.likes}人があなたをLike</div>
          </button>

          <button
            onClick={() => navigate('/matches')}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.2s',
              position: 'relative'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {stats.matches > 0 && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: '#44d8ff',
                color: 'white',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {stats.matches}
              </div>
            )}
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>メッセージ</div>
            <div style={{ fontSize: '12px', color: '#636e72' }}>{stats.matches}件の新着</div>
          </button>

          <button
            onClick={() => navigate('/profile')}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>👤</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>プロフィール</div>
            <div style={{ fontSize: '12px', color: '#636e72' }}>編集・設定</div>
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Home;
