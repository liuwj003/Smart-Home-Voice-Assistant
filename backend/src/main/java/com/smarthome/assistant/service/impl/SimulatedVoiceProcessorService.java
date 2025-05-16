package com.smarthome.assistant.service.impl;

import com.smarthome.assistant.model.VoiceCommand;
import com.smarthome.assistant.service.VoiceProcessorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * 模拟的语音处理器服务
 * 用于测试和开发环境
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "voice.processor.type", havingValue = "simulated", matchIfMissing = true)
public class SimulatedVoiceProcessorService implements VoiceProcessorService {

    private boolean listening = false;
    
    @Override
    public VoiceCommand processVoiceCommand(MultipartFile audioFile) {
        log.info("使用模拟处理器处理语音命令，文件名：{}", audioFile.getOriginalFilename());
        
        // 创建模拟命令结果
        VoiceCommand result = new VoiceCommand();
        result.setText("这是一个模拟识别的文本");
        result.setIntent("turn_on");

        // 创建模拟实体
        Map<String, Object> entities = new HashMap<>();
        entities.put("device_type", "light");
        entities.put("location", "living_room");
        entities.put("parameter", "brightness:80%");
        result.setEntities(entities);
        
        result.setConfidence(0.95);
        
        // 模拟处理延迟
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        return result;
    }
    
    @Override
    public void startListening() {
        log.info("开始模拟语音监听");
        this.listening = true;
    }
    
    @Override
    public void stopListening() {
        log.info("停止模拟语音监听");
        this.listening = false;
    }
    
    @Override
    public boolean isListening() {
        return this.listening;
    }
} 