import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Chat = () => {
  const { matchId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [matchInfo, setMatchInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchMatchInfo();
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMatchInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/matches/${matchId}`);
      setMatchInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch match info:', error);
      // ダミーデータを使用
      const dummyMatches = {
        1: { id: 1, name: '田中 花子', age: 25, photo: null },
        2: { id: 2, name: '佐藤 美咲', age: 28, photo: null },
        3: { id: 3, name: '鈴木 あやか', age: 26, photo: null },
        4: { id: 4, name: '高橋 結衣', age: 24, photo: null },
        5: { id: 5, name: '渡辺 さくら', age: 27, photo: null },
        6: { id: 6, name: '山田 愛', age: 29, photo: null },
        7: { id: 7, name: '伊藤 美月', age: 30, photo: null }
      };
      setMatchInfo(dummyMatches[matchId] || dummyMatches[1]);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/messages/${matchId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      // ダミーメッセージを使用
      const storedMessages = localStorage.getItem(`messages_${matchId}`);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        // 初期メッセージ
        const initialMessages = [
          {
            id: 1,
            matchId: parseInt(matchId),
            senderId: parseInt(matchId),
            message: 'こんにちは！マッチありがとうございます😊',
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
          }
        ];
        setMessages(initialMessages);
        localStorage.setItem(`messages_${matchId}`, JSON.stringify(initialMessages));
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    try {
      await axios.post(`http://localhost:5000/api/messages/${matchId}`, {
        message: newMessage,
      });
      
      setNewMessage('');
      await fetchMessages();
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // APIが利用できない場合はローカルで保存
      const newMsg = {
        id: Date.now(),
        matchId: parseInt(matchId),
        senderId: user?.id || 1,
        message: newMessage,
        createdAt: new Date().toISOString()
      };
      
      const updatedMessages = [...messages, newMsg];
      setMessages(updatedMessages);
      localStorage.setItem(`messages_${matchId}`, JSON.stringify(updatedMessages));
      
      setNewMessage('');
      
      // 自動返信（デモ用）
      setTimeout(() => {
        const autoReply = {
          id: Date.now() + 1,
          matchId: parseInt(matchId),
          senderId: parseInt(matchId),
          message: generateAutoReply(newMessage),
          createdAt: new Date().toISOString()
        };
        
        const withReply = [...updatedMessages, autoReply];
        setMessages(withReply);
        localStorage.setItem(`messages_${matchId}`, JSON.stringify(withReply));
      }, 1000 + Math.random() * 2000);
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } finally {
      setSending(false);
    }
  };

  const generateAutoReply = (userMessage) => {
    const replies = [
      'そうですね！😊',
      'いいですね！',
      'それは素敵ですね✨',
      'もっと詳しく聞かせてください',
      'なるほど！',
      'それは面白いですね',
      '私もそう思います',
      'ぜひ一緒に話しましょう！',
      'それは楽しそう！',
      'いつがいいですか？'
    ];
    
    if (userMessage.includes('会') || userMessage.includes('デート')) {
      return '会えるのを楽しみにしています！いつがご都合いいですか？😊';
    } else if (userMessage.includes('趣味')) {
      return '私も同じような趣味があります！もっと詳しく聞かせてください';
    } else if (userMessage.includes('？')) {
      return replies[Math.floor(Math.random() * replies.length)];
    } else {
      return replies[Math.floor(Math.random() * replies.length)];
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // 今日
      return date.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      // 昨日
      return '昨日 ' + date.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays < 7) {
      // 今週
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      return days[date.getDay()] + '曜日 ' + date.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      // それ以前
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* チャットヘッダー */}
      <div className="chat-header">
        <div 
          className="chat-back-button touchable"
          onClick={() => navigate('/matches')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </div>
        
        {matchInfo && (
          <div className="chat-user-info">
            <img
              src={matchInfo.photo ? 
                `http://localhost:5000${matchInfo.photo}` : 
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"%3E%3Cpath d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"%3E%3C/path%3E%3Ccircle cx="12" cy="7" r="4"%3E%3C/circle%3E%3C/svg%3E'
              }
              alt={matchInfo.name}
              className="chat-avatar"
            />
            <div>
              <h3 className="chat-user-name">{matchInfo.name}</h3>
            </div>
          </div>
        )}
        
        <div style={{ width: '32px' }}></div>
      </div>

      {/* メッセージエリア */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '40px' }}>
            <svg 
              className="empty-state-icon" 
              style={{ width: '60px', height: '60px' }}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
            >
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginTop: '16px' }}>
              会話を始めましょう
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
              {matchInfo?.name}さんにメッセージを送ってみましょう
            </p>
            
            {/* アイスブレーカー提案 */}
            <div style={{ marginTop: '24px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                会話のきっかけ：
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['こんにちは！マッチありがとうございます😊', 
                  'プロフィール見ました！素敵ですね', 
                  'はじめまして！よろしくお願いします'].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setNewMessage(suggestion)}
                    style={{
                      padding: '8px 16px',
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--text-secondary)',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    className="touchable"
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = 'var(--tinder-primary)';
                      e.target.style.color = 'var(--tinder-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = 'var(--border)';
                      e.target.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* マッチ成立の通知 */}
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              color: 'var(--text-tertiary)',
              fontSize: '14px'
            }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '8px 16px',
                background: 'var(--background)',
                borderRadius: 'var(--radius-full)'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--tinder-primary)">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                マッチしました！
              </div>
            </div>
            
            {messages.map((message, index) => {
              const isSent = message.senderId === user?.id;
              const showTime = index === messages.length - 1 || 
                messages[index + 1]?.senderId !== message.senderId ||
                new Date(messages[index + 1]?.createdAt) - new Date(message.createdAt) > 300000;
                
              return (
                <div key={message.id}>
                  <div className={`message ${isSent ? 'message-sent' : 'message-received'}`}>
                    <div className="message-bubble">
                      {message.message}
                    </div>
                  </div>
                  {showTime && (
                    <div className="message-time">
                      {formatTime(message.createdAt)}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* メッセージ入力 */}
      <form onSubmit={sendMessage} className="chat-input-container">
        <textarea
          ref={inputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="メッセージを入力..."
          className="chat-input"
          rows="1"
          style={{
            minHeight: '40px',
            maxHeight: '100px',
            lineHeight: '1.5'
          }}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="chat-send-button touchable"
        >
          {sending ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default Chat;
