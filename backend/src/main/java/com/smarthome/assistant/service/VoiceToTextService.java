package com.smarthome.assistant.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface VoiceToTextService {
    String vtot(MultipartFile audioFile) throws IOException;
}
