import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 默认使用深色主题
  const [darkMode, setDarkMode] = useState(true);
  
  // 从localStorage加载主题偏好设置
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setDarkMode(JSON.parse(savedTheme));
    }
    
    // 应用主题类到根元素
    document.documentElement.classList.toggle('light-mode', !darkMode);
  }, []);
  
  // 更新localStorage和文档类当主题改变时
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.classList.toggle('light-mode', !darkMode);
  }, [darkMode]);
  
  // 切换主题函数
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };
  
  // 主题名称方便引用
  const theme = darkMode ? 'dark' : 'light';
  
  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 自定义主题上下文钩子
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext; 