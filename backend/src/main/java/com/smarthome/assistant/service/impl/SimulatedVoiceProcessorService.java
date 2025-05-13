package com.smarthome.assistant.service.impl;

import com.smarthome.assistant.model.VoiceCommand;
import com.smarthome.assistant.service.VoiceProcessorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Slf4j
@Service
public class SimulatedVoiceProcessorService implements VoiceProcessorService {

    @Value("${voice.stt.engine-type}")
    private String sttEngineType;
    
    @Value("${voice.nlu.engine-type}")
    private String nluEngineType;
    
    private boolean listening = false;
    private final Random random = new Random();
    
    @Override
    public VoiceCommand processVoiceCommand(MultipartFile audioFile) {
        log.info("处理语音命令，文件名：{}", audioFile.getOriginalFilename());
        
        // 模拟语音处理 - 通常这里会调用真实的STT和NLU引擎
        // 在实际应用中，需要读取音频数据，转换格式，然后调用STT和NLU服务
        
        // 为演示目的，返回模拟的命令结果
        String[] intents = {"turn_on", "turn_off", "set_temperature", "set_volume", "open_curtain", "close_curtain"};
        String[] devices = {"客厅灯", "卧室空调", "阳台窗帘", "客厅电视", "加湿器", "风扇"};
        
        String simulatedText = "打开" + devices[random.nextInt(devices.length)];
        String intent = intents[random.nextInt(intents.length)];
        
        Map<String, Object> entities = new HashMap<>();
        entities.put("device", devices[random.nextInt(devices.length)]);
        
        if (intent.equals("set_temperature")) {
            entities.put("temperature", 20 + random.nextInt(10));
        } else if (intent.equals("set_volume")) {
            entities.put("volume", 5 + random.nextInt(15));
        }
        
        VoiceCommand command = new VoiceCommand();
        command.setText(simulatedText);
        command.setIntent(intent);
        command.setEntities(entities);
        command.setConfidence(0.85 + random.nextDouble() * 0.15);
        return command;
    }
    
    @Override
    public void startListening() {
        log.info("开始语音监听");
        this.listening = true;
    }
    
    @Override
    public void stopListening() {
        log.info("停止语音监听");
        this.listening = false;
    }
    
    @Override
    public boolean isListening() {
        return this.listening;
    }
} 