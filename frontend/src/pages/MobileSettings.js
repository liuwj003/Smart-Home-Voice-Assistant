import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  Switch,
  Divider,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';
import MobileContainer from '../components/MobileContainer';

/**
 * MobileSettings - 智能家居应用的设置页面
 * 
 * 允许用户配置:
 * - 外观设置（暗/亮模式）
 * - 语音转文本引擎选择
 * - 自然语言理解处理器选择
 * - 文本转语音引擎选择
 * - 启用/禁用语音反馈
 */
const MobileSettings = () => {
  const navigate = useNavigate();
  const { settings, setSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  
  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null); // 'stt', 'nlu', 或 'tts'
  const [tempSelection, setTempSelection] = useState('');
  
  // 设置初始状态
  const [sttEngine, setSttEngine] = useState('');
  const [nluEngine, setNluEngine] = useState('');
  const [ttsEngine, setTtsEngine] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  
  // 从全局设置状态加载设置
  useEffect(() => {
    if (settings) {
      setSttEngine(settings.stt?.engine || 'whisper');
      // 使用正确的引擎名称
      const nluEngineValue = settings.nlu?.engine || 'fine_tuned_bert';
      setNluEngine(nluEngineValue);
      setTtsEngine(settings.tts?.engine || 'pyttsx3');
      setTtsEnabled(settings.tts?.enabled !== undefined ? settings.tts.enabled : true);
    }
  }, [settings]);
  
  // 处理返回
  const handleBack = () => {
    navigate('/mobile');
  };
  
  // 处理对话框开启
  const handleOpenDialog = (type) => {
    let initialValue = '';
    
    switch (type) {
      case 'stt':
        initialValue = sttEngine;
        break;
      case 'nlu':
        initialValue = nluEngine;
        break;
      case 'tts':
        initialValue = ttsEngine;
        break;
      default:
        initialValue = '';
    }
    
    setTempSelection(initialValue);
    setDialogType(type);
    setDialogOpen(true);
  };
  
  // 处理对话框关闭
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // 处理选择确认
  const handleConfirmSelection = () => {
    if (!dialogType) return;
    
    let newSettings = { ...settings };
    
    switch (dialogType) {
      case 'stt':
        setSttEngine(tempSelection);
        newSettings.stt = { 
          ...newSettings.stt, 
          engine: tempSelection 
        };
        break;
      case 'nlu':
        setNluEngine(tempSelection);
        newSettings.nlu = { 
          ...newSettings.nlu, 
          engine: tempSelection 
        };
        break;
      case 'tts':
        setTtsEngine(tempSelection);
        newSettings.tts = { 
          ...newSettings.tts, 
          engine: tempSelection 
        };
        break;
      default:
        break;
    }
    
    setSettings(newSettings);
    setDialogOpen(false);
  };
  
  // 处理语音反馈开关
  const handleToggleTTS = (event) => {
    const enabled = event.target.checked;
    setTtsEnabled(enabled);
    
    let newSettings = { ...settings };
    newSettings.tts = { 
      ...newSettings.tts, 
      enabled 
    };
    
    setSettings(newSettings);
  };
  
  // 渲染STT对话框内容
  const renderSTTDialogContent = () => (
    <FormControl component="fieldset">
      <RadioGroup
        value={tempSelection}
        onChange={(e) => setTempSelection(e.target.value)}
      >
        <FormControlLabel
          value="whisper"
          control={<Radio />}
          label="Whisper引擎"
        />
        <FormControlLabel
          value="dolphin"
          control={<Radio />}
          label="Dolphin引擎(测试中，敬请期待)"
          disabled
        />
      </RadioGroup>
    </FormControl>
  );
  
  // 渲染NLU对话框内容
  const renderNLUDialogContent = () => (
    <>
      <FormControl component="fieldset">
        <RadioGroup
          value={tempSelection}
          onChange={(e) => setTempSelection(e.target.value)}
        >
          <FormControlLabel
            value="fine_tuned_bert"
            control={<Radio />}
            label="Fine-tuned-BERT"
          />
          <FormControlLabel
            value="nlu_orchestrator"
            control={<Radio />}
            label="NLU-Orchestrator(RAG+Fine-tuned-BERT)"
          />
        </RadioGroup>
      </FormControl>
      
      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          提示: 如果您希望更自然化的体验，请选择NLU-Orchestrator。如果您能确保说出较明确的家居指令(指定动作与要操作的家居)，可以选Fine-tuned-BERT。
        </Typography>
      </Box>
    </>
  );
  
  // 渲染TTS对话框内容
  const renderTTSDialogContent = () => (
    <FormControl component="fieldset">
      <RadioGroup
        value={tempSelection}
        onChange={(e) => setTempSelection(e.target.value)}
      >
        <FormControlLabel
          value="pyttsx3"
          control={<Radio />}
          label="pyttsx3引擎"
        />
      </RadioGroup>
    </FormControl>
  );
  
  // 获取对话框标题
  const getDialogTitle = () => {
    switch (dialogType) {
      case 'stt':
        return '语音转文本引擎';
      case 'nlu':
        return '自然语言理解处理器';
      case 'tts':
        return '文本转语音引擎';
      default:
        return '';
    }
  };
  
  // 获取对话框内容
  const getDialogContent = () => {
    switch (dialogType) {
      case 'stt':
        return renderSTTDialogContent();
      case 'nlu':
        return renderNLUDialogContent();
      case 'tts':
        return renderTTSDialogContent();
      default:
        return null;
    }
  };
  
  // 获取当前STT显示名称
  const getSTTDisplayName = () => {
    switch (sttEngine) {
      case 'whisper':
        return 'Whisper';
      case 'dolphin':
        return 'Dolphin(测试中)';
      default:
        return 'Whisper';
    }
  };
  
  // 获取当前NLU显示名称
  const getNLUDisplayName = () => {
    switch (nluEngine) {
      case 'fine_tuned_bert':
        return 'Fine-tuned-BERT';
      case 'nlu_orchestrator':
        return 'RAG+Fine-tuned-BERT';
      default:
        return 'Fine-tuned-BERT';
    }
  };
  
  // 获取当前TTS显示名称
  const getTTSDisplayName = () => {
    switch (ttsEngine) {
      case 'pyttsx3':
        return 'pyttsx3';
      default:
        return 'pyttsx3';
    }
  };
  
  return (
    <MobileContainer hideBottomNav>
      {/* 顶部标题栏 */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: theme === 'dark' ? '#121212' : '#fff'
      }}>
        <IconButton edge="start" onClick={handleBack} aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>设置</Typography>
      </Box>
      
      {/* 设置内容 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, py: 1 }}>
          外观
        </Typography>
        
        <Paper elevation={0} sx={{ mx: 2, borderRadius: 2, overflow: 'hidden' }}>
          <List disablePadding>
            <ListItem button onClick={toggleTheme}>
              <ListItemText 
                primary="显示模式" 
                secondary={theme === 'dark' ? '暗色' : '亮色'} 
              />
              <ListItemSecondaryAction>
                {theme === 'dark' ? <DarkModeIcon color="action" /> : <LightModeIcon color="warning" />}
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Paper>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, py: 1 }}>
          语音处理
        </Typography>
        
        <Paper elevation={0} sx={{ mx: 2, borderRadius: 2, overflow: 'hidden' }}>
          <List disablePadding>
            <ListItem button onClick={() => handleOpenDialog('stt')}>
              <ListItemText 
                primary="语音转文本引擎" 
                secondary={getSTTDisplayName()} 
              />
              <KeyboardArrowRightIcon color="action" />
            </ListItem>
            
            <Divider component="li" />
            
            <ListItem button onClick={() => handleOpenDialog('nlu')}>
              <ListItemText 
                primary="自然语言理解处理器" 
                secondary={getNLUDisplayName()} 
              />
              <KeyboardArrowRightIcon color="action" />
            </ListItem>
            
            <Divider component="li" />
            
            <ListItem button onClick={() => handleOpenDialog('tts')}>
              <ListItemText 
                primary="文本转语音引擎" 
                secondary={getTTSDisplayName()} 
              />
              <KeyboardArrowRightIcon color="action" />
            </ListItem>
            
            <Divider component="li" />
            
            <ListItem>
              <ListItemText primary="启用语音反馈" />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={ttsEnabled}
                  onChange={handleToggleTTS}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Paper>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, py: 1 }}>
          其他设置
        </Typography>
        
        <Paper elevation={0} sx={{ mx: 2, borderRadius: 2, overflow: 'hidden' }}>
          <List disablePadding>
            <ListItem button>
              <ListItemText primary="隐私与数据" />
              <KeyboardArrowRightIcon color="action" />
            </ListItem>
            
            <Divider component="li" />
            
            <ListItem button>
              <ListItemText primary="关于系统" />
              <KeyboardArrowRightIcon color="action" />
            </ListItem>
          </List>
        </Paper>
      </Box>
      
      {/* 设置选择对话框 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{getDialogTitle()}</DialogTitle>
        <DialogContent>
          {getDialogContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleConfirmSelection} color="primary">
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </MobileContainer>
  );
};

export default MobileSettings; 