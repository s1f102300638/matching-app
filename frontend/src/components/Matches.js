import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNavigation from './BottomNavigation';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('messages');
  const [sortBy, setSortBy] = useState('recent');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchMatches();
    fetchMessages();
  }, []);

  const fetchMatches = async () => {
    // ダミーデータ
    const dummyMatches = [
      {
        id: 1,
        name: '高橋',
        photo: null,
        isNew: true,
        isOnline: true,
        lastSeen: 'オンライン'
      },
      {
        id: 2,
        name: '伊藤',
        photo: null,
        isNew: true,
        isOnline: false,
        lastSeen: '2時間前'
      }
    ];
    setMatches(dummyMatches);
  };

  const fetchMessages = async () => {
    // ダミーデータ
    const dummyMessages = [
      {
        id: 1,
        matchId: 3,
        name: '田中 花子',
        photo: null,
        lastMessage: 'こんにちは！マッチありがとうございます😊',
        time: '30分前',
        unread: 3,
        isVerified: true,
        isOnline: false
      },
      {
        id: 2,
        matchId: 4,
        name: '佐藤 美咲',
        photo: null,
        lastMessage: '今週末は何か予定ありますか？',
        time: '4時間前',
        unread: 1,
        isVerified: false,
        isOnline: false
      },
      {
        id: 3,
        matchId: 5,
        name: '鈴木 あやか',
        photo: null,
        lastMessage: 'おはよう！',
        time: '1日前',
        unread: 0,
        isVerified: true,
        isOnline: false
      }
    ];
    setMessages(dummyMessages);
  };

  const handleChatClick = (matchId) => {
    navigate(`/chat/${matchId}`);
  };

  const filteredMessages = messages.filter(msg =>
    msg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = messages.reduce((sum, msg) => sum + msg.unread, 0);

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
              マッチ
            </h1>
            <div style={{
              background: '#fd5068',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {totalUnread > 0 && `${totalUnread} 未読`}
              {matches.length + messages.length}人
            </div>
          </div>

          {/* 検索バー */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="マッチを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 40px',
                borderRadius: '24px',
                border: '1px solid #e0e0e0',
                fontSize: '14px',
                background: '#f5f7fa',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#fd5068';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.background = '#f5f7fa';
              }}
            />
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="#999"
              strokeWidth="2"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>

          {/* タブとソート */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setActiveTab('messages')}
              style={{
                flex: 1,
                padding: '8px',
                background: activeTab === 'messages' ? '#fd5068' : 'transparent',
                color: activeTab === 'messages' ? 'white' : '#636e72',
                border: 'none',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              メッセージ
            </button>
            <button
              onClick={() => setActiveTab('new')}
              style={{
                flex: 1,
                padding: '8px',
                background: activeTab === 'new' ? '#fd5068' : 'transparent',
                color: activeTab === 'new' ? 'white' : '#636e72',
                border: 'none',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              新しいマッチ
              {matches.filter(m => m.isNew).length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '12px',
                  background: '#44d8ff',
                  color: 'white',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {matches.filter(m => m.isNew).length}
                </span>
              )}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '20px',
                border: '1px solid #e0e0e0',
                fontSize: '13px',
                color: '#636e72',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="recent">最近</option>
              <option value="unread">未読</option>
              <option value="online">オンライン</option>
            </select>
          </div>
        </div>

        {/* 新しいマッチ */}
        {activeTab === 'new' && matches.filter(m => m.isNew).length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#636e72',
              margin: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              新しいマッチ 🎉
            </h3>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
              {matches.filter(m => m.isNew).map(match => (
                <div
                  key={match.id}
                  onClick={() => handleChatClick(match.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    minWidth: '72px'
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: match.photo ? `url(${match.photo})` : 
                        match.id % 2 === 0 ? 
                        'linear-gradient(135deg, #667eea, #764ba2)' : 
                        'linear-gradient(135deg, #f093fb, #f5576c)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: '600',
                      border: '3px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                      {!match.photo && match.name.charAt(0)}
                    </div>
                    {match.isOnline && (
                      <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        width: '12px',
                        height: '12px',
                        background: '#44d884',
                        borderRadius: '50%',
                        border: '2px solid white'
                      }}/>
                    )}
                    <div style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#44d8ff',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}>
                      NEW
                    </div>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    marginTop: '8px',
                    color: '#2d3436',
                    fontWeight: '500'
                  }}>
                    {match.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* メッセージリスト */}
        {activeTab === 'messages' && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message, index) => (
                <div
                  key={message.id}
                  onClick={() => handleChatClick(message.matchId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    cursor: 'pointer',
                    borderBottom: index < filteredMessages.length - 1 ? '1px solid #f0f0f0' : 'none',
                    transition: 'background 0.2s',
                    background: message.unread > 0 ? '#fef5f6' : 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f5f7fa'}
                  onMouseLeave={(e) => e.currentTarget.style.background = message.unread > 0 ? '#fef5f6' : 'transparent'}
                >
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: message.photo ? `url(${message.photo})` : 
                        message.id % 2 === 0 ? 
                        'linear-gradient(135deg, #667eea, #764ba2)' : 
                        'linear-gradient(135deg, #f093fb, #f5576c)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: '600'
                    }}>
                      {!message.photo && message.name.charAt(0)}
                    </div>
                    {message.isOnline && (
                      <div style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '12px',
                        height: '12px',
                        background: '#44d884',
                        borderRadius: '50%',
                        border: '2px solid white'
                      }}/>
                    )}
                  </div>

                  <div style={{ flex: 1, marginLeft: '12px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '4px'
                    }}>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#2d3436'
                      }}>
                        {message.name}
                      </span>
                      {message.isVerified && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DA1F2">
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                        </svg>
                      )}
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: message.unread > 0 ? '#2d3436' : '#636e72',
                      fontWeight: message.unread > 0 ? '500' : '400',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {message.lastMessage}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '4px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: message.unread > 0 ? '#fd5068' : '#999'
                    }}>
                      {message.time}
                    </span>
                    {message.unread > 0 && (
                      <div style={{
                        background: '#fd5068',
                        color: 'white',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {message.unread}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                padding: '48px 24px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>
                  💬
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#2d3436',
                  marginBottom: '8px'
                }}>
                  まだメッセージはありません
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#636e72'
                }}>
                  マッチした人とチャットを始めましょう！
                </p>
              </div>
            )}
          </div>
        )}

        {/* 新しいマッチがない場合 */}
        {activeTab === 'new' && matches.filter(m => m.isNew).length === 0 && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              🎉
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#2d3436',
              marginBottom: '8px'
            }}>
              新しいマッチはありません
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#636e72',
              marginBottom: '24px'
            }}>
              スワイプを続けて新しい出会いを見つけましょう
            </p>
            <button
              onClick={() => navigate('/swipe')}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(90deg, #fd5068, #ff6036)',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(253, 80, 104, 0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              スワイプを続ける
            </button>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Matches;
