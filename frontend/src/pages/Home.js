import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardActions,
  IconButton,
  Switch, 
  Divider,
  Box,
  Slider,
  Chip,
  CircularProgress,
  TextField,
  Button
} from '@mui/material';
import { 
  Lightbulb, 
  AcUnit, 
  Tv, 
  WbSunny, 
  Opacity, 
  AirOutlined,
  DeviceThermostat, 
  Settings as SettingsIcon,
  ChevronRight,
  Send
} from '@mui/icons-material';
import VoiceInput from '../components/VoiceInput';
import { deviceApi, voiceApi } from '../services/api';
import { Link } from 'react-router-dom';

// Define room categories
const ROOM_CATEGORIES = {
  'living_room': {
    name: '客厅',
    deviceIds: ['light_1', 'tv_1', 'fan_1']
  },
  'bedroom': {
    name: '卧室',
    deviceIds: ['ac_1']
  },
  'balcony': {
    name: '阳台',
    deviceIds: ['curtain_1']
  },
  'other': {
    name: '其他区域',
    deviceIds: ['humidifier_1', 'sensor_1']
  }
};

// Device type to icon mapping
const DEVICE_ICONS = {
  'light': <Lightbulb />,
  'ac': <AcUnit />,
  'curtain': <WbSunny />,
  'tv': <Tv />,
  'humidifier': <Opacity />,
  'fan': <AirOutlined />,
  'sensor': <DeviceThermostat />
};

