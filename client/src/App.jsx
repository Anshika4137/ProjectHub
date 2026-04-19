import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Board from './pages/Board';
import Footer from './components/Footer';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/board/:projectId" element={<PrivateRoute><Board /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;