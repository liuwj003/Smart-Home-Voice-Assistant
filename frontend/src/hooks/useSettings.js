import { useState, useEffect } from 'react';
import { settingsApi } from '../services/api';

/**
 * 自定义Hook处理用户设置
 * 
 * @returns {Object} - 包含设置状态和相关函数
 */
const useSettings = () => {
  const [language, setLanguage] = useState('zh');
  
  // 加载设置
  const loadSettings = async () => {
    try {
      const settings = localStorage.getItem('voice_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        const languageCode = parsed.language || 'zh';
        setLanguage(languageCode);
      } else {
        const res = await settingsApi.getVoiceSettings();
        setLanguage(res.data.language || 'zh');
      }
    } catch (error) {
      console.error('加载设置失败', error);
      // 使用中文作为默认语言
      setLanguage('zh');
    }
  };

  // 首次挂载时加载设置
  useEffect(() => {
    loadSettings();
    
    // 添加页面聚焦监听，在从设置页返回后刷新设置
    const onFocus = () => {
      loadSettings();
      console.log('重新加载设置');
    };
    
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);
  
  return {
    language,
    loadSettings
  };
};

export default useSettings; 