const Home = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomDevices, setRoomDevices] = useState({});
  const [textCommand, setTextCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandResult, setCommandResult] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await deviceApi.getAllDevices();
        setDevices(response.data);
        
        // Organize devices by room
        const devicesByRoom = {};
        
        // Initialize rooms
        Object.keys(ROOM_CATEGORIES).forEach(roomKey => {
          devicesByRoom[roomKey] = [];
        });
        
        // Assign devices to rooms
        response.data.forEach(device => {
          // Find which room this device belongs to
          let assigned = false;
          
          Object.keys(ROOM_CATEGORIES).forEach(roomKey => {
            if (ROOM_CATEGORIES[roomKey].deviceIds.includes(device.id)) {
              devicesByRoom[roomKey].push(device);
              assigned = true;
            }
          });
          
          // If device not assigned to any room, put in "other" category
          if (!assigned) {
            devicesByRoom['other'].push(device);
          }
        });
        
        setRoomDevices(devicesByRoom);
      } catch (error) {
        console.error('获取设备列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [commandResult]); // Refresh devices when command results change

  const getDeviceStatusColor = (device) => {
    if (device.status === 'on') {
      return '#4CAF50'; // Green for on
    } else if (device.status === 'off') {
      return '#9e9e9e'; // Grey for off
    } else if (device.status === 'closed') {
      return '#9e9e9e'; // Grey for closed
    } else {
      return '#2196F3'; // Blue for other statuses
    }
  };

  const getStatusText = (device) => {
    if (device.type === 'sensor') {
      return `${device.temperature}°C / ${device.humidity}%`;
    }
    
    const statusMap = {
      'on': '开启',
      'off': '关闭',
      'closed': '关闭',
      'open': '打开'
    };
    
    return statusMap[device.status] || device.status;
  };

  const handleSendTextCommand = async () => {
    if (!textCommand.trim()) return;
    
    setIsProcessing(true);
    setCommandResult(null);
    
    try {
      const response = await voiceApi.sendTextCommand(textCommand);
      setCommandResult(response.data);
    } catch (error) {
      console.error('发送文本命令失败:', error);
      setCommandResult({
        error: true,
        errorMessage: error.response?.data?.message || '发送命令失败，请重试'
      });
    } finally {
      setIsProcessing(false);
      setTextCommand('');
    }
  };

  const handleVoiceCommandResult = (result) => {
    setCommandResult(result);
  };

  const renderDeviceCard = (device) => {
    return (
      <Card 
        key={device.id} 
        sx={{ 
          mb: 2, 
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          overflow: 'visible',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box 
              sx={{ 
                color: getDeviceStatusColor(device), 
                mr: 1, 
                display: 'flex' 
              }}
            >
              {DEVICE_ICONS[device.type] || <DeviceThermostat />}
            </Box>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {device.name}
            </Typography>
            
            {device.type !== 'sensor' && (
              <Chip 
                size="small" 
                label={getStatusText(device)} 
                sx={{ 
                  backgroundColor: getDeviceStatusColor(device),
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem'
                }} 
              />
            )}
          </Box>
          
          {device.type === 'light' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                亮度: {device.brightness}%
              </Typography>
              <Slider
                size="small"
                value={device.brightness}
                disabled
                sx={{ mt: 1 }}
              />
            </Box>
          )}
          
          {device.type === 'ac' && device.status === 'on' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                温度: {device.temperature}°C
              </Typography>
              <Typography variant="body2" color="text.secondary">
                模式: {device.mode === 'cool' ? '制冷' : device.mode}
              </Typography>
            </Box>
          )}
          
          {device.type === 'tv' && device.status === 'on' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              音量: {device.volume} / 声道: {device.channel}
            </Typography>
          )}
          
          {device.type === 'sensor' && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1">
                {device.temperature}°C / {device.humidity}%
              </Typography>
            </Box>
          )}
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
          <IconButton size="small">
            <ChevronRight />
          </IconButton>
        </CardActions>
      </Card>
    );
  };

  const renderRoomSection = (roomKey) => {
    const room = ROOM_CATEGORIES[roomKey];
    const roomDevicesList = roomDevices[roomKey] || [];
    
    if (roomDevicesList.length === 0) return null;
    
    return (
      <Box key={roomKey} sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium' }}>
            {room.name}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
        </Box>
        
        <Grid container spacing={2}>
          {roomDevicesList.map(device => (
            <Grid item xs={12} sm={6} md={4} key={device.id}>
              {renderDeviceCard(device)}
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderCommandResult = () => {
    if (!commandResult) return null;
    
    return (
      <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>命令处理结果</Typography>
        
        {commandResult.error ? (
          <Typography color="error">{commandResult.errorMessage}</Typography>
        ) : (
          <>
            {commandResult.sttText && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">语音识别结果:</Typography>
                <Typography>{commandResult.sttText}</Typography>
              </Box>
            )}
            
            {commandResult.nluResult && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">理解结果:</Typography>
                <Typography>
                  动作: {commandResult.nluResult.action || '未知'} | 
                  设备: {commandResult.nluResult.entity || '未知'} | 
                  位置: {commandResult.nluResult.location || '未知'}
                </Typography>
              </Box>
            )}
            
            {commandResult.deviceActionFeedback && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">设备状态:</Typography>
                <Typography>{commandResult.deviceActionFeedback}</Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    );
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          家庭助手
        </Typography>
        <Link to="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
          <IconButton color="primary">
            <SettingsIcon />
          </IconButton>
        </Link>
      </Box>
      
      {/* Text Command Input */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            label="输入文本命令"
            variant="outlined"
            value={textCommand}
            onChange={(e) => setTextCommand(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendTextCommand();
              }
            }}
            disabled={isProcessing}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSendTextCommand}
            disabled={isProcessing || !textCommand.trim()}
            endIcon={<Send />}
          >
            发送
          </Button>
        </Box>
      </Box>
      
      {/* Voice Command Button */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <VoiceInput onCommandResult={handleVoiceCommandResult} />
      </Box>
      
      {/* Command Result Display */}
      {renderCommandResult()}
      
      {/* Device Sections */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {Object.keys(ROOM_CATEGORIES).map(roomKey => renderRoomSection(roomKey))}
        </Box>
      )}
    </div>
  );
};

export default Home; 