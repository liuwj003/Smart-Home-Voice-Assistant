import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Button,
  IconButton,
  Divider,
  Grid,
  Alert,
  Paper,
  Slider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Snackbar
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Mic,
  RecordVoiceOver,
  VolumeUp,
  Translate,
  Settings as SettingsIcon,
  Refresh,
  Info
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { settingsApi } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';

const Settings = () => {
  const { settings, setSettings, loading, refreshSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSettingChange = (section, key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await setSettings(localSettings);
      setSaveSuccess(true);
      setSnackbarMessage('设置已保存');
      setSnackbarOpen(true);
    } catch (error) {
      setSaveError('保存设置失败，请重试');
      setSnackbarMessage('保存设置失败');
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading || !localSettings) return <div>加载中...</div>;

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton
            edge="start"
            component={Link}
            to="/"
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            设置
          </Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            语音识别 (STT) 设置
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>STT引擎</InputLabel>
                <Select
                  value={localSettings.stt.engine}
                  label="STT引擎"
                  onChange={(e) => handleSettingChange('stt', 'engine', e.target.value)}
                >
                  <MenuItem value="whisper">OpenAI Whisper</MenuItem>
                  <MenuItem value="dolphin">Dolphin</MenuItem>
                  <MenuItem value="placeholder">占位符引擎</MenuItem>
                  <MenuItem value="simulated">模拟引擎 (测试用)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>语言</InputLabel>
                <Select
                  value={localSettings.stt.language}
                  label="语言"
                  onChange={(e) => handleSettingChange('stt', 'language', e.target.value)}
                >
                  <MenuItem value="zh-CN">中文 (中国)</MenuItem>
                  <MenuItem value="en-US">英语 (美国)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography id="sensitivity-slider" gutterBottom>
                麦克风灵敏度: {localSettings.stt.sensitivity}
              </Typography>
              <Slider
                value={localSettings.stt.sensitivity}
                min={0}
                max={1}
                step={0.1}
                onChange={(e, value) => handleSettingChange('stt', 'sensitivity', value)}
                aria-labelledby="sensitivity-slider"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            自然语言理解 (NLU) 设置
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>NLU引擎</InputLabel>
                <Select
                  value={localSettings.nlu.engine}
                  label="NLU引擎"
                  onChange={(e) => handleSettingChange('nlu', 'engine', e.target.value)}
                >
                  <MenuItem value="fine_tuned_bert">Fine-tuned BERT</MenuItem>
                  <MenuItem value="nlu_orchestrator">NLU Orchestrator</MenuItem>
                  <MenuItem value="placeholder">占位符引擎</MenuItem>
                  <MenuItem value="simulated">模拟引擎 (测试用)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography id="confidence-slider" gutterBottom>
                置信度阈值: {localSettings.nlu.confidence_threshold}
              </Typography>
              <Slider
                value={localSettings.nlu.confidence_threshold}
                min={0}
                max={1}
                step={0.1}
                onChange={(e, value) => handleSettingChange('nlu', 'confidence_threshold', value)}
                aria-labelledby="confidence-slider"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            语音合成 (TTS) 设置
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.tts.enabled}
                    onChange={(e) => handleSettingChange('tts', 'enabled', e.target.checked)}
                  />
                }
                label="启用语音反馈"
              />
            </Grid>
            {localSettings.tts.enabled && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>TTS引擎</InputLabel>
                    <Select
                      value={localSettings.tts.engine}
                      label="TTS引擎"
                      onChange={(e) => handleSettingChange('tts', 'engine', e.target.value)}
                    >
                      <MenuItem value="placeholder">占位符引擎</MenuItem>
                      <MenuItem value="pyttsx3">本地TTS引擎 (pyttsx3)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>语音</InputLabel>
                    <Select
                      value={localSettings.tts.voice}
                      label="语音"
                      onChange={(e) => handleSettingChange('tts', 'voice', e.target.value)}
                    >
                      <MenuItem value="female">女声</MenuItem>
                      <MenuItem value="male">男声</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography id="speed-slider" gutterBottom>
                    语速: {localSettings.tts.speed}x
                  </Typography>
                  <Slider
                    value={localSettings.tts.speed}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onChange={(e, value) => handleSettingChange('tts', 'speed', value)}
                    aria-labelledby="speed-slider"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography id="pitch-slider" gutterBottom>
                    音调: {localSettings.tts.pitch}
                  </Typography>
                  <Slider
                    value={localSettings.tts.pitch}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onChange={(e, value) => handleSettingChange('tts', 'pitch', value)}
                    aria-labelledby="pitch-slider"
                  />
                </Grid>
                {localSettings.tts.engine === 'pyttsx3' && (
                  <Grid item xs={12} md={6}>
                    <Typography id="volume-slider" gutterBottom>
                      音量: {localSettings.tts.volume || 1.0}
                    </Typography>
                    <Slider
                      value={localSettings.tts.volume || 1.0}
                      min={0.0}
                      max={1.0}
                      step={0.1}
                      onChange={(e, value) => handleSettingChange('tts', 'volume', value)}
                      aria-labelledby="volume-slider"
                    />
                  </Grid>
                )}
              </>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            界面设置
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>主题</InputLabel>
                <Select
                  value={localSettings.ui.theme}
                  label="主题"
                  onChange={(e) => handleSettingChange('ui', 'theme', e.target.value)}
                >
                  <MenuItem value="light">浅色</MenuItem>
                  <MenuItem value="dark">深色</MenuItem>
                  <MenuItem value="system">跟随系统</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.ui.showFeedback}
                    onChange={(e) => handleSettingChange('ui', 'showFeedback', e.target.checked)}
                  />
                }
                label="显示详细反馈信息"
              />
            </Grid>
          </Grid>
        </Paper>

        {saveError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {saveError}
          </Alert>
        )}

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            设置已成功保存
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            component={Link} 
            to="/"
            startIcon={<ArrowBack />}
          >
            返回
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSettings}
            disabled={isSaving}
            startIcon={<Save />}
          >
            保存设置
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default Settings; 