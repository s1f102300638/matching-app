import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNavigation from './BottomNavigation';
import api, { API_BASE_URL } from '../config/api';

const Swipe = () => {
  const [candidates, setCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchModal, setMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0, rotation: 0 });
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [dailyStats, setDailyStats] = useState({ likes: 0, passes: 0, matches: 0 });
  const [superLikeUsed, setSuperLikeUsed] = useState(false);
  
  const cardRef = useRef(null);
  const startPosition = useRef({ x: 0, y: 0 });
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
    // 日別統計を取得（ローカルストレージから）
    const today = new Date().toDateString();
    const stats = localStorage.getItem(`stats_${today}`);
    if (stats) {
      setDailyStats(JSON.parse(stats));
    }
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/api/candidates');
      setCandidates(response.data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      // APIが利用できない場合のフォールバック
      const dummyData = [
        {
          id: 1,
          name: '山田 花子',
          age: 25,
          photo: null,
          photos: [null, null, null],
          bio: 'カフェ巡りが趣味です☕\n週末は美術館やギャラリーに行くのが好き。\n一緒に新しいお店を開拓してくれる人を探してます！',
          distance: 2,
          job: 'グラフィックデザイナー',
          company: 'クリエイティブエージェンシー',
          school: '多摩美術大学',
          height: '158cm',
          interests: ['☕ カフェ', '🎨 アート', '📷 写真', '🎬 映画', '📚 読書'],
          verified: true,
          lastActive: '1時間前',
          zodiac: '♉ 牡牛座',
          drinking: '🥂 たまに飲む',
          smoking: '🚭 非喫煙者',
          languages: ['日本語', 'English'],
          spotify: {
            artist: 'Vaundy',
            song: '踊り子'
          },
          instagram: '@hanako_design'
        },
        {
          id: 2,
          name: '佐藤 美咲',
          age: 28,
          photo: null,
          photos: [null, null],
          bio: 'ヨガとピラティスのインストラクターしてます🧘‍♀️\n健康的なライフスタイルを一緒に楽しめる人と出会いたい！\n休日はハイキングやキャンプも好きです⛰️',
          distance: 5,
          job: 'ヨガインストラクター',
          company: 'フィットネススタジオ',
          school: '日本体育大学',
          height: '165cm',
          interests: ['🧘 ヨガ', '🥗 健康', '⛰️ ハイキング', '🏕️ キャンプ', '🍳 料理'],
          verified: false,
          lastActive: '30分前',
          zodiac: '♊ 双子座',
          drinking: '🚫 飲まない',
          smoking: '🚭 非喫煙者',
          languages: ['日本語'],
          spotify: {
            artist: '米津玄師',
            song: 'Lemon'
          }
        },
        {
          id: 3,
          name: '高橋 結衣',
          age: 26,
          photo: null,
          photos: [null, null, null, null],
          bio: '都内でマーケターしてます📊\n美味しいものと楽しい会話が大好き！\n週末は料理したり、NetflixでBinge-watchingしたり。\n一緒に笑える関係が理想です😊',
          distance: 3,
          job: 'デジタルマーケター',
          company: 'IT企業',
          school: '慶應義塾大学',
          height: '162cm',
          interests: ['🍳 料理', '🎬 Netflix', '🍷 ワイン', '✈️ 旅行', '🎵 音楽'],
          verified: true,
          lastActive: 'オンライン',
          zodiac: '♌ 獅子座',
          drinking: '🍺 よく飲む',
          smoking: '🚭 非喫煙者',
          languages: ['日本語', 'English', '中文'],
          instagram: '@yui_foodie'
        },
        {
          id: 4,
          name: '田中 さくら',
          age: 24,
          photo: null,
          photos: [null],
          bio: 'パティシエ修行中です🍰\n将来は自分のお店を持つのが夢！\n甘いもの好きな人、カフェデート好きな人大歓迎です💕',
          distance: 7,
          job: 'パティシエ',
          company: 'ホテルベーカリー',
          school: '製菓専門学校',
          height: '155cm',
          interests: ['🍰 お菓子作り', '☕ カフェ', '📸 Instagram', '🎭 ミュージカル'],
          verified: true,
          lastActive: '3時間前',
          zodiac: '♓ 魚座',
          drinking: '🥂 たまに飲む',
          smoking: '🚭 非喫煙者',
          languages: ['日本語', 'Français'],
          spotify: {
            artist: 'Ed Sheeran',
            song: 'Perfect'
          }
        },
        {
          id: 5,
          name: '鈴木 あやか',
          age: 29,
          photo: null,
          photos: [null, null, null],
          bio: '外資系コンサルで働いています💼\n仕事も遊びも全力投球タイプ！\n週末は友達とBBQしたり、新しいレストラン開拓したり。\nアクティブな人だと嬉しいです✨',
          distance: 4,
          job: 'コンサルタント',
          company: '外資系コンサルティング',
          school: '東京大学',
          height: '168cm',
          interests: ['🍽️ グルメ', '💪 フィットネス', '🎾 テニス', '📚 ビジネス書', '🍷 ワイン'],
          verified: false,
          lastActive: '5時間前',
          zodiac: '♑ 山羊座',
          drinking: '🍺 よく飲む',
          smoking: '💨 たまに',
          languages: ['日本語', 'English'],
          instagram: '@ayaka_lifestyle'
        }
      ];
      setCandidates(dummyData);
      setCurrentIndex(0);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (type) => {
    const today = new Date().toDateString();
    const newStats = { ...dailyStats };
    newStats[type]++;
    setDailyStats(newStats);
    localStorage.setItem(`stats_${today}`, JSON.stringify(newStats));
  };

  const handleSwipe = async (isLike, isSuperLike = false) => {
    if (currentIndex >= candidates.length) return;

    const targetUser = candidates[currentIndex];
    
    // アニメーション
    setSwipeDirection(isLike ? 'right' : 'left');
    
    // 統計更新
    updateStats(isLike ? 'likes' : 'passes');
    
    setTimeout(async () => {
      try {
        // マッチ判定（ランダムで30%の確率でマッチ）
        const matched = isLike && Math.random() < 0.3;
        
        if (matched) {
          updateStats('matches');
          setMatchedUser(targetUser);
          setMatchModal(true);
        }

        // 次の候補へ
        if (currentIndex + 1 >= candidates.length) {
          await fetchCandidates();
        } else {
          setCurrentIndex(currentIndex + 1);
        }
        
        setSwipeDirection(null);
        setDragPosition({ x: 0, y: 0, rotation: 0 });
        setShowDetails(false);
      } catch (error) {
        console.error('Swipe failed:', error);
        setSwipeDirection(null);
      }
    }, 300);
  };

  const handleSuperLike = () => {
    if (!superLikeUsed) {
      setSuperLikeUsed(true);
      handleSwipe(true, true);
      // 24時間後にリセット
      setTimeout(() => setSuperLikeUsed(false), 24 * 60 * 60 * 1000);
    } else {
      alert('Super Likeは1日1回まで使用できます');
    }
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
    startPosition.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
    
    const deltaX = clientX - startPosition.current.x;
    const deltaY = clientY - startPosition.current.y;
    const rotation = deltaX * 0.1;
    
    setDragPosition({ x: deltaX, y: deltaY, rotation });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragPosition.x) > threshold) {
      handleSwipe(dragPosition.x > 0);
    } else {
      setDragPosition({ x: 0, y: 0, rotation: 0 });
    }
  };

  const handleRewind = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentCandidate = candidates[currentIndex];
  const nextCandidate = candidates[currentIndex + 1];
  const hasMoreCandidates = currentIndex < candidates.length - 1;

  if (loading) {
    return (
      <div className="container">
        <div className="swipe-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* ヘッダーステータスバー */}
      <div style={{
        background: 'white',
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#44d884' }}>
              {dailyStats.likes}
            </div>
            <div style={{ fontSize: '10px', color: '#999' }}>いいね</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#fd5068' }}>
              {dailyStats.passes}
            </div>
            <div style={{ fontSize: '10px', color: '#999' }}>パス</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#ffd700' }}>
              {dailyStats.matches}
            </div>
            <div style={{ fontSize: '10px', color: '#999' }}>マッチ</div>
          </div>
        </div>
        
        {/* フィルターボタン */}
        <button
          onClick={() => navigate('/profile')}
          style={{
            padding: '6px 12px',
            background: '#f5f5f5',
            border: 'none',
            borderRadius: '16px',
            color: '#666',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
          </svg>
          フィルター
        </button>
      </div>

      <div className="swipe-container">
        {currentCandidate ? (
          <div className="card-stack">
            {/* 次の次のカードのプレビュー */}
            {candidates[currentIndex + 2] && (
              <div 
                className="swipe-card" 
                style={{ 
                  zIndex: 0, 
                  opacity: 0.3, 
                  transform: 'scale(0.9) translateY(20px)',
                  pointerEvents: 'none'
                }}
              >
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  background: '#f0f0f0',
                  borderRadius: 'var(--radius-lg)'
                }}/>
              </div>
            )}
            
            {/* 次のカードのプレビュー */}
            {nextCandidate && (
              <div 
                className="swipe-card" 
                style={{ 
                  zIndex: 1, 
                  opacity: 0.5, 
                  transform: 'scale(0.95) translateY(10px)',
                  pointerEvents: 'none'
                }}
              >
                <img
                  src={nextCandidate.photo ? 
                    `${API_BASE_URL}${nextCandidate.photo}` : 
                    `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect fill='%23e0e0e0' width='400' height='600'/%3E%3C/svg%3E`
                  }
                  alt="Next"
                  className="card-image"
                />
              </div>
            )}
            
            {/* 現在のカード */}
            <div
              ref={cardRef}
              className={`swipe-card ${isDragging ? 'dragging' : ''} ${swipeDirection ? `swiping-${swipeDirection}` : ''}`}
              style={{
                zIndex: 2,
                transform: `translate(${dragPosition.x}px, ${dragPosition.y}px) rotate(${dragPosition.rotation}deg)`,
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            >
              {/* Like/Nope インジケーター */}
              {dragPosition.x > 50 && (
                <div style={{
                  position: 'absolute',
                  top: '60px',
                  left: '10px',
                  padding: '4px 8px',
                  background: 'transparent',
                  color: '#44d884',
                  border: '4px solid #44d884',
                  borderRadius: '8px',
                  fontWeight: '900',
                  fontSize: '32px',
                  transform: 'rotate(-20deg)',
                  zIndex: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}>
                  LIKE
                </div>
              )}
              {dragPosition.x < -50 && (
                <div style={{
                  position: 'absolute',
                  top: '60px',
                  right: '10px',
                  padding: '4px 8px',
                  background: 'transparent',
                  color: '#fd5068',
                  border: '4px solid #fd5068',
                  borderRadius: '8px',
                  fontWeight: '900',
                  fontSize: '32px',
                  transform: 'rotate(20deg)',
                  zIndex: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}>
                  NOPE
                </div>
              )}
              
              {/* 写真カルーセル */}
              <div style={{ position: 'relative', width: '100%', height: '65%' }}>
                <img
                  src={currentCandidate.photo ? 
                    `${API_BASE_URL}${currentCandidate.photo}` : 
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"%3E%3Crect fill="%23f0f0f0" width="400" height="600"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="20"%3E写真なし%3C/text%3E%3C/svg%3E'
                  }
                  alt={currentCandidate.name}
                  className="card-image"
                  draggable={false}
                />
                
                {/* 写真インジケーター */}
                {currentCandidate.photos && currentCandidate.photos.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    right: '8px',
                    display: 'flex',
                    gap: '4px'
                  }}>
                    {[currentCandidate.photo, ...currentCandidate.photos].filter(Boolean).map((_, idx) => (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          height: '3px',
                          background: idx === 0 ? 'white' : 'rgba(255,255,255,0.3)',
                          borderRadius: '2px'
                        }}
                      />
                    ))}
                  </div>
                )}
                
                {/* バッジ */}
                <div className="card-badges">
                  {currentCandidate.verified && (
                    <span className="badge" style={{ background: '#1da1f2' }}>
                      ✓ 認証済み
                    </span>
                  )}
                  {currentCandidate.lastActive === 'オンライン' && (
                    <span className="badge" style={{ background: '#44d884' }}>
                      ● オンライン
                    </span>
                  )}
                </div>
              </div>
              
              <div className="card-info" style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: showDetails ? 'white' : 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.7), transparent)',
                color: showDetails ? '#333' : 'white',
                padding: showDetails ? '20px 16px' : '60px 16px 16px',
                transition: 'all 0.3s ease',
                maxHeight: showDetails ? '70%' : '35%',
                overflowY: showDetails ? 'auto' : 'hidden'
              }}>
                <div className="card-name-age" style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <span style={{
                    fontSize: '26px',
                    fontWeight: '600',
                    color: showDetails ? '#333' : 'white'
                  }}>{currentCandidate.name}</span>
                  <span style={{
                    fontSize: '22px',
                    fontWeight: '400',
                    opacity: '0.9',
                    color: showDetails ? '#666' : 'white'
                  }}>{currentCandidate.age}</span>
                </div>
                
                {/* 職業・学校 */}
                {(currentCandidate.job || currentCandidate.school) && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    fontSize: '14px',
                    opacity: 0.9,
                    color: showDetails ? '#666' : 'white'
                  }}>
                    {currentCandidate.job && (
                      <>
                        <span>💼 {currentCandidate.job}</span>
                        {currentCandidate.school && <span>•</span>}
                      </>
                    )}
                    {currentCandidate.school && (
                      <span>🎓 {currentCandidate.school}</span>
                    )}
                  </div>
                )}
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{currentCandidate.distance} km先</span>
                  </div>
                  
                  {currentCandidate.height && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>📏 {currentCandidate.height}</span>
                    </div>
                  )}
                </div>
                
                {currentCandidate.bio && (
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.4',
                    opacity: '0.95',
                    marginTop: '8px',
                    whiteSpace: 'pre-wrap',
                    color: showDetails ? '#333' : 'white'
                  }}>{currentCandidate.bio}</p>
                )}
                
                {/* 詳細情報（展開時） */}
                {showDetails && (
                  <>
                    {/* 興味・関心 */}
                    {currentCandidate.interests && currentCandidate.interests.length > 0 && (
                      <div style={{ marginTop: '16px' }}>
                        <h4 style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>興味・関心</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {currentCandidate.interests.map((interest, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: '#f5f5f5',
                                padding: '6px 12px',
                                borderRadius: '16px',
                                fontSize: '13px',
                                color: '#333'
                              }}
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* ライフスタイル */}
                    <div style={{ marginTop: '16px' }}>
                      <h4 style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>ライフスタイル</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {currentCandidate.zodiac && (
                          <span style={{ fontSize: '13px', color: '#666' }}>
                            {currentCandidate.zodiac}
                          </span>
                        )}
                        {currentCandidate.drinking && (
                          <span style={{ fontSize: '13px', color: '#666' }}>
                            {currentCandidate.drinking}
                          </span>
                        )}
                        {currentCandidate.smoking && (
                          <span style={{ fontSize: '13px', color: '#666' }}>
                            {currentCandidate.smoking}
                          </span>
                        )}
                        {currentCandidate.languages && (
                          <span style={{ fontSize: '13px', color: '#666' }}>
                            🌐 {currentCandidate.languages.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Spotify */}
                    {currentCandidate.spotify && (
                      <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: '#1db954',
                        borderRadius: '8px',
                        color: 'white'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span>🎵</span>
                          <span style={{ fontSize: '12px', fontWeight: '600' }}>最近よく聴く</span>
                        </div>
                        <div style={{ fontSize: '14px' }}>
                          {currentCandidate.spotify.artist} - {currentCandidate.spotify.song}
                        </div>
                      </div>
                    )}
                    
                    {/* Instagram */}
                    {currentCandidate.instagram && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: 'linear-gradient(45deg, #f093fb, #f5576c)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        textAlign: 'center'
                      }}>
                        📸 {currentCandidate.instagram}
                      </div>
                    )}
                  </>
                )}
                
                {/* Infoボタン */}
                <button
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    right: '16px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: showDetails ? '#f0f0f0' : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(!showDetails);
                  }}
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill={showDetails ? '#666' : 'white'}
                    style={{
                      transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    {showDetails ? (
                      <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                    ) : (
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
            <h3 className="empty-state-title">新しい人を探しています</h3>
            <p className="empty-state-subtitle">
              もう少しお待ちください。<br />
              新しいマッチ候補を探しています。
            </p>
            <button
              onClick={fetchCandidates}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                background: 'linear-gradient(90deg, #fd5068, #ff6036)',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              再読み込み
            </button>
          </div>
        )}
      </div>

      {/* アクションボタン */}
      {currentCandidate && (
        <div className="action-buttons">
          <button
            className="action-btn btn-rewind"
            onClick={handleRewind}
            disabled={currentIndex === 0}
            title="前に戻る"
            style={{
              background: 'white',
              border: '2px solid #ffc107',
              color: '#ffc107',
              opacity: currentIndex === 0 ? 0.3 : 1,
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.5 3C17.15 3 21 6.85 21 11.5s-3.85 8.5-8.5 8.5c-1.65 0-3.17-.52-4.46-1.35l1.42-1.42c.91.57 2 .9 3.04.9 3.54 0 6.63-3.09 6.63-6.63S16.04 4.87 12.5 4.87 5.87 7.96 5.87 11.5c0 .97.25 1.88.64 2.68L4.5 16.19c-.73-1.3-1.13-2.76-1.13-4.31C3.37 6.85 7.35 3 12.5 3zm-.85 4v5l4.28 2.54-.72 1.21-5-3V7h1.44z"/>
            </svg>
          </button>
          
          <button
            className="action-btn btn-nope"
            onClick={() => handleSwipe(false)}
            title="NOPE"
            style={{
              background: 'white',
              border: '2px solid #fd5068',
              color: '#fd5068'
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
          
          <button
            className="action-btn btn-super-like"
            onClick={handleSuperLike}
            title="SUPER LIKE"
            style={{
              background: 'white',
              border: '2px solid #44d8ff',
              color: '#44d8ff',
              opacity: superLikeUsed ? 0.3 : 1,
              cursor: superLikeUsed ? 'not-allowed' : 'pointer',
              position: 'relative'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {!superLikeUsed && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#44d8ff',
                color: 'white',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '10px',
                fontWeight: '600'
              }}>
                1
              </span>
            )}
          </button>
          
          <button
            className="action-btn btn-like"
            onClick={() => handleSwipe(true)}
            title="LIKE"
            style={{
              background: 'white',
              border: '2px solid #44d884',
              color: '#44d884'
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
          
          <button
            className="action-btn btn-boost"
            onClick={() => alert('ブースト機能は準備中です')}
            title="BOOST"
            style={{
              background: 'white',
              border: '2px solid #8b5cf6',
              color: '#8b5cf6'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
            </svg>
          </button>
        </div>
      )}

      {/* マッチモーダル */}
      {matchModal && matchedUser && (
        <div className="modal-overlay" onClick={() => setMatchModal(false)}>
          <div className="modal-content match-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="match-modal-title">It's a Match!</h2>
            <p style={{ marginBottom: '20px', color: 'white' }}>
              あなたと {matchedUser.name} さんがお互いにLikeしました！
            </p>
            
            <div className="match-modal-avatars">
              <img
                src={user?.photo ? 
                  `${API_BASE_URL}${user.photo}` : 
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="white"%3E%3Cpath d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"%3E%3C/path%3E%3Ccircle cx="12" cy="7" r="4"%3E%3C/circle%3E%3C/svg%3E'
                }
                alt="You"
                className="match-modal-avatar"
              />
              
              <svg className="match-modal-heart" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              
              <img
                src={matchedUser.photo ? 
                  `${API_BASE_URL}${matchedUser.photo}` : 
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="white"%3E%3Cpath d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"%3E%3C/path%3E%3Ccircle cx="12" cy="7" r="4"%3E%3C/circle%3E%3C/svg%3E'
                }
                alt={matchedUser.name}
                className="match-modal-avatar"
              />
            </div>
            
            <div className="match-modal-buttons">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setMatchModal(false);
                  navigate('/matches');
                }}
                style={{
                  background: 'white',
                  color: '#fd5068'
                }}
              >
                メッセージを送る
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setMatchModal(false)}
                style={{
                  background: 'transparent',
                  border: '2px solid white',
                  color: 'white'
                }}
              >
                スワイプを続ける
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ボトムナビゲーション */}
      <BottomNavigation />
    </div>
  );
};

export default Swipe;
