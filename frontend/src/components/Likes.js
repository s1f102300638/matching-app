import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNavigation from './BottomNavigation';
import axios from 'axios';

const Likes = () => {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, recent, nearby
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    try {
      // 実際のAPIでは、自分に「いいね」をした人のリストを取得
      // ここではダミーデータを使用
      const dummyLikes = [
        {
          id: 1,
          name: '田中 太郎',
          age: 28,
          photo: null,
          bio: 'カフェ巡りが趣味です。週末は美術館によく行きます。',
          distance: 3,
          likedAt: new Date(Date.now() - 1000 * 60 * 30), // 30分前
          verified: true,
          interests: ['☕ カフェ', '🎨 アート'],
          job: 'デザイナー',
          school: '東京大学'
        },
        {
          id: 2,
          name: '佐藤 花子',
          age: 25,
          photo: null,
          bio: 'ヨガインストラクターをしています。健康的なライフスタイルを大切にしています。',
          distance: 5,
          likedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2時間前
          verified: false,
          interests: ['🧘 ヨガ', '🥗 健康'],
          job: 'ヨガインストラクター',
          school: '早稲田大学'
        },
        {
          id: 3,
          name: '鈴木 美咲',
          age: 30,
          photo: null,
          bio: 'マーケティングの仕事をしています。休日は料理を楽しんでいます。',
          distance: 8,
          likedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1日前
          verified: true,
          interests: ['🍳 料理', '📚 読書', '✈️ 旅行'],
          job: 'マーケター',
          school: '慶應義塾大学'
        },
        {
          id: 4,
          name: '高橋 さくら',
          age: 27,
          photo: null,
          bio: 'デザイナーとして働いています。アートと音楽が大好きです。',
          distance: 2,
          likedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2日前
          verified: false,
          interests: ['🎨 アート', '🎵 音楽', '📷 写真'],
          job: 'UIデザイナー',
          school: '多摩美術大学'
        },
        {
          id: 5,
          name: '渡辺 真由',
          age: 26,
          photo: null,
          bio: 'エンジニアです。週末はハイキングやキャンプを楽しんでいます。',
          distance: 15,
          likedAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3日前
          verified: true,
          interests: ['⛰️ ハイキング', '🏕️ キャンプ', '💻 テクノロジー'],
          job: 'ソフトウェアエンジニア',
          school: '東京工業大学'
        },
        {
          id: 6,
          name: '山田 愛',
          age: 29,
          photo: null,
          bio: '看護師をしています。映画鑑賞と読書が趣味です。',
          distance: 7,
          likedAt: new Date(Date.now() - 1000 * 60 * 60 * 96), // 4日前
          verified: false,
          interests: ['🎬 映画', '📚 読書'],
          job: '看護師',
          school: '聖路加国際大学'
        },
        {
          id: 7,
          name: '伊藤 結衣',
          age: 24,
          photo: null,
          bio: 'カフェ巡りとお菓子作りが趣味です。新しいレシピに挑戦中！',
          distance: 4,
          likedAt: new Date(Date.now() - 1000 * 60 * 60 * 120), // 5日前
          verified: true,
          interests: ['☕ カフェ', '🍰 お菓子作り', '📸 Instagram'],
          job: 'パティシエ',
          school: '製菓専門学校'
        },
        {
          id: 8,
          name: '中村 美月',
          age: 31,
          photo: null,
          bio: 'ピラティスとワインが好きです。美味しいレストラン探しも趣味です。',
          distance: 10,
          likedAt: new Date(Date.now() - 1000 * 60 * 60 * 144), // 6日前
          verified: true,
          interests: ['🍷 ワイン', '🍽️ グルメ', '💪 ピラティス'],
          job: 'PR',
          school: '上智大学'
        }
      ];
      setLikes(dummyLikes);
      
      // localStorageに保存（他のコンポーネントからアクセス可能）
      localStorage.setItem('userLikes', JSON.stringify(dummyLikes));
    } catch (error) {
      console.error('Failed to fetch likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeBack = async (likeId) => {
    try {
      // いいねを返すAPI呼び出し
      // await axios.post(`http://localhost:5000/api/like-back/${likeId}`);
      
      // マッチ成立のアニメーション表示
      const likedPerson = likes.find(l => l.id === likeId);
      alert(`${likedPerson.name}さんとマッチしました！🎉`);
      
      // リストから削除
      const updatedLikes = likes.filter(like => like.id !== likeId);
      setLikes(updatedLikes);
      localStorage.setItem('userLikes', JSON.stringify(updatedLikes));
      
      // マッチ画面へ遷移
      setTimeout(() => {
        navigate('/matches');
      }, 1000);
    } catch (error) {
      console.error('Failed to like back:', error);
    }
  };

  const handlePass = (likeId) => {
    // パスした場合、リストから削除
    const updatedLikes = likes.filter(like => like.id !== likeId);
    setLikes(updatedLikes);
    localStorage.setItem('userLikes', JSON.stringify(updatedLikes));
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return `${Math.floor(diffDays / 7)}週間前`;
  };

  const getFilteredLikes = () => {
    let filtered = [...likes];
    
    switch (filter) {
      case 'recent':
        // 24時間以内
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        filtered = filtered.filter(like => like.likedAt > oneDayAgo);
        break;
      case 'nearby':
        // 5km以内
        filtered = filtered.filter(like => like.distance <= 5);
        break;
      default:
        // all
        break;
    }
    
    return filtered.sort((a, b) => b.likedAt - a.likedAt);
  };

  const handleViewProfile = (like) => {
    // プロフィール詳細モーダルを表示（将来的に実装）
    console.log('View profile:', like);
  };

  const filteredLikes = getFilteredLikes();

  if (loading) {
    return (
      <div className="container">
        <div style={{ padding: '20px', paddingBottom: '80px' }}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ padding: '16px', paddingBottom: '80px', minHeight: '100vh', background: '#f5f7fa' }}>
        {/* ヘッダー */}
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              margin: 0,
              color: '#333'
            }}>
              あなたに「いいね！」
            </h2>
            <div style={{
              background: 'linear-gradient(90deg, #fd5068, #ff6036)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {filteredLikes.length}人
            </div>
          </div>

          {/* フィルター */}
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            {[
              { value: 'all', label: 'すべて', count: likes.length },
              { value: 'recent', label: '最近', count: likes.filter(l => l.likedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)).length },
              { value: 'nearby', label: '近くの人', count: likes.filter(l => l.distance <= 5).length }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: filter === option.value ? 'linear-gradient(90deg, #fd5068, #ff6036)' : '#f5f5f5',
                  color: filter === option.value ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {option.label}
                {option.count > 0 && (
                  <span style={{
                    marginLeft: '4px',
                    opacity: 0.8,
                    fontSize: '12px'
                  }}>
                    ({option.count})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Likesグリッド */}
        {filteredLikes.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            {filteredLikes.map((like, index) => (
              <div
                key={like.id}
                style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => handleViewProfile(like)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {/* 画像部分 */}
                <div style={{
                  aspectRatio: '3/4',
                  background: '#f0f0f0',
                  position: 'relative'
                }}>
                  {like.photo ? (
                    <img
                      src={`http://localhost:5000${like.photo}`}
                      alt={like.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, 
                        ${['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#dda0dd', '#98d8c8', '#ffd93d', '#a8e6cf'][index % 8]}, 
                        ${['#ee5a6f', '#44a08d', '#3a8cc1', '#86c7a4', '#cd91cd', '#88c8b8', '#ffb347', '#98d8b8'][index % 8]})`
                    }}>
                      <span style={{
                        fontSize: '48px',
                        color: 'white',
                        fontWeight: '600'
                      }}>
                        {like.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* バッジ */}
                  {like.verified && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: 'rgba(29, 161, 242, 0.9)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backdropFilter: 'blur(10px)'
                    }}>
                      ✓ 認証済み
                    </div>
                  )}

                  {/* 時間 */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '500',
                    backdropFilter: 'blur(10px)'
                  }}>
                    {getTimeAgo(like.likedAt)}
                  </div>

                  {/* グラデーションオーバーレイ */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '80%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5), transparent)',
                    pointerEvents: 'none'
                  }}/>

                  {/* 情報 */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '12px',
                    color: 'white'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '6px',
                      marginBottom: '4px'
                    }}>
                      <span style={{ fontSize: '18px', fontWeight: '600' }}>
                        {like.name}
                      </span>
                      <span style={{ fontSize: '16px', opacity: 0.9 }}>
                        {like.age}
                      </span>
                    </div>

                    {/* 職業・学校 */}
                    <div style={{
                      fontSize: '12px',
                      marginBottom: '6px',
                      opacity: 0.9
                    }}>
                      {like.job && <span>{like.job}</span>}
                      {like.job && like.school && <span> • </span>}
                      {like.school && <span>{like.school}</span>}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      marginBottom: '8px',
                      opacity: 0.8
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{like.distance} km先</span>
                    </div>

                    {like.interests && like.interests.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px'
                      }}>
                        {like.interests.slice(0, 3).map((interest, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: 'rgba(255, 255, 255, 0.2)',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '10px',
                              backdropFilter: 'blur(10px)'
                            }}
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* アクションボタン */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '12px'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePass(like.id);
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '20px',
                          color: '#fd5068',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fd5068';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                          e.currentTarget.style.color = '#fd5068';
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>×</span>
                        パス
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikeBack(like.id);
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '20px',
                          color: '#44d884',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#44d884';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                          e.currentTarget.style.color = '#44d884';
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>♥</span>
                        いいね！
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #fd5068, #ff6036)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
              {filter === 'recent' ? '最近の「いいね」はありません' :
               filter === 'nearby' ? '近くの人からの「いいね」はありません' :
               'まだ「いいね」がありません'}
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
              スワイプを続けて、もっと多くの人にあなたのプロフィールを見てもらいましょう
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

        {/* 統計情報 */}
        {likes.length > 0 && (
          <div style={{
            marginTop: '24px',
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#333'
            }}>
              統計
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: '#f5f7fa',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#fd5068',
                  marginBottom: '4px'
                }}>
                  {likes.length}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666'
                }}>
                  総いいね数
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: '#f5f7fa',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#44d884',
                  marginBottom: '4px'
                }}>
                  {likes.filter(l => l.verified).length}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666'
                }}>
                  認証済み
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: '#f5f7fa',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#4ecdc4',
                  marginBottom: '4px'
                }}>
                  {Math.round(likes.reduce((sum, l) => sum + l.distance, 0) / likes.length)}
                  <span style={{ fontSize: '14px', fontWeight: '400' }}>km</span>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666'
                }}>
                  平均距離
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ボトムナビゲーション */}
      <BottomNavigation />
    </div>
  );
};

export default Likes;
