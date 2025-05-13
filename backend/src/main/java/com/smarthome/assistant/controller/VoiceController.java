package com.smarthome.assistant.controller;

import com.smarthome.assistant.dto.ApiResponse;
import com.smarthome.assistant.dto.VoiceResponse;
import com.smarthome.assistant.model.VoiceCommand;
import com.smarthome.assistant.service.VoiceProcessorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/voice")
@RequiredArgsConstructor
@CrossOrigin
public class VoiceController {

    private final VoiceProcessorService voiceProcessorService;
    
    @PostMapping("/command")
    public VoiceResponse processVoiceCommand(@RequestParam("audio") MultipartFile audioFile) {
        log.info("接收到语音命令请求，文件名: {}, 大小: {} bytes", 
                audioFile.getOriginalFilename(), audioFile.getSize());
        
        try {
            VoiceCommand result = voiceProcessorService.processVoiceCommand(audioFile);
            
            VoiceResponse response = new VoiceResponse();
            response.setText(result.getText());
            response.setIntent(result.getIntent());
            response.setEntities(result.getEntities());
            response.setConfidence(result.getConfidence());
            return response;
        } catch (Exception e) {
            log.error("处理语音命令失败", e);
            VoiceResponse response = new VoiceResponse();
            response.setStatus("error");
            response.setText("处理语音时出现问题，请稍后再试");
            return response;
        }
    }
    
    @PostMapping("/start")
    public ApiResponse<String> startListening() {
        log.info("开始语音监听");
        try {
            voiceProcessorService.startListening();
            return ApiResponse.success("Started listening");
        } catch (Exception e) {
            log.error("开始语音监听失败", e);
            return ApiResponse.error("无法开始语音监听: " + e.getMessage());
        }
    }
    
    @PostMapping("/stop")
    public ApiResponse<String> stopListening() {
        log.info("停止语音监听");
        try {
            voiceProcessorService.stopListening();
            return ApiResponse.success("Stopped listening");
        } catch (Exception e) {
            log.error("停止语音监听失败", e);
            return ApiResponse.error("无法停止语音监听: " + e.getMessage());
        }
    }
    
    @GetMapping("/status")
    public ApiResponse<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("is_listening", voiceProcessorService.isListening());
        
        return ApiResponse.success(status);
    }
} 