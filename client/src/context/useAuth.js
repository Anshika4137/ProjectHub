import { useContext } from 'react';
import { AppAuthContext } from './appAuthContext.js';

export const useAuth = () => useContext(AppAuthContext);
