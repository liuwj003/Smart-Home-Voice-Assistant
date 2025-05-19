import React, { useState, useEffect } from 'react';
import { deviceApi, voiceApi, settingsApi } from '../services/api';
import api, { checkServerAvailability } from '../services/api';
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
  Switch,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Paper,
  Avatar,
  Fade
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MicIcon from '@mui/icons-material/Mic';
import SettingsIcon from '@mui/icons-material/Settings';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
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
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Weather from './Weather';
import Settings from './Settings';
import '../MobileApp.css';  // 引入移动样式

// Make sure the component loads correctly
console.log('PhoneView component loaded with SmartToyIcon:', !!SmartToyIcon);
console.log('Weather component imported:', !!Weather);
console.log('Settings component imported:', !!Settings);

// 房间分类和映射
const ROOMS = {
  livingRoom: {
    id: 'living_room',
    name: '客厅',
    iconType: 'chair',
    color: '#e8f0fe', // Google blue light
    devices: []
  },
  kitchen: {
    id: 'kitchen',
    name: '厨房',
    iconType: 'kitchen',
    color: '#fef7e0', // Google yellow light
    devices: []
  },
  bedroom: {
    id: 'bedroom',
    name: '卧室',
    iconType: 'bed',
    color: '#e6f4ea', // Google green light
    devices: []
  },
  bathroom: {
    id: 'bathroom',
    name: '浴室',
    iconType: 'bath',
    color: '#fce8e6', // Google red light
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

// Typing animation component
const TypingAnimation = ({ text, speed = 70, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timer);
    } else if (!isCompleted) {
      setIsCompleted(true);
      if (onComplete) onComplete();
    }
  }, [text, currentIndex, speed, isCompleted, onComplete]);

  return <Typography variant="body1">{displayText}</Typography>;
};

