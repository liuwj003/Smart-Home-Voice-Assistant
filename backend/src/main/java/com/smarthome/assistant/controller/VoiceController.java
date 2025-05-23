package com.smarthome.assistant.controller;

import com.smarthome.assistant.service.NlpServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/voice")
@RequiredArgsConstructor
@CrossOrigin
@Slf4j
public class VoiceController {

    private final NlpServiceClient nlpServiceClient;
    
    @Value("${nlp.service.rootPath:}")
    private String nlpServiceRootPath;  // NLP服务的根目录路径，从配置中注入

    @PostMapping("/test-audio")
    public Map<String, Object> testAudio(@RequestParam("audio") MultipartFile audioFile) throws Exception {
        // 这里可以传递空设置或自定义设置
        Map<String, Object> settings = new HashMap<>();
        return nlpServiceClient.callProcessAudio(audioFile, settings);
    }

    @PostMapping("/test-text")
    public Map<String, Object> testText(@RequestParam("text") String text) throws Exception {
        Map<String, Object> settings = new HashMap<>();
        return nlpServiceClient.callProcessText(text, settings);
    }
    
    /**
     * 获取TTS生成的音频文件
     * 
     * @param filename 音频文件名
     * @return 音频文件内容
     */
    @GetMapping(value = "/audio/{filename:.+}", produces = "audio/wav")
    public ResponseEntity<Resource> getAudioFile(@PathVariable String filename) {
        try {
            // 构建完整的文件路径（假设路径是 nlpServiceRootPath/data/temp_audio/filename）
            String nlpRoot = nlpServiceRootPath.isEmpty() ? "." : nlpServiceRootPath;
            Path audioPath = Paths.get(nlpRoot, "data", "temp_audio", filename);
            File audioFile = audioPath.toFile();
            
            log.info("请求音频文件: {}, 完整路径: {}", filename, audioFile.getAbsolutePath());
            
            if (!audioFile.exists()) {
                log.error("音频文件不存在: {}", audioFile.getAbsolutePath());
                return ResponseEntity.notFound().build();
            }
            
            // 返回音频文件
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("audio/wav"))
                    .body(new FileSystemResource(audioFile));
        } catch (Exception e) {
            log.error("获取音频文件失败: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}