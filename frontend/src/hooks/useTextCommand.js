import { useState } from 'react';
import { voiceApi } from '../services/api';

/**
 * 自定义Hook处理文本命令
 * 
 * @param {Function} onResultReceived - 接收处理结果的回调函数
 * @param {Function} onCommandStart - 开始新命令时的回调函数
 * @returns {Object} - 包含文本命令状态和处理函数
 */
const useTextCommand = (onResultReceived, onCommandStart) => {
  const [textCommand, setTextCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 处理文本命令输入
  const handleSendTextCommand = async () => {
    if (!textCommand.trim()) return;
    
    // 通知开始新命令处理，清除旧状态
    if (onCommandStart) {
      onCommandStart();
    }
    
    setIsProcessing(true);
    
    try {
      const response = await voiceApi.sendTextCommand(textCommand);
      
      if (onResultReceived) {
        // 使用Promise.resolve包装结果处理，确保状态更新有序进行
        onResultReceived(response.data);
      }
    } catch (error) {
      console.error('发送文本命令失败:', error);
      if (onResultReceived) {
        onResultReceived({
          error: true,
          errorMessage: error.response?.data?.message || '发送命令失败，请重试'
        });
      }
    } finally {
      setIsProcessing(false);
      setTextCommand('');
    }
  };

  return {
    textCommand,
    setTextCommand,
    isProcessing,
    handleSendTextCommand
  };
};

export default useTextCommand; 