import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 未読メッセージ数とLikes数を取得（実際のアプリではAPIから取得）
  const unreadCount = 4;
  const likesCount = 8;

  const navItems = [
    {
      path: '/',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ),
      label: 'ホーム'
    },
    {
      path: '/explore',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/>
        </svg>
      ),
      label: '探索'
    },
    {
      path: '/swipe',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ),
      label: 'スワイプ'
    },
    {
      path: '/likes',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      ),
      label: 'いいね',
      badge: likesCount
    },
    {
      path: '/matches',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
        </svg>
      ),
      label: 'チャット',
      badge: unreadCount
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    if (path === '/matches' && location.pathname.startsWith('/chat')) {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`nav-item touchable ${isActive(item.path) ? 'active' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <div style={{ position: 'relative' }}>
              {item.icon}
              {item.badge && parseInt(item.badge) > 0 && (
                <span className="notification-badge">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span style={{
              fontSize: '10px',
              marginTop: '2px',
              fontWeight: isActive(item.path) ? '600' : '400'
            }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
