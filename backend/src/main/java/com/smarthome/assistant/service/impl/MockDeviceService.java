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
import java.util.stream.Collectors;

@Slf4j
@Service
public class MockDeviceService implements DeviceService {

    private final Map<String, Device> devices = new HashMap<>();
    
    // 设备类型到可读中文名称的映射
    private final Map<String, String> deviceTypeNames = Map.of(
        "light", "灯光",
        "ac", "空调",
        "curtain", "窗帘",
        "tv", "电视",
        "humidifier", "加湿器",
        "fan", "风扇",
        "sensor", "传感器"
    );
    
    // 位置到可读中文名称的映射
    private final Map<String, String> locationNames = Map.of(
        "living_room", "客厅",
        "bedroom", "卧室", 
        "kitchen", "厨房",
        "bathroom", "浴室",
        "balcony", "阳台",
        "study", "书房"
    );
    
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
                .location("living_room")
                .build());
                
        devices.put("ac_1", Device.builder()
                .id("ac_1")
                .name("卧室空调")
                .type("ac")
                .status("off")
                .temperature(26)
                .mode("cool")
                .fanSpeed("medium")
                .location("bedroom")
                .build());
                
        devices.put("curtain_1", Device.builder()
                .id("curtain_1")
                .name("阳台窗帘")
                .type("curtain")
                .status("closed")
                .position(0)
                .location("balcony")
                .build());
                
        devices.put("tv_1", Device.builder()
                .id("tv_1")
                .name("客厅电视")
                .type("tv")
                .status("on")
                .volume(15)
                .channel(5)
                .location("living_room")
                .build());
                
        devices.put("humidifier_1", Device.builder()
                .id("humidifier_1")
                .name("加湿器")
                .type("humidifier")
                .status("on")
                .humidity(45)
                .location("bedroom")
                .build());
                
        devices.put("fan_1", Device.builder()
                .id("fan_1")
                .name("风扇")
                .type("fan")
                .status("off")
                .speed("low")
                .location("living_room")
                .build());
                
        devices.put("sensor_1", Device.builder()
                .id("sensor_1")
                .name("温湿度传感器")
                .type("sensor")
                .temperature(24)
                .humidity(50)
                .location("living_room")
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
    
    @Override
    public String updateDeviceState(String entityType, String location, String action) {
        if (entityType == null || action == null) {
            return "无法执行操作：设备类型或动作未指定";
        }
        
        // 查找指定类型和位置的设备
        List<Device> matchedDevices = getAllDevices().stream()
                .filter(device -> device.getType().equalsIgnoreCase(entityType) &&
                        (location == null || location.isEmpty() || 
                         (device.getLocation() != null && device.getLocation().equalsIgnoreCase(location))))
                .collect(Collectors.toList());
        
        if (matchedDevices.isEmpty()) {
            String locationText = location != null && !location.isEmpty() ? 
                    locationNames.getOrDefault(location, location) : "所有区域";
            String entityTypeText = deviceTypeNames.getOrDefault(entityType, entityType);
            return String.format("未找到%s的%s", locationText, entityTypeText);
        }
        
        // 对所有匹配的设备执行操作
        for (Device device : matchedDevices) {
            String deviceAction = convertNluActionToDeviceAction(action);
            controlDevice(device.getId(), deviceAction, null);
        }
        
        // 生成反馈消息
        Device firstDevice = matchedDevices.get(0);
        String deviceTypeName = deviceTypeNames.getOrDefault(entityType, entityType);
        String locationName = location != null && !location.isEmpty() ? 
                locationNames.getOrDefault(location, location) : 
                locationNames.getOrDefault(firstDevice.getLocation(), firstDevice.getLocation());
        
        String statusText;
        if (action.equalsIgnoreCase("TURN_ON")) {
            statusText = "已打开";
        } else if (action.equalsIgnoreCase("TURN_OFF")) {
            statusText = "已关闭";
        } else {
            statusText = "已调整";
        }
        
        // 返回操作结果描述
        return String.format("%s的%s%s。", locationName, deviceTypeName, statusText);
    }
    
    /**
     * 将NLU动作转换为设备控制动作
     */
    private String convertNluActionToDeviceAction(String nluAction) {
        switch (nluAction.toUpperCase()) {
            case "TURN_ON":
                return "turn_on";
            case "TURN_OFF":
                return "turn_off";
            default:
                return nluAction.toLowerCase();
        }
    }
} 