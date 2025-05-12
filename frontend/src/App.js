import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { deviceApi, voiceApi, weatherApi } from './services/api';

function App() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 测试后端连接
  const testBackendConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await deviceApi.getAllDevices();
      setDevices(response.data);
      console.log('后端连接成功:', response.data);
    } catch (err) {
      setError('无法连接到后端服务器，请确保后端服务正在运行。');
      console.error('后端连接错误:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          智能家居语音助手
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            后端连接测试
          </Typography>
          
          <Button 
            variant="contained" 
            onClick={testBackendConnection}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : '测试后端连接'}
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {devices.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                设备列表：
              </Typography>
              <pre>{JSON.stringify(devices, null, 2)}</pre>
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            开发状态
          </Typography>
          <Typography variant="body1" color="text.secondary">
            这是一个测试界面，用于验证前后端连接。
            <br />
            后端 API 地址: http://localhost:5000/api
            <br />
            前端开发服务器: http://localhost:3000
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default App; 