package com.smarthome.assistant.service.impl;

import com.smarthome.assistant.model.Device;
import com.smarthome.assistant.service.DeviceService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class MockDeviceService implements DeviceService {

    private final Map<String, Device> devices = new HashMap<>();
    
    @PostConstruct
    public void init() {
        // 初始化虚拟设备列表
        devices.put("light_1", Device.builder()
                .id("light_1")
                .name("客厅灯")
                .type("light")
                .status("on")
                .brightness(80)
                .color("warm_white")
                .build());
                
        devices.put("ac_1", Device.builder()
                .id("ac_1")
                .name("卧室空调")
                .type("ac")
                .status("off")
                .temperature(26)
                .mode("cool")
                .fanSpeed("medium")
                .build());
                
        devices.put("curtain_1", Device.builder()
                .id("curtain_1")
                .name("阳台窗帘")
                .type("curtain")
                .status("closed")
                .position(0)
                .build());
                
        devices.put("tv_1", Device.builder()
                .id("tv_1")
                .name("客厅电视")
                .type("tv")
                .status("on")
                .volume(15)
                .channel(5)
                .build());
                
        devices.put("humidifier_1", Device.builder()
                .id("humidifier_1")
                .name("加湿器")
                .type("humidifier")
                .status("on")
                .humidity(45)
                .build());
                
        devices.put("fan_1", Device.builder()
                .id("fan_1")
                .name("风扇")
                .type("fan")
                .status("off")
                .speed("low")
                .build());
                
        devices.put("sensor_1", Device.builder()
                .id("sensor_1")
                .name("温湿度传感器")
                .type("sensor")
                .temperature(24)
                .humidity(50)
                .build());
                
        log.info("初始化了{}个虚拟设备", devices.size());
    }
    
    @Override
    public List<Device> getAllDevices() {
        return new ArrayList<>(devices.values());
    }
    
    @Override
    public Device getDeviceById(String id) {
        return devices.get(id);
    }
    
    @Override
    public Device controlDevice(String id, String action, Object params) {
        Device device = devices.get(id);
        
        if (device == null) {
            log.warn("设备{}不存在", id);
            return null;
        }
        
        log.info("控制设备: {}, 动作: {}, 参数: {}", id, action, params);
        
        switch (action) {
            case "turn_on":
                device.setStatus("on");
                break;
            case "turn_off":
                device.setStatus("off");
                break;
            case "set_brightness":
                if (device.getType().equals("light") && params instanceof Integer) {
                    device.setBrightness((Integer) params);
                }
                break;
            case "set_temperature":
                if (device.getType().equals("ac") && params instanceof Integer) {
                    device.setTemperature((Integer) params);
                }
                break;
            case "set_volume":
                if (device.getType().equals("tv") && params instanceof Integer) {
                    device.setVolume((Integer) params);
                }
                break;
            default:
                log.warn("不支持的动作: {}", action);
        }
        
        return device;
    }
} 