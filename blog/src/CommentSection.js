import React, { useState } from 'react';
import './CommentSection.css';

function CommentSection({ comments, postId, onAddComment }) {
  const [newComment, setNewComment] = useState(''); // 새 댓글 입력 상태

  const handleAddComment = async () => {
    if (!newComment || newComment.trim() === '') {
      alert('댓글 내용을 입력하세요.');
      return;
    }

    const commentData = {
      postID: parseInt(postId, 10), // postId를 숫자로 변환
      parentCommentID: 0,
      content: newComment.trim(),
    };
    console.log('전송할 댓글 데이터:', commentData); // 전송 데이터 로그
    try {
      await onAddComment(commentData); // 상위 컴포넌트에서 댓글 추가 처리
      setNewComment('');
    } catch (error) {
      console.error('댓글 추가 실패:', error);
      alert('댓글 추가에 실패했습니다.');
    }
  };

  return (
    <div className="comments-container">
      <h3>댓글</h3>
      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.commentID} className="comment-item">
            <p>
              <strong>{comment.nickname}</strong>: {comment.content}
            </p>
            <p className="comment-date">
              {new Date(comment.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <div className="comment-input-container">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="comment-input"
        />
        <button onClick={handleAddComment} className="add-comment-button">
          댓글 추가
        </button>
      </div>
    </div>
  );
}

export default CommentSection;
