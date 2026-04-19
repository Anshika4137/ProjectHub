import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CommentSection from '../components/CommentSection';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');
const COLUMNS = ['Todo', 'In Progress', 'Done'];

export default function Board() {
  const { projectId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '' });
  const [error, setError] = useState('');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberMsg, setMemberMsg] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [reassigning, setReassigning] = useState(false);
  const [reassignMsg, setReassignMsg] = useState('');
  // ── NEW ──
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editTaskForm, setEditTaskForm] = useState({ title: '', description: '', priority: 'Medium', dueDate: '' });
  const [editTaskError, setEditTaskError] = useState('');
  const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState(false);
  // ─────────

  const addNotification = (message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const removeNotification = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tasks/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchProject = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const found = res.data.find(p => p._id === projectId);
      setProject(found);
      if (found && found.owner && found.owner._id === user?.id) setIsOwner(true);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    fetchTasks();
    fetchProject();
    socket.emit('joinProject', projectId);
    socket.on('refreshTasks', () => fetchTasks());
    socket.on('notification', (data) => addNotification(data.message));
    return () => { socket.off('refreshTasks'); socket.off('notification'); };
  }, [projectId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks', { ...form, projectId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '' });
      setShowTaskModal(false);
      fetchTasks();
      socket.emit('taskUpdated', { projectId });
      socket.emit('newTask', { projectId, taskTitle: form.title });
      if (form.assignedTo) socket.emit('taskAssigned', { projectId, taskTitle: form.title, assignedTo: form.assignedTo });
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create task');
    }
  };

  // ── NEW: edit task ──
  const handleEditTask = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/tasks/${selectedTask._id}`,
        editTaskForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditTaskModal(false);
      setSelectedTask(null);
      fetchTasks();
      socket.emit('taskUpdated', { projectId });
    } catch (err) {
      setEditTaskError(err.response?.data?.msg || 'Failed to update task');
    }
  };

  // ── NEW: delete task ──
  const handleDeleteTask = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/tasks/${selectedTask._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowDeleteTaskConfirm(false);
      setSelectedTask(null);
      fetchTasks();
      socket.emit('taskUpdated', { projectId });
    } catch (err) { console.log(err); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/finduser?email=${memberEmail}`, { headers: { Authorization: `Bearer ${token}` } });
      const userId = res.data._id;
      await axios.put(`http://localhost:5000/api/projects/${projectId}/addmember`, { userId }, { headers: { Authorization: `Bearer ${token}` } });
      setMemberMsg('✅ Member added successfully!');
      setMemberEmail('');
      fetchProject();
    } catch (err) {
      setMemberMsg(err.response?.data?.msg || '❌ User not found!');
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    try {
      await axios.put(`http://localhost:5000/api/tasks/${draggableId}`, { status: destination.droppableId }, { headers: { Authorization: `Bearer ${token}` } });
      fetchTasks();
      socket.emit('taskUpdated', { projectId });
      if (destination.droppableId === 'Done') socket.emit('newTask', { projectId, taskTitle: `Task moved to Done ✅` });
    } catch (err) { console.log(err); }
  };

  const handleReassign = async (newAssigneeId) => {
    setReassigning(true);
    setReassignMsg('');
    try {
      await axios.put(`http://localhost:5000/api/tasks/${selectedTask._id}`, { assignedTo: newAssigneeId }, { headers: { Authorization: `Bearer ${token}` } });
      setReassignMsg('✅ Reassigned successfully!');
      await fetchTasks();
      setSelectedTask(prev => ({ ...prev, assignedTo: project.members.find(m => m._id === newAssigneeId) || null }));
      socket.emit('taskUpdated', { projectId });
      setTimeout(() => setReassignMsg(''), 3000);
    } catch (err) {
      setReassignMsg('❌ Failed to reassign');
    } finally {
      setReassigning(false);
    }
  };

  const getTasksByStatus = (status) => tasks.filter(task => task.status === status);

  // ── NEW: priority helpers ──
  const priorityColors = {
    'High': 'bg-red-100 text-red-700',
    'Medium': 'bg-amber-100 text-amber-700',
    'Low': 'bg-emerald-100 text-emerald-700',
  };

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  const columnColors = { 'Todo': 'border-indigo-500', 'In Progress': 'border-amber-500', 'Done': 'border-emerald-500' };
  const columnGradients = { 'Todo': 'from-indigo-500/20 to-indigo-600/10', 'In Progress': 'from-amber-500/20 to-amber-600/10', 'Done': 'from-emerald-500/20 to-emerald-600/10' };
  const columnIcons = { 'Todo': '📋', 'In Progress': '⚡', 'Done': '✅' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Navbar projectId={projectId} />

      {/* Toast Notification Stack */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto flex items-start gap-3 bg-white border border-indigo-100 shadow-xl rounded-2xl px-4 py-3 min-w-[280px] max-w-[360px] animate-slideUp">
            <div className="bg-indigo-100 p-1.5 rounded-lg flex-shrink-0">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-800 text-sm font-medium flex-1 leading-snug pt-0.5">{n.message}</p>
            <button onClick={() => removeNotification(n.id)} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/dashboard')} className="group text-gray-500 hover:text-indigo-600 mb-4 flex items-center gap-2 transition-all duration-300 font-medium">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{project?.name || 'Loading...'}</h2>
              {project?.description && <p className="text-gray-500 mt-2 text-lg">{project.description}</p>}
              <div className="mt-3">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${isOwner ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'}`}>
                  {isOwner ? '👑 Project Owner' : '👤 Team Member'}
                </span>
              </div>
            </div>
            {isOwner && (
              <div className="flex gap-3">
                <button onClick={() => setShowTaskModal(true)} className="group relative bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-md flex items-center gap-2">
                  <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Task
                </button>
                <button onClick={() => setShowMemberModal(true)} className="group relative bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-md flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Add Member
                </button>
              </div>
            )}
          </div>
        </div>

        {!isOwner && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-indigo-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-indigo-800 text-sm">You are a <strong>Team Member</strong> — You can drag tasks and add comments. Only the owner can create tasks and add members.</p>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {COLUMNS.map((col) => (
              <div key={col} className={`bg-white rounded-2xl shadow-lg border-t-4 ${columnColors[col]} overflow-hidden transition-all duration-300 hover:shadow-xl`}>
                <div className={`bg-gradient-to-r ${columnGradients[col]} p-4 border-b border-gray-100`}>
                  <h3 className="text-gray-800 font-bold text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2"><span className="text-2xl">{columnIcons[col]}</span>{col}</span>
                    <span className="bg-white/80 text-gray-700 text-sm px-2.5 py-1 rounded-full font-semibold shadow-sm">{getTasksByStatus(col).length}</span>
                  </h3>
                </div>
                <Droppable droppableId={col}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={`p-4 space-y-3 transition-all duration-200 ${snapshot.isDraggingOver ? 'bg-gradient-to-br from-gray-50 to-indigo-50' : ''}`} style={{ minHeight: '300px', height: 'auto' }}>
                      {getTasksByStatus(col).map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => { setSelectedTask(task); setReassignMsg(''); }}
                              className={`group bg-white rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-gray-200 ${snapshot.isDragging ? 'shadow-2xl rotate-1 border-indigo-300' : 'hover:border-indigo-200'}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-gray-800 font-semibold text-base group-hover:text-indigo-600 transition-colors line-clamp-2">{task.title}</h4>
                                {/* ── NEW: priority badge on card ── */}
                                {task.priority && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ml-2 ${priorityColors[task.priority]}`}>
                                    {task.priority}
                                  </span>
                                )}
                              </div>
                              {task.description && <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed">{task.description}</p>}

                              {/* ── NEW: due date on card ── */}
                              {task.dueDate && (
                                <div className={`flex items-center gap-1 text-xs mb-2 ${isOverdue(task.dueDate) ? 'text-red-500' : 'text-gray-400'}`}>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {isOverdue(task.dueDate) ? 'Overdue · ' : ''}{new Date(task.dueDate).toLocaleDateString()}
                                </div>
                              )}

                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                  {task.assignedTo && (
                                    <div className="flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-full">
                                      <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      <span className="text-indigo-600 text-xs font-medium">{task.assignedTo.name}</span>
                                    </div>
                                  )}
                                </div>
                                {task.comments?.length > 0 && (
                                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span>{task.comments.length}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && isOwner && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all duration-300 animate-slideUp">
            <div className="p-7">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2.5 rounded-xl shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Create New Task</h3>
                </div>
                <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {error && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              <form onSubmit={handleCreateTask} className="space-y-5">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Task Title *</label>
                  <input type="text" placeholder="Enter task title" className="w-full p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Description</label>
                  <textarea placeholder="Add task details..." className="w-full p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Assign To</label>
                  <select className="w-full p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                    <option value="">Unassigned</option>
                    {project?.members?.map((member) => (
                      <option key={member._id} value={member._id}>{member.name} ({member.email})</option>
                    ))}
                  </select>
                </div>
                {/* ── NEW: priority + due date ── */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Priority</label>
                    <select className="w-full p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                      <option value="Low">🟢 Low</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="High">🔴 High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Due Date</label>
                    <input type="date" className="w-full p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                  </div>
                </div>
                {/* ─────────────────────────────── */}
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md">Create Task</button>
                  <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && !showEditTaskModal && !showDeleteTaskConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-7">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2.5 rounded-xl shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{selectedTask.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                  {/* ── NEW: edit + delete buttons in detail modal ── */}
                  {isOwner && (
                    <>
                      <button
                        onClick={() => { setEditTaskForm({ title: selectedTask.title, description: selectedTask.description || '', priority: selectedTask.priority || 'Medium', dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : '' }); setEditTaskError(''); setShowEditTaskModal(true); }}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Edit task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setShowDeleteTaskConfirm(true)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                  <button onClick={() => setSelectedTask(null)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-lg ml-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {selectedTask.description && (
                <div className="mb-5 p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-700 leading-relaxed">{selectedTask.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${selectedTask.status === 'Done' ? 'bg-emerald-100 text-emerald-700' : selectedTask.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                  {selectedTask.status}
                </span>
                {/* ── NEW: priority + due date badges ── */}
                {selectedTask.priority && (
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${priorityColors[selectedTask.priority]}`}>
                    {selectedTask.priority} Priority
                  </span>
                )}
                {selectedTask.dueDate && (
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 ${isOverdue(selectedTask.dueDate) ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {isOverdue(selectedTask.dueDate) ? 'Overdue · ' : 'Due '}{new Date(selectedTask.dueDate).toLocaleDateString()}
                  </span>
                )}
                {/* ─────────────────────────────────── */}
                {selectedTask.assignedTo && (
                  <span className="px-3 py-1.5 rounded-lg text-sm bg-indigo-100 text-indigo-700 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {selectedTask.assignedTo.name}
                  </span>
                )}
              </div>

              {isOwner && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Reassign Task
                  </label>
                  <div className="flex gap-2">
                    <select className="flex-1 p-2.5 rounded-xl bg-white text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm" defaultValue={selectedTask.assignedTo?._id || ''} onChange={(e) => handleReassign(e.target.value)} disabled={reassigning}>
                      <option value="">Unassigned</option>
                      {project?.members?.map((member) => (
                        <option key={member._id} value={member._id}>{member.name} ({member.email})</option>
                      ))}
                    </select>
                    {reassigning && (
                      <div className="flex items-center px-3">
                        <svg className="animate-spin h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {reassignMsg && <p className={`text-xs mt-2 font-medium ${reassignMsg.includes('✅') ? 'text-emerald-600' : 'text-red-500'}`}>{reassignMsg}</p>}
                </div>
              )}

              <CommentSection
                task={selectedTask}
                onUpdate={() => {
                  fetchTasks();
                  const updated = tasks.find(t => t._id === selectedTask._id);
                  if (updated) setSelectedTask(updated);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── NEW: Edit Task Modal ── */}
      {showEditTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp">
            <div className="p-7">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2.5 rounded-xl shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Edit Task</h3>
                </div>
                <button onClick={() => setShowEditTaskModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {editTaskError && <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-red-600 text-sm">{editTaskError}</p></div>}
              <form onSubmit={handleEditTask} className="space-y-5">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Task Title *</label>
                  <input type="text" className="w-full p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all" value={editTaskForm.title} onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Description</label>
                  <textarea className="w-full p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all resize-none" rows={3} value={editTaskForm.description} onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Priority</label>
                    <select className="w-full p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all" value={editTaskForm.priority} onChange={(e) => setEditTaskForm({ ...editTaskForm, priority: e.target.value })}>
                      <option value="Low">🟢 Low</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="High">🔴 High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Due Date</label>
                    <input type="date" className="w-full p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all" value={editTaskForm.dueDate} onChange={(e) => setEditTaskForm({ ...editTaskForm, dueDate: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md">Save Changes</button>
                  <button type="button" onClick={() => setShowEditTaskModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW: Delete Task Confirm ── */}
      {showDeleteTaskConfirm && selectedTask && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-slideUp p-7">
            <div className="text-center mb-6">
              <div className="bg-red-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Task?</h3>
              <p className="text-gray-500 text-sm">Are you sure you want to delete <strong>"{selectedTask.title}"</strong>? This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleDeleteTask} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-all duration-300">Delete</button>
              <button onClick={() => setShowDeleteTaskConfirm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && isOwner && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all duration-300 animate-slideUp max-h-[90vh] overflow-y-auto">
            <div className="p-7">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 rounded-xl shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Add Team Member</h3>
                </div>
                <button onClick={() => { setShowMemberModal(false); setMemberMsg(''); }} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {memberMsg && (
                <div className={`mb-5 p-3 rounded-xl flex items-center gap-2 ${memberMsg.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <svg className={`w-5 h-5 ${memberMsg.includes('✅') ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className={`text-sm ${memberMsg.includes('✅') ? 'text-green-700' : 'text-red-700'}`}>{memberMsg}</p>
                </div>
              )}
              <form onSubmit={handleAddMember} className="space-y-5">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Member's Email</label>
                  <input type="email" placeholder="Enter email address" className="w-full p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} required />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md">Add Member</button>
                  <button type="button" onClick={() => { setShowMemberModal(false); setMemberMsg(''); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300">Cancel</button>
                </div>
              </form>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Current Members ({project?.members?.length || 0})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {project?.members?.map((member) => (
                    <div key={member._id} className="bg-gray-50 p-3 rounded-xl flex items-center gap-3 hover:bg-gray-100 transition-all duration-200">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${project.owner?._id === member._id ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium text-sm">{member.name}</p>
                        <p className="text-gray-500 text-xs">{member.email}</p>
                      </div>
                      {project.owner?._id === member._id && <span className="text-amber-600 text-xs font-semibold bg-amber-50 px-2 py-1 rounded-full">Owner</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}