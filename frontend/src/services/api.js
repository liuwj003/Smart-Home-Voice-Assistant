import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
    baseURL: 'http://localhost:8081/api',  // 后端 API 的基础 URL
    timeout: 5000,  // 请求超时时间
    headers: {
        'Content-Type': 'application/json'
    }
});

// 自动重试服务器端点
let serverCheckInProgress = false;
const checkServerAvailability = async () => {
    if (serverCheckInProgress) return;

    serverCheckInProgress = true;
    const ports = ['8081', '8080', '5000']; // 尝试的端口顺序
    const currentPortStr = api.defaults.baseURL.match(/:(\d+)/)[1];
    const startIndex = ports.indexOf(currentPortStr);
    
    // 遍历可能的端口，从当前后面的端口开始
    for (let i = 0; i < ports.length; i++) {
        const idx = (startIndex + i + 1) % ports.length;
        const port = ports[idx];
        const testUrl = `http://localhost:${port}/api/devices`;
        
        try {
            console.log(`尝试连接到端口 ${port}`);
            await axios.get(testUrl, { timeout: 1000 });
            // 如果成功，更新baseURL
            setApiBaseUrl(`http://localhost:${port}/api`);
            console.log(`成功连接到端口 ${port}`);
            serverCheckInProgress = false;
            return true;
        } catch (err) {
            console.log(`端口 ${port} 连接失败`);
        }
    }
    
    serverCheckInProgress = false;
    return false;
};

// 设备控制 API
export const deviceApi = {
    // 获取所有设备状态
    getAllDevices: async () => {
        try {
            return await api.get('/devices');
        } catch (err) {
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                // 尝试其他端口
                await checkServerAvailability();
                return api.get('/devices');
            }
            throw err;
        }
    },
    
    // 获取单个设备状态
    getDevice: async (deviceId) => {
        try {
            return await api.get(`/devices/${deviceId}`);
        } catch (err) {
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                // 尝试其他端口
                await checkServerAvailability();
                return api.get(`/devices/${deviceId}`);
            }
            throw err;
        }
    },
    
    // 控制设备
    controlDevice: async (deviceId, action, params) => {
        try {
            return await api.post(`/devices/${deviceId}/control`, { action, params });
        } catch (err) {
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                // 尝试其他端口
                await checkServerAvailability();
                return api.post(`/devices/${deviceId}/control`, { action, params });
            }
            throw err;
        }
    }
};

// 语音控制 API
export const voiceApi = {
    // 发送语音命令
    sendVoiceCommand: async (formData) => {
        try {
            return await api.post('/command/audio', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } catch (err) {
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                // 尝试其他端口
                await checkServerAvailability();
                return api.post('/command/audio', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            throw err;
        }
    },
    
    // 发送文本命令
    sendTextCommand: async (text) => {
        try {
            return await api.post('/command/text', { 
                textInput: text,
                settings: { ttsEnabled: true }
            });
        } catch (err) {
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                // 尝试其他端口
                await checkServerAvailability();
                return api.post('/command/text', { 
                    textInput: text,
                    settings: { ttsEnabled: true } 
                });
            }
            throw err;
        }
    },
    
    // 开始语音监听
    startListening: async () => {
        try {
            return await api.post('/voice/start');
        } catch (err) {
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                await checkServerAvailability();
                return api.post('/voice/start');
            }
            throw err;
        }
    },
    
    // 停止语音监听
    stopListening: async () => {
        try {
            return await api.post('/voice/stop');
        } catch (err) {
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                await checkServerAvailability();
                return api.post('/voice/stop');
            }
            throw err;
        }
    },
    
    // 获取语音识别状态
    getVoiceStatus: async () => {
        try {
            return await api.get('/voice/status');
        } catch (err) {
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                await checkServerAvailability();
                return api.get('/voice/status');
            }
            throw err;
        }
    }
};

// 设置 API
export const settingsApi = {
    // 获取语音设置
    getVoiceSettings: async () => {
        try {
            return await api.get('/voice/settings');
        } catch (err) {
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                await checkServerAvailability();
                return api.get('/voice/settings');
            }
            throw err;
        }
    },
    
    // 更新语音设置
    updateVoiceSettings: async (settings) => {
        try {
            return await api.post('/voice/settings', settings);
        } catch (err) {
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                await checkServerAvailability();
                return api.post('/voice/settings', settings);
            }
            throw err;
        }
    }
};

// 修改 baseURL 的辅助函数
export const setApiBaseUrl = (url) => {
    api.defaults.baseURL = url;
    localStorage.setItem('apiBaseUrl', url);
    console.log(`API baseURL 已更新为: ${url}`);
};

// 天气 API
export const weatherApi = {
    // 获取天气信息
    getWeather: async (city) => {
        try {
            return await api.get(`/weather/${city}`);
        } catch (err) {
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                await checkServerAvailability();
                return api.get(`/weather/${city}`);
            }
            throw err;
        }
    }
};

// 初始化 API - 尝试从 localStorage 加载保存的 baseURL
const initApi = () => {
    const savedBaseUrl = localStorage.getItem('apiBaseUrl');
    if (savedBaseUrl) {
        api.defaults.baseURL = savedBaseUrl;
    }
};
initApi();

// 错误处理
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default api; 