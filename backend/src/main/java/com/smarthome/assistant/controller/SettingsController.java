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

    // 默认设置
    private static final Map<String, Object> defaultSettings = new HashMap<String, Object>() {{
        put("stt", new HashMap<String, Object>() {{
            put("engine", "dolphin");
            put("language", "zh-CN");
        }});
        put("nlu", new HashMap<String, Object>() {{
            put("engine", "nlu_orchestrator");
            put("confidence_threshold", 300);
        }});
        put("tts", new HashMap<String, Object>() {{
            put("enabled", true);
            put("engine", "pyttsx3");
            put("voice", "female");
            put("speed", 1.0);
            put("pitch", 1.0);
            put("volume", 1.0);  
        }});
        put("ui", new HashMap<String, Object>() {{
            put("theme", "light");
            put("showFeedback", true);
        }});
    }};

    private static Map<String, Object> currentSettings = new HashMap<>(defaultSettings);
    
    @PostConstruct
    public void init() {
        log.info("Initializing SettingsController, API path: /api/voice/settings");
    }

    /**
     * 获取语音设置
     * 
     * @return 当前设置
     */
    @GetMapping("/settings")
    public ApiResponse<Map<String, Object>> getVoiceSettings() {
        log.info("Received request to get voice settings");
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
        log.info("Received request to update voice settings: {}", settings);
        
        try {
            // 合并设置
            if (settings != null) {
                currentSettings.putAll(settings);
            }
            
            return ApiResponse.success("Settings have been updated");
        } catch (Exception e) {
            log.error("Failed to update settings", e);
            return ApiResponse.error("Failed to update settings: " + e.getMessage());
        }
    }

    /**
     * 重置设置为默认值
     * 
     * @return 操作结果
     */
    @PostMapping("/settings/reset")
    public ApiResponse<String> resetSettings() {
        log.info("Received request to reset settings");
        
        currentSettings = new HashMap<>(defaultSettings);
        return ApiResponse.success("Settings have been reset to default values");
    }
} 