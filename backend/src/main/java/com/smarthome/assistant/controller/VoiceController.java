package com.smarthome.assistant.controller;

import com.smarthome.assistant.service.NlpServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/voice")
@RequiredArgsConstructor
@CrossOrigin
public class VoiceController {

    private final NlpServiceClient nlpServiceClient;

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
}