package com.smarthome.assistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 简化的NLU结果数据对象，用于前端展示
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NluResultDisplayDto {
    
    /**
     * 动作，如 TURN_ON, TURN_OFF 等
     */
    private String action;
    
    /**
     * 实体类型，如 light, fan, air_conditioner 等
     */
    private String entity;
    
    /**
     * 位置，如 bedroom, living_room 等
     */
    private String location;
    
    /**
     * 置信度，表示NLU对结果的确信程度
     */
    private double confidence;
} 