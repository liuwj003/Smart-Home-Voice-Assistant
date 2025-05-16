package com.smarthome.assistant.controller;

import com.smarthome.assistant.dto.FrontendResponseDto;
import com.smarthome.assistant.dto.TextCommandRequestDto;
import com.smarthome.assistant.service.SmartHomeCommandOrchestrator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/command")
@RequiredArgsConstructor
@CrossOrigin
public class VoiceCommandController {

    private final SmartHomeCommandOrchestrator orchestrator;

    /**
     * 处理音频命令
     *
     * @param audioFile 上传的音频文件
     * @param settingsJson 设置JSON字符串
     * @return 前端响应DTO
     */
    @PostMapping("/audio")
    public ResponseEntity<FrontendResponseDto> processAudioCommand(
            @RequestParam("audio") MultipartFile audioFile,
            @RequestParam(value = "settingsJson", defaultValue = "{}") String settingsJson) {
        
        log.info("接收到音频命令请求，文件名: {}, 大小: {} bytes", 
                audioFile.getOriginalFilename(), audioFile.getSize());
        
        try {
            // 处理音频命令
            FrontendResponseDto response = orchestrator.orchestrateAudioCommand(audioFile, settingsJson);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("处理音频命令失败", e);
            FrontendResponseDto errorResponse = FrontendResponseDto.builder()
                    .commandSuccess(false)
                    .errorMessage("处理音频命令时出错: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * 处理文本命令
     *
     * @param request 包含文本输入和设置的请求
     * @return 前端响应DTO
     */
    @PostMapping("/text")
    public ResponseEntity<FrontendResponseDto> processTextCommand(@RequestBody TextCommandRequestDto request) {
        log.info("接收到文本命令请求: {}", request.getTextInput());
        
        try {
            // 处理文本命令
            FrontendResponseDto response = orchestrator.orchestrateTextCommand(
                    request.getTextInput(), request.getSettings());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("处理文本命令失败", e);
            FrontendResponseDto errorResponse = FrontendResponseDto.builder()
                    .commandSuccess(false)
                    .errorMessage("处理文本命令时出错: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
} 