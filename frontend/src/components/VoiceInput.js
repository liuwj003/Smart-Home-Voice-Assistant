import React, { useState, useRef } from 'react';
import { Button, Typography, Box, CircularProgress, Alert, Snackbar } from '@mui/material';
import { Mic, MicOff } from '@mui/icons-material';
import { voiceApi } from '../services/api';

const VoiceInput = ({ onCommandResult }) => {
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
        formData.append('settingsJson', JSON.stringify({
          ttsEnabled: true
        }));
        
        try {
          // 发送到服务器
          const response = await voiceApi.sendVoiceCommand(formData);
          setResponse(response.data);
          
          // 如果服务器返回的文本表示没有识别到语音，显示错误
          if (response.data.transcribedText === "" || 
              response.data.error === true) {
            setError('没有识别到语音，请重新尝试');
          } else {
            // 通知父组件处理结果
            if (onCommandResult) {
              onCommandResult({
                sttText: response.data.transcribedText,
                nluResult: response.data.nluResult,
                deviceActionFeedback: response.data.deviceActionFeedback,
                ttsOutputReference: response.data.ttsOutputReference
              });
              
              // 如果返回了TTS音频，尝试播放
              if (response.data.ttsOutputReference) {
                playTTSAudio(response.data.ttsOutputReference);
              }
            }
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
          
          // 通知父组件出错
          if (onCommandResult) {
            onCommandResult({
              error: true,
              errorMessage: err.response?.data?.message || '语音命令处理失败'
            });
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
      
      // 通知父组件出错
      if (onCommandResult) {
        onCommandResult({
          error: true,
          errorMessage: `无法访问麦克风: ${err.message}`
        });
      }
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
  
  const playTTSAudio = async (audioReference) => {
    try {
      // 判断audioReference是URL还是Base64
      const audio = new Audio();
      if (audioReference.startsWith('data:audio')) {
        // Base64格式
        audio.src = audioReference;
      } else if (audioReference.startsWith('http')) {
        // URL格式
        audio.src = audioReference;
      } else {
        // 假设是文件路径
        audio.src = audioReference;
      }
      
      await audio.play();
    } catch (err) {
      console.error('播放TTS音频失败:', err);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
      <Button 
        variant="contained" 
        color={isListening ? "secondary" : "primary"}
        size="large"
        disabled={isListening && !mediaRecorderRef.current}
        onClick={isListening ? handleStopListening : handleStartListening}
        sx={{ 
          width: 80, 
          height: 80, 
          borderRadius: '50%',
          mb: 2,
          boxShadow: isListening ? '0 0 15px rgba(211, 47, 47, 0.5)' : 'none',
          animation: isListening ? 'pulse 1.5s infinite' : 'none',
          '@keyframes pulse': {
            '0%': {
              boxShadow: '0 0 0 0 rgba(211, 47, 47, 0.4)',
            },
            '70%': {
              boxShadow: '0 0 0 15px rgba(211, 47, 47, 0)',
            },
            '100%': {
              boxShadow: '0 0 0 0 rgba(211, 47, 47, 0)',
            },
          },
        }}
      >
        {isListening ? (
          mediaRecorderRef.current ? <MicOff /> : <CircularProgress size={24} color="inherit" />
        ) : (
          <Mic />
        )}
      </Button>
      
      <Typography 
        variant="button" 
        color={isListening ? "secondary" : "primary"} 
        sx={{ fontWeight: 'bold' }}
      >
        {isListening ? "点击停止" : "语音命令"}
      </Typography>
      
      {error && !onCommandResult && (
        <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
          {error}
        </Alert>
      )}
      
      {response && !error && !onCommandResult && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, width: '100%' }}>
          <Typography variant="subtitle1" fontWeight="bold">识别结果:</Typography>
          <Typography variant="body1">{response.transcribedText}</Typography>
          {response.nluResult && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>意图:</Typography>
              <Typography variant="body2">
                {`${response.nluResult.action || "未知"} / ${response.nluResult.entity || "未知"}`}
              </Typography>
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