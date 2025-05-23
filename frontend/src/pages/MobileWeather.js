import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, IconButton, Divider, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import UmbrellaIcon from '@mui/icons-material/Umbrella';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WaterIcon from '@mui/icons-material/Water';
import AirIcon from '@mui/icons-material/Air';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NavigationIcon from '@mui/icons-material/Navigation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MobileContainer from '../components/MobileContainer';
import { useTheme } from '../contexts/ThemeContext';
import '../MobileApp.css';

/**
 * MobileWeather - 移动端天气页面
 * 采用iOS风格的设计，展示当前天气和未来几天预报
 */
const MobileWeather = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const { darkMode } = useTheme();
  const theme = darkMode ? 'dark' : 'light';

  // 加载天气数据
  useEffect(() => {
    // 模拟网络请求延迟
    const timer = setTimeout(() => {
      // 模拟天气数据 (实际项目中应从API获取)
      setWeatherData({
        location: '北京市',
        current: {
          temperature: 22,
          condition: 'sunny',
          humidity: 45,
          windSpeed: 3.2,
          windDirection: 'NE',
          feelsLike: 21,
          visibility: 10,
          uvIndex: 4,
          airQuality: '优',
          pressure: 1012,
        },
        hourly: [
          { time: '09:00', temp: 18, condition: 'sunny' },
          { time: '10:00', temp: 19, condition: 'sunny' },
          { time: '11:00', temp: 21, condition: 'sunny' },
          { time: '12:00', temp: 22, condition: 'sunny' },
          { time: '13:00', temp: 23, condition: 'cloudy' },
          { time: '14:00', temp: 23, condition: 'cloudy' },
          { time: '15:00', temp: 22, condition: 'cloudy' },
          { time: '16:00', temp: 21, condition: 'rainy' },
        ],
        forecast: [
          { day: '今天', high: 24, low: 18, condition: 'sunny' },
          { day: '明天', high: 23, low: 17, condition: 'cloudy' },
          { day: '周三', high: 21, low: 15, condition: 'rainy' },
          { day: '周四', high: 19, low: 14, condition: 'rainy' },
          { day: '周五', high: 20, low: 15, condition: 'cloudy' },
          { day: '周六', high: 22, low: 16, condition: 'sunny' },
          { day: '周日', high: 21, low: 15, condition: 'snowy' },
        ]
      });
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // 返回按钮点击事件
  const handleBackClick = () => {
    navigate(-1);
  };

  // 获取天气图标
  const getWeatherIcon = (condition, size = 'medium') => {
    const iconSize = size === 'large' ? { fontSize: 64 } : 
                    size === 'medium' ? { fontSize: 36 } : { fontSize: 20 };
                   
    const iconColor = condition === 'sunny' ? '#f9a825' : 
                    condition === 'cloudy' ? '#78909c' : 
                    condition === 'rainy' ? '#42a5f5' : 
                    condition === 'snowy' ? '#90caf9' : '#f5f5f5';
                   
    switch (condition) {
      case 'sunny':
        return <WbSunnyIcon sx={{ ...iconSize, color: iconColor }} />;
      case 'cloudy':
        return <CloudIcon sx={{ ...iconSize, color: iconColor }} />;
      case 'rainy':
        return <UmbrellaIcon sx={{ ...iconSize, color: iconColor }} />;
      case 'snowy':
        return <AcUnitIcon sx={{ ...iconSize, color: iconColor }} />;
      default:
        return <WbSunnyIcon sx={{ ...iconSize, color: '#f9a825' }} />;
    }
  };

  return (
    <MobileContainer title="Our Home">
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
        <IconButton edge="start" onClick={handleBackClick} aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>天气</Typography>
      </Box>
      
      <Box 
        className="ios-scrollable-content"
        sx={{ 
          pb: 5,
          height: 'auto',
          minHeight: '100%',
          '&::-webkit-scrollbar': { display: 'none' }
        }}
      >
        {loading ? (
          <WeatherSkeleton />
        ) : weatherData && (
          <>
            {/* 顶部主要天气信息 */}
            <Box 
              className="ios-section" 
              sx={{ 
                background: 'linear-gradient(to bottom, rgba(66, 165, 245, 0.1), rgba(66, 165, 245, 0))',
                pt: 2,
                pb: 3
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                textAlign: 'center',
                padding: '20px'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOnIcon sx={{ fontSize: 18, mr: 0.5, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight="500">
                    {weatherData.location}
                  </Typography>
                </Box>
                
                {getWeatherIcon(weatherData.current.condition, 'large')}
                
                <Typography variant="h2" component="div" sx={{ my: 1, fontWeight: '300', fontSize: '3.5rem' }}>
                  {weatherData.current.temperature}°
                </Typography>
                
                <Typography variant="subtitle1">
                  体感温度 {weatherData.current.feelsLike}°
                </Typography>
              </Box>

              {/* 当天高低温 */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  最高: {weatherData.forecast[0].high}°
                </Typography>
                <Box 
                  component="span" 
                  sx={{ 
                    display: 'inline-block', 
                    width: '4px', 
                    height: '4px', 
                    borderRadius: '50%',
                    backgroundColor: 'text.secondary',
                    mx: 1
                  }}
                />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  最低: {weatherData.forecast[0].low}°
                </Typography>
              </Box>

              {/* 主要天气指标 */}
              <Box sx={{ px: 3 }}>
                <Card elevation={0} sx={{ borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.7)' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <WaterIcon sx={{ mr: 1, color: '#42a5f5', fontSize: 18 }} />
                          <Typography variant="body2">
                            湿度: {weatherData.current.humidity}%
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AirIcon sx={{ mr: 1, color: '#78909c', fontSize: 18 }} />
                          <Typography variant="body2">
                            风速: {weatherData.current.windSpeed} m/s
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <NavigationIcon sx={{ mr: 1, color: '#78909c', fontSize: 18 }} />
                          <Typography variant="body2">
                            风向: {weatherData.current.windDirection}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <VisibilityIcon sx={{ mr: 1, color: '#90a4ae', fontSize: 18 }} />
                          <Typography variant="body2">
                            能见度: {weatherData.current.visibility} km
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* 逐小时预报 */}
            <Box className="ios-section" sx={{ mt: 2 }}>
              <Box className="ios-section-title">
                <Typography variant="h2" component="h2">今日预报</Typography>
              </Box>
              
              <Box sx={{ overflowX: 'auto', px: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  minWidth: weatherData.hourly.length * 70, 
                  pb: 1 
                }}>
                  {weatherData.hourly.map((hour, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        flex: '0 0 70px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        opacity: index === 0 ? 1 : 0.8
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {hour.time}
                      </Typography>
                      <Box sx={{ my: 1 }}>
                        {getWeatherIcon(hour.condition, 'small')}
                      </Box>
                      <Typography variant="body1" fontWeight="500">
                        {hour.temp}°
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* 未来几天预报 */}
            <Box className="ios-section" sx={{ mt: 2 }}>
              <Box className="ios-section-title">
                <Typography variant="h2" component="h2">7天预报</Typography>
              </Box>
              
              <Box sx={{ px: 2 }}>
                <Card elevation={0} sx={{ borderRadius: '16px' }}>
                  <CardContent sx={{ p: 0 }}>
                    {weatherData.forecast.map((day, index) => (
                      <React.Fragment key={index}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          p: 2
                        }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: '500',
                              width: '40px',
                              color: index === 0 ? 'primary.main' : 'inherit'
                            }}
                          >
                            {day.day}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            mr: 2
                          }}>
                            {getWeatherIcon(day.condition, 'small')}
                          </Box>
                          <Box sx={{ 
                            flex: 1,
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'flex-end'
                          }}>
                            <Typography sx={{ fontWeight: '500', mr: 1 }}>
                              {day.high}°
                            </Typography>
                            <Typography color="text.secondary">
                              {day.low}°
                            </Typography>
                          </Box>
                        </Box>
                        {index < weatherData.forecast.length - 1 && (
                          <Divider sx={{ mx: 2 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </MobileContainer>
  );
};

// 加载中骨架屏组件
const WeatherSkeleton = () => (
  <>
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Skeleton variant="circular" width={80} height={80} />
      <Skeleton variant="text" width={120} height={60} sx={{ my: 2 }} />
      <Skeleton variant="text" width={80} height={24} />
      <Skeleton variant="text" width={180} height={24} sx={{ mt: 1 }} />
      
      <Box sx={{ width: '100%', mt: 2 }}>
        <Skeleton variant="rounded" width="100%" height={100} />
      </Box>
    </Box>
    
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width={100} height={32} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'hidden' }}>
        {[...Array(6)].map((_, i) => (
          <Box key={i} sx={{ minWidth: 60 }}>
            <Skeleton variant="text" width={60} height={20} />
            <Skeleton variant="circular" width={40} height={40} sx={{ my: 1, mx: 'auto' }} />
            <Skeleton variant="text" width={30} height={20} sx={{ mx: 'auto' }} />
          </Box>
        ))}
      </Box>
    </Box>
    
    <Box sx={{ px: 3, mt: 2 }}>
      <Skeleton variant="text" width={100} height={32} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" width="100%" height={250} />
    </Box>
  </>
);

export default MobileWeather; 