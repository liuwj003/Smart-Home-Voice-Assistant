package com.smarthome.assistant.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoiceCommand {
    private String text;
    private String intent;
    private Map<String, Object> entities;
    private Double confidence;
} 