import React from 'react';
import { Box, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

/**
 * 设备项组件 - 显示单个设备
 * 
 * @param {Object} props
 * @param {Object} props.device - 设备数据对象
 * @param {Boolean} props.useSpecialIcon - 是否使用特殊图标
 * @param {Function} props.onClick - 点击设备的处理函数
 * @returns {JSX.Element}
 */
const DeviceItem = ({ device, useSpecialIcon = false, onClick }) => {
  return (
    <Box 
      className={`ios-card ${device.active ? 'active' : ''}`}
      onClick={onClick}
      sx={{ mb: 1, cursor: onClick ? 'pointer' : 'default' }}
    >
      <Box 
        className="ios-card-icon" 
        sx={useSpecialIcon ? {
          backgroundColor: 'rgba(255, 215, 0, 0.2)' 
        } : {}}
      >
        {useSpecialIcon ? 
          <SmartToyIcon sx={{ color: 'gold' }} /> : 
          device.icon
        }
      </Box>
      <Box className="ios-card-content">
        <Typography className="ios-card-title">
          {useSpecialIcon ? '智能助手' : device.title}
        </Typography>
        <Typography className="ios-card-subtitle">
          {useSpecialIcon ? '随时为您服务' : device.subtitle}
        </Typography>
      </Box>
    </Box>
  );
};

export default DeviceItem; 