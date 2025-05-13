import React, { useState, useEffect } from 'react';
import { deviceApi, voiceApi } from '../services/api';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MicIcon from '@mui/icons-material/Mic';
import '../MobileApp.css';  // 引入移动样式

// 设备类型映射
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
    id: 'light-1',
    name: '客厅灯',
    type: 'light',
    status: 'on',
    brightness: 80
  },
  {
    id: 'ac-1',
    name: '卧室空调',
    type: 'ac',
    status: 'on',
    temperature: 24,
    mode: 'cool'
  },
  {
    id: 'curtain-1',
    name: '客厅窗帘',
    type: 'curtain',
    status: 'on',
    position: 30
  },
  {
    id: 'tv-1',
    name: '客厅电视',
    type: 'tv',
    status: 'off',
    volume: 15
  },
  {
    id: 'sensor-1',
    name: '温湿度传感器',
    type: 'sensor',
    status: 'on',
    temperature: 26,
    humidity: 68
  }
];

const MobileView = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await deviceApi.getAllDevices();
      // 确保响应数据是一个数组
      const devicesData = response.data && response.data.data ? response.data.data : [];
      setDevices(Array.isArray(devicesData) ? devicesData : []);
      setUseMockData(false);
      setError(null);
    } catch (err) {
      console.error('获取设备列表失败:', err);
      setError('无法连接到后端服务器，使用模拟数据进行展示。');
      setDevices(mockDevices); // 使用模拟数据
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceCommand = () => {
    setAlert({
      open: true,
      message: '这里将弹出语音录制界面，目前为模拟演示版本',
      severity: 'info'
    });
    
    // 模拟语音命令处理
    setTimeout(() => {
      setAlert({
        open: true,
        message: '命令识别结果: 打开客厅灯 (置信度: 92%, 意图: turn_on, 实体: 客厅灯)',
        severity: 'success'
      });
    }, 1500);
  };

  const toggleListening = async () => {
    try {
      if (isListening) {
        await voiceApi.stopListening();
        setIsListening(false);
      } else {
        await voiceApi.startListening();
        setIsListening(true);
      }
    } catch (err) {
      setAlert({
        open: true,
        message: `语音监听控制失败: ${err.message}`,
        severity: 'error'
      });
    }
  };

  const renderDeviceItem = (device) => (
    <Card key={device.id} className="device-card" sx={{ mb: 1, boxShadow: 2, borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{device.name}</Typography>
          <div className={`status-indicator ${device.status === 'on' ? 'status-on' : 'status-off'}`} />
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2">类型: {deviceTypeLabels[device.type] || device.type}</Typography>
          <Typography variant="body2">状态: {device.status === 'on' ? '开启' : '关闭'}</Typography>
          {device.brightness !== undefined && 
            <Typography variant="body2">亮度: {device.brightness}%</Typography>}
          {device.temperature !== undefined && 
            <Typography variant="body2">温度: {device.temperature}°C</Typography>}
          {device.humidity !== undefined && 
            <Typography variant="body2">湿度: {device.humidity}%</Typography>}
          {device.volume !== undefined && 
            <Typography variant="body2">音量: {device.volume}</Typography>}
          {device.speed !== undefined && 
            <Typography variant="body2">风速: {device.speed}</Typography>}
          {device.position !== undefined && 
            <Typography variant="body2">位置: {device.position}%</Typography>}
        </Box>
      </CardContent>
    </Card>
  );

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <div className="mobile-view">
      <div className="mobile-view-top"></div>
      
      {/* 顶部标题栏 */}
      <div className="header-bar">
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          智能家居语音助手
        </Typography>
        <IconButton 
          color="primary" 
          onClick={fetchDevices}
          disabled={loading}
        >
          <RefreshIcon />
        </IconButton>
      </div>

      {/* 设备列表 */}
      <div className="mobile-content">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>加载设备信息...</Typography>
          </Box>
        ) : error ? (
          <>
            <Alert severity="warning" sx={{ my: 2 }}>{error}</Alert>
            {useMockData && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  提示：这是前端模拟数据，不代表实际设备状态
                </Typography>
              </Box>
            )}
            {devices.map(renderDeviceItem)}
          </>
        ) : devices.length > 0 ? (
          devices.map(renderDeviceItem)
        ) : (
          <Alert severity="info" sx={{ my: 2 }}>没有发现设备，请添加设备</Alert>
        )}
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
          语音命令
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

export default MobileView; 