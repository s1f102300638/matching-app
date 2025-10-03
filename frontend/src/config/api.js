import axios from 'axios';

// 環境変数からAPIのベースURLを取得
// 本番環境: Vercelの環境変数 REACT_APP_API_URL
// 開発環境: http://localhost:5000
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Axiosインスタンスを作成
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（トークンを自動的に付与）
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラーの場合、ログアウト処理
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// APIエンドポイント
export const API_ENDPOINTS = {
  // 認証
  LOGIN: '/api/login',
  REGISTER: '/api/register',
  VERIFY_INVITE_CODE: '/api/verify-invite-code',
  
  // プロフィール
  PROFILE: '/api/profile',
  UPLOAD_PHOTO: '/api/upload-photo',
  
  // スワイプ・マッチング
  CANDIDATES: '/api/candidates',
  SWIPE: '/api/swipe',
  MATCHES: '/api/matches',
  
  // メッセージ
  MESSAGES: '/api/messages',
  
  // 管理者
  ADMIN_INVITE_CODES: '/api/admin/invite-codes',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_STATS: '/api/admin/stats',
};

export { API_BASE_URL };
export default api;
