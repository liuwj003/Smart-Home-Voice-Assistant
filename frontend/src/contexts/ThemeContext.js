import React, { createContext, useState, useEffect, useContext } from 'react';

/**
 * ThemeContext - Context for managing application theme (light/dark mode)
 * Following Apple design patterns for theme management
 */
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Default to dark mode
  const [darkMode, setDarkMode] = useState(true);
  
  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setDarkMode(JSON.parse(savedTheme));
    }
    
    // Apply theme class to root element
    document.documentElement.classList.toggle('light-mode', !darkMode);
  }, []);
  
  // Update localStorage and document class when theme changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.classList.toggle('light-mode', !darkMode);
  }, [darkMode]);
  
  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };
  
  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext; 