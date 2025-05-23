import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * 下拉刷新指示器组件
 * 
 * @param {Object} props
 * @param {Boolean} props.refreshing - 是否正在刷新
 * @param {Number} props.pullDistance - 下拉距离
 * @param {Number} props.threshold - 触发刷新的阈值
 * @param {React.RefObject} props.refreshIndicatorRef - 指示器的ref对象
 * @returns {JSX.Element}
 */
const PullToRefresh = ({ 
  refreshing,
  pullDistance,
  threshold,
  refreshIndicatorRef
}) => {
  return (
    <Box 
      ref={refreshIndicatorRef}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: `${pullDistance}px`,
        overflow: 'hidden',
        transition: refreshing ? 'none' : 'height 0.2s ease'
      }}
    >
      {refreshing ? (
        <CircularProgress size={24} color="inherit" />
      ) : (
        <RefreshIcon 
          sx={{ 
            transform: `rotate(${Math.min(pullDistance / threshold * 180, 180)}deg)`,
            opacity: Math.min(pullDistance / threshold, 1),
            transition: 'transform 0.1s ease'
          }} 
        />
      )}
    </Box>
  );
};

export default PullToRefresh; 