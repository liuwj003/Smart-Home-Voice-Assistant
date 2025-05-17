package com.smarthome.assistant.repository;

import com.smarthome.assistant.model.Device;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeviceRepository extends JpaRepository<Device, String> {
    // 可自定义查询方法
} 