package com.smarthome.assistant.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "device")
public class Device {
    @Id
    private String id;
    private String name;
    private String type;
    private String status;
    private String location;
    
    // 设备元数据
    private String deviceId;                // 设备唯一标识（如MAC地址或序列号）
    
    @Column(columnDefinition = "TEXT")
    private String capabilities;            // 设备支持的功能列表(JSON格式)
    
    private String category;                // 设备类别（如灯光、空调、窗帘等）
    
    @Column(columnDefinition = "TEXT")
    private String supportedParameters;     // 支持的参数列表(JSON格式)
    
    private String icon;                    // 设备图标路径
    
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