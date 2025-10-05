import axios from 'axios';

// ========================================
// 🌐 API Configuration
// ========================================

// 環境変数からAPIのベースURLを取得
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Axiosインスタンスを作成
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒のタイムアウト
});

// ========================================
// 🔒 Request Interceptor
// ========================================
/**
 * リクエストインターセプター
 * すべてのAPIリクエストに認証トークンを自動的に付与
 * 
 * ⚠️ セキュリティ注意:
 * LocalStorageにトークンを保存するのはXSS攻撃に対して脆弱です。
 * 本番環境では、HTTPOnly Cookieの使用を強く推奨します。
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// ========================================
// 🔄 Response Interceptor
// ========================================
/**
 * レスポンスインターセプター
 * エラーハンドリングと認証エラーの処理
 */
api.interceptors.response.use(
  (response) => {
    // 成功レスポンスをそのまま返す
    return response;
  },
  (error) => {
    // エラーレスポンスの処理
    if (error.response) {
      // サーバーがエラーレスポンスを返した場合
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // 認証エラー: トークンが無効または期限切れ
          console.error('🔒 Authentication error: Token expired or invalid');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // ログインページにリダイレクト（現在のページがログイン/登録ページでない場合）
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
          break;

        case 403:
          // 認可エラー: 権限がない
          console.error('🚫 Authorization error: Insufficient permissions');
          break;

        case 404:
          // リソースが見つからない
          console.error('🔍 Not found:', error.config.url);
          break;

        case 409:
          // 競合エラー（例: メールアドレス重複）
          console.error('⚠️ Conflict:', data.error);
          break;

        case 429:
          // レート制限
          console.error('⏰ Rate limit exceeded');
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // サーバーエラー
          console.error('🔥 Server error:', status);
          break;

        default:
          console.error('❌ API error:', status, data);
      }

      // エラーメッセージを含むエラーオブジェクトを返す
      return Promise.reject({
        status,
        message: data.error || 'An error occurred',
        details: data.details || null,
      });
    } else if (error.request) {
      // リクエストは送信されたが、レスポンスがない
      console.error('📡 Network error: No response from server');
      return Promise.reject({
        status: 0,
        message: 'Network error: Unable to reach server',
        details: 'Please check your internet connection',
      });
    } else {
      // リクエスト設定中にエラーが発生
      console.error('⚙️ Request setup error:', error.message);
      return Promise.reject({
        status: -1,
        message: 'Request configuration error',
        details: error.message,
      });
    }
  }
);

// ========================================
// 📡 API Endpoints
// ========================================
/**
 * API エンドポイントの定義
 * すべてのAPIエンドポイントを一元管理
 */
export const API_ENDPOINTS = {
  // 🔐 Authentication
  LOGIN: '/api/login',
  REGISTER: '/api/register',
  VERIFY_INVITE_CODE: '/api/verify-invite-code',
  SETUP_ADMIN: '/api/setup-admin',
  
  // 👤 User Profile
  PROFILE: '/api/profile',
  UPLOAD_PHOTO: '/api/upload-photo',
  
  // 💖 Swipe & Matching
  CANDIDATES: '/api/candidates',
  SWIPES: '/api/swipes', // RESTful endpoint
  MATCHES: '/api/matches',
  
  // 💬 Messaging
  MESSAGES: '/api/messages',
  MESSAGE_BY_MATCH: (matchId) => `/api/messages/${matchId}`,
  
  // 🔐 Admin
  ADMIN_INVITE_CODES: '/api/admin/invite-codes',
  ADMIN_INVITE_CODE_DELETE: (id) => `/api/admin/invite-codes/${id}`,
  ADMIN_USERS: '/api/admin/users',
  ADMIN_STATS: '/api/admin/stats',
  
  // ❤️ Health Check
  HEALTH: '/health',
};

// ========================================
// 🛠️ Helper Functions
// ========================================

/**
 * エラーメッセージを整形して返す
 * @param {Error} error - APIエラーオブジェクト
 * @returns {string} ユーザーフレンドリーなエラーメッセージ
 */
export const getErrorMessage = (error) => {
  if (error.message) {
    return error.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * 認証トークンが存在するかチェック
 * @returns {boolean} トークンの有無
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * 現在のユーザー情報を取得
 * @returns {Object|null} ユーザー情報またはnull
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('❌ Error parsing user data:', error);
    return null;
  }
};

/**
 * ログアウト処理
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// ========================================
// 📊 API Status Check
// ========================================

/**
 * APIサーバーの健全性をチェック
 * @returns {Promise<Object>} ヘルスチェック結果
 */
export const checkApiHealth = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.HEALTH);
    return {
      status: 'ok',
      data: response.data,
    };
  } catch (error) {
    return {
      status: 'error',
      error: getErrorMessage(error),
    };
  }
};

// ========================================
// 📤 Export
// ========================================

export { API_BASE_URL };
export default api;

// ========================================
// 📝 Usage Examples
// ========================================

/**
 * 使用例:
 * 
 * // 基本的な使い方
 * import api, { API_ENDPOINTS } from './config/api';
 * 
 * // GETリクエスト
 * const response = await api.get(API_ENDPOINTS.PROFILE);
 * const user = response.data;
 * 
 * // POSTリクエスト
 * const response = await api.post(API_ENDPOINTS.LOGIN, {
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 * 
 * // PUTリクエスト
 * const response = await api.put(API_ENDPOINTS.PROFILE, {
 *   name: 'New Name',
 *   age: 25
 * });
 * 
 * // DELETEリクエスト
 * await api.delete(API_ENDPOINTS.ADMIN_INVITE_CODE_DELETE(1));
 * 
 * // エラーハンドリング
 * try {
 *   const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
 * } catch (error) {
 *   const errorMessage = getErrorMessage(error);
 *   alert(errorMessage);
 * }
 * 
 * // ヘルスチェック
 * const health = await checkApiHealth();
 * if (health.status === 'ok') {
 *   console.log('API is healthy');
 * }
 */