const PhoneView = () => {
  const [devices, setDevices] = useState([]);
  const [roomData, setRoomData] = useState(ROOMS);
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [useMockData, setUseMockData] = useState(false);
  const [language, setLanguage] = useState('zh');
  const [textCommand, setTextCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandResult, setCommandResult] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0: Home, 1: Settings, 2: Weather
  const [resultText, setResultText] = useState('');
  const [showTypingResponse, setShowTypingResponse] = useState(false);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSendTextCommand = async () => {
    if (!textCommand.trim()) return;
    
    setIsProcessing(true);
    setCommandResult(null);
    setResultText('');
    setShowTypingResponse(false);
    
    try {
      const response = await voiceApi.sendTextCommand(textCommand);
      setCommandResult(response.data);
      
      // Set result text for typing animation if TTS feedback is available
      if (response.data?.ttsFeedback) {
        setResultText(response.data.ttsFeedback);
        setShowTypingResponse(true);
      } else if (response.data?.deviceActionFeedback) {
        setResultText(response.data.deviceActionFeedback);
        setShowTypingResponse(true);
      }
      
      // Play TTS if available
      if (response.data?.ttsAudioUrl) {
        playTTSAudio(response.data.ttsAudioUrl);
      }
    } catch (error) {
      console.error('发送文本命令失败:', error);
      setResultText('发送命令失败，请重试');
      setShowTypingResponse(true);
      setCommandResult({
        error: true,
        errorMessage: error.response?.data?.message || '发送命令失败，请重试'
      });
    } finally {
      setIsProcessing(false);
      setTextCommand('');
    }
  };

  useEffect(() => {
    loadSettings();
    fetchDevices();
  }, [commandResult]);
  
  const loadSettings = async () => {
    try {
      const settings = localStorage.getItem('voice_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        const languageCode = parsed.language || 'zh';
        setLanguage(languageCode);
      } else {
        const res = await settingsApi.getVoiceSettings();
        setLanguage(res.data.language || 'zh');
      }
    } catch (error) {
      console.error('加载设置失败', error);
      // 使用中文作为默认语言
      setLanguage('zh');
    }
  };
  
  const fetchDevices = async () => {
    setLoading(true);
    try {
      // 尝试从后端获取设备
      const response = await deviceApi.getAllDevices();
      setDevices(response.data);
      organizeDevicesByRoom(response.data);
      setUseMockData(false);
    } catch (error) {
      console.warn('无法从后端获取设备列表，使用模拟数据', error);
      // 如果后端未启动，使用模拟数据
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };
  
  const organizeDevicesByRoom = (devicesList) => {
    const updatedRoomData = { ...ROOMS };
    
    // 将设备归类到房间
    devicesList.forEach(device => {
      const roomId = device.room;
      
      // 遍历所有房间，找到匹配的
      Object.keys(updatedRoomData).forEach(key => {
        if (updatedRoomData[key].id === roomId) {
          updatedRoomData[key].devices.push(device);
        }
      });
    });
    
    setRoomData(updatedRoomData);
  };
  
  const handleVoiceCommand = async () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    
    setIsListening(true);
    setResultText('');
    setShowTypingResponse(false);
    
    // 检查麦克风权限
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 创建音频上下文和分析器
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      
      microphone.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);
      
      // 用于检测声音
      const soundAllowed = (stream) => {
        // 录音
        const options = {
          audioBitsPerSecond: 128000,
          mimeType: 'audio/webm'
        };
        
        const mediaRecorder = new MediaRecorder(stream, options);
        const audioChunks = [];
        
        mediaRecorder.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });
        
        mediaRecorder.addEventListener("stop", async () => {
          // 创建音频 Blob
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          // 创建 FormData 对象，准备发送到后端
          const formData = new FormData();
          formData.append('audio_file', audioBlob, 'recording.webm');
          
          // 停止麦克风
          stream.getTracks().forEach(track => track.stop());
          
          // 清理音频处理
          scriptProcessor.disconnect();
          analyser.disconnect();
          microphone.disconnect();
          audioContext.close();
          
          setIsListening(false);
          setIsProcessing(true);
          
          try {
            // 发送到后端
            const response = await voiceApi.sendVoiceCommand(formData);
            handleCommandResult(response.data);
          } catch (error) {
            console.error('处理语音命令失败:', error);
            setAlert({
              open: true,
              message: '处理语音命令时出错',
              severity: 'error'
            });
          } finally {
            setIsProcessing(false);
          }
        });
        
        // 开始录音
        mediaRecorder.start();
        
        // 3秒后停止（模拟实际语音助手）
        setTimeout(() => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, 3000);
      };
      
      // 开始处理音频
      soundAllowed(stream);
      
    } catch (error) {
      console.error('无法访问麦克风:', error);
      setIsListening(false);
      setAlert({
        open: true,
        message: '无法访问麦克风，请检查权限设置',
        severity: 'error'
      });
    }
  };

  const handleCommandResult = (result) => {
    setCommandResult(result);
    
    // 设置结果文本用于打字动画
    if (result?.ttsFeedback) {
      setResultText(result.ttsFeedback);
      setShowTypingResponse(true);
    } else if (result?.deviceActionFeedback) {
      setResultText(result.deviceActionFeedback);
      setShowTypingResponse(true);
    } else if (result?.error) {
      setResultText(result.errorMessage || '处理命令时出错');
      setShowTypingResponse(true);
    }
    
    // 播放 TTS
    if (result?.ttsAudioUrl) {
      playTTSAudio(result.ttsAudioUrl);
    }
  };
  
  const playTTSAudio = async (audioReference) => {
    if (!audioReference) return;
    
    let audioUrl = audioReference;
    
    // 检查是否为相对路径
    if (!audioReference.startsWith('http') && !audioReference.startsWith('blob:')) {
      // 构建完整 URL
      const baseUrl = 'http://localhost:8080'; // 默认端口
      audioUrl = `${baseUrl}${audioReference.startsWith('/') ? '' : '/'}${audioReference}`;
    }
    
    try {
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('播放 TTS 音频失败:', error);
    }
  };

  const getStatusLabel = (status, type) => {
    if (type === 'sensor') {
      return '正常';
    }
    
    const statusMap = {
      'on': '开启',
      'off': '关闭',
      'open': '打开',
      'closed': '关闭',
      'playing': '播放中'
    };
    
    return statusMap[status] || status;
  };
  
  const getDeviceIcon = (device) => {
    const iconType = DEVICE_TYPES[device.type] || 'device_unknown';
    
    // 根据图标类型返回相应的 Material-UI 图标
    switch (iconType) {
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
      case 'kitchen':
        return <KitchenIcon />;
      default:
        return <DeviceThermostatIcon />;
    }
  };
  
  const renderDeviceCard = (device) => {
    // 获取设备状态颜色
    const getStatusColor = (status) => {
      if (status === 'on' || status === 'open' || status === 'playing') {
        return '#34a853'; // Google green
      } else {
        return '#9aa0a6'; // Google gray
      }
    };
    
    return (
      <Card
        elevation={0}
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          overflow: 'visible',
          mb: 2,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)',
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box 
              sx={{ 
                color: getStatusColor(device.status), 
                mr: 1.5,
                display: 'flex' 
              }}
            >
              {getDeviceIcon(device)}
            </Box>
            <Typography variant="subtitle1" fontWeight={500}>
              {device.name}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: getStatusColor(device.status),
                fontWeight: 500
              }}
            >
              {getStatusLabel(device.status, device.type)}
            </Typography>
          </Box>
          
          {device.type === 'ac' && device.status === 'on' && (
            <Typography variant="body2" color="text.secondary">
              温度: {device.temperature}°C
            </Typography>
          )}
          
          {device.type === 'sensor' && (
            <Typography variant="body2" color="text.secondary">
              温度: {device.temperature}°C, 湿度: {device.humidity}%
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };
  
  const renderRoomSection = (roomKey) => {
    const room = roomData[roomKey];
    
    const getRoomIcon = (iconType) => {
      switch (iconType) {
        case 'chair':
          return <ChairIcon sx={{ fontSize: 28 }} />;
        case 'kitchen':
          return <KitchenIcon sx={{ fontSize: 28 }} />;
        case 'bed':
          return <SingleBedIcon sx={{ fontSize: 28 }} />;
        case 'bath':
          return <BathtubIcon sx={{ fontSize: 28 }} />;
        default:
          return <HomeIcon sx={{ fontSize: 28 }} />;
      }
    };
    
    return (
      <Card
        key={room.id}
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: '12px',
          backgroundColor: room.color,
          border: '1px solid #e0e0e0',
          overflow: 'visible'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: '#fff',
                color: '#5f6368',
                mr: 2,
                width: 48,
                height: 48
              }}
            >
              {getRoomIcon(room.iconType)}
            </Avatar>
            <Typography variant="h6" fontWeight={500}>{room.name}</Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {room.devices.length > 0 
              ? `${room.devices.length} 个设备` 
              : `后端数据库待接入，暂无设备数据`
            }
          </Typography>
        </CardContent>
      </Card>
    );
  };
  
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };
  
  return (
    <Box sx={{ width: '100%', maxWidth: '480px', margin: '0 auto', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Phone header */}
      <Paper 
        square 
        elevation={0}
        sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 10,
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#fff'
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          aria-label="phone navigation tabs"
          sx={{ 
            '& .MuiTab-root': { 
              textTransform: 'none',
              fontSize: '0.9rem',
              fontWeight: 500
            }
          }}
        >
          <Tab 
            icon={<HomeIcon />} 
            iconPosition="start" 
            label="主界面" 
          />
          <Tab 
            icon={<SettingsIcon />} 
            iconPosition="start" 
            label="设置" 
          />
          <Tab 
            icon={<WbSunnyIcon />} 
            iconPosition="start" 
            label="天气" 
          />
        </Tabs>
      </Paper>

      {/* Tab content */}
      <Box sx={{ p: 2 }}>
        {/* Home Tab */}
        {activeTab === 0 && (
          <Box>
            {/* Voice Input Section */}
            <Paper
              elevation={0}
              sx={{
                mb: 3,
                p: 2.5,
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                backgroundColor: '#fff'
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 500,
                  fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
                  color: '#202124',
                  mb: 2
                }}
              >
                智能家居助手
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="输入命令，例如：打开客厅灯"
                  variant="outlined"
                  value={textCommand}
                  onChange={(e) => setTextCommand(e.target.value)}
                  disabled={isProcessing}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendTextCommand()}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleSendTextCommand}
                          disabled={isProcessing || !textCommand.trim()}
                        >
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '24px',
                    }
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={isListening ? null : <MicIcon />}
                  onClick={handleVoiceCommand}
                  disabled={isProcessing}
                  sx={{
                    borderRadius: '24px',
                    textTransform: 'none',
                    fontWeight: 500,
                    backgroundColor: isListening ? '#ea4335' : '#1a73e8',
                    '&:hover': {
                      backgroundColor: isListening ? '#d93025' : '#1765cc'
                    },
                    width: '140px',
                    height: '48px'
                  }}
                >
                  {isListening ? '正在聆听...' : '语音输入'}
                </Button>
              </Box>
              
              {/* Response display with typing animation */}
              <Fade in={showTypingResponse}>
                <Box 
                  sx={{ 
                    mt: 2, 
                    p: 2,
                    backgroundColor: '#f1f3f4',
                    borderRadius: '12px'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar
                      sx={{
                        mr: 1.5,
                        width: 32,
                        height: 32,
                        backgroundColor: '#e8f0fe'
                      }}
                    >
                      <SmartToyIcon sx={{ fontSize: 18, color: '#1a73e8' }} />
                    </Avatar>
                    <Box>
                      <TypingAnimation text={resultText} />
                    </Box>
                  </Box>
                </Box>
              </Fade>
            </Paper>
            
            {/* Room Sections */}
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                fontWeight: 500,
                fontFamily: 'Google Sans, Roboto, Arial, sans-serif'
              }}
            >
              房间
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              Object.keys(roomData).map(roomKey => renderRoomSection(roomKey))
            )}
            
            {!loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={fetchDevices}
                  variant="outlined"
                  sx={{
                    borderRadius: '24px',
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  刷新设备状态
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Settings Tab */}
        {activeTab === 1 && (
          <Box sx={{ pb: 10 }}>
            <Settings />
          </Box>
        )}

        {/* Weather Tab */}
        {activeTab === 2 && (
          <Box sx={{ pb: 10 }}>
            <Weather />
          </Box>
        )}
      </Box>

      {/* Snackbar for alerts */}
      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={handleAlertClose}
      >
        <Alert onClose={handleAlertClose} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PhoneView; 