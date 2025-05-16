package com.smarthome.assistant.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

/**
 * 文本命令请求DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TextCommandRequestDto {
    
    /**
     * 文本输入
     */
    private String textInput;
    
    /**
     * 设置参数，如 ttsEnabled, language 等
     */
    private Map<String, Object> settings = new HashMap<>();
} 