import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth.js';
import { useNavigate, Link } from 'react-router-dom';
import ProjectHubBrand from './ProjectHubBrand';
import { API_URL } from '../config/api.js';
import { connectSocket, socket } from '../config/socket.js';


const formatTimestamp = (createdAt) => new Date(createdAt).toLocaleString([], {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default function Navbar({ projectId }) {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const addNotification = (notification) => {
    setNotifications((previous) => [notification, ...previous.filter((item) => item._id !== notification._id)].slice(0, 20));
  };

  useEffect(() => {
    if (projectId) {
      socket.emit('joinProject', projectId);
    }
  }, [projectId]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let isCurrentSession = true;

    const loadNotifications = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isCurrentSession) setNotifications(response.data.slice(0, 20));
      } catch {
        if (isCurrentSession) console.error('Unable to load notifications');
      }
    };

    const onNotification = (notification) => addNotification(notification);
    const authenticateSocket = () => socket.emit('authenticate', { token });
    socket.on('connect', authenticateSocket);
    connectSocket(token);
    socket.on('notification', onNotification);
    loadNotifications();

    return () => {
      isCurrentSession = false;
      socket.off('connect', authenticateSocket);
      socket.off('notification', onNotification);
    };
  }, [token, user?.id]);

  const handleLogout = () => {
    socket.emit('deauthenticate');
    logout();
    navigate('/login');
  };

  const clearNotifications = async () => {
    try {
      await axios.delete(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
      setShowNotif(false);
    } catch {
      console.error('Unable to clear notifications');
    }
  };

  return (
    <nav className="app-navbar bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex justify-between items-center shadow-lg border-b border-gray-100">

      <ProjectHubBrand />

      {/* Right Section */}
      <div className="flex items-center gap-3">

        {/* Show when LOGGED IN */}
        {user ? (
          <>
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-md">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotif && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)}></div>
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl z-50 border border-gray-100 overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 p-1.5 rounded-lg">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <h4 className="text-gray-800 font-semibold">Notifications</h4>
                      </div>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearNotifications}
                          className="text-gray-500 hover:text-red-600 text-xs font-medium transition-colors duration-200 hover:bg-red-50 px-2 py-1 rounded-lg"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4">
                          <p className="text-gray-500 text-sm">No notifications</p>
                          <p className="text-gray-400 text-xs mt-1">You're all caught up!</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif._id} className="p-4 border-b border-gray-100 hover:bg-indigo-50 transition-all duration-200 cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-lg">🔔</span>
                              </div>
                              <div>
                                <p className="text-gray-800 text-sm font-medium">{notif.message}</p>
                                <p className="text-gray-400 text-xs mt-1">{formatTimestamp(notif.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Avatar + Name */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-gray-800 text-sm font-semibold">{user?.name}</p>
                <p className="text-gray-500 text-xs">{user?.email}</p>
              </div>
            </div>

            <Link
              to="/settings"
              className="group flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317a1.65 1.65 0 013.35 0 1.65 1.65 0 002.476 1.428 1.65 1.65 0 012.37 2.37 1.65 1.65 0 001.428 2.476 1.65 1.65 0 010 3.35 1.65 1.65 0 00-1.428 2.476 1.65 1.65 0 01-2.37 2.37 1.65 1.65 0 00-2.476 1.428 1.65 1.65 0 01-3.35 0 1.65 1.65 0 00-2.476-1.428 1.65 1.65 0 01-2.37-2.37 1.65 1.65 0 00-1.428-2.476 1.65 1.65 0 010-3.35 1.65 1.65 0 001.428-2.476 1.65 1.65 0 012.37-2.37 1.65 1.65 0 002.476-1.428z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15.25A3.25 3.25 0 1012 8.75a3.25 3.25 0 000 6.5z" />
              </svg>
              <span className="hidden lg:inline">Settings</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-300 font-medium"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          /* Show when LOGGED OUT */
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-gray-600 hover:text-indigo-600 font-semibold px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-5 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
