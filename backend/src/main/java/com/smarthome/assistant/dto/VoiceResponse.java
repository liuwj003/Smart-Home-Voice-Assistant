package com.smarthome.assistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoiceResponse {
    private String text;
    private String intent;
    private Map<String, Object> entities;
    private Double confidence;
    
    @Builder.Default
    private String status = "success";
} 