import React from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeviceItem from './DeviceItem';

/**
 * 场景列表组件 - 显示所有房间场景及其设备
 * 
 * @param {Object} props
 * @param {Array} props.scenes - 场景数据数组
 * @param {Object} props.roomDevices - 每个房间的设备数据
 * @param {String} props.expandedScene - 当前展开的场景ID
 * @param {Function} props.onSceneToggle - 场景切换处理函数
 * @returns {JSX.Element}
 */
const ScenesList = ({ scenes, roomDevices, expandedScene, onSceneToggle }) => {
  return (
    <Box className="ios-section">
      <Box className="ios-section-title">
        <Typography variant="h2" component="h2">场景</Typography>
      </Box>
      
      <Box sx={{ padding: '0 20px' }}>
        {scenes.map(scene => (
          <React.Fragment key={scene.id}>
            <Box 
              className="ios-section-card"
              onClick={() => onSceneToggle(scene.id)}
            >
              <Box className="ios-section-card-header">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box className="ios-section-card-icon">
                    {scene.icon}
                  </Box>
                  <Box>
                    <Typography className="ios-section-card-title">
                      {scene.title}
                    </Typography>
                    <Typography className="ios-section-card-meta">
                      {scene.devices} 设备
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <ExpandMoreIcon 
                    className={`ios-section-expand-icon ${expandedScene === scene.id ? 'expanded' : ''}`}
                  />
                </Box>
              </Box>
            </Box>
            
            <Collapse in={expandedScene === scene.id} timeout="auto" unmountOnExit>
              <Box className="ios-section-card-content">
                {roomDevices[scene.id]?.map(device => (
                  <DeviceItem 
                    key={device.id}
                    device={device}
                  />
                ))}
              </Box>
            </Collapse>
            {expandedScene !== scene.id && <Box sx={{ mb: 2 }} />}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default ScenesList; 