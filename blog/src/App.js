import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Sad from './Sad';
import Header from './Header';
import Login from './Login';
import Signup from './Signup';
import Createpost from './Createpost';
import Profilesetting from './Profilesetting';

// 라우터
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/sad/:postId" element={<Sad />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Createpost" element={<Createpost />} />
        <Route path="/profilesetting" element={<Profilesetting />} />
      </Routes>
    </Router>
  );
}

function PostList() {
  // 게시글 목록을 가져오는 API 함수
  const fetchPosts = async (page = 1) => {
    console.log('[INFO] API 요청 시작: /posts/trending?page=${page}');
    try {
      const response = await fetch(`/posts/trending?page=${page}&limit=20`); // API 요청 limit: 한 페이지 게시글 개수
      console.log(`[INFO] 응답 상태: ${response.status}, URL: ${response.url}`); // 응답 상태 로그
      if (!response.ok) {
        console.error(`[ERROR] API 요청 실패, 상태 코드: ${response.status}`);
        throw new Error('API 요청 실패');
      }
      const data = await response.json(); // JSON 파싱
      console.log('[INFO] API 데이터 파싱 성공:', data);
      return data.posts; // posts 배열 반환
    } catch (error) {
      console.error('[ERROR] 게시글 불러오기 실패:', error);
      return []; // 실패 시 빈 배열 반환
    }
  };

  // 상태 선언
  const [selectedButton, setSelectedButton] = useState('popular');
  const [posts, setPosts] = useState([]);
  const [followers] = useState([]); // 팔로우한 유저 리스트 상태 추가

  const handleButtonClick = (button) => {
    console.log(`[INFO] 버튼 클릭: ${button}`);
    setSelectedButton(button);
  };

  // 게시글 목록을 API로 불러오기
  useEffect(() => {
    console.log('[INFO] 게시글 목록 로드 시작');
    const loadPosts = async () => {
      const postData = await fetchPosts(10);//해당 페이지 불러오기
      console.log('[INFO] 불러온 게시글 데이터:', postData);
      setPosts(postData);
    };
    loadPosts();
  }, []);

  // 필터링 및 조건부 렌더링 관련 로그
  const popularPosts = posts.filter((post) => post.count_likes >= 0);
  console.log('[DEBUG] 인기 게시글 수:', popularPosts.length);

  const isFollowing = followers.length > 0;
  console.log('[DEBUG] 팔로우 유저 여부:', isFollowing);

  return (
    <div className="App">
      <Header />
      <div className="selector">
        <button
          id="popular"
          className={selectedButton === 'popular' ? 'selected' : 'not-selected'}
          onClick={() => handleButtonClick('popular')}
        >
          인기글
        </button>
        <button
          id="follow"
          className={selectedButton === 'follow' ? 'selected' : 'not-selected'}
          onClick={() => handleButtonClick('follow')}
        >
          팔로우
        </button>
      </div>
      <div className="post-container">
        {selectedButton === 'follow' && !isFollowing && (
          <p>[INFO] 팔로우한 유저가 없습니다.</p>
        )}
        {selectedButton === 'popular' && popularPosts.length === 0 ? (
          <p>[INFO] 게시글이 없습니다.</p>
        ) : (
          selectedButton === 'popular' &&
          popularPosts.map((post) => (
            <Link
              key={post.postID} // postID에 맞게 key 수정
              to={`/sad/${post.postID}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <DummyPost post={post} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

// 게시글 컴포넌트
function DummyPost({ post }) {
  console.log('[INFO] DummyPost 렌더링:', post);
  return (
    <div className="post">
      <h2>{post.title}</h2> {/* 서버 데이터와 일치 */}
      <div className="bottom">
        <p id="second">{new Date(post.create_at).toLocaleDateString()}</p>
        <div className="post-footer">
          <div className="author">
            <span>by {post.nickname}</span>
          </div>
          <div className="actions">
            <img src="image/liked.png" alt="좋아요 이미지" />
            {post.count_likes || 0}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
