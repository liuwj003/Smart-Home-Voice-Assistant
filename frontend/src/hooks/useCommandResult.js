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
    // 检查两种可能的响应格式
    // 1. 直接包含nluResult的格式
    if (result && result.nluResult) {
      const nluResult = result.nluResult;
      const formattedQuintuple = {
        action: nluResult.action || "未识别",
        object: nluResult.entity || "未识别",
        location: nluResult.location || "未指定",
        deviceId: nluResult.deviceId || "0",
        parameter: nluResult.parameter,
      };
      
      // 根据用户需求，简化判断逻辑：仅当ACTION和DEVICE_TYPE（entity）中有一个为None/null/空时，认为理解失败
      const isSuccess = 
        formattedQuintuple.action && 
        formattedQuintuple.action !== "未识别" &&
        formattedQuintuple.action !== "" &&
        formattedQuintuple.object && 
        formattedQuintuple.object !== "未识别" && 
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
      nlpQuintuple.action !== "未识别" && 
      nlpQuintuple.action !== "" &&
      nlpQuintuple.object && 
      nlpQuintuple.object !== "未识别" && 
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
    
    let audioUrl = audioReference;
    
    // 检查是否为相对路径
    if (!audioReference.startsWith('http') && !audioReference.startsWith('blob:')) {
      // 构建完整 URL
      const baseUrl = 'http://localhost:8080'; // 默认端口
      audioUrl = `${baseUrl}${audioReference.startsWith('/') ? '' : '/'}${audioReference}`;
    }
    
    try {
      const audio = new Audio(audioUrl);
      await audio.play();
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