import React, { useState, useEffect } from 'react';
import { deviceApi, voiceApi, settingsApi } from '../services/api';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Divider,
  Grid,
  Slider,
  Switch
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MicIcon from '@mui/icons-material/Mic';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import KitchenIcon from '@mui/icons-material/Kitchen';
import ChairIcon from '@mui/icons-material/Chair';
import SingleBedIcon from '@mui/icons-material/SingleBed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import TvIcon from '@mui/icons-material/Tv';
import WindPowerIcon from '@mui/icons-material/WindPower';
import BlindIcon from '@mui/icons-material/Blinds';
import '../MobileApp.css';  // 引入移动样式

// 房间分类和映射
const ROOMS = {
  livingRoom: {
    id: 'living_room',
    name: '客厅',
    iconType: 'chair',
    devices: []
  },
  kitchen: {
    id: 'kitchen',
    name: '厨房',
    iconType: 'kitchen',
    devices: []
  },
  bedroom: {
    id: 'bedroom',
    name: '卧室',
    iconType: 'bed',
    devices: []
  },
  bathroom: {
    id: 'bathroom',
    name: '浴室',
    iconType: 'bath',
    devices: []
  }
};

// 设备类型映射 - 使用字符串表示图标类型
const DEVICE_TYPES = {
  'light': 'lightbulb',
  'ac': 'ac_unit',
  'curtain': 'blind',
  'tv': 'tv',
  'humidifier': 'water_drop',
  'fan': 'wind_power',
  'sensor': 'thermostat',
  'speaker': 'speaker',
  'appliance': 'kitchen'
};

// 设备类型中文名称
const deviceTypeLabels = {
  'light': '灯光',
  'ac': '空调',
  'curtain': '窗帘',
  'tv': '电视',
  'humidifier': '加湿器',
  'fan': '风扇',
  'sensor': '传感器'
};

// 模拟设备数据
const mockDevices = [
  {
    id: 'light_1',
    name: '客厅灯光',
    type: 'light',
    status: 'on',
    brightness: 70,
    room: 'living_room'
  },
  {
    id: 'light_2',
    name: '卧室灯光',
    type: 'light',
    status: 'on',
    brightness: 49,
    room: 'living_room'
  },
  {
    id: 'bar_lamp',
    name: '客厅吊灯',
    type: 'light',
    status: 'on',
    brightness: 100,
    room: 'living_room'
  },
  {
    id: 'blind_1',
    name: '客厅窗帘',
    type: 'curtain',
    status: 'open',
    position: 100,
    room: 'living_room'
  },
  {
    id: 'nest_mini',
    name: 'Nest mini',
    type: 'speaker',
    status: 'playing',
    room: 'living_room'
  },
  {
    id: 'kitchen_spotlight',
    name: '厨房灯光',
    type: 'light',
    status: 'off',
    brightness: 0,
    room: 'kitchen'
  },
  {
    id: 'kitchen_shutter',
    name: '厨房窗帘',
    type: 'curtain',
    status: 'open',
    position: 100,
    room: 'kitchen'
  },
  {
    id: 'kitchen_worktop',
    name: '厨房工作台灯光',
    type: 'light',
    status: 'off',
    brightness: 0,
    room: 'kitchen'
  },
  {
    id: 'fridge',
    name: '冰箱',
    type: 'appliance',
    status: 'closed',
    room: 'kitchen'
  },
  {
    id: 'nest_audio',
    name: 'Nest Audio',
    type: 'speaker',
    status: 'on',
    room: 'kitchen'
  },
  {
    id: 'ac_1',
    name: '卧室空调',
    type: 'ac',
    status: 'on',
    temperature: 22,
    mode: 'cool',
    room: 'bedroom'
  },
  {
    id: 'sensor_1',
    name: '客厅传感器',
    type: 'sensor',
    status: 'on',
    temperature: 22.8,
    humidity: 57,
    room: 'living_room'
  }
];

