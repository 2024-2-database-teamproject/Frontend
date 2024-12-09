import React, { useState, useEffect } from 'react';
import './Createpost.css';
import Header from './Header';
function CreatePost() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    keywords: [],
    attachments: [],
  });
  const [files, setFiles] = useState([]);
  const [userId, setUserId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 컴포넌트가 로드될 때 토큰에서 user_id 추출
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1])); // JWT 디코딩
        console.log('토큰 페이로드:', payload); // 디버깅용
        if (payload.sub) {
          setUserId(payload.sub); // payload에서 sub를 userId로 설정
        } else {
          setErrorMessage('토큰에 유효한 사용자 정보가 없습니다.');
        }
      } catch (error) {
        console.error('토큰 디코딩 실패:', error);
        setErrorMessage('유효하지 않은 토큰입니다.');
      }
    } else {
      setErrorMessage('로그인이 필요합니다.');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['title', 'content'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        setErrorMessage(`${field}을(를) 입력해주세요.`);
        return;
      }
    }

    if (!userId) {
      setErrorMessage('로그인이 필요합니다.');
      return;
    }

    setErrorMessage('');

    const data = new FormData();
    // FormData에 텍스트 데이터 추가
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => data.append(key, v));
      } else {
        data.append(key, value || '');
      }
    });

    // FormData에 user_id 추가
    data.append('user_id', userId);
    console.log('FormData user_id:', userId); // userId 확인
    // FormData에 파일 추가
    Array.from(files).forEach((file) => data.append('files', file));

    try {
        const token = localStorage.getItem('access_token'); // 토큰 가져오기
        const response = await fetch('/posts/', {
        method: 'POST',
        body: data,
        headers: {
            Authorization: `Bearer ${token}`, // Authorization 헤더 추가
          },
      });

      if (response.ok) {
        alert('게시물이 성공적으로 업로드되었습니다.');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.detail || '게시물 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('네트워크 오류:', error);
      setErrorMessage('서버 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className='ful-cont'><Header></Header>
    <div className='create-cont'>
      
      <h1 className='hea'>게시물 작성</h1>
      <form className='fo' onSubmit={handleSubmit}>
        <input className='in1'
          type="text"
          name="title"
          placeholder="제목"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea className='tx1'
          name="content"
          placeholder="내용"
          value={formData.content}
          onChange={handleChange}
          required
        />
        <input className='in2'
          type="text"
          name="keywords"
          placeholder="키워드 (쉼표로 구분)"
          value={formData.keywords}
          onChange={(e) =>
            setFormData({
              ...formData,
              keywords: e.target.value.split(',').map((keyword) => keyword.trim()),
            })
          }
        />
        <input className='in3'
          type="file"
          name="files"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
        {errorMessage && <p>{errorMessage}</p>}
        <button className='bu' type="submit">게시물 업로드</button>
      </form>
    </div></div>
  );
}

export default CreatePost;
