import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import { useTheme } from '../contexts/ThemeContext';
import '../MobileApp.css';

/**
 * MobileContainer - An Apple-style mobile device container
 * 
 * This component wraps content in a mobile device frame with Apple-inspired UI elements
 * like the status bar and home indicator.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to display within the mobile container
 * @param {string} props.title - The title to display in the header, defaults to "Our Home"
 * @param {boolean} props.showHeader - Whether to show the title header, defaults to true
 * @param {React.ReactNode} props.rightButtons - Optional buttons/components to display on the right side of the header
 */
const MobileContainer = ({ children, title = "Our Home", showHeader = true, rightButtons }) => {
  const [currentTime, setCurrentTime] = useState('');
  const { darkMode } = useTheme();

  // Update current time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    
    updateTime();
    const timeInterval = setInterval(updateTime, 60000);
    
    return () => clearInterval(timeInterval);
  }, []);

  return (
    <Box className={`mobile-view ${darkMode ? 'dark-mode' : 'light-mode'}`} sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* Fixed Elements - These have flex-shrink: 0 */}
      <Box sx={{ flexShrink: 0 }}>
        {/* Status Bar (iOS style) */}
        <Box className="ios-status-bar">
          <Box className="status-bar-left">
            {currentTime}
          </Box>
          <Box className="status-bar-right">
            <WifiIcon sx={{ fontSize: 16 }} />
            <BatteryFullIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* App Header with Title */}
        {showHeader && (
          <Box className="ios-app-header">
            <Typography variant="h1" className="ios-header-title">
              {title}
            </Typography>
            {rightButtons}
          </Box>
        )}
      </Box>

      {/* Main Content - Scrollable */}
      <Box 
        className="mobile-content" 
        sx={{ 
          overflowY: 'auto', 
          flex: '1 1 auto',
          display: 'flex', 
          flexDirection: 'column',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }}
      >
        {children}
      </Box>

      {/* Home Indicator (iOS style) - Fixed at bottom */}
      <Box sx={{ padding: '8px 0', flexShrink: 0 }}>
        <div className="home-indicator"></div>
      </Box>
    </Box>
  );
};

export default MobileContainer; 