const PhoneView = () => {
  const [devices, setDevices] = useState([]);
  const [roomData, setRoomData] = useState(ROOMS);
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [useMockData, setUseMockData] = useState(false);
  const [language, setLanguage] = useState('zh');

  useEffect(() => {
    fetchDevices();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // 尝试从localStorage获取语言设置
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
      
      // 尝试从语音设置API获取语言设置
      const response = await settingsApi.getVoiceSettings();
      if (response.data && response.data.language) {
        setLanguage(response.data.language);
        localStorage.setItem('language', response.data.language);
      }
    } catch (err) {
      console.warn('Failed to load settings:', err);
    }
  };

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await deviceApi.getAllDevices();
      // 确保数据格式正确
      const devicesData = response.data && response.data.data ? response.data.data : [];
      const devicesList = Array.isArray(devicesData) ? devicesData : [];
      setDevices(devicesList);
      organizeDevicesByRoom(devicesList);
      setUseMockData(false);
      setError(null);
    } catch (err) {
      console.error('获取设备列表失败:', err);
      setError('无法连接到后端服务器，请检查网络连接，或尝试使用模拟数据。');
      setDevices(mockDevices); // 使用模拟数据
      organizeDevicesByRoom(mockDevices);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const organizeDevicesByRoom = (devicesList) => {
    // 复制房间数据
    const newRoomData = JSON.parse(JSON.stringify(ROOMS));
    
    // 将设备分配到相应的房间
    devicesList.forEach(device => {
      const roomId = device.room || 'living_room'; // 如果设备没有指定房间，默认放在客厅
      
      // 确保房间存在
      if (Object.values(newRoomData).some(room => room.id === roomId)) {
        // 找到对应的房间并添加设备
        Object.values(newRoomData).forEach(room => {
          if (room.id === roomId) {
            room.devices.push(device);
          }
        });
      } else {
        // 如果房间不存在，默认添加到客厅
        newRoomData.livingRoom.devices.push(device);
      }
    });
    
    setRoomData(newRoomData);
  };

  const handleVoiceCommand = () => {
    setAlert({
      open: true,
      message: language === 'zh' ? '开始录音，请说出你的命令...' : 'Recording, please say your command...',
      severity: 'info'
    });
    
    // 模拟命令识别
    setTimeout(() => {
      setAlert({
        open: true,
        message: language === 'zh' ? 
          '命令识别成功: 打开客厅灯光 (置信度: 92%)' : 
          'Command recognized: Turn on living room light (Confidence: 92%)',
        severity: 'success'
      });
    }, 1500);
  };

  const getStatusLabel = (status, type) => {
    if (language === 'zh') {
      if (status === 'on') return type === 'curtain' ? '打开' : '打开';
      if (status === 'off') return type === 'curtain' ? '关闭' : '关闭';
      if (status === 'open') return '打开 ·100%';
      if (status === 'closed') return '关闭';
      if (status === 'playing') return '播放中';
      return status;
    } else {
      if (status === 'on') return 'On';
      if (status === 'off') return 'Off';
      if (status === 'open') return 'Open ·100%';
      if (status === 'closed') return 'Closed';
      if (status === 'playing') return 'Playing';
      return status;
    }
  };

  // 根据设备类型获取图标
  const getDeviceIcon = (device) => {
    const iconType = DEVICE_TYPES[device.type] || 'device_unknown';
    
    switch(iconType) {
      case 'lightbulb':
        return <LightbulbIcon />;
      case 'ac_unit':
        return <AcUnitIcon />;
      case 'blind':
        return <BlindIcon />;
      case 'tv':
        return <TvIcon />;
      case 'water_drop':
        return <WaterDropIcon />;
      case 'wind_power':
        return <WindPowerIcon />;
      case 'thermostat':
        return <DeviceThermostatIcon />;
      case 'speaker':
        return <DeviceThermostatIcon />;
      case 'kitchen':
        return <KitchenIcon />;
      default:
        return <DeviceThermostatIcon />;
    }
  };

  const renderDeviceCard = (device) => {
    return (
      <Card 
        key={device.id} 
        className="device-card" 
        sx={{ 
          mb: 1.5, 
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                color: device.status === 'on' || device.status === 'open' || device.status === 'playing' 
                  ? '#4CAF50' : '#9e9e9e',
                mr: 1,
                display: 'flex'
              }}>
                {getDeviceIcon(device)}
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {device.name}
              </Typography>
            </Box>
            
            {device.type === 'light' && device.status === 'on' && device.brightness !== undefined ? (
              <Typography variant="body2" color="text.secondary">
                {device.brightness}%
              </Typography>
            ) : (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: device.status === 'on' || device.status === 'open' || device.status === 'playing' 
                    ? 'text.primary' : 'text.secondary'
                }}
              >
                {getStatusLabel(device.status, device.type)}
              </Typography>
            )}
          </Box>
          
          {device.type === 'light' && device.status === 'on' && device.brightness !== undefined && (
            <Box sx={{ mt: 1, px: 0.5 }}>
              <Slider
                size="small"
                value={device.brightness}
                disabled={device.status !== 'on'}
                valueLabelDisplay="auto"
                sx={{
                  color: device.status === 'on' ? '#FFD600' : undefined,
                  '.MuiSlider-rail': { opacity: 0.32 },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderRoomSection = (roomKey) => {
    const room = roomData[roomKey];
    
    if (!room || room.devices.length === 0) return null;
    
    return (
      <Box key={room.id} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ mr: 1, color: 'text.secondary' }}>
            {getRoomIcon(room.iconType)}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {room.name}
          </Typography>
          
          {/* 如果房间是客厅，显示传感器信息 */}
          {room.id === 'living_room' && room.devices.some(d => d.type === 'sensor') && (
            <Box sx={{ display: 'flex', ml: 'auto', alignItems: 'center' }}>
              {room.devices
                .filter(d => d.type === 'sensor')
                .map(sensor => (
                  <React.Fragment key={sensor.id}>
                    <DeviceThermostatIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ mr: 1.5 }}>
                      {sensor.temperature}°C
                    </Typography>
                    <WaterDropIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {sensor.humidity}%
                    </Typography>
                  </React.Fragment>
                ))
              }
            </Box>
          )}
        </Box>
        
        <Box sx={{ pl: 0.5 }}>
          {room.devices
            .filter(d => d.type !== 'sensor') // 不显示传感器在设备列表中
            .map(renderDeviceCard)}
        </Box>
      </Box>
    );
  };

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  const navigateToSettings = () => {
    window.location.href = '/settings';
  };

  // 获取户外数据
  const getOutdoorData = () => {
    return [
      { 
        key: 'temperature',
        icon: 'temperature', 
        value: '10.5 °C' 
      },
      { 
        key: 'humidity',
        icon: 'humidity', 
        value: '70.4%' 
      },
      { 
        key: 'mode',
        icon: 'home', 
        value: language === 'zh' ? '外出' : 'Away' 
      }
    ];
  };
  
  // 根据类型获取适当的图标
  const getOutdoorIcon = (iconType) => {
    switch(iconType) {
      case 'temperature':
        return <DeviceThermostatIcon />;
      case 'humidity':
        return <WaterDropIcon />;
      case 'home':
        return <HomeIcon />;
      default:
        return null;
    }
  };

  // 根据类型获取房间图标
  const getRoomIcon = (iconType) => {
    switch(iconType) {
      case 'chair':
        return <ChairIcon />;
      case 'kitchen':
        return <KitchenIcon />;
      case 'bed':
        return <SingleBedIcon />;
      case 'bath':
        return <BathtubIcon />;
      default:
        return <HomeIcon />;
    }
  };

  return (
    <div className="mobile-view">
      <div className="mobile-view-top"></div>
      
      {/* 顶部标题栏 */}
      <div className="header-bar">
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          {language === 'zh' ? '家庭助手' : 'Home Assistant'}
        </Typography>
        <Box>
          <IconButton onClick={navigateToSettings} sx={{ mr: 0.5 }}>
            <SettingsIcon />
          </IconButton>
          <IconButton 
            color="primary" 
            onClick={fetchDevices}
            disabled={loading}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </div>
      
      {/* 顶部状态栏 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1.5 }}>
        {getOutdoorData().map((item) => (
          <Box 
            key={item.key}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: 'rgba(0,0,0,0.03)',
              px: 2,
              py: 1,
              borderRadius: 28,
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)'
            }}
          >
            <Box sx={{ color: 'text.secondary', mr: 1 }}>{getOutdoorIcon(item.icon)}</Box>
            <Typography variant="body2">{item.value}</Typography>
          </Box>
        ))}
      </Box>

      {/* 设备列表 */}
      <div className="mobile-content">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>
              {language === 'zh' ? '加载设备信息...' : 'Loading devices...'}
            </Typography>
          </Box>
        ) : error ? (
          <>
            <Alert severity="warning" sx={{ my: 2 }}>{error}</Alert>
            {useMockData && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {language === 'zh' ? 
                    '注意: 这是模拟数据，不代表实际设备状态' : 
                    'Note: This is simulated data, not actual device status'}
                </Typography>
              </Box>
            )}
            {Object.keys(roomData).map(renderRoomSection)}
          </>
        ) : (
          Object.keys(roomData).map(renderRoomSection)
        )}
        
        {/* 能源部分 */}
        <Box sx={{ mt: 3, mb: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ mr: 1, color: 'text.secondary' }}>
              <RefreshIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {language === 'zh' ? '能源' : 'Energy'}
            </Typography>
          </Box>
          
          {/* 能源内容 */}
          <Box sx={{ 
            height: 120, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.03)',
            borderRadius: 2
          }}>
            <Typography color="text.secondary">
              {language === 'zh' ? '能源统计功能开发中...' : 'Energy statistics coming soon...'}
            </Typography>
          </Box>
        </Box>
      </div>

      {/* 底部语音按钮 */}
      <div className="mic-button">
        <Button
          variant="contained"
          color={isListening ? "secondary" : "primary"}
          size="large"
          startIcon={<MicIcon />}
          onClick={handleVoiceCommand}
          className="voice-command-button"
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 28
          }}
        >
          {language === 'zh' ? '语音命令' : 'Voice Command'}
        </Button>
      </div>

      {/* 提示信息 */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={alert.severity} variant="filled">
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PhoneView; 