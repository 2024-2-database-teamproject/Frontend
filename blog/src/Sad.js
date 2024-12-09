import './Sad.css';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import SearchModal from './SearchModal';
import { FaHeart } from 'react-icons/fa';
import CommentSection from './CommentSection';
import DeletePost from "./DeletePost";

// 게시글 정보를 불러오는 함수
const fetchPostDetails = async (postId) => {
  try {
    const response = await fetch(`/posts/${postId}`);
    console.log(`fetchPostDetails 응답 상태: ${response.status}`); // 상태 코드 로그
    if (!response.ok) throw new Error('게시글을 불러오는 데 실패했습니다.');
    const data = await response.json();
    console.log('fetchPostDetails 응답 데이터:', data); // 응답 데이터 로그
    return data;
  } catch (error) {
    console.error('게시글 불러오기 실패:', error);
    throw error;
  }
};

// 유저의 모든 키워드 정보를 불러오는 함수
const fetchUserKeywords = async (userId) => {
  try {
    const response = await fetch(`/user/${userId}/main`);
    console.log(`fetchUserKeywords 응답 상태: ${response.status}`); // 상태 코드 로그
    if (!response.ok) throw new Error('키워드 정보를 불러오는 데 실패했습니다.');
    const data = await response.json();
    console.log('키워드 정보:', data); // 응답 데이터 로그
    return data;
  } catch (error) {
    console.error('키워드 정보 불러오기 실패:', error);
    throw error;
  }
};

function Sad() {
  const isLikingRef = useRef(false);
  const { postId } = useParams();
  const [postDetails, setPostDetails] = useState(null);
  const [userKeywords, setUserKeywords] = useState(null);
  const [error, setError] = useState(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [userId, setUserId] = useState(''); // userID 상태 추가

  // 컴포넌트 로드 시 토큰에서 user_id 추출
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1])); // JWT 디코딩
        console.log('토큰 페이로드:', payload); // 디버깅용
        if (payload.sub) {
          setUserId(payload.sub); // payload에서 sub를 userId로 설정
        } else {
          setError('토큰에 유효한 사용자 정보가 없습니다.');
        }
      } catch (error) {
        console.error('토큰 디코딩 실패:', error);
        setError('유효하지 않은 토큰입니다.');
      }
    } else {
      setError('로그인이 필요합니다.');
    }
  }, []);

  useEffect(() => {
    const loadPostDetails = async () => {
      try {
        const postData = await fetchPostDetails(postId);
        setPostDetails(postData);
        setIsLiked(postData.like_state); // 좋아요 상태 동기화
        setError(null);

        // 유저의 키워드 정보 가져오기
        const userData = await fetchUserKeywords(postData.userID);
        setUserKeywords(userData.keyword_count);
      } catch (error) {
        setError('게시글 정보를 불러오는 데 실패했습니다.');
      }
    };
    loadPostDetails();
  }, [postId]);

  const handleAddComment = async (commentData) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    // userID를 포함한 댓글 데이터 준비
    const updatedCommentData = {
      ...commentData,
      userID: userId, // userID 추가
    };

    console.log('보내는 댓글 데이터:', updatedCommentData); // 요청 데이터 로그

    try {
      const response = await fetch('/comments/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCommentData),
      });
      console.log('서버 응답 상태 코드:', response.status); // 상태 코드 로그
      const responseText = await response.text(); // JSON 응답 여부 확인을 위해 텍스트로 읽기
      console.log('서버 응답 텍스트:', responseText);
      try {
        const responseData = JSON.parse(responseText);
        console.log('파싱된 응답 데이터:', responseData);
        if (!response.ok) {
          throw new Error(responseData.detail || '댓글 추가에 실패했습니다.');
        }
        setPostDetails((prevDetails) => ({
          ...prevDetails,
          comments: [responseData, ...prevDetails.comments],
        }));
      } catch (error) {
        console.error('JSON 파싱 실패:', error);
        throw new Error('서버 오류: ' + responseText);
      }
    } catch (error) {
      console.error('댓글 추가 실패:', error);
      alert('댓글 추가에 실패했습니다.');
    }
  };

  if (!postDetails && !error) return <div>게시글을 불러오는 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="Sad">
      <Header />
      <div className="profile-container">
        <div id="blank"></div>
        <div id="profile">
          <img
            src="/image/combined.png"
            alt="프로필 이미지"
            className="profile-image"
          />
          <div className="profile-details">
            <h2 className="profile-nickname">{postDetails.nickname}</h2>
            <p className="profile-info">게시글 ID: {postDetails.PostID}</p>
          </div>
          <div className='deletepo'><DeletePost postId={postId} /></div>
        </div>
      </div>
      <div className="follow">
        <p>0 팔로워 0 팔로잉</p>
      </div>
      <div className="title">
        <div id="blank2"></div>
        <div className="title2">
          <h2>{postDetails.Title}</h2>
        </div>
        <button className="follow-button" >팔로우</button>
      </div>
      <div className="date">
        <div className="blank3"></div>
        <p className="date2">
          {new Date(postDetails.Create_at).toLocaleDateString()}
        </p>
        <FaHeart color="black" />&nbsp;  0
      </div>
      <div className="contents-container">
        <div className="leftside">
          <SearchModal />
          <div className="category-container">
            <p>카테고리</p>
            <div className="category">
              {userKeywords &&
                Object.entries(userKeywords).map(([keyword, count]) => (
                  <div key={keyword} className="tag">
                    {keyword} ({count})
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="rightside">
          <p>{postDetails.Content}</p>
          <CommentSection
            comments={postDetails.comments || []} // 댓글 데이터 전달
            postId={postId}
            onAddComment={handleAddComment} // 댓글 추가 함수 전달
          />
        </div>
      </div>
      <div className="attachment-container">
        <h3>첨부파일</h3>
        <div className="attachment-list">
          {postDetails.attachment.map((file) => (
            <a
              key={file.attachmentID}
              href={`/uploads/${file.fileName}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {file.fileName}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sad;
