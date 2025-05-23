import { useState, useCallback } from 'react';
import { playTTSAudio } from '../utils/audio-utils';

/**
 * 命令结果处理Hook
 * 处理语音和文本命令的结果显示和音频播放
 */
const useCommandResult = () => {
  const [resultText, setResultText] = useState('');
  const [nlpResult, setNlpResult] = useState(null);
  const [showTypingResponse, setShowTypingResponse] = useState(false);
  const [isUnderstandSuccess, setIsUnderstandSuccess] = useState(true);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);

  // 检查文本是否包含理解失败的关键词
  const containsFailureKeywords = (text) => {
    if (!text) return false;
    
    const lowerText = text.toLowerCase();
    const failureKeywords = [
      "抱歉", "对不起", "没能理解", "不明白", "没听清", "请再说一遍"
    ];
    
    return failureKeywords.some(keyword => lowerText.includes(keyword));
  };

  // 格式化NLP五元组结果
  const formatNlpQuintuple = (result) => {
    if (!result) return null;
    
    // 检查两种可能的响应格式
    // 1. 直接包含nluResult的格式
    if (result.nluResult) {
      const nluResult = result.nluResult;
      return {
        action: nluResult.action || "未识别",
        object: nluResult.entity || "未识别",
        location: nluResult.location || "未指定",
        deviceId: nluResult.deviceId || "0",
        parameter: nluResult.parameter,
        success: nluResult.success !== undefined ? nluResult.success : true
      };
    } 
    
    // 2. 旧格式：直接包含五元组字段
    else if (result.ACTION || result.DEVICE_TYPE) {
      return {
        action: result.ACTION || "未识别",
        object: result.DEVICE_TYPE || "未识别", 
        location: result.LOCATION || "未指定",
        deviceId: result.DEVICE_ID || "0",
        parameter: result.PARAMETER,
        // 根据用户需求，简化判断逻辑：仅当ACTION和DEVICE_TYPE中有一个为None/null/空时，认为理解失败
        success: !!(result.ACTION && result.ACTION !== "未识别" && result.ACTION !== "" && 
                  result.DEVICE_TYPE && result.DEVICE_TYPE !== "未识别" && result.DEVICE_TYPE !== "")
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
    
    if (!result) {
      setIsProcessingResponse(false);
      return;
    }
    
    // 获取响应文本，用于判断理解成功状态
    // 优先使用responseMessageForTts作为显示文本
    let responseText = '';
    if (result.responseMessageForTts) {
      responseText = result.responseMessageForTts;
    }
    // 回退到deviceActionFeedback
    else if (result.deviceActionFeedback) {
      responseText = result.deviceActionFeedback;
    }
    // 错误消息
    else if (result.errorMessage) {
      responseText = result.errorMessage;
    }
    // 最后尝试transcribedText
    else if (result.transcribedText) {
      responseText = "已识别: " + result.transcribedText;
    }
    // 最终默认
    else {
      responseText = "命令已处理";
    }
    
    // 设置 NLP 识别结果
    const nlpQuintuple = formatNlpQuintuple(result);
    
    // 判断理解成功或失败
    let isSuccess = true;
    
    // 1. 明确的错误响应
    if (result.error) {
      console.log("检测到错误标志，设置为理解失败");
      isSuccess = false;
    }
    // 2. 根据文本内容判断
    else if (containsFailureKeywords(responseText)) {
      console.log(`检测到理解失败的文本提示: "${responseText}"`);
      isSuccess = false;
    }
    // 3. NLP五元组中的成功标志
    else if (nlpQuintuple && nlpQuintuple.success === false) {
      console.log("NLP五元组标记为失败");
      isSuccess = false;
    } 
    // 4. 直接的成功标志
    else if (result.success === false) {
      console.log("结果直接标记为失败");
      isSuccess = false;
    }
    
    // 记录最终判断结果
    console.log(`理解结果: ${isSuccess ? '成功' : '失败'}, 文本: "${responseText}"`);
    
    // 同步设置所有相关状态，避免状态更新不一致
    setTimeout(() => {
      // 使用微任务确保React的批处理机制能同时应用这些状态更新
      setIsUnderstandSuccess(isSuccess);
      
      if (nlpQuintuple) {
        setNlpResult(nlpQuintuple);
      }
      
      setResultText(responseText);
      setShowTypingResponse(true);
      
      // 播放 TTS
      if (result.ttsOutputReference) {
        playTTSAudio(result.ttsOutputReference);
      }
      
      setIsProcessingResponse(false);
    }, 0);
  }, [clearResult, containsFailureKeywords]);
  
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