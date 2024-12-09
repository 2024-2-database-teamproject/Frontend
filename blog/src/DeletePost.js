import React from "react";
import { useNavigate } from "react-router-dom";

const DeletePost = ({ postId }) => {
  const navigate = useNavigate();

  const handleDeletePost = async () => {
    const confirmed = window.confirm("이 게시글을 삭제하시겠습니까?");
    if (!confirmed) return;

    const token = localStorage.getItem("access_token"); // 인증 토큰 가져오기
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch(`/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // 인증 헤더 추가
          "Content-Type": "application/json",
        },
      });

      console.log(`게시글 삭제 응답 상태: ${response.status}`);
      if (response.status === 204) {
        alert("게시글이 성공적으로 삭제되었습니다.");
        navigate("/"); // 삭제 후 메인 페이지로 이동
      } else if (response.status === 401 || response.status === 403) {
        alert("권한이 없습니다. 이 게시글을 삭제할 수 없습니다.");
      } else if (response.status === 422) {
        const errorData = await response.json();
        alert(`삭제 실패: ${errorData.detail[0].msg}`);
      } else {
        alert("게시글 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert("서버와의 통신에 실패했습니다.");
    }
  };

  return (
    <div className="delete-container">
      <button onClick={handleDeletePost} className="delete-button">
        게시글 삭제
      </button>
    </div>
  );
};

export default DeletePost;
