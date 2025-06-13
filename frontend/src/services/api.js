import axios from 'axios';
import { commandService } from './command';
import {clearRoomDevices} from '../data/DeviceData';
import { fetchDevices } from '../data/deviceApi';

// 创建 axios 实例
const api = axios.create({
    baseURL: 'http://localhost:8080/api',  // 后端 API 的基础 URL
    timeout: 60000,  // 全局超时时间 60秒
    headers: {
        'Content-Type': 'application/json'
    }
});

// 自动重试服务器端点
let serverCheckInProgress = false;
export const checkServerAvailability = async () => {
    if (serverCheckInProgress) {
        console.log('服务器检查已在进行中，跳过');
        return false;
    }

    serverCheckInProgress = true;
    // 首先尝试默认的8080端口，然后是8081，最后是5000
    const ports = ['8080', '8081', '5000']; 
    const currentPortStr = api.defaults.baseURL.match(/:(\d+)/)[1];
    const startIndex = ports.indexOf(currentPortStr);
    let foundWorkingPort = false;
    
    console.log(`检查服务器可用性，当前端口: ${currentPortStr}`);
    
    // 优先检查健康端点，这是一个轻量级调用
    try {
        console.log('检查当前端口健康状态');
        await axios.get(`http://localhost:${currentPortStr}/api/voice/settings`, { timeout: 2000 });
        console.log(`当前端口 ${currentPortStr} 工作正常，无需切换`);
        serverCheckInProgress = false;
        return true;
    } catch (err) {
        console.log(`当前端口 ${currentPortStr} 健康检查失败: ${err.message}`);
        // 如果当前端口不可用，继续检查其他端口
    }
    
    // 尝试其他可能的端口
    for (let i = 0; i < ports.length; i++) {
        const idx = (startIndex + i + 1) % ports.length;
        const port = ports[idx];
        const testUrl = `http://localhost:${port}/api/voice/settings`;
        
        try {
            console.log(`尝试连接到端口 ${port}`);
            await axios.get(testUrl, { timeout: 2000 });
            // 如果成功，更新baseURL
            setApiBaseUrl(`http://localhost:${port}/api`);
            console.log(`成功连接到端口 ${port}`);
            foundWorkingPort = true;
            break;
        } catch (err) {
            console.log(`端口 ${port} 连接失败: ${err.message}`);
        }
    }
    
    serverCheckInProgress = false;
    return foundWorkingPort;
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
        // 读取本地 voice_settings
        let settings = {};
        try {
            const localSettings = localStorage.getItem('voice_settings');
            if (localSettings) {
                const parsed = JSON.parse(localSettings);
                settings = {
                    stt_engine: parsed.stt?.engine,
                    nlu_engine: parsed.nlu?.engine,
                    tts_engine: parsed.tts?.engine,
                    tts_enabled: parsed.tts?.enabled !== undefined ? parsed.tts.enabled : true // 默认启用
                };
            }
        } catch (e) { console.warn('读取本地 voice_settings 失败', e); }
        formData.append('settingsJson', JSON.stringify(settings));
        
        try {
            // 确保FormData中音频文件的字段名为audio_file
            // 检查并重命名字段 - 这是兼容处理
            if (formData.has('audio') && !formData.has('audio_file')) {
                const audioBlob = formData.get('audio');
                formData.delete('audio');
                formData.append('audio_file', audioBlob, audioBlob.name || 'recording.webm');
            }
            
            // 调试信息
            console.log('发送语音命令到:', `${api.defaults.baseURL}/command/audio`);
            console.log('FormData字段:', Array.from(formData.keys()));
            
            // 设置更长的超时时间，避免音频处理超时
            const response = await api.post('/command/audio', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60000 // 1分钟
            });
            
            // 调试信息
            console.log('语音命令响应成功:', response.status);
            
            return response;
        } catch (err) {
            console.error('语音命令请求失败:', err.message);
            
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                console.log('尝试重新连接到后端服务器...');
                const success = await checkServerAvailability();
                console.log('服务器重连结果:', success ? '成功' : '失败');
                
                if (success) {
                    console.log('使用新的baseURL重新发送语音命令:', api.defaults.baseURL);
                    return api.post('/command/audio', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        timeout: 120000
                    });
                }
            }
            
            // 详细记录错误
            if (err.response) {
                console.error('服务器响应:', err.response.status, err.response.data);
            }
            
            throw err;
        }
    },
    
    // 发送文本命令
    sendTextCommand: async (text) => {
        let settings = {};
        try {
            const localSettings = localStorage.getItem('voice_settings');
            if (localSettings) {
                const parsed = JSON.parse(localSettings);
                settings = {
                    stt_engine: parsed.stt?.engine,
                    nlu_engine: parsed.nlu?.engine,
                    tts_engine: parsed.tts?.engine,
                    tts_enabled: parsed.tts?.enabled !== undefined ? parsed.tts.enabled : true
                };
            }
        } catch (e) { console.warn('读取本地 voice_settings 失败', e); }
        
        try {
            // 先发送命令到8005端口
            // await commandService.sendCommand(text);
            
            
            
            // 然后发送到主API
            console.log('发送文本命令到:', `${api.defaults.baseURL}/command/text`);
            console.log('文本内容:', text);
            
            const response = await api.post('/command/text', {
                textInput: text,
                settings
            }, {
                timeout: 60000
            });
            
            console.log('文本命令响应成功:', response.status);
            // 清除并刷新设备数据
            console.log('清除设备数据...');
            clearRoomDevices();
            console.log('获取最新设备数据...');
            await fetchDevices();
            return response;
        } catch (err) {
            console.error('文本命令请求失败:', err.message);
            
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                console.log('尝试重新连接到后端服务器...');
                const success = await checkServerAvailability();
                console.log('服务器重连结果:', success ? '成功' : '失败');
                
                if (success) {
                    // 重连成功后也要刷新设备数据
                    console.log('清除并刷新设备数据...');
                    clearRoomDevices();
                    await fetchDevices();
                    
                    console.log('使用新的baseURL重新发送文本命令:', api.defaults.baseURL);
                    return api.post('/command/text', { 
                        textInput: text,
                        settings: { 
                            tts_enabled: settings.tts_enabled !== undefined ? settings.tts_enabled : true
                        } 
                    }, {
                        timeout: 60000
                    });
                }
            }
            
            if (err.response) {
                console.error('服务器响应:', err.response.status, err.response.data);
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