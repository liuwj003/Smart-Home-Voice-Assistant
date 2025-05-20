package com.smarthome.assistant.controller;

import com.smarthome.assistant.dto.ApiResponse;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 设置控制器，处理系统设置相关的API请求
 */
@Slf4j
@RestController
@RequestMapping("/voice")
@RequiredArgsConstructor
@CrossOrigin
public class SettingsController {

    // 默认设置，实际项目中应从数据库或配置文件中读取
    private static final Map<String, Object> defaultSettings = new HashMap<String, Object>() {{
        put("stt", new HashMap<String, Object>() {{
            put("engine", "whisper");
            put("language", "zh-CN");
            put("sensitivity", 0.5);
        }});
        put("nlu", new HashMap<String, Object>() {{
            put("engine", "fine_tuned_bert");
            put("confidence_threshold", 0.7);
        }});
        put("tts", new HashMap<String, Object>() {{
            put("enabled", true);
            put("engine", "pyttsx3");
            put("voice", "female");
            put("speed", 1.0);
            put("pitch", 1.0);
            put("volume", 1.0);  // 音量设置，适用于pyttsx3引擎
        }});
        put("ui", new HashMap<String, Object>() {{
            put("theme", "light");
            put("showFeedback", true);
        }});
    }};

    // 存储当前设置的变量，实际项目中应使用数据库
    private static Map<String, Object> currentSettings = new HashMap<>(defaultSettings);
    
    @PostConstruct
    public void init() {
        log.info("初始化SettingsController，设置API路径为 /api/voice/settings");
    }

    /**
     * 获取语音设置
     * 
     * @return 当前设置
     */
    @GetMapping("/settings")
    public ApiResponse<Map<String, Object>> getVoiceSettings() {
        log.info("接收到获取语音设置请求");
        return ApiResponse.success(currentSettings);
    }

    /**
     * 更新语音设置
     * 
     * @param settings 新的设置
     * @return 操作结果
     */
    @PostMapping("/settings")
    public ApiResponse<String> updateVoiceSettings(@RequestBody Map<String, Object> settings) {
        log.info("接收到更新语音设置请求: {}", settings);
        
        try {
            // 合并设置
            if (settings != null) {
                currentSettings.putAll(settings);
            }
            
            return ApiResponse.success("设置已更新");
        } catch (Exception e) {
            log.error("更新设置失败", e);
            return ApiResponse.error("更新设置失败: " + e.getMessage());
        }
    }

    /**
     * 重置设置为默认值
     * 
     * @return 操作结果
     */
    @PostMapping("/settings/reset")
    public ApiResponse<String> resetSettings() {
        log.info("接收到重置设置请求");
        
        currentSettings = new HashMap<>(defaultSettings);
        return ApiResponse.success("设置已重置为默认值");
    }
} 