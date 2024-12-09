// Header.js
import React, { useState } from 'react';
import './Header.css'; 
import { useNavigate, useLocation } from 'react-router-dom'; // useNavigate 훅을 임포트

function Header() {
  const navigate = useNavigate(); // useNavigate 훅 초기화
  const location = useLocation(); // 현재 경로 확인
  const token = localStorage.getItem('access_token'); // 토큰 확인
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 메뉴 상태 추가
  const [isSearchOpen, setIsSearchOpen] = useState(false); // 검색창 상태 추가
  const [searchText, setSearchText] = useState(''); // 검색어 상태 추가

  const handleLoginClick = () => {
    navigate('/login'); // '/login' 경로로 이동
  };

  const handleProfileClick2 = () => {
    setIsDropdownOpen(!isDropdownOpen); // 드롭다운 메뉴 토글
  };
  const handleLogoutClick = () => { //로그아웃 핸들러
    localStorage.removeItem('access_token'); 

    if (location.pathname === '/') {
      window.location.reload(); 
    } else {
      navigate('/'); 
    }
  };
  const handleSearchClick = () => {
    setIsSearchOpen(!isSearchOpen); // 검색창 토글
  };

  const handleCreatePostClick = () => {
    navigate('/createpost'); // 새 글 작성 페이지로 이동
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value); // 입력된 검색어 업데이트
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // 기본 폼 제출 동작을 방지
    // 여기에서 실제 검색어 처리 로직을 추가하면 됩니다.
    console.log('검색어:', searchText);
    // 예시: API 호출을 추가하거나 페이지 이동을 할 수 있습니다.
  };
  
  // 로고 클릭 핸들러
  const handleLogoClick = () => {
    if (location.pathname === '/') {
      // 현재 경로가 '/'라면 새로고침
      window.location.reload();
    } else {
      // 다른 경로에 있다면 메인 화면으로 이동
      navigate('/');
    }
  };
  const handleProfileSettingsClick = () => {
    navigate('/profilesetting'); // 프로필 설정 페이지로 이동
  };
  return (
    <div className="header">
      <h1 onClick={handleLogoClick} style={{ cursor: 'pointer' }}>로고</h1>
      <div className="actions">
        <button onClick={handleSearchClick}>
          <img src="/image/search.png" alt="검색" />
        </button>
        {isSearchOpen && (
          <div className="search-box">
            <form onSubmit={handleSearchSubmit} className='classform'> {/* form으로 감싸서 엔터키 처리 */}
              <input 
                type="text" 
                value={searchText} 
                onChange={handleSearchChange} 
                placeholder="검색어를 입력하세요..."
                className="search-input"
              />
              <button className="search-close" onClick={handleSearchClick}>×</button>
            </form>
          </div>
        )}
        <button>
          <img src="/image/alert.png" alt="알림" />
        </button>
        {token ? (
          // 토큰이 있을 때: 프로필 버튼 표시
          <div className="profile">
             <button className="create-post" onClick={handleCreatePostClick}>
            새 글 작성
            </button>
            <button className="profileimg" onClick={handleProfileClick2}>
              <img src="/image/combined.png" alt="프로필" />
            </button>
            {isDropdownOpen && (
              <div className="dropdown">
                <ul>
                  <li>내 글 관리</li>
                  <li>팔로우 관리</li>
                  <li onClick={handleProfileSettingsClick}>프로필 설정</li>
                  <li>환경설정</li>
                  <li onClick={handleLogoutClick}>로그아웃</li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          // 토큰이 없을 때: 로그인 버튼 표시
          <button className="login" onClick={handleLoginClick}>로그인</button>
        )}
      </div>
    </div>
  );
}

export default Header;
