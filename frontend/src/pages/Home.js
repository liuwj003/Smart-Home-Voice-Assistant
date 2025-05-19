import React, { useState, useEffect, useRef } from 'react';
import { 
  Typography, 
  Box,
  Paper,
  Card, 
  CardContent, 
  CardActions,
  Button,
  Container,
  Grid,
  useTheme,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MicIcon from '@mui/icons-material/Mic';
import HomeIcon from '@mui/icons-material/Home';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { voiceApi } from '../services/api';

// Typing animation component
const TypingAnimation = ({ text, speed = 70, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timer);
    } else if (!isCompleted) {
      setIsCompleted(true);
      if (onComplete) onComplete();
    }
  }, [text, currentIndex, speed, isCompleted, onComplete]);

  return <Typography variant="body1">{displayText}</Typography>;
};

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [animationState, setAnimationState] = useState('input'); // 'input', 'processing', 'response'
  const [showResponseText, setShowResponseText] = useState(false);
  const animationRef = useRef(null);

  // Start the animation loop
  useEffect(() => {
    startAnimationSequence();
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  const startAnimationSequence = () => {
    // Reset animation state
    setAnimationState('input');
    setShowResponseText(false);
    
    // Start animation cycle again after completion
    animationRef.current = setTimeout(() => {
      startAnimationSequence();
    }, 15000); // Restart every 15 seconds
  };

  const handleInputComplete = () => {
    setAnimationState('processing');
    setTimeout(() => {
      setAnimationState('response');
    }, 1500); // Simulate processing delay
  };

  const handleResponseComplete = () => {
    // Animation completed, wait before restarting
  };

  const handleDirectExperience = () => {
    navigate('/phone');
  };

  const handleDeepseekService = () => {
    // This would integrate with the future deepseek API
    alert('DeepSeek服务尚未开放，敬请期待！');
  };

  return (
    <Container maxWidth="lg">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          mb: 6,
          mt: 2
        }}
      >
        {/* Logo */}
        <Avatar 
          sx={{ 
            width: 120, 
            height: 120, 
            backgroundColor: '#e8f0fe',
            mb: 2
          }}
        >
          <HomeIcon 
            sx={{ 
              fontSize: 80, 
              color: '#1a73e8'
            }} 
          />
        </Avatar>
        
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
            fontWeight: 500,
            color: '#202124',
            mb: 4
          }}
        >
          智能家居语音助手
        </Typography>

        {/* Main Conversation Demo */}
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 800,
            p: 3,
            mb: 4,
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            backgroundColor: '#f8f9fa'
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start' }}>
            <Avatar 
              sx={{ 
                mr: 2, 
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0'
              }}
            >
              <Typography variant="body2" sx={{ color: '#5f6368' }}>你</Typography>
            </Avatar>
            <Box>
              {animationState === 'input' && (
                <TypingAnimation 
                  text="客厅太冷了。" 
                  onComplete={handleInputComplete}
                />
              )}
              {animationState !== 'input' && (
                <Typography variant="body1">客厅太冷了。</Typography>
              )}
              {animationState === 'processing' && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <MicIcon 
                    sx={{ 
                      fontSize: 18, 
                      color: '#ea4335',
                      mr: 1,
                      animation: 'pulse 1.5s infinite'
                    }} 
                  />
                  <Typography variant="body2" color="textSecondary">
                    正在处理语音...
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {animationState === 'response' && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-start' }}>
              <Avatar 
                sx={{ 
                  mr: 2, 
                  backgroundColor: 'rgba(255, 215, 0, 0.2)'
                }}
              >
                <SmartToyIcon sx={{ color: 'gold' }} />
              </Avatar>
              <Box>
                <TypingAnimation 
                  text="好的，正在为您调低客厅空调温度。" 
                  onComplete={handleResponseComplete}
                />
              </Box>
            </Box>
          )}
        </Paper>

        {/* Service Cards */}
        <Grid container spacing={3} justifyContent="center">
          {/* DeepSeek Card */}
          <Grid item xs={12} sm={6} md={5}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      backgroundColor: '#e8f0fe',
                      mr: 2
                    }}
                  >
                    <SmartToyIcon sx={{ color: '#1a73e8' }} />
                  </Avatar>
                  <Typography 
                    variant="h6" 
                    component="h2"
                    sx={{
                      fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
                      fontWeight: 500
                    }}
                  >
                    接入 DeepSeek
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  color="textSecondary"
                  sx={{ mb: 2 }}
                >
                  希望接入 DeepSeek，使用更智能的服务，体验更先进的语音识别和自然语言处理能力，让您的智能家居更具智慧。
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="outlined"
                  startIcon={<LocalAtmIcon />}
                  onClick={handleDeepseekService}
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    color: '#1a73e8',
                    borderColor: '#1a73e8',
                    '&:hover': {
                      backgroundColor: 'rgba(26, 115, 232, 0.04)',
                      borderColor: '#1a73e8'
                    }
                  }}
                >
                  支付 0.001 元，启动
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Direct Experience Card */}
          <Grid item xs={12} sm={6} md={5}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      backgroundColor: 'rgba(255, 215, 0, 0.2)',
                      mr: 2
                    }}
                  >
                    <SmartToyIcon sx={{ color: 'gold' }} />
                  </Avatar>
                  <Typography 
                    variant="h6" 
                    component="h2"
                    sx={{
                      fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
                      fontWeight: 500
                    }}
                  >
                    直接体验
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  color="textSecondary"
                  sx={{ mb: 2 }}
                >
                  我希望立即体验智能家居语音助手的功能，通过语音或文本发送指令，控制家中的各种智能设备，让生活更加便捷。
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  startIcon={<SmartToyIcon />}
                  onClick={handleDirectExperience}
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    backgroundColor: 'rgb(218, 165, 32)',
                    '&:hover': {
                      backgroundColor: 'rgb(184, 134, 11)'
                    }
                  }}
                >
                  直接启动
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Add global animations */}
      <style jsx="true">{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </Container>
  );
};

export default Home; 