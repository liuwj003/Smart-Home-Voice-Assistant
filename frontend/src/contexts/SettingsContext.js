import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsApi } from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

// 默认设置
const defaultSettings = {
  stt: {
    engine: 'dolphin',
    language: 'zh-CN'
  },
  nlu: {
    engine: 'fine_tuned_bert',
    confidence_threshold: 300
  },
  tts: {
    enabled: true,
    engine: 'pyttsx3'
  },
  ui: {
    theme: 'light',
    showFeedback: true
  }
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettingsState] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  // 加载 settings（优先 localStorage，后端...）
  useEffect(() => {
    const saved = localStorage.getItem('voice_settings');
    if (saved) {
      setSettingsState(JSON.parse(saved));
      setLoading(false);
    } else {
      settingsApi.getVoiceSettings().then(res => {
        setSettingsState(res.data);
        setLoading(false);
      }).catch(() => {
        setSettingsState(defaultSettings);
        setLoading(false);
      });
    }
  }, []);

  // 每次 settings 变化都同步到 localStorage
  useEffect(() => {
    if (settings) {
      localStorage.setItem('voice_settings', JSON.stringify(settings));
    }
  }, [settings]);

  // 更新 settings 并同步到后端
  const setSettings = useCallback(async (newSettings) => {
    setSettingsState(newSettings);
    localStorage.setItem('voice_settings', JSON.stringify(newSettings));
    try {
      await settingsApi.updateVoiceSettings(newSettings);
    } catch (e) {
      // 可加全局错误提示
      console.error('同步设置到后端失败', e);
    }
  }, []);

  // 刷新（从后端拉取最新 settings 并覆盖本地）
  const refreshSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getVoiceSettings();
      setSettingsState(res.data);
      localStorage.setItem('voice_settings', JSON.stringify(res.data));
    } catch (e) {
      console.error('刷新设置失败', e);
    }
    setLoading(false);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}; 