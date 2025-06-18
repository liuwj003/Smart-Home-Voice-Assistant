import axios from 'axios';
import { updateApiDeviceData, processApiData } from './DeviceData';

export const fetchDevices = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8005/api/devices');
    
    // 更新API数据
    updateApiDeviceData(response.data.data);
    
    // 处理API数据
    if (response.data ) {
      processApiData(response.data.data);
    } else {
      console.error('fetchDevices API数据格式不正确:', response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('fetchDevices获取设备数据时出错:', error);
    throw error;
  }
}; 