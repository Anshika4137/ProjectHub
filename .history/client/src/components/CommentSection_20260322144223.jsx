import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function CommentSection({ task, onUpdate }) {
  const { token, user } = useAuth();
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
      <h4 className="text-white font-semibold mb-3">💬 Comments</h4>
      <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
        {task.comments?.length === 0 && (
          <p className="text-gray-500 text-sm">No comments yet</p>
        )}
        {task.comments?.map((c, i) => (
          <div key={i} className="bg-gray-700 p-3 rounded-lg">
            {/* 👤 Show who commented */}
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                👤 {c.user?.name || 'Unknown'}
              </span>
              <span className="text-gray-500 text-xs">
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-300 text-sm">{c.text}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a comment..."
          className="flex-1 p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
        />
        <button
          onClick={handleAddComment}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
