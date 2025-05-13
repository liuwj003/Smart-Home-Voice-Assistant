package com.smarthome.assistant.controller;

import com.smarthome.assistant.dto.ApiResponse;
import com.smarthome.assistant.model.Device;
import com.smarthome.assistant.service.DeviceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
@CrossOrigin
public class DeviceController {

    private final DeviceService deviceService;
    
    @GetMapping
    public ApiResponse<List<Device>> getAllDevices() {
        log.info("获取所有设备");
        return ApiResponse.success(deviceService.getAllDevices());
    }
    
    @GetMapping("/{id}")
    public ApiResponse<Device> getDevice(@PathVariable String id) {
        log.info("获取设备: {}", id);
        Device device = deviceService.getDeviceById(id);
        
        if (device == null) {
            return ApiResponse.error("设备不存在");
        }
        
        return ApiResponse.success(device);
    }
    
    @PostMapping("/{id}/control")
    public ApiResponse<Device> controlDevice(
            @PathVariable String id, 
            @RequestBody Map<String, Object> request) {
        
        String action = (String) request.get("action");
        Object params = request.get("params");
        
        log.info("控制设备: {}, 动作: {}, 参数: {}", id, action, params);
        
        if (action == null) {
            return ApiResponse.error("缺少action参数");
        }
        
        Device device = deviceService.controlDevice(id, action, params);
        
        if (device == null) {
            return ApiResponse.error("设备不存在或操作失败");
        }
        
        return ApiResponse.success(device);
    }
} 