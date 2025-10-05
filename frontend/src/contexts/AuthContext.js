import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../config/api';

// ========================================
// 🔐 Authentication Context
// ========================================

const AuthContext = createContext(null);

/**
 * useAuth Hook
 * コンポーネントから認証状態にアクセスするためのカスタムフック
 * 
 * @throws {Error} AuthProvider外で使用された場合
 * @returns {Object} 認証関連の状態と関数
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider Component
 * アプリ全体に認証状態を提供するプロバイダー
 * 
 * ⚠️ セキュリティ注意:
 * LocalStorageを使用したトークン保存はXSS攻撃に対して脆弱です。
 * 本番環境では、HTTPOnly Cookieの使用を強く推奨します。
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========================================
  // 🔄 初期化: ローカルストレージからユーザー情報を復元
  // ========================================
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // ローカルストレージからユーザー情報を復元
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error('❌ Failed to parse stored user:', e);
          // 破損したデータをクリア
          localStorage.removeItem('user');
        }
      }

      // バックエンドから最新のユーザー情報を取得
      try {
        const response = await api.get('/api/profile');
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        setError(null);
      } catch (error) {
        console.error('⚠️ Failed to fetch user profile:', error);
        // APIが利用できない場合は、保存されているユーザー情報を使用
        // エラーは設定しない（オフライン対応）
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ========================================
  // 🔐 ログイン機能
  // ========================================
  
  /**
   * トークンとユーザー情報を保存してログイン状態にする
   * @param {string} tokenValue - JWT トークン
   * @param {Object} userData - ユーザー情報
   */
  const login = useCallback((tokenValue, userData) => {
    try {
      localStorage.setItem('token', tokenValue);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setError(null);
    } catch (error) {
      console.error('❌ Error saving login data:', error);
      setError('Failed to save login information');
    }
  }, []);

  /**
   * メールアドレスとパスワードでログイン
   * @param {string} email - メールアドレス
   * @param {string} password - パスワード
   * @returns {Promise<Object>} { success: boolean, error?: string }
   */
  const loginWithCredentials = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/api/login', { email, password });
      const { token, user: userData } = response.data;
      
      login(token, userData);
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [login]);

  /**
   * 新規ユーザー登録
   * @param {Object} userData - 登録情報
   * @returns {Promise<Object>} { success: boolean, error?: string }
   */
  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await api.post('/api/register', userData);
      const { token, user: newUser } = response.data;
      
      login(token, newUser);
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [login]);

  /**
   * ログアウト
   */
  const logout = useCallback(() => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  }, []);

  // ========================================
  // 👤 プロフィール管理
  // ========================================

  /**
   * プロフィール情報を更新
   * @param {Object} profileData - 更新するプロフィール情報
   * @returns {Promise<Object>} { success: boolean, error?: string }
   */
  const updateProfile = useCallback(async (profileData) => {
    try {
      setError(null);
      await api.put('/api/profile', profileData);
      
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed';
      setError(errorMessage);
      
      // APIが利用できない場合でもローカルで更新（オフライン対応）
      if (error.status === 0) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true };
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [user]);

  /**
   * ユーザー情報を部分的に更新（ローカルのみ）
   * @param {Object} userData - 更新するユーザー情報
   */
  const updateUser = useCallback((userData) => {
    try {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('❌ Error updating user:', error);
    }
  }, [user]);

  /**
   * プロフィール写真を更新
   * @param {string} photoUrl - 写真のURL
   */
  const updateProfilePhoto = useCallback((photoUrl) => {
    try {
      const updatedUser = { ...user, photo: photoUrl };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('❌ Error updating profile photo:', error);
    }
  }, [user]);

  // ========================================
  // 🔍 ユーティリティ関数
  // ========================================

  /**
   * 現在のユーザーが管理者かチェック
   * @returns {boolean}
   */
  const isAdmin = useCallback(() => {
    return user?.is_admin === 1 || user?.is_admin === true;
  }, [user]);

  /**
   * 認証済みかチェック
   * @returns {boolean}
   */
  const isAuthenticated = useCallback(() => {
    return !!user && !!localStorage.getItem('token');
  }, [user]);

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========================================
  // 📤 Context Value
  // ========================================
  const value = {
    // State
    user,
    loading,
    error,
    
    // Authentication
    login,
    loginWithCredentials,
    register,
    logout,
    
    // Profile Management
    updateProfile,
    updateUser,
    updateProfilePhoto,
    
    // Utilities
    isAdmin,
    isAuthenticated,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ========================================
// 📝 Usage Example
// ========================================

/**
 * コンポーネントでの使用例:
 * 
 * import { useAuth } from './contexts/AuthContext';
 * 
 * function MyComponent() {
 *   const { 
 *     user, 
 *     loading, 
 *     error,
 *     loginWithCredentials, 
 *     logout,
 *     isAdmin,
 *     clearError
 *   } = useAuth();
 * 
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 * 
 *   return (
 *     <div>
 *       {user ? (
 *         <>
 *           <p>Welcome, {user.name}!</p>
 *           {isAdmin() && <p>Admin privileges</p>}
 *           <button onClick={logout}>Logout</button>
 *         </>
 *       ) : (
 *         <LoginForm onLogin={loginWithCredentials} />
 *       )}
 *     </div>
 *   );
 * }
 */
