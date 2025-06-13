package com.smarthome.assistant.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

@Slf4j
@Service
public class CommandForwardService {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private static final String COMMAND_ENDPOINT = "http://127.0.0.1:8005/base/command";

    public CommandForwardService(ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    public void forwardCommand(Map<String, Object> command) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(command, headers);
            
            restTemplate.postForEntity(COMMAND_ENDPOINT, requestEntity, String.class);
            log.info("Successfully forwarded command to external service");
        } catch (Exception e) {
            log.error("Error forwarding command to external service", e);
        }
    }
} 