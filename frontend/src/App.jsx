/**
 * App.jsx - Main Application Shell with Context Providers and Router
 * Hashmat Uddin High School Online Admission System
 */

import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './context/ToastProvider';
import { AdminAuthProvider } from './context/AdminAuthProvider';
import { StudentProvider } from './context/StudentProvider';
import { AppRouter } from './router/AppRouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AdminAuthProvider>
          <StudentProvider>
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </StudentProvider>
        </AdminAuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
