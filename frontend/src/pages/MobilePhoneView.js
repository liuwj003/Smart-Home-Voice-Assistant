import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, TextField, Button, InputAdornment, Avatar, Fade, CircularProgress, Collapse } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import LightIcon from '@mui/icons-material/Light';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WifiIcon from '@mui/icons-material/Wifi';
import LivingIcon from '@mui/icons-material/Weekend';
import KitchenIcon from '@mui/icons-material/Kitchen';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MobileContainer from '../components/MobileContainer';
import TypingAnimation from '../components/TypingAnimation';
import { voiceApi, settingsApi } from '../services/api';
import '../MobileApp.css';

/**
 * MobilePhoneView - Apple-style home view with scenes and voice input
 * 
 * This component displays home devices organized into different scenes (rooms),
 * following Apple's design language from the Figma design. It includes the 
 * text and voice input functionality from the original PhoneView.
 */
const MobilePhoneView = () => {
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textCommand, setTextCommand] = useState('');
  const [resultText, setResultText] = useState('');
  const [nlpResult, setNlpResult] = useState(null);
  const [showTypingResponse, setShowTypingResponse] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [language, setLanguage] = useState('zh');
  const [expandedScene, setExpandedScene] = useState(null);
  const [isUnderstandSuccess, setIsUnderstandSuccess] = useState(true);
  
  // Pull-to-refresh states
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const pullThreshold = 80; // Distance needed to trigger refresh
  const touchStartY = useRef(0);
  const refreshIndicatorRef = useRef(null);

  // Navigation handlers
  const goToSettings = () => {
    navigate('/phone/settings');
  };
  
  const goToWeather = () => {
    // Temporary placeholder - will be implemented later
    console.log('Weather button clicked - feature coming soon');
  };

  // Handle scene toggle
  const handleSceneToggle = (sceneId) => {
    setExpandedScene(expandedScene === sceneId ? null : sceneId);
  };

  // Sample devices data for each room/scene
  const roomDevices = {
    living: [
      {
        id: 'light1',
        title: '客厅灯',
        subtitle: '开',
        icon: <LightIcon />,
        active: true
      },
      {
        id: 'ac1',
        title: '客厅空调',
        subtitle: '27°C',
        icon: <ThermostatIcon />,
        active: false
      },
      {
        id: 'wifi1',
        title: 'WiFi',
        subtitle: '已连接',
        icon: <WifiIcon />,
        active: false
      },
      {
        id: 'light2',
        title: '茶几灯',
        subtitle: '关',
        icon: <LightIcon />,
        active: false
      }
    ],
    kitchen: [
      {
        id: 'light3',
        title: '厨房吊灯',
        subtitle: '关',
        icon: <LightIcon />,
        active: false
      },
      {
        id: 'light4',
        title: '橱柜灯',
        subtitle: '关',
        icon: <LightIcon />,
        active: false
      },
      {
        id: 'ac2',
        title: '排风扇',
        subtitle: '关',
        icon: <ThermostatIcon />,
        active: false
      }
    ],
    bedroom: [
      {
        id: 'light5',
        title: '卧室灯',
        subtitle: '关',
        icon: <LightIcon />,
        active: false
      },
      {
        id: 'ac3',
        title: '卧室空调',
        subtitle: '26°C',
        icon: <ThermostatIcon />,
        active: true
      },
      {
        id: 'light6',
        title: '床头灯',
        subtitle: '关',
        icon: <LightIcon />,
        active: false
      },
      {
        id: 'light7',
        title: '阅读灯',
        subtitle: '关',
        icon: <LightIcon />,
        active: false
      },
      {
        id: 'light8',
        title: '衣柜灯',
        subtitle: '关',
        icon: <LightIcon />,
        active: false
      }
    ],
    bathroom: [
      {
        id: 'light9',
        title: '浴室灯',
        subtitle: '关',
        icon: <LightIcon />,
        active: false
      },
      {
        id: 'ac4',
        title: '浴霸',
        subtitle: '关',
        icon: <ThermostatIcon />,
        active: false
      }
    ]
  };
  
  // Sample home scenes data grouped by room/scene
  const scenes = [
    {
      id: 'living',
      title: '客厅',
      icon: <LivingIcon />,
      devices: roomDevices.living.length,
      image: '/images/living.jpg'
    },
    {
      id: 'kitchen',
      title: '厨房',
      icon: <KitchenIcon />,
      devices: roomDevices.kitchen.length,
      image: '/images/kitchen.jpg'
    },
    {
      id: 'bedroom',
      title: '卧室',
      icon: <BedIcon />,
      devices: roomDevices.bedroom.length,
      image: '/images/bedroom.jpg'
    },
    {
      id: 'bathroom',
      title: '浴室',
      icon: <BathtubIcon />,
      devices: roomDevices.bathroom.length,
      image: '/images/bathroom.jpg'
    }
  ];
  
  // Sample favorites devices
  const favoriteDevices = [
    {
      id: 'light1',
      title: '客厅灯',
      subtitle: '开',
      icon: <LightIcon />,
      active: true
    },
    {
      id: 'ac1',
      title: '空调',
      subtitle: '27°C',
      icon: <ThermostatIcon />,
      active: false
    },
    {
      id: 'wifi1',
      title: 'WiFi',
      subtitle: '已连接',
      icon: <WifiIcon />,
      active: false
    }
  ];

  // Load settings
  useEffect(() => {
    loadSettings();
  }, []);

  // 添加页面聚焦监听，在从设置页返回后刷新设置
  useEffect(() => {
    const onFocus = () => {
      loadSettings();
      console.log('重新加载设置');
    };
    
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

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

  // Format NLP quintuple result
  const formatNlpQuintuple = (result) => {
    // 检查两种可能的响应格式
    // 1. 直接包含nluResult的格式
    if (result && result.nluResult) {
      const nluResult = result.nluResult;
      const formattedQuintuple = {
        action: nluResult.action || "未识别",
        object: nluResult.entity || "未识别",
        location: nluResult.location || "未指定",
        deviceId: nluResult.deviceId || "0",
        parameter: nluResult.parameter,
      };
      
      // 根据用户需求，简化判断逻辑：仅当ACTION和DEVICE_TYPE（entity）中有一个为None/null/空时，认为理解失败
      const isSuccess = 
        formattedQuintuple.action && 
        formattedQuintuple.action !== "未识别" &&
        formattedQuintuple.action !== "" &&
        formattedQuintuple.object && 
        formattedQuintuple.object !== "未识别" && 
        formattedQuintuple.object !== "";
      
      return {
        ...formattedQuintuple,
        isSuccess
      };
    }
    
    return null;
  };

  // Handle text command input
  const handleSendTextCommand = async () => {
    if (!textCommand.trim()) return;
    
    setIsProcessing(true);
    setResultText('');
    setShowTypingResponse(false);
    setNlpResult(null);
    
    try {
      const response = await voiceApi.sendTextCommand(textCommand);
      
      // 设置 NLP 识别结果
      const nlpQuintuple = formatNlpQuintuple(response.data);
      
      // 简化逻辑，只根据NLU字段来判断成功失败（DEVICE_TYPE和ACTION至少1个是None）
      const isSuccess = 
        nlpQuintuple && 
        nlpQuintuple.action && 
        nlpQuintuple.action !== "未识别" && 
        nlpQuintuple.action !== "" &&
        nlpQuintuple.object && 
        nlpQuintuple.object !== "未识别" && 
        nlpQuintuple.object !== "";
      
      setIsUnderstandSuccess(isSuccess);
      if (nlpQuintuple) {
        setNlpResult(nlpQuintuple);
      }
      
      // 优先使用responseMessageForTts作为显示文本
      if (response.data?.responseMessageForTts) {
        setResultText(response.data.responseMessageForTts);
        setShowTypingResponse(true);
      }
      // 回退到其他文本
      else if (response.data?.deviceActionFeedback) {
        setResultText(response.data.deviceActionFeedback);
        setShowTypingResponse(true);
      } else if (response.data?.errorMessage) {
        setResultText(response.data.errorMessage);
        setShowTypingResponse(true);
      }
      
      // Play TTS if available
      if (response.data?.ttsOutputReference) {
        playTTSAudio(response.data.ttsOutputReference);
      }
    } catch (error) {
      console.error('发送文本命令失败:', error);
      setResultText('发送命令失败，请重试');
      setShowTypingResponse(true);
      setIsUnderstandSuccess(false);
    } finally {
      setIsProcessing(false);
      setTextCommand('');
    }
  };

  // Handle voice command
  const handleVoiceCommand = async () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    
    setIsListening(true);
    setResultText('');
    setShowTypingResponse(false);
    setNlpResult(null);
    
    // 检查麦克风权限
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 创建音频上下文和分析器
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      
      microphone.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);
      
      // 录音
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];
      
      mediaRecorder.addEventListener("dataavailable", event => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener("stop", async () => {
        // 创建音频 Blob
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // 创建 FormData 对象，准备发送到后端
        const formData = new FormData();
        formData.append('audio_file', audioBlob, 'recording.webm');
        
        // 停止麦克风
        stream.getTracks().forEach(track => track.stop());
        
        // 清理音频处理
        scriptProcessor.disconnect();
        analyser.disconnect();
        microphone.disconnect();
        audioContext.close();
        
        setIsListening(false);
        setIsProcessing(true);
        
        try {
          // 发送到后端
          const response = await voiceApi.sendVoiceCommand(formData);
          handleCommandResult(response.data);
        } catch (error) {
          console.error('处理语音命令失败:', error);
          setResultText('处理语音命令时出错，请重试');
          setShowTypingResponse(true);
        } finally {
          setIsProcessing(false);
        }
      });
      
      // 开始录音
      mediaRecorder.start();
      
      // 3秒后停止（模拟实际语音助手）
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, 3000);
      
    } catch (error) {
      console.error('无法访问麦克风:', error);
      setIsListening(false);
      setResultText('无法访问麦克风，请检查权限设置');
      setShowTypingResponse(true);
    }
  };

  // Process command result
  const handleCommandResult = (result) => {
    setResultText('');
    setShowTypingResponse(false);
    setNlpResult(null);
    
    // 设置 NLP 识别结果
    const nlpQuintuple = formatNlpQuintuple(result);
    
    // 简化逻辑，只根据NLU字段来判断成功失败（DEVICE_TYPE和ACTION至少1个是None）
    const isSuccess = 
      nlpQuintuple && 
      nlpQuintuple.action && 
      nlpQuintuple.action !== "未识别" && 
      nlpQuintuple.action !== "" &&
      nlpQuintuple.object && 
      nlpQuintuple.object !== "未识别" && 
      nlpQuintuple.object !== "";
    
    setIsUnderstandSuccess(isSuccess);
    if (nlpQuintuple) {
      setNlpResult(nlpQuintuple);
    }
    
    // 优先使用responseMessageForTts作为显示文本
    if (result?.responseMessageForTts) {
      setResultText(result.responseMessageForTts);
      setShowTypingResponse(true);
    }
    // 回退到其他文本
    else if (result?.deviceActionFeedback) {
      setResultText(result.deviceActionFeedback);
      setShowTypingResponse(true);
    } else if (result?.errorMessage) {
      setResultText(result.errorMessage || '处理命令时出错');
      setShowTypingResponse(true);
    }
    
    // 播放 TTS
    if (result?.ttsOutputReference) {
      playTTSAudio(result.ttsOutputReference);
    }
  };
  
  // Play TTS Audio
  const playTTSAudio = async (audioReference) => {
    if (!audioReference) return;
    
    let audioUrl = audioReference;
    
    // 检查是否为相对路径
    if (!audioReference.startsWith('http') && !audioReference.startsWith('blob:')) {
      // 构建完整 URL
      const baseUrl = 'http://localhost:8080'; // 默认端口
      audioUrl = `${baseUrl}${audioReference.startsWith('/') ? '' : '/'}${audioReference}`;
    }
    
    try {
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error('播放TTS语音失败:', error);
    }
  };

  // Refresh data function - replace with your actual data refresh logic
  const refreshData = async () => {
    setRefreshing(true);
    try {
      // In the future, you can add real data refresh logic here
      await loadSettings();
      // Simulate delay for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('刷新数据失败', error);
    } finally {
      setRefreshing(false);
      setPullDistance(0);
    }
  };
  
  // Handle pull-to-refresh touch events
  const handleTouchStart = (e) => {
    if (contentRef.current && contentRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };
  
  const handleTouchMove = (e) => {
    if (touchStartY.current === 0 || refreshing) return;
    
    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStartY.current;
    
    // Only activate pull if we're at the top of the content and pulling down
    if (distance > 0 && contentRef.current && contentRef.current.scrollTop === 0) {
      // Use a resistance factor to make the pull feel more natural
      const newPullDistance = Math.min(distance * 0.5, pullThreshold * 1.5);
      setPullDistance(newPullDistance);
      
      // Prevent default scroll behavior when pulling
      e.preventDefault();
    }
  };
  
  const handleTouchEnd = () => {
    if (pullDistance > pullThreshold && !refreshing) {
      refreshData();
    } else {
      setPullDistance(0);
    }
    touchStartY.current = 0;
  };

  return (
    <MobileContainer 
      title="Our Home"
      rightButtons={
        <Box sx={{ display: 'flex' }}>
          <IconButton 
            className="ios-nav-button" 
            onClick={goToWeather}
            sx={{ mr: 1 }}
          >
            <WbSunnyIcon />
          </IconButton>
          <IconButton 
            className="ios-nav-button"
            onClick={goToSettings}
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      }
    >
      {/* Pull-to-refresh indicator */}
      <Box 
        ref={refreshIndicatorRef}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 5,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: `${pullDistance}px`,
          overflow: 'hidden',
          transition: refreshing ? 'none' : 'height 0.2s ease'
        }}
      >
        {refreshing ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          <RefreshIcon 
            sx={{ 
              transform: `rotate(${Math.min(pullDistance / pullThreshold * 180, 180)}deg)`,
              opacity: Math.min(pullDistance / pullThreshold, 1),
              transition: 'transform 0.1s ease'
            }} 
          />
        )}
      </Box>
      
      {/* Main scrollable content with pull-to-refresh events */}
      <Box 
        ref={contentRef}
        className="ios-scrollable-content"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        sx={{ 
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : 'none',
          transition: refreshing || pullDistance === 0 ? 'transform 0.2s ease' : 'none',
          height: 'auto',
          minHeight: '100%',
          pb: 10, // 额外的内部底部间距
          display: 'flex',
          flexDirection: 'column',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          msOverflowStyle: 'none',  /* IE and Edge */
          scrollbarWidth: 'none'  /* Firefox */
        }}
      >
        {/* Voice Input Section */}
        <Box className="ios-section">
          <Box sx={{ padding: '0 20px', mb: 3 }}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="输入命令，例如：打开客厅灯"
                variant="outlined"
                value={textCommand}
                onChange={(e) => setTextCommand(e.target.value)}
                disabled={isProcessing}
                onKeyPress={(e) => e.key === 'Enter' && handleSendTextCommand()}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleSendTextCommand}
                        disabled={isProcessing || !textCommand.trim()}
                      >
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '16px' }
                }}
              />
            </Box>
            
            <Button
              variant="contained"
              startIcon={isListening ? null : <MicIcon />}
              onClick={handleVoiceCommand}
              disabled={isProcessing}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                backgroundColor: isListening ? '#ea4335' : '#1a73e8',
                '&:hover': {
                  backgroundColor: isListening ? '#d93025' : '#1765cc'
                },
                width: '100%',
                height: '48px'
              }}
            >
              {isListening ? '正在聆听...' : '语音输入'}
              {isProcessing && <CircularProgress size={24} sx={{ ml: 1, color: 'white' }} />}
            </Button>
          </Box>

          {/* Response display with typing animation */}
          {showTypingResponse && (
            <Fade in={showTypingResponse}>
              <Box 
                sx={{ 
                  margin: '0 20px',
                  p: 2,
                  borderRadius: '16px',
                  backgroundColor: isUnderstandSuccess 
                    ? 'rgba(75, 181, 67, 0.15)' // 成功理解用绿色底
                    : 'rgba(37, 37, 37, 0.55)' // 未理解用灰色底
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar
                    sx={{
                      mr: 1.5,
                      width: 32,
                      height: 32,
                      backgroundColor: isUnderstandSuccess 
                        ? 'rgba(75, 181, 67, 0.6)' // 成功理解用绿色
                        : 'rgba(255, 255, 255, 0.2)' // 未理解用灰色
                    }}
                  >
                    {isUnderstandSuccess ? 
                      <EmojiEmotionsIcon sx={{ fontSize: 18, color: 'white' }} /> : // 成功理解用笑脸
                      <SentimentDissatisfiedIcon sx={{ fontSize: 18, color: 'white' }} /> // 未理解用难过脸
                    }
                  </Avatar>
                  <Box sx={{ color: isUnderstandSuccess ? '#4BB543' : 'white', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {isUnderstandSuccess ? '操作完成' : '理解失败'}
                      </Typography>
                      
                      {/* 显示NLU结果标签（仅在理解成功时显示） */}
                      {isUnderstandSuccess && nlpResult && (
                        <Box 
                          sx={{ 
                            display: 'inline-flex',
                            ml: 2,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 4,
                            backgroundColor: 'rgba(75, 181, 67, 0.2)',
                            color: '#4BB543'
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                            {nlpResult.action !== "未识别" && nlpResult.action !== "" ? `${nlpResult.action} ` : ""} 
                            {nlpResult.object !== "未识别" && nlpResult.object !== "" ? nlpResult.object : ""} 
                            {nlpResult.location && nlpResult.location !== "未指定" ? ` (${nlpResult.location})` : ""}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <TypingAnimation text={resultText} />
                  </Box>
                </Box>
              </Box>
            </Fade>
          )}
        </Box>
        
        {/* Scenes Section with Expandable Rooms */}
        <Box className="ios-section">
          <Box className="ios-section-title">
            <Typography variant="h2" component="h2">场景</Typography>
          </Box>
          
          <Box sx={{ padding: '0 20px' }}>
            {scenes.map(scene => (
              <React.Fragment key={scene.id}>
                <Box 
                  className="ios-section-card"
                  onClick={() => handleSceneToggle(scene.id)}
                >
                  <Box className="ios-section-card-header">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box className="ios-section-card-icon">
                        {scene.icon}
                      </Box>
                      <Box>
                        <Typography className="ios-section-card-title">
                          {scene.title}
                        </Typography>
                        <Typography className="ios-section-card-meta">
                          {scene.devices} 设备
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <ExpandMoreIcon 
                        className={`ios-section-expand-icon ${expandedScene === scene.id ? 'expanded' : ''}`}
                      />
                    </Box>
                  </Box>
                </Box>
                
                <Collapse in={expandedScene === scene.id} timeout="auto" unmountOnExit>
                  <Box className="ios-section-card-content">
                    {roomDevices[scene.id]?.map(device => (
                      <Box 
                        key={device.id}
                        className={`ios-card ${device.active ? 'active' : ''}`}
                        sx={{ mb: 1 }}
                      >
                        <Box className="ios-card-icon">
                          {device.icon}
                        </Box>
                        <Box className="ios-card-content">
                          <Typography className="ios-card-title">
                            {device.title}
                          </Typography>
                          <Typography className="ios-card-subtitle">
                            {device.subtitle}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Collapse>
                {expandedScene !== scene.id && <Box sx={{ mb: 2 }} />}
              </React.Fragment>
            ))}
          </Box>
        </Box>
        
        {/* Favorites Section - 替换第二个项目的图标为金色机器人 */}
        <Box className="ios-section">
          <Box className="ios-section-title">
            <Typography variant="h2" component="h2">收藏</Typography>
            <ChevronRightIcon className="ios-section-chevron" />
          </Box>
          
          <Box sx={{ padding: '0 20px' }}>
            {favoriteDevices.map((device, index) => (
              <Box 
                key={device.id}
                className={`ios-card ${device.active ? 'active' : ''}`}
              >
                <Box className="ios-card-icon" 
                     sx={index === 1 ? {
                       backgroundColor: 'rgba(255, 215, 0, 0.2)' // 金色背景
                     } : {}}>
                  {index === 1 ? 
                    <SmartToyIcon sx={{ color: 'gold' }} /> : // 第二个项目使用金色机器人图标
                    device.icon
                  }
                </Box>
                <Box className="ios-card-content">
                  <Typography className="ios-card-title">
                    {index === 1 ? '智能助手' : device.title}
                  </Typography>
                  <Typography className="ios-card-subtitle">
                    {index === 1 ? '随时为您服务' : device.subtitle}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </MobileContainer>
  );
};

export default MobilePhoneView; 