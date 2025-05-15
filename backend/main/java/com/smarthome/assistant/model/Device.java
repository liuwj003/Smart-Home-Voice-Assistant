package com.smarthome.assistant.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Device {
    private String id;
    private String name;
    private String type;
    private String status;
    
    // 灯光特有属性
    private Integer brightness;
    private String color;
    
    // 空调特有属性
    private Integer temperature;
    private String mode;
    private String fanSpeed;
    
    // 窗帘特有属性
    private Integer position;
    
    // 电视特有属性
    private Integer volume;
    private Integer channel;
    
    // 加湿器特有属性
    private Integer humidity;
    
    // 风扇特有属性
    private String speed;
} 