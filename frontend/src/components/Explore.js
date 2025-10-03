import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNavigation from './BottomNavigation';

const Explore = () => {
  const [activeTab, setActiveTab] = useState('vibes');
  const [searchQuery, setSearchQuery] = useState('');
  const [vibes, setVibes] = useState([]);
  const [interests, setInterests] = useState([]);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadContent();
  }, [activeTab]);

  const loadContent = () => {
    // ダミーデータ
    setVibes([
      { 
        id: 1, 
        title: 'アドベンチャー好き', 
        description: '新しい場所を探検するのが好き',
        members: 342,
        icon: '🏔️',
        color: '#4CAF50'
      },
      { 
        id: 2, 
        title: 'フーディー', 
        description: '美味しいものを求めて',
        members: 456,
        icon: '🍱',
        color: '#FF9800'
      },
      { 
        id: 3, 
        title: 'ナイトライフ', 
        description: '夜の街を楽しむ',
        members: 289,
        icon: '🌃',
        color: '#9C27B0'
      },
      { 
        id: 4, 
        title: 'フィットネス', 
        description: '健康的なライフスタイル',
        members: 523,
        icon: '💪',
        color: '#F44336'
      }
    ]);

    setInterests([
      { id: 1, name: '音楽', icon: '🎵', count: 1234 },
      { id: 2, name: '映画', icon: '🎬', count: 987 },
      { id: 3, name: '読書', icon: '📚', count: 654 },
      { id: 4, name: 'スポーツ', icon: '⚽', count: 876 },
      { id: 5, name: '料理', icon: '🍳', count: 432 },
      { id: 6, name: '旅行', icon: '✈️', count: 765 },
      { id: 7, name: 'ゲーム', icon: '🎮', count: 543 },
      { id: 8, name: 'アート', icon: '🎨', count: 321 }
    ]);

    setEvents([
      {
        id: 1,
        title: 'Weekend Coffee Meetup',
        date: '今週土曜日',
        time: '14:00',
        location: '渋谷',
        attendees: 8,
        maxAttendees: 12,
        image: '☕'
      },
      {
        id: 2,
        title: 'ハイキング＆ピクニック',
        date: '日曜日',
        time: '10:00',
        location: '高尾山',
        attendees: 6,
        maxAttendees: 10,
        image: '🏔️'
      }
    ]);
  };

  const handleVibeClick = (vibe) => {
    console.log('Vibe clicked:', vibe);
    // Vibeベースのマッチングページへ遷移
  };

  const handleInterestClick = (interest) => {
    console.log('Interest clicked:', interest);
    // 興味ベースのマッチングページへ遷移
  };

  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
    // イベント詳細ページへ遷移
  };

  return (
    <div className="container">
      <div style={{ 
        padding: '20px',
        paddingBottom: '80px',
        background: '#f5f7fa',
        minHeight: '100vh'
      }}>
        {/* ヘッダー */}
        <div style={{
          marginBottom: '24px'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#fd5068',
            margin: '0 0 16px 0'
          }}>
            Explore
          </h1>

          {/* 検索バー */}
          <div style={{
            position: 'relative'
          }}>
            <input
              type="text"
              placeholder="Vibesや興味を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                borderRadius: '24px',
                border: '1px solid #e0e0e0',
                fontSize: '14px',
                background: 'white',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#fd5068';
                e.target.style.boxShadow = '0 0 0 3px rgba(253, 80, 104, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            />
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="#999"
              strokeWidth="2"
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
        </div>

        {/* タブ */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px'
        }}>
          {[
            { key: 'vibes', label: '✨ Vibes', color: '#fd5068' },
            { key: 'interests', label: '❤️ 興味', color: '#ff6036' },
            { key: 'events', label: '📅 イベント', color: '#44d8ff' },
            { key: 'spotlight', label: '⭐ 注目', color: '#ffd700' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '10px',
                background: activeTab === tab.key ? tab.color : 'white',
                color: activeTab === tab.key ? 'white' : '#636e72',
                border: 'none',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: activeTab === tab.key ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeTab === tab.key ? `0 4px 12px ${tab.color}33` : '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Vibesコンテンツ */}
        {activeTab === 'vibes' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            {vibes.map(vibe => (
              <div
                key={vibe.id}
                onClick={() => handleVibeClick(vibe)}
                style={{
                  background: vibe.color,
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  color: 'white',
                  boxShadow: `0 4px 12px ${vibe.color}33`
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{vibe.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
                  {vibe.title}
                </h3>
                <p style={{ fontSize: '12px', opacity: 0.9, margin: '0 0 12px 0' }}>
                  {vibe.description}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    marginLeft: '-4px'
                  }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.3)',
                        border: '2px solid white',
                        marginLeft: '-8px',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {['👤', '👩', '👨'][i-1]}
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: '12px' }}>{vibe.members}人</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 興味コンテンツ */}
        {activeTab === 'interests' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            {interests.map(interest => (
              <div
                key={interest.id}
                onClick={() => handleInterestClick(interest)}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{interest.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>
                  {interest.name}
                </div>
                <div style={{ fontSize: '12px', color: '#636e72', marginTop: '4px' }}>
                  {interest.count}人が興味あり
                </div>
              </div>
            ))}
          </div>
        )}

        {/* イベントコンテンツ */}
        {activeTab === 'events' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {events.map(event => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  display: 'flex',
                  gap: '16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #fd5068, #ff6036)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px'
                }}>
                  {event.image}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: '#2d3436' }}>
                    {event.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#636e72' }}>📅 {event.date}</span>
                    <span style={{ fontSize: '12px', color: '#636e72' }}>🕐 {event.time}</span>
                    <span style={{ fontSize: '12px', color: '#636e72' }}>📍 {event.location}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      flex: 1,
                      height: '4px',
                      background: '#e0e0e0',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(event.attendees / event.maxAttendees) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #fd5068, #ff6036)'
                      }}/>
                    </div>
                    <span style={{ fontSize: '12px', color: '#636e72' }}>
                      {event.attendees}/{event.maxAttendees}人
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 注目コンテンツ */}
        {activeTab === 'spotlight' && (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2d3436', marginBottom: '8px' }}>
              注目のコンテンツ
            </h3>
            <p style={{ fontSize: '14px', color: '#636e72' }}>
              まもなく公開予定です
            </p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Explore;
