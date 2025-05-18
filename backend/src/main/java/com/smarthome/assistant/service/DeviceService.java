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
    
    /**
     * 根据NLU结果更新设备状态
     * 
     * @param entityType 实体类型（如light, fan等）
     * @param location 位置（如bedroom, living_room等）
     * @param action 动作（如TURN_ON, TURN_OFF等）
     * @param deviceId 设备ID（如"1", "2"等）
     * @param parameter 额外参数（如亮度、温度等）
     * @return 操作结果描述
     */
    String updateDeviceState(String entityType, String location, String action, String deviceId, Object parameter);
} 