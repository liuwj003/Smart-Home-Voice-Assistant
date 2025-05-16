package com.smarthome.assistant.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthome.assistant.service.NlpServiceClient;
import com.smarthome.assistant.service.VoiceToTextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * 语音转文本服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VoiceToTextServiceImpl implements VoiceToTextService {

    private final NlpServiceClient nlpServiceClient;
    private final ObjectMapper objectMapper;

    @Override
    public String vtot(MultipartFile audioFile) throws IOException {
        try {
            // 准备处理设置
            Map<String, Object> settings = new HashMap<>();
            settings.put("language", "zh-CN");
            settings.put("engine", "google");
            
            // 调用NLP服务处理音频
            Map<String, Object> result = nlpServiceClient.callProcessAudio(audioFile, settings);
            
            // 检查是否有错误
            if (result.containsKey("error") && (Boolean)result.get("error")) {
                log.error("语音转文本失败: {}", result.get("errorMessage"));
                return "语音识别失败: " + result.get("errorMessage");
            }
            
            // 提取文本结果
            String text = (String) result.getOrDefault("sttText", "");
            
            if (text.isEmpty()) {
                return "未能识别出语音内容";
            }
            
            return text;
        } catch (Exception e) {
            log.error("语音转文本处理异常", e);
            return "处理出错: " + e.getMessage();
        }
    }
} 