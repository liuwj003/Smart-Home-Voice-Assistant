package com.smarthome.assistant.repository;

import com.smarthome.assistant.model.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeviceRepository extends JpaRepository<Device, String> {
    /**
     * 根据设备类型查找设备
     */
    List<Device> findByType(String type);
    
    /**
     * 根据位置查找设备
     */
    List<Device> findByLocation(String location);
    
    /**
     * 根据类型和位置查找设备
     */
    List<Device> findByTypeAndLocation(String type, String location);
    
    /**
     * 根据类型列表和位置查找设备
     */
    List<Device> findByTypeInAndLocation(List<String> types, String location);
} 