import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Box,
  Alert,
  Snackbar 
} from '@mui/material';
import { setApiBaseUrl } from '../services/api';

const Settings = () => {
  const [apiUrl, setApiUrl] = useState('http://localhost:5000/api');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 初始化时从本地存储加载API URL
  useEffect(() => {
    const savedApiUrl = localStorage.getItem('apiBaseUrl');
    if (savedApiUrl) {
      setApiUrl(savedApiUrl);
    }
  }, []);

  const handleSaveSettings = () => {
    try {
      // 保存到本地存储
      localStorage.setItem('apiBaseUrl', apiUrl);
      
      // 更新API基础URL
      setApiBaseUrl(apiUrl);
      
      setSnackbar({
        open: true,
        message: '设置已保存',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: '保存设置失败: ' + error.message,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        设置
      </Typography>
      
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          API 设置
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="后端 API 地址"
            variant="outlined"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="例如: http://192.168.1.100:5000/api"
            helperText="设置后端API的基础URL，确保包含/api路径"
            sx={{ mb: 3 }}
          />
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSaveSettings}
          >
            保存设置
          </Button>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          关于
        </Typography>
        <Typography variant="body1">
          智能家居语音助手 v1.0
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          这是一个模拟智能家居控制的演示应用，通过语音命令控制虚拟家居设备。
        </Typography>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Settings; 