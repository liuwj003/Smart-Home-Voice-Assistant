package com.smarthome.assistant.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * Python NLP服务客户端
 * 负责与Python NLP服务进行通信
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NlpServiceClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${nlp.service.baseurl:http://localhost:8010}")
    private String nlpServiceBaseUrl;

    /**
     * 调用NLP服务的音频处理API
     *
     * @param audioFile 音频文件
     * @param settings 设置
     * @return 处理结果
     * @throws Exception 处理失败时抛出异常
     */
    public Map<String, Object> callProcessAudio(MultipartFile audioFile, Map<String, Object> settings) throws Exception {
        try {
            // 配置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // 构建表单数据
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource fileResource = new ByteArrayResource(audioFile.getBytes()) {
                @Override
                public String getFilename() {
                    return audioFile.getOriginalFilename();
                }
            };
            body.add("audio_file", fileResource);
            body.add("settings_json", objectMapper.writeValueAsString(settings));

            // 发送请求
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            String url = nlpServiceBaseUrl + "/process_audio";
            
            log.info("Sending audio processing request to: {}, file size: {} bytes, content type: {}", 
                   url, audioFile.getSize(), audioFile.getContentType());
                   
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Audio request successfully processed by NLP service");
                return response.getBody();
            } else {
                log.error("NLP service audio processing failed, status code: {}", response.getStatusCode());
                throw new Exception("NLP service audio processing failed");
            }
        } catch (Exception e) {
            log.error("Failed to call NLP service audio processing API: {}", e.getMessage(), e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", true);
            errorResult.put("errorMessage", "Failed to call NLP service: " + e.getMessage());
            errorResult.put("sttText", "");
            errorResult.put("nluResult", createEmptyNluResult());
            return errorResult;
        }
    }

    /**
     * 调用NLP服务的文本处理API
     *
     * @param textInput 文本输入
     * @param settings 设置
     * @return 处理结果
     * @throws Exception 处理失败时抛出异常
     */
    public Map<String, Object> callProcessText(String textInput, Map<String, Object> settings) throws Exception {
        try {
            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("text_input", textInput);
            requestBody.put("settings", settings);

            // 发送请求
            String url = nlpServiceBaseUrl + "/process_text";
            
            log.info("Sending text processing request to: {}, text: {}", url, textInput);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestBody, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                log.error("NLP service text processing failed, status code: {}", response.getStatusCode());
                throw new Exception("NLP service text processing failed");
            }
        } catch (Exception e) {
            log.error("Failed to call NLP service text processing API: {}", e.getMessage(), e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", true);
            errorResult.put("errorMessage", "Failed to call NLP service: " + e.getMessage());
            errorResult.put("sttText", textInput);
            errorResult.put("nluResult", createEmptyNluResult());
            return errorResult;
        }
    }
    
    /**
     * 创建空的NLU结果对象
     * 用于错误处理时提供默认结构
     */
    private Map<String, Object> createEmptyNluResult() {
        Map<String, Object> nluResult = new HashMap<>();
        nluResult.put("action", "");
        nluResult.put("entity", "");
        nluResult.put("location", "");
        nluResult.put("device_id", "0");
        nluResult.put("parameter", null);
        return nluResult;
    }
    
    /**
     * 健康检查方法
     * 检查NLP服务是否可达
     */
    public boolean isNlpServiceHealthy() {
        try {
            String url = nlpServiceBaseUrl + "/health";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.error("NLP service health check failed: {}", e.getMessage());
            return false;
        }
    }
} 