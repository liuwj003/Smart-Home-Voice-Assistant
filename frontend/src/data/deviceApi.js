import axios from 'axios';
import { updateApiDeviceData, processApiData } from './DeviceData';

export const fetchDevices = async () => {
  try {
    console.log('fetchDevices开始执行...');
    const response = await axios.get('http://127.0.0.1:8005/api/devices');
    console.log('fetchDevices获取到的原始数据:', response.data);
    
    // 更新API数据
    console.log('fetchDevices准备更新API数据...');
    updateApiDeviceData(response.data.data);
    console.log('fetchDevices API数据已更新');
    
    // 处理API数据
    console.log('fetchDevices开始处理API数据...');
    if (response.data ) {
      console.log('fetchDevices数据格式正确，准备调用processApiData');
      processApiData(response.data.data);
      console.log('fetchDevices processApiData调用完成');
    } else {
      console.error('fetchDevices API数据格式不正确:', response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('fetchDevices获取设备数据时出错:', error);
    throw error;
  }
}; 