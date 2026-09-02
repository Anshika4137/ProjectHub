import { useCallback, useState } from 'react';
import { AppAuthContext } from './appAuthContext.js';

const isExpiredToken = (token) => {
  try {
    const encodedPayload = token.split('.')[1];
    if (!encodedPayload) return true;
    const base64Payload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64Payload.padEnd(base64Payload.length + (4 - base64Payload.length % 4) % 4, '=')));
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

const restoreSession = () => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!token || !storedUser || isExpiredToken(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { user: null, token: null };
  }

  try {
    return { user: JSON.parse(storedUser), token };
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { user: null, token: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [{ user, token }, setSession] = useState(restoreSession);

  const login = (userData, tokenData) => {
    setSession({ user: userData, token: tokenData });
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
  };

  const logout = () => {
    setSession({ user: null, token: null });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = useCallback((userData) => {
    setSession((session) => ({ ...session, user: userData }));
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  return (
    <AppAuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AppAuthContext.Provider>
  );
};
