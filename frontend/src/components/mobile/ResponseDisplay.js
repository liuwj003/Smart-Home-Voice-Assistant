import React from 'react';
import { Box, Typography, Avatar, Fade, CircularProgress } from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import TypingAnimation from '../TypingAnimation';

/**
 * 响应显示组件 - 显示命令处理结果
 * 
 * @param {Object} props
 * @param {Boolean} props.show - 是否显示响应
 * @param {Boolean} props.isSuccess - 是否成功理解命令
 * @param {Object} props.nlpResult - NLP处理结果
 * @param {String} props.resultText - 结果文本
 * @param {Boolean} props.isProcessing - 是否正在处理响应
 * @returns {JSX.Element}
 */
const ResponseDisplay = ({ 
  show, 
  isSuccess, 
  nlpResult, 
  resultText,
  isProcessing 
}) => {
  if (!show) return null;

  return (
    <Fade in={show}>
      <Box 
        sx={{ 
          margin: '0 20px',
          p: 2,
          borderRadius: '16px',
          backgroundColor: isSuccess 
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
              backgroundColor: isSuccess 
                ? 'rgba(75, 181, 67, 0.6)' 
                : 'rgba(255, 255, 255, 0.2)' 
            }}
          >
            {isProcessing ? (
              <CircularProgress size={18} color="inherit" />
            ) : isSuccess ? (
              <EmojiEmotionsIcon sx={{ fontSize: 18, color: 'white' }} /> // 成功理解用笑脸
            ) : (
              <SentimentDissatisfiedIcon sx={{ fontSize: 18, color: 'white' }} /> // 未理解用难过脸
            )}
          </Avatar>
          <Box sx={{ color: isSuccess ? '#4BB543' : 'white', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {isProcessing ? '正在处理...' : isSuccess ? '操作完成' : '理解失败'}
              </Typography>
              
              {/* 显示NLU结果标签（仅在理解成功时显示） */}
              {isSuccess && nlpResult && !isProcessing && (
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
                    {nlpResult.action !== "" ? `${nlpResult.action} ` : ""} 
                    {nlpResult.object !== "" ? nlpResult.object : ""} 
                    {nlpResult.location ? ` (${nlpResult.location})` : ""}
                  </Typography>
                </Box>
              )}
            </Box>
            <TypingAnimation text={resultText} />
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default ResponseDisplay; 