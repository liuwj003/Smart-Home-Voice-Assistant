import { useState } from 'react';
import { voiceApi } from '../services/api';

/**
 * 自定义Hook处理语音命令
 * 
 * @param {Function} onResultReceived - 接收处理结果的回调函数
 * @param {Function} onCommandStart - 开始新命令时的回调函数
 * @returns {Object} - 包含语音命令状态和处理函数
 */
const useVoiceCommand = (onResultReceived, onCommandStart) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 处理语音命令
  const handleVoiceCommand = async () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    
    // 通知开始新命令处理，清除旧状态
    if (onCommandStart) {
      onCommandStart();
    }
    
    setIsListening(true);
    
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
      
      // 录音
      const mediaRecorder = new MediaRecorder(stream);
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
          if (onResultReceived) {
            // 在接收到结果后，将resultData包装在Promise.resolve以防止任何可能的竞态条件
            onResultReceived(response.data);
          }
        } catch (error) {
          console.error('处理语音命令失败:', error);
          if (onResultReceived) {
            onResultReceived({
              errorMessage: '处理语音命令时出错，请重试'
            });
          }
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
      
    } catch (error) {
      console.error('无法访问麦克风:', error);
      setIsListening(false);
      if (onResultReceived) {
        onResultReceived({
          errorMessage: '无法访问麦克风，请检查权限设置'
        });
      }
    }
  };

  return {
    isListening,
    isProcessing,
    handleVoiceCommand
  };
};

export default useVoiceCommand; 