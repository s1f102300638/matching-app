import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fd5068, #ff6036)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '50%',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="#fd5068"
            style={{
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div className="loading-spinner" style={{
          borderColor: 'white',
          borderTopColor: 'transparent'
        }}></div>
        <p style={{
          color: 'white',
          fontSize: '16px',
          marginTop: '20px',
          fontWeight: '500'
        }}>
          読み込み中...
        </p>
        
        <style>{`
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
