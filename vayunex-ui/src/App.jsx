// src/App.jsx
import { useState, useEffect } from 'react';
import { AppUser } from './lib';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage, SignupPage } from './modules/auth';
import AppLayout from './components/layout/AppLayout';

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(AppUser.isLoggedIn());
  const [showSignup, setShowSignup] = useState(window.location.pathname === '/signup');

  useEffect(() => {
    setIsAuthenticated(AppUser.isLoggedIn());
  }, []);

  // Simple routing
  useEffect(() => {
    const handlePopState = () => {
      setShowSignup(window.location.pathname === '/signup');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!isAuthenticated) {
    if (showSignup) {
      return <SignupPage onSignup={() => setIsAuthenticated(true)} />;
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
