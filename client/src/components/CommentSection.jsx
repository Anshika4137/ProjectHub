import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function CommentSection({ task, onUpdate }) {
  const { token, user } = useAuth();
  const [comment, setComment] = useState('');
  // ── NEW ──
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  // ─────────

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

  // ── NEW: edit comment ──
  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;
    try {
      await axios.put(
        `http://localhost:5000/api/tasks/${task._id}/comment/${commentId}`,
        { text: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      setEditText('');
      onUpdate();
    } catch (err) {
      console.log(err);
    }
  };

  // ── NEW: delete comment ──
  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/tasks/${task._id}/comment/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
        {task.comments?.map((c) => (
          <div key={c._id} className="bg-gray-50 border border-gray-100 p-3 rounded-xl hover:bg-gray-100 transition-colors duration-200">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                {c.user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="text-indigo-700 text-xs font-semibold">{c.user?.name || 'Unknown'}</span>
              <span className="text-gray-400 text-xs ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>

              {/* ── NEW: edit/delete buttons — only for comment owner ── */}
              {c.user?._id === user?.id && (
                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={() => { setEditingId(c._id); setEditText(c.text); }}
                    className="text-gray-400 hover:text-indigo-500 transition-colors p-0.5 rounded"
                    title="Edit"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteComment(c._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
              {/* ───────────────────────────────────────────────────── */}
            </div>

            {/* ── NEW: inline edit mode ── */}
            {editingId === c._id ? (
              <div className="pl-8 flex gap-2 mt-1">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEditComment(c._id)}
                  className="flex-1 p-1.5 rounded-lg bg-white text-gray-800 border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-sm"
                  autoFocus
                />
                <button
                  onClick={() => handleEditComment(c._id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="text-gray-600 text-sm leading-relaxed pl-8">{c.text}</p>
            )}
            {/* ─────────────────────────── */}
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