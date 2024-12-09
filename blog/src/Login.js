import React, { useState } from 'react';
import './Login.css';
import Header from './Header'; // Header 컴포넌트 임포트
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // 5초 타임아웃을 설정하는 fetch 함수
  const fetchWithTimeout = (url, options, timeout = 5000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), timeout)
      ),
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 제출 방지

    // 유효성 검사
    if (!username || !password) {
      setErrorMessage('아이디와 비밀번호를 입력해주세요!');
      return;
    }

    setErrorMessage(''); // 오류 메시지 초기화

    // 서버로 로그인 요청 보내기
    try {
      const response = await fetchWithTimeout('/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // 서버 요구사항
        },
        body: new URLSearchParams({
          grant_type: 'password', // 서버가 요구하는 값
          username, // 입력받은 아이디
          password, // 입력받은 비밀번호
        }),
      });

      if (response.ok) {
        const data = await response.json(); // 서버의 응답 데이터
        console.log('로그인 성공:', data);

        // 토큰 저장 (예: 로컬 스토리지)
        localStorage.setItem('access_token', data.access_token);

        // 메인 화면으로 이동
        navigate('/');
      } else {
        // 에러 상태 코드와 메시지 표시
        const errorData = await response.json();
        const errorMsg = errorData.detail?.[0]?.msg || '아이디 혹은 비밀번호가 틀렸습니다.';
        setErrorMessage(`에러 코드: ${response.status} - ${errorMsg}`);
      }
    } catch (error) {
      // 타임아웃 또는 네트워크 오류 처리
      if (error.message === 'TIMEOUT') {
        setErrorMessage('서버 응답 시간이 초과되었습니다.');
      } else {
        setErrorMessage(`네트워크 오류: ${error.message}`);
      }
      console.error('로그인 요청 실패:', error);
    }
  };

  return (
    <div className="logcon">
      <Header />
      <div className="login-container">
        <h1 className="logo">로고</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            id="username"
            placeholder="아이디"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            id="password"
            placeholder="비밀번호"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className="login-button">로그인</button>
        </form>
        <div className="additional-links">
          <p>
            아이디 찾기 | 비밀번호 찾기 |{' '}
            <span
              className="signup-link"
              onClick={() => navigate('/signup')} // 회원가입 페이지로 이동
            >
              회원가입
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
