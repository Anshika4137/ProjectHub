import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchProjects();
  }, []);

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
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg transition-colors font-medium"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {projects.map((project, index) => (
              <div
                key={project._id}
                onClick={() => navigate(`/board/${project._id}`)}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-indigo-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Decorative top gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                
                {/* Card Content */}
                <div className="p-6">
                  {/* Header with icon and date */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm bg-gray-50 px-3 py-1.5 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium">Created recently</span>
                    </div>
                  </div>

                  {/* Project Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300 line-clamp-1">
                    {project.name}
                  </h3>
                  
                  {/* Project Description */}
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[42px] leading-relaxed">
                    {project.description || 'No description provided'}
                  </p>
                  
                  {/* Footer with stats and action */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {project.members?.length || 0}
                        </div>
                      </div>
                      <span className="text-gray-500 text-sm font-medium">
                        {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {/* View details link */}
                    <div className="flex items-center gap-1 text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-2">
                      <span className="text-sm font-medium">View Board</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal - Enhanced Professional */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all duration-300 animate-slideUp">
            <div className="p-7">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2.5 rounded-xl shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Create New Project</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                >
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
                  <input
                    type="text"
                    placeholder="Enter project name"
                    className="w-full p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Description (Optional)</label>
                  <textarea
                    placeholder="What's this project about?"
                    className="w-full p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md"
                  >
                    Create Project
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}