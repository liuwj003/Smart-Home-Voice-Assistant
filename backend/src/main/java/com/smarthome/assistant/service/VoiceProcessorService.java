package com.smarthome.assistant.service;

import com.smarthome.assistant.model.VoiceCommand;
import org.springframework.web.multipart.MultipartFile;

public interface VoiceProcessorService {
    
    /**
     * 处理语音命令
     * 
     * @param audioFile 语音文件
     * @return 处理结果
     */
    VoiceCommand processVoiceCommand(MultipartFile audioFile);
    
    /**
     * 开始语音监听
     */
    void startListening();
    
    /**
     * 停止语音监听
     */
    void stopListening();
    
    /**
     * 获取语音监听状态
     * 
     * @return 监听状态
     */
    boolean isListening();
} 