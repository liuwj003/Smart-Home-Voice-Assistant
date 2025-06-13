import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MobileContainer from '../components/MobileContainer';
import VoiceInputSection from '../components/mobile/VoiceInputSection';
import ResponseDisplay from '../components/mobile/ResponseDisplay';
import ScenesList from '../components/mobile/ScenesList';
import FavoritesList from '../components/mobile/FavoritesList';
import PullToRefresh from '../components/mobile/PullToRefresh';
import MobileHeader from '../components/mobile/MobileHeader';
import useVoiceCommand from '../hooks/useVoiceCommand';
import useTextCommand from '../hooks/useTextCommand';
import useCommandResult from '../hooks/useCommandResult';
import useSettings from '../hooks/useSettings';
import usePullToRefresh from '../hooks/usePullToRefresh';
import { scenes, roomDevices, favoriteDevices } from '../data/DeviceData';
import '../MobileApp.css';

/**
 * MobilePhoneView - Apple风格的智能家居控制界面
 * 使用模块化组件和自定义hooks实现功能解耦
 */
const MobilePhoneView = () => {
  const navigate = useNavigate();
  const [expandedScene, setExpandedScene] = useState(null);
  
  // 使用自定义hooks管理各功能模块
  const { language, loadSettings } = useSettings();
  
  const { 
    resultText, 
    nlpResult, 
    showTypingResponse, 
    isUnderstandSuccess,
    isProcessingResponse,
    handleCommandResult,
    clearResult
  } = useCommandResult();
  
  // 开始新命令前清理旧结果
  const handleCommandStart = () => {
    clearResult();
  };
  
  const {
    textCommand,
    setTextCommand,
    isProcessing: isTextProcessing,
    handleSendTextCommand
  } = useTextCommand(handleCommandResult, handleCommandStart);
  
  const {
    isListening,
    isProcessing: isVoiceProcessing,
    handleVoiceCommand
  } = useVoiceCommand(handleCommandResult, handleCommandStart);
  
  // 下拉刷新功能
  const {
    refreshing,
    pullDistance,
    contentRef,
    refreshIndicatorRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    threshold: pullThreshold
  } = usePullToRefresh(loadSettings);
  
  // 场景切换处理
  const handleSceneToggle = (sceneId) => {
    setExpandedScene(expandedScene === sceneId ? null : sceneId);
  };

  // 导航处理函数
  const goToSettings = () => {
    navigate('/phone/settings');
  };
  
  const goToWeather = () => {
    navigate('/phone/weather');
  };
  
  // 设备点击处理函数
  const handleDeviceClick = (device) => {
    console.log('设备点击:', device);
  };

  const isProcessing = isTextProcessing || isVoiceProcessing || isProcessingResponse;

  return (
    <MobileContainer 
      title="Our Home"
      rightButtons={
        <MobileHeader
          onSettingsClick={goToSettings}
          onWeatherClick={goToWeather}
        />
      }
    >
      {/* 下拉刷新指示器 */}
      <PullToRefresh
        refreshing={refreshing}
        pullDistance={pullDistance}
        threshold={pullThreshold}
        refreshIndicatorRef={refreshIndicatorRef}
      />
      
      {/* 主要滚动内容区域，带下拉刷新事件 */}
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
        {/* 语音输入区域 */}
        <VoiceInputSection
          textCommand={textCommand}
          onTextChange={setTextCommand}
          isProcessing={isProcessing}
          isListening={isListening}
          onSendText={handleSendTextCommand}
          onVoiceCommand={handleVoiceCommand}
        />

        {/* 响应显示区域 */}
        <ResponseDisplay
          show={showTypingResponse}
          isSuccess={isUnderstandSuccess}
          nlpResult={nlpResult}
          resultText={resultText}
          isProcessing={isProcessingResponse}
        />
        
        {/* 场景/房间列表区域 */}
        <ScenesList
          scenes={scenes}
          roomDevices={roomDevices}
          expandedScene={expandedScene}
          onSceneToggle={handleSceneToggle}
        />
        
        {/* 收藏设备列表区域 */}
        <FavoritesList
          favoriteDevices={favoriteDevices}
          onDeviceClick={handleDeviceClick}
        />
      </Box>
    </MobileContainer>
  );
};

export default MobilePhoneView; 