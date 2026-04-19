import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ProjectHub
              </h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              A modern project management tool to help teams collaborate, track progress, and get work done efficiently.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-800 font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors duration-200 flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors duration-200 flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors duration-200 flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-gray-800 font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              {[
                '🗂️ Project Boards',
                '✅ Task Management',
                '👥 Team Collaboration',
                '💬 Real-time Comments',
                '🔔 Notifications',
              ].map((f, i) => (
                <li key={i} className="text-gray-500 text-sm">{f}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} <span className="text-indigo-600 font-semibold">ProjectHub</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Built with</span>
            <span className="text-red-500">❤️</span>
            <span className="text-gray-400 text-sm">using MERN Stack</span>
          </div>
        </div>
      </div>
    </footer>
  );
}