package com.smarthome.assistant.service;

import com.smarthome.assistant.model.Device;
import java.util.List;

public interface DeviceService {
    
    /**
     * 获取所有设备
     * 
     * @return 设备列表
     */
    List<Device> getAllDevices();
    
    /**
     * 根据ID获取设备
     * 
     * @param id 设备ID
     * @return 设备信息
     */
    Device getDeviceById(String id);
    
    /**
     * 控制设备
     * 
     * @param id 设备ID
     * @param action 动作
     * @param params 参数
     * @return 更新后的设备
     */
    Device controlDevice(String id, String action, Object params);
} 