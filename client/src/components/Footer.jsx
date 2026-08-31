import { Link } from 'react-router-dom';
import ProjectHubBrand from './ProjectHubBrand';

export default function Footer() {
  return (
    <footer className="app-footer bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="mb-3"><ProjectHubBrand /></div>
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
