import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HomeIcon from '@mui/icons-material/Home';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DevicesIcon from '@mui/icons-material/Devices';
import MobileContainer from '../components/MobileContainer';
import { useTheme } from '../contexts/ThemeContext';
import '../MobileApp.css';

/**
 * MobileOnboarding - The first layer of the mobile phone view
 * 
 * This component shows an Apple-style onboarding screen for the Smart Home Voice Assistant,
 * featuring a welcome message and a Get Started button.
 */
const MobileOnboarding = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  
  // Set light mode on component mount
  useEffect(() => {
    if (darkMode) {
      toggleTheme(); // Switch to light mode if currently in dark mode
    }
  }, [darkMode, toggleTheme]);
  
  const handleGetStarted = () => {
    navigate('/phone/home');
  };
  
  return (
    <MobileContainer showHeader={false}>
      <Box className="mobile-onboarding">
        {/* Image/Illustration Section */}
        <Box className="onboarding-image-section">
          {/* Main Smart Home Icon */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center',
            zIndex: 1
          }}>
            <Paper
              elevation={4}
              sx={{
                width: 150,
                height: 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                mb: 3,
                background: 'linear-gradient(145deg, #3f51b5, #2196f3)'
              }}
            >
              <HomeIcon sx={{ fontSize: 80, color: 'white' }} />
            </Paper>
            
            {/* Smaller Smart Device Icons */}
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Avatar
                sx={{
                  bgcolor: 'white',
                  width: 50,
                  height: 50,
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                }}
              >
                <SmartToyIcon sx={{ fontSize: 30, color: '#2196f3' }} />
              </Avatar>
              <Avatar
                sx={{
                  bgcolor: 'white',
                  width: 50, 
                  height: 50,
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                }}
              >
                <DevicesIcon sx={{ fontSize: 30, color: '#2196f3' }} />
              </Avatar>
            </Box>
          </Box>
        </Box>
        
        {/* Content Section */}
        <Box className="onboarding-content">
          <Box>
            <Typography className="onboarding-title">
              智能家居语音助手
            </Typography>
            <Typography className="onboarding-description">
              欢迎使用智能家居语音助手，您的家居智能化管理中心。通过简单的语音指令，您可以控制家中的所有智能设备。
            </Typography>
          </Box>
          
          <button 
            className="onboarding-button"
            onClick={handleGetStarted}
          >
            开始体验
            <ArrowForwardIcon sx={{ ml: 1 }} />
          </button>
        </Box>
      </Box>
    </MobileContainer>
  );
};

export default MobileOnboarding; 