// src/App.jsx
import { useState, useEffect } from 'react';
import { AppUser } from './lib';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage, SignupPage } from './modules/auth';
import ForgotPasswordPage from './modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './modules/auth/pages/ResetPasswordPage';
import AppLayout from './components/layout/AppLayout';

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(AppUser.isLoggedIn());
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    setIsAuthenticated(AppUser.isLoggedIn());
  }, []);

  // Simple routing
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!isAuthenticated) {
    if (currentPath === '/signup') {
      return <SignupPage onSignup={() => setIsAuthenticated(true)} />;
    }
    if (currentPath === '/forgot-password') {
      return <ForgotPasswordPage />;
    }
    if (currentPath.startsWith('/reset-password')) {
      return <ResetPasswordPage />;
    }
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return <AppLayout />;
};

const App = () => (
  <ThemeProvider>
    <AppWrapper />
  </ThemeProvider>
);

export default App;
