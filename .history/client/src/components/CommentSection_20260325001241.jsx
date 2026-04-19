import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function CommentSection({ task, onUpdate }) {
  const { token } = useAuth();
  const [comment, setComment] = useState('');

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await axios.post(
        `http://localhost:5000/api/tasks/${task._id}/comment`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment('');
      onUpdate();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="mt-4">
      <h4 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Comments
      </h4>

      <div className="space-y-2 max-h-48 overflow-y-auto mb-3 pr-1">
        {task.comments?.length === 0 && (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
          </div>
        )}
        {task.comments?.map((c, i) => (
          <div key={i} className="bg-gray-50 border border-gray-100 p-3 rounded-xl hover:bg-gray-100 transition-colors duration-200">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                {c.user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="text-indigo-700 text-xs font-semibold">
                {c.user?.name || 'Unknown'}
              </span>
              <span className="text-gray-400 text-xs ml-auto">
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed pl-8">{c.text}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a comment..."
          className="flex-1 p-2.5 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm transition-all"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
        />
        <button
          onClick={handleAddComment}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Send
        </button>
      </div>
    </div>
  );
}