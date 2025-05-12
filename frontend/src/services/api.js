import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
    baseURL: 'http://localhost:5000/api',  // 后端 API 的基础 URL
    timeout: 5000,  // 请求超时时间
    headers: {
        'Content-Type': 'application/json'
    }
});

// 设备控制 API
export const deviceApi = {
    // 获取所有设备状态
    getAllDevices: () => api.get('/devices'),
    
    // 获取单个设备状态
    getDevice: (deviceId) => api.get(`/devices/${deviceId}`),
    
    // 控制设备开关
    controlDevice: (deviceId, action) => api.post(`/devices/${deviceId}/control`, { action }),
    
    // 调整设备参数
    adjustDevice: (deviceId, parameter, value) => api.post(`/devices/${deviceId}/adjust`, { parameter, value })
};

// 语音控制 API
export const voiceApi = {
    // 发送语音命令
    sendVoiceCommand: (formData) => {
        return api.post('/voice/command', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    
    // 获取语音识别状态
    getVoiceStatus: () => api.get('/voice/status')
};

// 天气 API
export const weatherApi = {
    // 获取天气信息
    getWeather: (city) => api.get(`/weather/${city}`)
};

// 错误处理
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        // 这里可以添加全局错误处理逻辑
        return Promise.reject(error);
    }
);

export default api; 