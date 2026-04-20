// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-bs-theme', 'dark');
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.setAttribute('data-bs-theme', 'light');
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);
  
  const toggleTheme = () => setIsDark(!isDark);
  
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
