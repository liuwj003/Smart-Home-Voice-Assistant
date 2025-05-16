import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Box,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Grid,
  CircularProgress
} from '@mui/material';
import { setApiBaseUrl, settingsApi } from '../services/api';
import { ArrowBack } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Settings = () => {
  const [apiUrl, setApiUrl] = useState('http://localhost:5000/api');
  const [language, setLanguage] = useState('zh');
  const [sttEngine, setSttEngine] = useState('whisper');
  const [voiceFeedback, setVoiceFeedback] = useState(true);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load settings from local storage and server when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      // First load from local storage
      const savedApiUrl = localStorage.getItem('apiBaseUrl');
      if (savedApiUrl) {
        setApiUrl(savedApiUrl);
        setApiBaseUrl(savedApiUrl); // Set it for current session
      }
      
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
      
      const savedSttEngine = localStorage.getItem('sttEngine');
      if (savedSttEngine) {
        setSttEngine(savedSttEngine);
      }
      
      const savedVoiceFeedback = localStorage.getItem('voiceFeedback');
      if (savedVoiceFeedback !== null) {
        setVoiceFeedback(savedVoiceFeedback === 'true');
      }
      
      // Then try to load from server to get the latest settings
      try {
        const response = await settingsApi.getVoiceSettings();
        const serverSettings = response.data;
        
        if (serverSettings.language) {
          setLanguage(serverSettings.language);
          localStorage.setItem('language', serverSettings.language);
        }
        
        if (serverSettings.stt_engine) {
          setSttEngine(serverSettings.stt_engine);
          localStorage.setItem('sttEngine', serverSettings.stt_engine);
        }
        
        if (serverSettings.voice_feedback !== undefined) {
          setVoiceFeedback(serverSettings.voice_feedback);
          localStorage.setItem('voiceFeedback', serverSettings.voice_feedback.toString());
        }
      } catch (error) {
        console.warn('Could not fetch settings from server:', error);
        // Continue using local settings
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // Save to local storage
      localStorage.setItem('apiBaseUrl', apiUrl);
      localStorage.setItem('language', language);
      localStorage.setItem('sttEngine', sttEngine);
      localStorage.setItem('voiceFeedback', voiceFeedback.toString());
      
      // Update API base URL for current session
      setApiBaseUrl(apiUrl);
      
      // Send settings to backend
      const settingsPayload = {
        language,
        stt_engine: sttEngine,
        voice_feedback: voiceFeedback
      };
      
      try {
        // Call the API to save settings
        await settingsApi.updateVoiceSettings(settingsPayload);
        
        // Show success message
        setSnackbar({
          open: true,
          message: language === 'zh' ? '设置已保存' : 'Settings saved',
          severity: 'success'
        });
        
        // 如果用户在手机端页面修改了语言，页面需要刷新以更新显示
        setTimeout(() => {
          if (window.location.pathname.includes('/phone')) {
            window.location.reload();
          }
        }, 1500);
      } catch (error) {
        console.error('Failed to save settings to backend:', error);
        // Show partial success message
        setSnackbar({
          open: true,
          message: language === 'zh' ? 
            '设置已保存到本地，但无法同步到服务器' : 
            'Settings saved locally, but could not sync to server',
          severity: 'warning'
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({
        open: true,
        message: language === 'zh' ? 
          '保存设置失败: ' + error.message : 
          'Failed to save settings: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleBackClick = () => {
    // Check if we came from phone view and return there if so
    if (window.location.pathname.includes('/settings') && document.referrer.includes('/phone')) {
      window.location.href = '/phone';
    } else {
      // Otherwise go to the main page
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '50vh'
      }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }}>加载设置中...</Typography>
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        gap: 2
      }}>
        <IconButton 
          onClick={handleBackClick}
          sx={{ 
            backgroundColor: 'rgba(0,0,0,0.05)',
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          设置
        </Typography>
      </Box>
      
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: '16px',
          backgroundColor: '#f8f9fa'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
          语音识别设置
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel id="language-select-label">语言</InputLabel>
              <Select
                labelId="language-select-label"
                id="language-select"
                value={language}
                label="语言"
                onChange={(e) => setLanguage(e.target.value)}
              >
                <MenuItem value="zh">中文</MenuItem>
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="ja">日本語</MenuItem>
                <MenuItem value="ko">한국어</MenuItem>
                <MenuItem value="ru">Русский</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel id="stt-engine-select-label">语音识别引擎</InputLabel>
              <Select
                labelId="stt-engine-select-label"
                id="stt-engine-select"
                value={sttEngine}
                label="语音识别引擎"
                onChange={(e) => setSttEngine(e.target.value)}
              >
                <MenuItem value="whisper">Whisper</MenuItem>
                <MenuItem value="dolphin">Dolphin</MenuItem>
                <MenuItem value="simulated">模拟引擎 (仅测试用)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={voiceFeedback}
                onChange={(e) => setVoiceFeedback(e.target.checked)}
                color="primary"
              />
            }
            label="启用语音反馈（在设备操作后播放语音提示）"
          />
        </Box>
      </Paper>
      
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: '16px',
          backgroundColor: '#f8f9fa'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
          API 设置
        </Typography>
        
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
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary"
          size="large"
          onClick={handleSaveSettings}
          disabled={loading}
          sx={{ borderRadius: '10px', px: 4 }}
        >
          {loading ? <CircularProgress size={24} /> : '保存设置'}
        </Button>
      </Box>
      
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mt: 4, 
          borderRadius: '16px',
          backgroundColor: '#f8f9fa'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
          关于
        </Typography>
        <Typography variant="body1">
          智能家居语音助手 v1.0
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          这是一个智能家居控制系统，允许您通过语音命令控制家居设备。
          该系统使用先进的语音识别和自然语言处理技术，支持多种语言和设备类型。
        </Typography>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} 
          sx={{ width: '100%', boxShadow: '0 3px 10px rgba(0,0,0,0.1)' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Settings; 