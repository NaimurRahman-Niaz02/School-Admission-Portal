/**
 * AdminAuthProvider.jsx - Authority Authentication and Session State Component
 * Hashmat Uddin High School Online Admission System
 */

import { useState, useCallback } from 'react';
import { AdminAuthContext } from './AdminAuthContext';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => storageService.isAdminAuthenticated());
  const [isLoading] = useState(false);

  const login = useCallback(async (password) => {
    const result = await apiService.verifyAdminPassword(password);
    setIsAuthenticated(true);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await apiService.logoutAdmin();
    setIsAuthenticated(false);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export default AdminAuthProvider;
