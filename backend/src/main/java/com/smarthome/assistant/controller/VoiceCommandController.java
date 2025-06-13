package com.smarthome.assistant.controller;

import com.smarthome.assistant.dto.FrontendResponseDto;
import com.smarthome.assistant.dto.TextCommandRequestDto;
import com.smarthome.assistant.service.SmartHomeCommandOrchestrator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/command")
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
            @RequestParam(value = "audio_file", required = false) MultipartFile audioFile,
            @RequestParam(value = "audio", required = false) MultipartFile audioFallback,
            @RequestParam(value = "settingsJson", defaultValue = "{}") String settingsJson) {
        
        // 支持两种参数名，优先使用audio_file
        MultipartFile actualAudioFile = audioFile != null ? audioFile : audioFallback;
        
        if (actualAudioFile == null) {
            log.error("未提供音频文件 (audio_file 或 audio 参数)");
            return ResponseEntity.badRequest().body(
                FrontendResponseDto.builder()
                    .commandSuccess(false)
                    .errorMessage("未提供音频文件")
                    .build()
            );
        }
        
        log.info("接收到音频命令请求，文件名: {}, 大小: {} bytes, 内容类型: {}", 
                actualAudioFile.getOriginalFilename(), actualAudioFile.getSize(), actualAudioFile.getContentType());
        
        try {
            // 检查文件是否为空
            if (actualAudioFile.isEmpty()) {
                log.error("上传的音频文件为空");
                return ResponseEntity.badRequest().body(
                    FrontendResponseDto.builder()
                        .commandSuccess(false)
                        .errorMessage("上传的音频文件为空")
                        .build()
                );
            }
            
            // 处理音频命令
            FrontendResponseDto response = orchestrator.orchestrateAudioCommand(actualAudioFile, settingsJson);
            log.info("音频命令处理成功: {}", response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("处理音频命令失败: {}", e.getMessage(), e);
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
        log.info("Received text command request: {}", request.getTextInput());
        
        try {
            // 处理文本命令
            FrontendResponseDto response = orchestrator.orchestrateTextCommand(
                    request.getTextInput(), request.getSettings());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to process text command", e);
            FrontendResponseDto errorResponse = FrontendResponseDto.builder()
                    .commandSuccess(false)
                    .errorMessage("处理文本命令时出错: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
} 