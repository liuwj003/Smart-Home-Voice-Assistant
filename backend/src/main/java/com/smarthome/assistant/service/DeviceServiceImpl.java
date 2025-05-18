package com.smarthome.assistant.service;

import com.smarthome.assistant.model.Device;
import com.smarthome.assistant.repository.DeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DeviceServiceImpl implements DeviceService {
    @Autowired
    private DeviceRepository deviceRepository;

    @Override
    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    @Override
    public Device getDeviceById(String id) {
        return deviceRepository.findById(id).orElse(null);
    }

    @Override
    public Device controlDevice(String id, String action, Object params) {
        Device device = getDeviceById(id);
        // ... 业务逻辑，修改 device
        return deviceRepository.save(device);
    }

    @Override
    public String updateDeviceState(String entityType, String location, String action, String deviceId, Object parameter) {
        // ... 业务逻辑，查找并批量更新设备
        // 返回操作结果描述
        return "操作完成";
    }
} 