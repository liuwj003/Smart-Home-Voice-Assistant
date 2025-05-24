import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  IconButton, 
  Divider, 
  Skeleton,
  Tabs,
  Tab,
  Paper,
  LinearProgress
} from '@mui/material';
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
import RefreshIcon from '@mui/icons-material/Refresh';
import OpacityIcon from '@mui/icons-material/Opacity';
import CompressIcon from '@mui/icons-material/Compress';
import MobileContainer from '../components/MobileContainer';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import '../MobileApp.css';

/**
 * MobileWeather - 移动端天气页面
 * 采用iOS风格的设计，展示当前天气和未来几天预报
 */
const MobileWeather = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const { darkMode } = useTheme();
  const theme = darkMode ? 'dark' : 'light';

  // 加载天气数据
  const fetchWeatherData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // 实际项目中应调用API获取数据
      // const response = await api.getWeatherData();
      // setWeatherData(response.data);
      
      // 模拟网络请求延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟天气数据
      setWeatherData({
        location: '北京市',
        updateTime: '更新于 ' + new Date().toLocaleTimeString(),
        current: {
          temperature: 22,
          condition: 'sunny',
          humidity: 45,
          windSpeed: 3.2,
          windDirection: 'NE',
          feelsLike: 21,
          visibility: 10,
          uvIndex: 4,
          airQuality: {
            level: '优',
            pm25: 15,
            pm10: 28,
            o3: 35,
          },
          pressure: 1012,
          precipitation: 0,
        },
        hourly: [
          { time: '09:00', temp: 18, condition: 'sunny', precipitation: 0 },
          { time: '10:00', temp: 19, condition: 'sunny', precipitation: 0 },
          { time: '11:00', temp: 21, condition: 'sunny', precipitation: 0 },
          { time: '12:00', temp: 22, condition: 'sunny', precipitation: 0 },
          { time: '13:00', temp: 23, condition: 'cloudy', precipitation: 0 },
          { time: '14:00', temp: 23, condition: 'cloudy', precipitation: 0 },
          { time: '15:00', temp: 22, condition: 'cloudy', precipitation: 10 },
          { time: '16:00', temp: 21, condition: 'rainy', precipitation: 30 },
          { time: '17:00', temp: 20, condition: 'rainy', precipitation: 40 },
          { time: '18:00', temp: 19, condition: 'rainy', precipitation: 35 },
          { time: '19:00', temp: 18, condition: 'cloudy', precipitation: 20 },
          { time: '20:00', temp: 17, condition: 'cloudy', precipitation: 10 },
        ],
        forecast: [
          { day: '今天', high: 24, low: 18, condition: 'sunny', precipitation: 0 },
          { day: '明天', high: 23, low: 17, condition: 'cloudy', precipitation: 20 },
          { day: '周三', high: 21, low: 15, condition: 'rainy', precipitation: 60 },
          { day: '周四', high: 19, low: 14, condition: 'rainy', precipitation: 70 },
          { day: '周五', high: 20, low: 15, condition: 'cloudy', precipitation: 30 },
          { day: '周六', high: 22, low: 16, condition: 'sunny', precipitation: 10 },
          { day: '周日', high: 21, low: 15, condition: 'snowy', precipitation: 40 },
        ]
      });
    } catch (error) {
      console.error("获取天气数据失败:", error);
      // 可以添加错误提示
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    fetchWeatherData();
  }, []);

  // 返回按钮点击事件
  const handleBackClick = () => {
    navigate(-1);
  };

  // 刷新按钮点击事件
  const handleRefreshClick = () => {
    fetchWeatherData(true);
  };

  // 标签页切换事件
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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

  // 获取降水概率颜色
  const getPrecipitationColor = (probability) => {
    if (probability === 0) return '#e0e0e0';
    if (probability < 30) return '#81d4fa';
    if (probability < 60) return '#29b6f6';
    return '#0288d1';
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
        <IconButton edge="end" onClick={handleRefreshClick} disabled={refreshing} aria-label="refresh">
          <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </IconButton>
      </Box>
      
      {refreshing && <LinearProgress color="primary" sx={{ height: 2 }} />}
      
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
                background: theme === 'dark' 
                  ? 'linear-gradient(to bottom, rgba(30, 60, 90, 0.3), rgba(30, 40, 60, 0.1))' 
                  : 'linear-gradient(to bottom, rgba(66, 165, 245, 0.1), rgba(66, 165, 245, 0))',
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
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {weatherData.updateTime}
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
                <Card elevation={0} sx={{ 
                  borderRadius: '16px', 
                  bgcolor: theme === 'dark' 
                    ? 'rgba(30, 40, 60, 0.6)' 
                    : 'rgba(255, 255, 255, 0.7)'
                }}>
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
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <OpacityIcon sx={{ mr: 1, color: '#29b6f6', fontSize: 18 }} />
                          <Typography variant="body2">
                            降水: {weatherData.current.precipitation} mm
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CompressIcon sx={{ mr: 1, color: '#9e9e9e', fontSize: 18 }} />
                          <Typography variant="body2">
                            气压: {weatherData.current.pressure} hPa
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* 标签页导航 */}
            <Paper sx={{ 
              position: 'sticky', 
              top: 56, 
              zIndex: 9,
              borderRadius: 0,
              boxShadow: 'none',
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: theme === 'dark' ? '#121212' : '#fff'
            }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    minHeight: '48px',
                    fontWeight: 500
                  }
                }}
              >
                <Tab label="24小时" />
                <Tab label="7天" />
                <Tab label="空气质量" />
              </Tabs>
            </Paper>

            {/* 内容区域 */}
            <Box sx={{ pt: 2 }}>
              {/* 24小时预报 */}
              {tabValue === 0 && (
                <Box sx={{ px: 2 }}>
                  <Box sx={{ overflowX: 'auto', py: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      minWidth: weatherData.hourly.length * 80,
                      pb: 1 
                    }}>
                      {weatherData.hourly.map((hour, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            width: 80,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {hour.time}
                          </Typography>
                          {getWeatherIcon(hour.condition, 'small')}
                          <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
                            {hour.temp}°
                          </Typography>
                          <Box sx={{ 
                            width: '100%', 
                            mt: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {hour.precipitation > 0 && (
                              <>
                                <OpacityIcon sx={{ 
                                  fontSize: 14, 
                                  mr: 0.5, 
                                  color: getPrecipitationColor(hour.precipitation)
                                }} />
                                <Typography variant="caption" sx={{ 
                                  color: getPrecipitationColor(hour.precipitation)
                                }}>
                                  {hour.precipitation}%
                                </Typography>
                              </>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* 7天预报 */}
              {tabValue === 1 && (
                <Box sx={{ px: 2 }}>
                  {weatherData.forecast.map((day, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        py: 2,
                        borderBottom: index < weatherData.forecast.length - 1 ? 1 : 0,
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ width: '25%' }}>
                        <Typography variant="body1" sx={{ fontWeight: index === 0 ? 'bold' : 'normal' }}>
                          {day.day}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        width: '20%',
                        justifyContent: 'center'
                      }}>
                        {getWeatherIcon(day.condition, 'small')}
                        {day.precipitation > 0 && (
                          <Typography 
                            variant="caption" 
                            sx={{ ml: 1, color: getPrecipitationColor(day.precipitation) }}
                          >
                            {day.precipitation}%
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ 
                        width: '55%', 
                        display: 'flex', 
                        alignItems: 'center'
                      }}>
                        <Typography variant="body2" color="text.secondary" sx={{ width: 30 }}>
                          {day.low}°
                        </Typography>
                        <Box sx={{ 
                          mx: 1, 
                          flex: 1, 
                          display: 'flex', 
                          alignItems: 'center'
                        }}>
                          <Box sx={{ 
                            height: 4, 
                            bgcolor: theme === 'dark' 
                              ? 'linear-gradient(to right, #90caf9, #f44336)' 
                              : 'linear-gradient(to right, #42a5f5, #f9a825)',
                            width: '100%',
                            borderRadius: 2
                          }} />
                        </Box>
                        <Typography variant="body2" sx={{ width: 30 }}>
                          {day.high}°
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              {/* 空气质量 */}
              {tabValue === 2 && (
                <Box sx={{ px: 3, pt: 2 }}>
                  <Card elevation={0} sx={{ 
                    borderRadius: '16px',
                    bgcolor: theme === 'dark' ? 'rgba(30, 40, 60, 0.6)' : 'rgba(66, 165, 245, 0.05)',
                    mb: 3
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>空气质量指数</Typography>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2
                      }}>
                        <Typography variant="h3" sx={{ 
                          fontWeight: 'bold',
                          color: weatherData.current.airQuality.level === '优' ? '#4caf50' :
                                weatherData.current.airQuality.level === '良' ? '#8bc34a' :
                                weatherData.current.airQuality.level === '轻度污染' ? '#ffc107' :
                                weatherData.current.airQuality.level === '中度污染' ? '#ff9800' : '#f44336'
                        }}>
                          {weatherData.current.airQuality.level}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">PM2.5</Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            mt: 1
                          }}>
                            <Typography variant="body1" fontWeight="bold">
                              {weatherData.current.airQuality.pm25} μg/m³
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">PM10</Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            mt: 1
                          }}>
                            <Typography variant="body1" fontWeight="bold">
                              {weatherData.current.airQuality.pm10} μg/m³
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">臭氧 (O₃)</Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          mt: 1
                        }}>
                          <Typography variant="body1" fontWeight="bold">
                            {weatherData.current.airQuality.o3} μg/m³
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 3, px: 1 }}>
                    空气质量数据来源于环境监测站，每小时更新一次。空气质量良好时，可以正常进行户外活动。
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>
    </MobileContainer>
  );
};

// 加载状态的骨架屏
const WeatherSkeleton = () => (
  <Box sx={{ p: 3 }}>
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      textAlign: 'center',
      mb: 4
    }}>
      <Skeleton variant="circular" width={64} height={64} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width={120} height={60} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={100} />
    </Box>
    
    <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2, mb: 3 }} />
    
    <Typography variant="subtitle1" sx={{ mb: 2 }}>
      <Skeleton width={120} />
    </Typography>
    
    <Box sx={{ 
      display: 'flex', 
      overflowX: 'hidden',
      mb: 4
    }}>
      {[1, 2, 3, 4, 5].map((item) => (
        <Box 
          key={item} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            mr: 2,
            width: 60
          }}
        >
          <Skeleton variant="text" width={40} />
          <Skeleton variant="circular" width={40} height={40} sx={{ my: 1 }} />
          <Skeleton variant="text" width={30} />
        </Box>
      ))}
    </Box>
    
    <Typography variant="subtitle1" sx={{ mb: 2 }}>
      <Skeleton width={80} />
    </Typography>
    
    {[1, 2, 3, 4].map((item) => (
      <Box 
        key={item} 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Skeleton variant="text" width={60} />
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="rectangular" width={120} height={16} sx={{ borderRadius: 1 }} />
      </Box>
    ))}
  </Box>
);

export default MobileWeather;

// 添加动画帧
const styles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// 将样式添加到文档
if (!document.querySelector('style#weather-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'weather-styles';
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
} 