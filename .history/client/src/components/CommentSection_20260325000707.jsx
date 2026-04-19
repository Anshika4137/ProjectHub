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
      {/* FIXED: was text-white (invisible on white modal), now text-gray-800 */}
      <h4 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Comments
      </h4>

      <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
        {task.comments?.length === 0 && (
          {/* FIXED: was text-gray-500 on dark bg, now clearly visible on white */}
          <p className="text-gray-400 text-sm text-center py-4">No comments yet</p>
        )}
        {task.comments?.map((c, i) => (
          {/* FIXED: was bg-gray-700 (dark card), now bg-gray-50 (light card matching modal) */}
          <div key={i} className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              {/* FIXED: was bg-blue-600 text-white badge, now indigo to match app theme */}
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 text-xs font-bold">
                  {c.user?.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              {/* FIXED: name was hidden inside blue badge, now clearly shown */}
              <span className="text-gray-800 text-xs font-semibold">{c.user?.name || 'Unknown'}</span>
              <span className="text-gray-400 text-xs">
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
            </div>
            {/* FIXED: was text-gray-300 (light text on dark), now text-gray-600 (dark text on light) */}
            <p className="text-gray-600 text-sm ml-8">{c.text}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {/* FIXED: was bg-gray-700 text-white (dark input), now bg-gray-50 text-gray-800 (light input) */}
        <input
          type="text"
          placeholder="Add a comment..."
          className="flex-1 p-2.5 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
        />
        {/* FIXED: was bg-blue-600, now bg-indigo-600 to match app theme */}
        <button
          onClick={handleAddComment}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
}