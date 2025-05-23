import React from 'react';
import { Box, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

/**
 * 移动视图头部组件
 * 
 * @param {Object} props
 * @param {Function} props.onSettingsClick - 设置按钮点击事件处理
 * @param {Function} props.onWeatherClick - 天气按钮点击事件处理
 * @returns {JSX.Element}
 */
const MobileHeader = ({ onSettingsClick, onWeatherClick }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <IconButton 
        className="ios-nav-button" 
        onClick={onWeatherClick}
        sx={{ mr: 1 }}
      >
        <WbSunnyIcon />
      </IconButton>
      <IconButton 
        className="ios-nav-button"
        onClick={onSettingsClick}
      >
        <SettingsIcon />
      </IconButton>
    </Box>
  );
};

export default MobileHeader; 