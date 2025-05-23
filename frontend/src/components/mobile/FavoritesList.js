import React from 'react';
import { Box, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeviceItem from './DeviceItem';

/**
 * 收藏列表组件 - 显示收藏的设备
 * 
 * @param {Object} props
 * @param {Array} props.favoriteDevices - 收藏设备数据数组
 * @param {Function} props.onDeviceClick - 设备点击处理函数（可选）
 * @returns {JSX.Element}
 */
const FavoritesList = ({ favoriteDevices, onDeviceClick }) => {
  return (
    <Box className="ios-section">
      <Box className="ios-section-title">
        <Typography variant="h2" component="h2">收藏</Typography>
        <ChevronRightIcon className="ios-section-chevron" />
      </Box>
      
      <Box sx={{ padding: '0 20px' }}>
        {favoriteDevices.map((device, index) => (
          <DeviceItem 
            key={device.id}
            device={device}
            useSpecialIcon={index === 1} // 第二个项目使用特殊图标
            onClick={onDeviceClick ? () => onDeviceClick(device) : undefined}
          />
        ))}
      </Box>
    </Box>
  );
};

export default FavoritesList; 