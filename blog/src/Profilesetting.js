import React, { useState, useEffect, useCallback } from "react";
import "./Profilesetting.css";
import Header from './Header';

function ProfileSettings() {
  const [userID, setUserID] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    nickname: "",
    introduce: "",
    profile_image: "",
  });

  // userID 추출
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    console.log("Stored Token:", token); // 토큰 확인
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Decoded Payload:", payload); // 디코딩된 페이로드 확인
        if (payload.sub) {
          setUserID(payload.sub);
          console.log("UserID Set to:", payload.sub); // 추출된 userID 확인
        } else {
          setError("토큰에 유효한 사용자 정보가 없습니다.");
        }
      } catch (error) {
        console.error("토큰 디코딩 실패:", error);
        setError("유효하지 않은 토큰입니다.");
      }
    } else {
      setError("로그인이 필요합니다.");
    }
  }, []);

  // 사용자 데이터 가져오기
  const fetchUserData = useCallback(async () => {
    if (!userID) {
      console.warn("fetchUserData 호출 시 userID가 없습니다.");
      return;
    }

    console.log("Fetching data for userID:", userID);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("인증 토큰이 없습니다.");

      const response = await fetch(`/user/${userID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Fetch Response Status:", response.status); // 응답 상태 코드 확인
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Fetch Error Details:", errorData);
        throw new Error("사용자 정보를 가져오지 못했습니다.");
      }

      const data = await response.json();
      console.log("Fetched User Data:", data); // 가져온 사용자 데이터 확인
      setUserData(data);
      setFormData({
        email: data.email || "",
        phone: data.phone || "",
        nickname: data.nickname || "",
        introduce: data.introduce || "",
        profile_image: data.profile_image || "",
      });
      setError(null);
    } catch (error) {
      console.error("fetchUserData 에러:", error.message);
      setError(error.message);
    }
  }, [userID]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form Input Changed - ${name}:`, value); // 입력 변경 확인
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 프로필 업데이트 함수
  const handleProfileUpdate = async () => {
    console.log("Updating Profile with Data:", formData); // 업데이트 데이터 확인
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("인증 토큰이 없습니다.");

      const response = await fetch(`/user/${userID}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Update Response Status:", response.status); // 응답 상태 코드 확인
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Update Error Details:", errorData);
        throw new Error("프로필 업데이트에 실패했습니다.");
      }

      alert("프로필이 성공적으로 업데이트되었습니다.");
      setIsEditing(false);
      fetchUserData();
    } catch (error) {
      console.error("handleProfileUpdate 에러:", error.message);
      alert(`프로필 업데이트 실패: ${error.message}`);
    }
  };

  if (error) return <div className="error">에러: {error}</div>;
  if (!userData) return <div>로딩 중...</div>;

  return (
    <div className="sw">
    <Header />
    <div className="profile-container2">
      <h1>프로필 설정</h1>
      <div className="profile-content2">
        <img
          src={formData.profile_image || "/image/combined.png"}
          alt="프로필 이미지"
          className="profile-image2"
        />
        <button onClick={() => setIsEditing((prev) => !prev)}>
          {isEditing ? "취소" : "편집"}
        </button>
        {isEditing ? (
          <div className="profile-form">
            <label>
              이메일:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </label>
            <label>
              전화번호:
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </label>
            <label>
              닉네임:
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
              />
            </label>
            <label>
              자기소개:
              <textarea
                name="introduce"
                value={formData.introduce}
                onChange={handleInputChange}
              />
            </label>
            <label>
              프로필 이미지 URL:
              <input
                type="text"
                name="profile_image"
                value={formData.profile_image}
                onChange={handleInputChange}
              />
            </label>
            <button onClick={handleProfileUpdate}>저장</button>
          </div>
        ) : (
          <div>
            <p>이메일: {userData.email}</p>
            <p>전화번호: {userData.phone}</p>
            <p>닉네임: {userData.nickname}</p>
            <p>자기소개: {userData.introduce}</p>
          </div>
        )}
      </div>
    </div></div>
  );
}

export default ProfileSettings;
