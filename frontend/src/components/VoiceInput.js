import React, { useState, useRef } from 'react';
import { Button, Typography, Box, CircularProgress, Alert, Snackbar } from '@mui/material';
import { voiceApi } from '../services/api';

const VoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleStartListening = async () => {
    try {
      setIsListening(true);
      setError(null);
      setResponse(null);
      audioChunksRef.current = [];
      
      // 显示提示
      setSnackbarMessage('正在请求麦克风权限...');
      setSnackbarOpen(true);
      
      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      setSnackbarMessage('正在录音，请说话...');
      setSnackbarOpen(true);
      
      // 创建媒体录制器
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      // 数据可用时的处理
      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });
      
      // 录制停止时的处理
      mediaRecorderRef.current.addEventListener('stop', async () => {
        if (audioChunksRef.current.length === 0) {
          setError('没有录制到任何音频');
          setIsListening(false);
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        setSnackbarMessage('正在处理语音...');
        setSnackbarOpen(true);
        
        // 创建音频 Blob
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm' 
        });
        
        // 检查 Blob 大小
        if (audioBlob.size < 100) {
          setError('录制的音频太短或为空');
          setIsListening(false);
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        // 创建表单数据
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        
        try {
          // 发送到服务器
          const response = await voiceApi.sendVoiceCommand(formData);
          setResponse(response.data);
          
          // 如果服务器返回的文本表示没有识别到语音，显示错误
          if (response.data.text === "没有检测到语音，请重新尝试" || 
              response.data.text === "无法识别语音") {
            setError('没有识别到语音，请重新尝试');
          }
        } catch (err) {
          console.error('发送语音命令失败:', err);
          // 显示具体的错误信息
          if (err.response) {
            // 服务器返回了响应
            setError(`服务器错误: ${err.response.data.message || err.response.statusText}`);
          } else if (err.request) {
            // 请求已发送但没有收到响应
            setError('服务器无响应，请检查网络连接');
          } else {
            // 设置请求时发生错误
            setError(`请求错误: ${err.message}`);
          }
        } finally {
          setIsListening(false);
          stream.getTracks().forEach(track => track.stop());
          setSnackbarOpen(false);
        }
      });
      
      // 开始录制
      mediaRecorderRef.current.start();
      
      // 5秒后自动停止录音
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 5000);
      
    } catch (err) {
      setError(`无法访问麦克风: ${err.message}`);
      setIsListening(false);
      setSnackbarOpen(false);
    }
  };

  const handleStopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
      <Button 
        variant="contained" 
        color="primary" 
        size="large"
        disabled={isListening}
        onClick={handleStartListening}
        sx={{ 
          width: 100, 
          height: 100, 
          borderRadius: '50%',
          mb: 2
        }}
      >
        {isListening ? <CircularProgress size={24} color="inherit" /> : '语音输入'}
      </Button>
      
      {isListening && (
        <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
          Listening...
        </Typography>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
          {error}
        </Alert>
      )}
      
      {response && !error && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, width: '100%' }}>
          <Typography variant="subtitle1" fontWeight="bold">识别结果:</Typography>
          <Typography variant="body1">{response.text}</Typography>
          {response.intent !== "unknown" && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>意图:</Typography>
              <Typography variant="body2">{response.intent}</Typography>
            </>
          )}
        </Box>
      )}
      
      <Snackbar
        open={snackbarOpen}
        message={snackbarMessage}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      />
    </Box>
  );
};

export default VoiceInput; 