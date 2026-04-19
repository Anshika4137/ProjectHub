import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  // ── NEW ──
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [editError, setEditError] = useState('');
  // ─────────

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/projects', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ name: '', description: '' });
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      setError('Failed to create project');
    }
  };

  // ── NEW: edit project ──
  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/projects/${selectedProject._id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditModal(false);
      setSelectedProject(null);
      fetchProjects();
    } catch (err) {
      setEditError(err.response?.data?.msg || 'Failed to update project');
    }
  };

  // ── NEW: delete project ──
  const handleDeleteProject = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/projects/${selectedProject._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowDeleteConfirm(false);
      setSelectedProject(null);
      fetchProjects();
    } catch (err) {
      console.log(err);
    }
  };

  // ── NEW: remove member ──
  const handleRemoveMember = async (memberId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/projects/${selectedProject._id}/removemember`,
        { userId: memberId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedProject(res.data);
      fetchProjects();
    } catch (err) {
      console.log(err);
    }
  };

  const isProjectOwner = (project) => project.owner?._id === user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              My Projects
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Manage and collaborate on your projects</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group relative bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-7 py-3.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-4">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 mb-6">
              <svg className="w-24 h-24 text-indigo-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm">Create your first project to get started with collaboration</p>
            <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg transition-colors font-medium">
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {projects.map((project, index) => (
              <div
                key={project._id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>

                    {/* ── NEW: owner action buttons ── */}
                    {isProjectOwner(project) && (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => { setSelectedProject(project); setEditForm({ name: project.name, description: project.description || '' }); setEditError(''); setShowEditModal(true); }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit project"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => { setSelectedProject(project); setShowDeleteConfirm(true); }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete project"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                    {/* ─────────────────────────────── */}
                  </div>

                  <div onClick={() => navigate(`/board/${project._id}`)} className="cursor-pointer">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300 line-clamp-1">
                      {project.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[42px] leading-relaxed">
                      {project.description || 'No description provided'}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {project.members?.length || 0}
                        </div>
                        <span className="text-gray-500 text-sm font-medium">
                          {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="text-sm font-medium">View Board</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
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
                  <h3 className="text-2xl font-bold text-gray-800">Create New Project</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
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
              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Project Name</label>
                  <input type="text" placeholder="Enter project name" className="w-full p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Description (Optional)</label>
                  <textarea placeholder="What's this project about?" className="w-full p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all resize-none" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md">Create Project</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW: Edit Project Modal ── */}
      {showEditModal && selectedProject && (
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
                  <h3 className="text-2xl font-bold text-gray-800">Edit Project</h3>
                </div>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {editError && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <p className="text-red-600 text-sm">{editError}</p>
                </div>
              )}
              <form onSubmit={handleEditProject} className="space-y-5">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Project Name</label>
                  <input type="text" className="w-full p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Description</label>
                  <textarea className="w-full p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all resize-none" rows={4} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </div>

                {/* ── Remove Members section ── */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Members</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedProject.members?.map((member) => (
                      <div key={member._id} className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${selectedProject.owner?._id === member._id ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 text-sm font-medium">{member.name}</p>
                          <p className="text-gray-400 text-xs">{member.email}</p>
                        </div>
                        {selectedProject.owner?._id === member._id ? (
                          <span className="text-amber-600 text-xs font-semibold bg-amber-50 px-2 py-0.5 rounded-full">Owner</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member._id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-lg transition-all"
                            title="Remove member"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md">Save Changes</button>
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW: Delete Confirm Modal ── */}
      {showDeleteConfirm && selectedProject && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-slideUp p-7">
            <div className="text-center mb-6">
              <div className="bg-red-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Project?</h3>
              <p className="text-gray-500 text-sm">Are you sure you want to delete <strong>"{selectedProject.name}"</strong>? This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleDeleteProject} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-all duration-300">Delete</button>
              <button onClick={() => { setShowDeleteConfirm(false); setSelectedProject(null); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300">Cancel</button>
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