import React from 'react';
import { Box, TextField, Button, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';

/**
 * 语音输入组件 - 处理语音和文本输入
 * 
 * @param {Object} props
 * @param {String} props.textCommand - 文本命令内容
 * @param {Function} props.onTextChange - 文本变化处理函数
 * @param {Boolean} props.isProcessing - 是否正在处理命令
 * @param {Boolean} props.isListening - 是否正在监听语音
 * @param {Function} props.onSendText - 发送文本命令处理函数
 * @param {Function} props.onVoiceCommand - 语音命令处理函数
 * @returns {JSX.Element}
 */
const VoiceInputSection = ({
  textCommand,
  onTextChange,
  isProcessing,
  isListening,
  onSendText,
  onVoiceCommand
}) => {
  return (
    <Box className="ios-section">
      <Box sx={{ padding: '0 20px', mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="输入命令，例如：打开客厅灯"
            variant="outlined"
            value={textCommand}
            onChange={(e) => onTextChange(e.target.value)}
            disabled={isProcessing}
            onKeyPress={(e) => e.key === 'Enter' && onSendText()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={onSendText}
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
          onClick={onVoiceCommand}
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
    </Box>
  );
};

export default VoiceInputSection; 