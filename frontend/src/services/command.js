import axios from 'axios';

// 命令服务
export const commandService = {
    // 发送命令到指定端口
    sendCommand: async (command) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8005/base/text`, {
                params: { command }
            });
            console.log('命令响应:', response.data);
            return response;
        } catch (error) {
            console.error('发送命令失败:', error);
            throw error;
        }
    }
};

export default commandService; 