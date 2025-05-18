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
            // 首先检查NLP服务是否健康
            if (!nlpServiceClient.isNlpServiceHealthy()) {
                log.error("NLP服务不可用，无法处理音频命令");
                return FrontendResponseDto.builder()
                        .commandSuccess(false)
                        .errorMessage("NLP服务不可用，请确保NLP服务已启动")
                        .build();
            }
            
            // 解析设置
            Map<String, Object> settings = objectMapper.readValue(settingsJson, Map.class);
            
            // 调用NLP服务进行音频处理
            Map<String, Object> nlpResponse = nlpServiceClient.callProcessAudio(audioFile, settings);
            
            // 如果响应包含错误标志，则返回错误信息
            if (nlpResponse.containsKey("error") && (Boolean)nlpResponse.get("error")) {
                String errorMsg = nlpResponse.containsKey("errorMessage") ? 
                        (String)nlpResponse.get("errorMessage") : "处理音频时出错";
                
                log.error("NLP服务返回错误: {}", errorMsg);
                
                // 如果存在NLU结果（即使是空的），我们仍然可以构建部分响应
                if (nlpResponse.containsKey("nluResult")) {
                    // 构建带有错误信息的响应，但包含NLU结果
                    FrontendResponseDto response = processNlpResponse(nlpResponse);
                    response.setCommandSuccess(false);
                    response.setErrorMessage(errorMsg);
                    return response;
                }
                
                return FrontendResponseDto.builder()
                        .commandSuccess(false)
                        .errorMessage(errorMsg)
                        .build();
            }
            
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
            // 首先检查NLP服务是否健康
            if (!nlpServiceClient.isNlpServiceHealthy()) {
                log.error("NLP服务不可用，无法处理文本命令");
                return FrontendResponseDto.builder()
                        .commandSuccess(false)
                        .errorMessage("NLP服务不可用，请确保NLP服务已启动")
                        .build();
            }
            
            // 调用NLP服务进行文本处理
            Map<String, Object> nlpResponse = nlpServiceClient.callProcessText(textInput, settings);
            
            // 如果响应包含错误标志，则返回错误信息
            if (nlpResponse.containsKey("error") && (Boolean)nlpResponse.get("error")) {
                String errorMsg = nlpResponse.containsKey("errorMessage") ? 
                        (String)nlpResponse.get("errorMessage") : "处理文本时出错";
                
                log.error("NLP服务返回错误: {}", errorMsg);
                
                // 如果存在NLU结果（即使是空的），我们仍然可以构建部分响应
                if (nlpResponse.containsKey("nluResult")) {
                    // 构建带有错误信息的响应，但包含NLU结果
                    FrontendResponseDto response = processNlpResponse(nlpResponse);
                    response.setCommandSuccess(false);
                    response.setErrorMessage(errorMsg);
                    return response;
                }
                
                return FrontendResponseDto.builder()
                        .commandSuccess(false)
                        .errorMessage(errorMsg)
                        .build();
            }
            
            return processNlpResponse(nlpResponse);
        } catch (Exception e) {
            log.error("处理文本命令时出错", e);
            return FrontendResponseDto.builder()
                    .commandSuccess(false)
                    .errorMessage("处理文本命令时出错: " + e.getMessage())
                    .sttText(textInput) // 至少返回用户输入的文本
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
            Map<String, Object> nluResult = (Map<String, Object>) nlpResponse.get("nlu_result");
            if (nluResult == null) {
                return FrontendResponseDto.builder()
                        .commandSuccess(false)
                        .errorMessage("未能获取NLU结果")
                        .build();
            }
            // 解析五元组字段
            String action = (String) nluResult.get("action");
            String entity = (String) nluResult.get("entity");
            String location = (String) nluResult.get("location");
            String deviceId = (String) nluResult.get("device_id");
            Object parameter = nluResult.get("parameter");
            Double confidence = nluResult.containsKey("confidence") ? 
                    ((Number) nluResult.get("confidence")).doubleValue() : 0.0;
            
            // 构建用于显示的NLU结果
            NluResultDisplayDto nluDisplayDto = NluResultDisplayDto.builder()
                    .action(action)
                    .entity(entity)
                    .location(location)
                    .deviceId(deviceId)
                    .parameter(parameter)
                    .confidence(confidence)
                    .build();
            
            // 设备控制，传递deviceId和parameter
            String deviceFeedback = deviceService.updateDeviceState(entity, location, action, deviceId, parameter);
            
            // 构建响应
            return FrontendResponseDto.builder()
                    .commandSuccess(true)
                    .sttText((String) nlpResponse.getOrDefault("transcribed_text", null))
                    .nluResult(nluDisplayDto)
                    .deviceActionFeedback(deviceFeedback)
                    .ttsOutputReference((String) nlpResponse.getOrDefault("tts_output_reference", null))
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