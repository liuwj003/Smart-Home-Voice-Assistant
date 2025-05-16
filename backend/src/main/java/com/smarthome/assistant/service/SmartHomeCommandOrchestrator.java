package com.smarthome.assistant.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthome.assistant.dto.FrontendResponseDto;
import com.smarthome.assistant.dto.NluResultDisplayDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * 智能家居命令编排服务
 * 负责协调NLP服务和设备服务的工作流
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SmartHomeCommandOrchestrator {

    private final NlpServiceClient nlpServiceClient;
    private final DeviceService deviceService;
    private final ObjectMapper objectMapper;

    /**
     * 处理音频命令
     *
     * @param audioFile 音频文件
     * @param settingsJson 设置JSON
     * @return 前端响应DTO
     */
    public FrontendResponseDto orchestrateAudioCommand(MultipartFile audioFile, String settingsJson) {
        try {
            // 解析设置
            Map<String, Object> settings = objectMapper.readValue(settingsJson, Map.class);
            
            // 调用NLP服务进行音频处理
            Map<String, Object> nlpResponse = nlpServiceClient.callProcessAudio(audioFile, settings);
            
            return processNlpResponse(nlpResponse);
        } catch (Exception e) {
            log.error("处理音频命令时出错", e);
            return FrontendResponseDto.builder()
                    .commandSuccess(false)
                    .errorMessage("处理音频命令时出错: " + e.getMessage())
                    .build();
        }
    }

    /**
     * 处理文本命令
     *
     * @param textInput 文本输入
     * @param settings 设置
     * @return 前端响应DTO
     */
    public FrontendResponseDto orchestrateTextCommand(String textInput, Map<String, Object> settings) {
        try {
            // 调用NLP服务进行文本处理
            Map<String, Object> nlpResponse = nlpServiceClient.callProcessText(textInput, settings);
            
            return processNlpResponse(nlpResponse);
        } catch (Exception e) {
            log.error("处理文本命令时出错", e);
            return FrontendResponseDto.builder()
                    .commandSuccess(false)
                    .errorMessage("处理文本命令时出错: " + e.getMessage())
                    .build();
        }
    }

    /**
     * 处理NLP服务响应
     *
     * @param nlpResponse NLP服务响应
     * @return 前端响应DTO
     */
    @SuppressWarnings("unchecked")
    private FrontendResponseDto processNlpResponse(Map<String, Object> nlpResponse) {
        try {
            // 提取NLU结果
            Map<String, Object> nluResult = (Map<String, Object>) nlpResponse.get("nluResult");
            if (nluResult == null) {
                return FrontendResponseDto.builder()
                        .commandSuccess(false)
                        .errorMessage("未能获取NLU结果")
                        .build();
            }
            
            // 构建NLU显示DTO
            String action = (String) nluResult.get("action");
            String entity = (String) nluResult.get("entity");
            String location = (String) nluResult.get("location");
            Double confidence = nluResult.containsKey("confidence") ? 
                    ((Number) nluResult.get("confidence")).doubleValue() : 0.0;
            
            NluResultDisplayDto nluDisplayDto = NluResultDisplayDto.builder()
                    .action(action)
                    .entity(entity)
                    .location(location)
                    .confidence(confidence)
                    .build();
            
            // 更新设备状态
            String deviceFeedback = deviceService.updateDeviceState(entity, location, action);
            
            // 构建响应
            return FrontendResponseDto.builder()
                    .commandSuccess(true)
                    .sttText(nlpResponse.containsKey("transcribedText") ? 
                            (String) nlpResponse.get("transcribedText") : null)
                    .nluResult(nluDisplayDto)
                    .deviceActionFeedback(deviceFeedback)
                    .ttsOutputReference(nlpResponse.containsKey("ttsOutputReference") ? 
                            (String) nlpResponse.get("ttsOutputReference") : null)
                    .build();
            
        } catch (Exception e) {
            log.error("处理NLP服务响应时出错", e);
            return FrontendResponseDto.builder()
                    .commandSuccess(false)
                    .errorMessage("处理NLP服务响应时出错: " + e.getMessage())
                    .build();
        }
    }
} 