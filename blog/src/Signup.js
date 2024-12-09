import React, { useState } from 'react';
import './Signup.css'; 
import Header from './Header'; 

function Signup() {
  const [formData, setFormData] = useState({
    userID: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    birth: '',
    name: '',
    nickname: '',
    introduce: '',
    profile_image: null, // 서버에서 기대하는 필드 이름
  });

  const [errorMessage, setErrorMessage] = useState('');

  // 입력값 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 파일 입력 처리
  const handleFileChange = (e) => {
    setFormData({ ...formData, profile_image: e.target.files[0] }); // 서버에서 기대하는 필드 이름 사용
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    const requiredFields = ['userID', 'email', 'password', 'phone', 'gender', 'birth', 'name', 'nickname'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        setErrorMessage(`${field}을(를) 입력해주세요.`);
        return;
      }
    }

    setErrorMessage(''); // 오류 메시지 초기화

     // FormData 생성
  const data = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    if (key === "profile_image" && value === null) {
      data.append(key, new File([""], "")); // 빈 파일로 전송
    } else {
      data.append(key, value || ""); // null 값을 빈 문자열로 처리
    }
  });

    // FormData 확인 (디버깅용)
    for (let pair of data.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      const response = await fetch('/user/signup', {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        alert('회원가입 성공!');
      } else {
        const errorText = await response.text(); // 서버 응답 메시지 확인
        console.error('서버 오류 응답:', errorText);
        setErrorMessage('회원가입 실패: ' + errorText);
      }
    } catch (error) {
      console.error('네트워크 오류:', error);
      setErrorMessage('서버 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className='full-container'>
      <Header></Header>
      <div className="signup-container">
        <h1>회원가입</h1>
        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="text"
            name="userID"
            placeholder="아이디"
            value={formData.userID}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="전화번호"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">성별 선택</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
          <input
            type="date"
            name="birth"
            placeholder="생년월일"
            value={formData.birth}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="nickname"
            placeholder="닉네임"
            value={formData.nickname}
            onChange={handleChange}
            required
          />
          <textarea
            name="introduce"
            placeholder="자기소개"
            value={formData.introduce}
            onChange={handleChange}
          />
          <input
            type="file"
            name="profile_image" // 서버에서 기대하는 이름
            accept="image/*"
            onChange={handleFileChange}
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className="signup-button">
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
