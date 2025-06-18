import { useState, useCallback } from 'react';

/**
 * 自定义Hook处理命令结果
 * 
 * @returns {Object} - 包含命令结果处理状态和函数
 */
const useCommandResult = () => {
  const [resultText, setResultText] = useState('');
  const [nlpResult, setNlpResult] = useState(null);
  const [showTypingResponse, setShowTypingResponse] = useState(false);
  const [isUnderstandSuccess, setIsUnderstandSuccess] = useState(true);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);

  // 格式化NLP五元组结果
  const formatNlpQuintuple = (result) => {

    if (result && result.nluResult) {
      const nluResult = result.nluResult;
      const formattedQuintuple = {
        action: nluResult.action,
        object: nluResult.entity,
        location: nluResult.location,
        deviceId: nluResult.deviceId || "0",
        parameter: nluResult.parameter,
      };
      
      // 仅当ACTION和DEVICE中有一个为空时，认为理解失败
      const isSuccess = 
        formattedQuintuple.action && 
        formattedQuintuple.action !== "" &&
        formattedQuintuple.object && 
        formattedQuintuple.object !== "";
      
      return {
        ...formattedQuintuple,
        isSuccess
      };
    }
    
    return null;
  };

  // 清除结果 - 在开始新的命令处理前调用
  const clearResult = useCallback(() => {
    // 使用单一原子操作设置所有状态，确保它们的更新是同步的
    setResultText('');
    setShowTypingResponse(false);
    setNlpResult(null);
    // 保留上一个理解状态直到有新状态
  }, []);
  
  // 处理命令结果
  const handleCommandResult = useCallback((result) => {
    // 首先标记为正在处理响应
    setIsProcessingResponse(true);
    
    // 先完全清除旧的状态
    clearResult();
    
    // 设置 NLP 识别结果
    const nlpQuintuple = formatNlpQuintuple(result);
    
    // 判断理解成功或失败
    const isSuccess = 
      nlpQuintuple && 
      nlpQuintuple.action && 
      nlpQuintuple.action !== "" &&
      nlpQuintuple.object && 
      nlpQuintuple.object !== "";
    
    // 同步设置所有相关状态，避免状态更新不一致
    setTimeout(() => {
      // 使用微任务确保React的批处理机制能同时应用这些状态更新
      setIsUnderstandSuccess(isSuccess);
      
      if (nlpQuintuple) {
        setNlpResult(nlpQuintuple);
      }
      
      // 设置响应文本
      let responseText = '';
      // 优先使用responseMessageForTts作为显示文本
      if (result?.responseMessageForTts) {
        responseText = result.responseMessageForTts;
      }
      // 回退到其他文本
      else if (result?.deviceActionFeedback) {
        responseText = result.deviceActionFeedback;
      } else if (result?.errorMessage) {
        responseText = result.errorMessage || '处理命令时出错';
      }
      
      setResultText(responseText);
      setShowTypingResponse(true);
      
      // 播放 TTS
      if (result?.ttsOutputReference) {
        playTTSAudio(result.ttsOutputReference);
      }
      
      setIsProcessingResponse(false);
    }, 0);
  }, [clearResult]);
  
  // 播放 TTS 音频
  const playTTSAudio = async (audioReference) => {
    if (!audioReference) return;
    
    console.log('尝试播放TTS音频:', audioReference.substring(0, 50) + '...');
    
    try {
      // 处理base64格式的音频
      if (audioReference.startsWith('base64://')) {
        const base64Data = audioReference.replace('base64://', '');
        console.log('检测到base64格式音频，长度:', base64Data.length);
        
        // 将base64字符串转换为二进制数据
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        // 创建音频Blob和URL
        const audioBlob = new Blob([byteArray], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        console.log('已创建Blob URL:', audioUrl);
        
        // 创建音频元素并播放
        const audio = new Audio(audioUrl);
        audio.oncanplaythrough = () => {
          console.log('音频已加载，准备播放');
          audio.play()
            .then(() => console.log('音频播放开始'))
            .catch(err => console.error('播放失败:', err));
        };
        
        audio.onerror = (e) => {
          console.error('音频加载出错:', e);
        };
        
        // 清理资源
        audio.onended = () => {
          console.log('音频播放结束，释放资源');
          URL.revokeObjectURL(audioUrl);
        };
      } 
      // 处理URL格式的音频
      else {
        let audioUrl = audioReference;
        
        // 检查是否为相对路径
        if (!audioReference.startsWith('http') && !audioReference.startsWith('blob:')) {
          // 构建完整 URL
          const baseUrl = 'http://localhost:8080'; // 默认端口
          audioUrl = `${baseUrl}${audioReference.startsWith('/') ? '' : '/'}${audioReference}`;
        }
        
        console.log('使用URL播放音频:', audioUrl);
        const audio = new Audio(audioUrl);
        await audio.play();
      }
    } catch (error) {
      console.error('播放TTS语音失败:', error);
    }
  };

  // 对外暴露简化版清除函数
  const resetState = () => {
    clearResult();
    setIsUnderstandSuccess(true); // 重置为默认值
  };
  
  return {
    resultText,
    nlpResult,
    showTypingResponse,
    isUnderstandSuccess,
    isProcessingResponse,
    handleCommandResult,
    clearResult: resetState
  };
};

export default useCommandResult; 