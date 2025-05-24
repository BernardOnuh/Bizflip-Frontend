import React, { useState } from 'react';

const CommentSection = ({ nftId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { id: Date.now(), text: newComment, likes: 0, dislikes: 0 }]);
      setNewComment('');
      setAlertMessage('Comment posted successfully!');
      setShowAlert(true);
      
      // Auto-hide alert after 3 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
  };

  const handleLike = (commentId) => {
    setComments(comments.map(comment =>
      comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment
    ));
  };

  const handleDislike = (commentId) => {
    setComments(comments.map(comment =>
      comment.id === commentId ? { ...comment, dislikes: comment.dislikes + 1 } : comment
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h4 className="text-lg font-medium text-purple-800 mb-3">Comments</h4>
      
      {/* Comment input */}
      <div className="mb-4">
        <textarea
          className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          rows="3"
        />
        
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition flex-1 md:flex-none"
            onClick={handleAddComment}
          >
            Post Comment
          </button>
          
          <button
            className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition flex-1 md:flex-none"
            onClick={() => setIsModalOpen(true)}
          >
            View All Comments ({comments.length})
          </button>
        </div>
      </div>
      
      {/* Success alert */}
      {showAlert && (
        <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-700 p-3 rounded mb-4 transition-all">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{alertMessage}</span>
          </div>
        </div>
      )}
      
      {/* Recent comments preview (showing up to 2 recent comments) */}
      {comments.length > 0 && (
        <div className="space-y-3 mb-2">
          <h5 className="text-sm font-medium text-gray-500">Recent Comments</h5>
          {comments.slice(-2).map(comment => (
            <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-700 mb-2">{comment.text}</p>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <button 
                  className="flex items-center space-x-1 hover:text-purple-600 transition"
                  onClick={() => handleLike(comment.id)}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>{comment.likes}</span>
                </button>
                
                <button 
                  className="flex items-center space-x-1 hover:text-purple-600 transition"
                  onClick={() => handleDislike(comment.id)}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                  </svg>
                  <span>{comment.dislikes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal for all comments */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Comments for {nftId}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 transition"
                onClick={() => setIsModalOpen(false)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700 mb-2">{comment.text}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <button 
                          className="flex items-center space-x-1 hover:text-purple-600 transition"
                          onClick={() => handleLike(comment.id)}
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          <span>{comment.likes}</span>
                        </button>
                        
                        <button 
                          className="flex items-center space-x-1 hover:text-purple-600 transition"
                          onClick={() => handleDislike(comment.id)}
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                          </svg>
                          <span>{comment.dislikes}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="mt-2">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;