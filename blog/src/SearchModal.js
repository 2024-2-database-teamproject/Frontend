import React, { useState, useEffect } from "react";
import "./SearchModal.css";

function SearchModal() {
  const [isOpen, setIsOpen] = useState(false); // 검색창 열림 상태
  const [query, setQuery] = useState(""); // 검색어 상태
  const [chatMessages, setChatMessages] = useState([]); // 채팅 메시지
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 에러 메시지
  const [userId, setUserId] = useState(""); // 유저 ID 상태 추가

  // 컴포넌트가 로드될 때 토큰에서 user_id 추출
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1])); // JWT 디코딩
        console.log("토큰 페이로드:", payload); // 디버깅용
        if (payload.sub) {
          setUserId(payload.sub); // payload에서 sub를 userId로 설정
        } else {
          setError("토큰에 유효한 사용자 정보가 없습니다.");
        }
      } catch (err) {
        console.error("토큰 디코딩 실패:", err);
        setError("유효하지 않은 토큰입니다.");
      }
    } else {
      setError("로그인이 필요합니다.");
    }
  }, []);

  // 벡터 DB 업데이트 API 호출
  const updateVectorDB = async () => {
    if (!userId) {
      console.error("userId가 제공되지 않았습니다.");
      return;
    }
    try {
      const response = await fetch(`http://125.178.118.25:5000/vectordb/update/${userId}`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("벡터 DB 업데이트 실패");
      }
      console.log("벡터 DB 업데이트 성공");
    } catch (err) {
      console.error("벡터 DB 업데이트 중 오류:", err);
    }
  };

  // 검색창 열기
  const openSearch = () => {
    setIsOpen(true);
    updateVectorDB(); // 벡터 DB 업데이트 호출
  };

  // 검색창 닫기
  const closeSearch = () => {
    setIsOpen(false);
    setQuery(""); // 검색어 초기화
    setChatMessages([]); // 채팅 메시지 초기화
    setError(null); // 에러 초기화
  };

  // 검색 버튼 클릭 처리
  const handleSearch = async () => {
    if (query.trim() === "") return;
  
    const userMessage = { type: "user", text: query };
    setChatMessages((prev) => [userMessage, ...prev]);
  
    try {
      setLoading(true);
      setError(null);
  
      const response = await fetch("http://125.178.118.25:5000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query, // 소문자 key로 변경
          user_id: userId, // key 이름 수정
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("백엔드 에러 응답:", errorData);
        throw new Error(errorData.message || "검색 요청 실패");
      }
  
      const result = await response.json();
      const botMessage = {
        type: "bot",
        text: result?.answer || "검색 결과가 없습니다.",
      };
  
      setChatMessages((prev) => [botMessage, ...prev]);
    } catch (err) {
      console.error("검색 요청 중 오류:", err);
      setError("검색 요청 중 오류 발생: " + err.message);
    } finally {
      setLoading(false);
    }
  
    setQuery(""); // 입력 초기화
  };
  

  return (
    <div>
      {/* 기본 검색창 */}
      <div className="search-container" onClick={openSearch}>
        <img
          className="search-icon"
          src="/image/search.png"
          alt="검색 아이콘"
        />
        <input
          className="search-input"
          type="text"
          placeholder="RAG 검색"
          readOnly
        />
      </div>

      {/* 검색창이 열렸을 때 표시 */}
      {isOpen && (
        <div className="search-modal">
          <div className="close-container">
            <button className="close-button" onClick={closeSearch}>
              &times;
            </button>
          </div>
          <div className="search-results">
            {loading && <p>검색 중...</p>} {/* 로딩 메시지 */}
            {error && <p style={{ color: "red" }}>{error}</p>} {/* 에러 메시지 */}
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${
                  message.type === "user" ? "user-message" : "bot-message"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <div className="search-input-section">
            <input
              className="search-modal-input"
              type="text"
              placeholder="질문을 입력하세요..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="search-button" onClick={handleSearch}>
              전송
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchModal;
