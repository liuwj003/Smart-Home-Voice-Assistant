import React, { useState } from 'react';
import { Typography, Box, Card, CardContent, CircularProgress, Grid, Divider } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import UmbrellaIcon from '@mui/icons-material/Umbrella';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WaterIcon from '@mui/icons-material/Water';
import AirIcon from '@mui/icons-material/Air';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NavigationIcon from '@mui/icons-material/Navigation';

// Debug logs
console.log('Weather component imported successfully');

const Weather = () => {
  const [loading] = useState(false);
  
  // Mock weather data
  const weatherData = {
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
    },
    forecast: [
      { day: '周一', high: 24, low: 18, condition: 'sunny' },
      { day: '周二', high: 23, low: 17, condition: 'cloudy' },
      { day: '周三', high: 21, low: 15, condition: 'rainy' },
      { day: '周四', high: 19, low: 14, condition: 'rainy' },
      { day: '周五', high: 20, low: 15, condition: 'cloudy' },
    ]
  };

  // Get weather icon based on condition
  const getWeatherIcon = (condition, size = 'medium') => {
    const iconSize = size === 'large' ? { fontSize: 80 } : 
                   size === 'medium' ? { fontSize: 40 } : { fontSize: 24 };
                   
    const iconColor = condition === 'sunny' ? '#f9a825' : 
                    condition === 'cloudy' ? '#78909c' : 
                    condition === 'rainy' ? '#42a5f5' : 
                    condition === 'snowy' ? '#90caf9' : '#f5f5f5';
                   
    switch (condition) {
      case 'sunny':
        return <WbSunnyIcon sx={{ ...iconSize, color: iconColor, animation: 'pulse 2s infinite ease-in-out' }} />;
      case 'cloudy':
        return <CloudIcon sx={{ ...iconSize, color: iconColor, animation: 'float 5s infinite ease-in-out' }} />;
      case 'rainy':
        return <UmbrellaIcon sx={{ ...iconSize, color: iconColor, animation: 'bounce 2s infinite ease-in-out' }} />;
      case 'snowy':
        return <AcUnitIcon sx={{ ...iconSize, color: iconColor, animation: 'fadeInOut 3s infinite ease-in-out' }} />;
      default:
        return <WbSunnyIcon sx={{ ...iconSize, color: '#f9a825' }} />;
    }
  };

  return (
    <Box>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3, 
          fontWeight: 500,
          fontFamily: 'Google Sans, Roboto, Arial, sans-serif'
        }}
      >
        天气预报
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Current Weather Card */}
          <Card 
            elevation={0}
            sx={{ 
              mb: 3, 
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid #e0e0e0',
              backgroundImage: 'linear-gradient(to bottom, #e8f0fe, #f1f6ff)',
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute', 
                top: '10px', 
                right: '10px',
                zIndex: 1,
                opacity: 0.2
              }}
            >
              {getWeatherIcon(weatherData.current.condition, 'large')}
            </Box>
            <CardContent sx={{ py: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Box sx={{ mr: 3, display: 'flex', alignItems: 'center' }}>
                  {getWeatherIcon(weatherData.current.condition, 'medium')}
                </Box>
                <Box>
                  <Typography variant="h3" fontWeight={500} sx={{ mb: 0 }}>
                    {weatherData.current.temperature}°
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    {weatherData.location}
                    <Box 
                      component="span" 
                      sx={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        ml: 1,
                        '&::before': {
                          content: '""',
                          display: 'inline-block',
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          backgroundColor: 'text.secondary',
                          mr: 1
                        }
                      }}
                    >
                      体感温度 {weatherData.current.feelsLike}°
                    </Box>
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Weather Details */}
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WaterIcon sx={{ mr: 1, color: '#42a5f5', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      湿度: {weatherData.current.humidity}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AirIcon sx={{ mr: 1, color: '#78909c', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      风速: {weatherData.current.windSpeed} m/s
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NavigationIcon sx={{ mr: 1, color: '#78909c', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      风向: {weatherData.current.windDirection}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <VisibilityIcon sx={{ mr: 1, color: '#90a4ae', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      能见度: {weatherData.current.visibility} km
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Forecast */}
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              fontWeight: 500,
              fontFamily: 'Google Sans, Roboto, Arial, sans-serif' 
            }}
          >
            未来几天
          </Typography>
          
          <Card
            elevation={0}
            sx={{ 
              borderRadius: '12px',
              border: '1px solid #e0e0e0'
            }}
          >
            <CardContent sx={{ px: 2, py: 1 }}>
              <Grid container>
                {weatherData.forecast.map((day, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        py: 1
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            width: '80px'
                          }}
                        >
                          {day.day}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getWeatherIcon(day.condition, 'small')}
                        </Box>
                        <Box sx={{ 
                          flexGrow: 1, 
                          display: 'flex', 
                          justifyContent: 'flex-end',
                          alignItems: 'center'
                        }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ mr: 1 }}
                          >
                            {day.low}°
                          </Typography>
                          <Box 
                            sx={{ 
                              width: '60px', 
                              height: '4px', 
                              backgroundColor: '#e0e0e0', 
                              borderRadius: '4px',
                              position: 'relative',
                              mx: 1
                            }}
                          >
                            <Box 
                              sx={{ 
                                position: 'absolute',
                                height: '100%',
                                left: '0',
                                width: '60%',
                                backgroundColor: day.condition === 'sunny' ? '#f9a825' : 
                                  day.condition === 'cloudy' ? '#78909c' : 
                                  day.condition === 'rainy' ? '#42a5f5' : '#90caf9',
                                borderRadius: '4px'
                              }}
                            />
                          </Box>
                          <Typography variant="body2">
                            {day.high}°
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </React.Fragment>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Add the weather animation keyframes */}
          <style jsx="true">{`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.9; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
              100% { transform: translateY(0px); }
            }
            @keyframes bounce {
              0% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
              100% { transform: translateY(0); }
            }
            @keyframes fadeInOut {
              0% { opacity: 0.7; }
              50% { opacity: 1; }
              100% { opacity: 0.7; }
            }
          `}</style>
        </>
      )}
    </Box>
  );
};

export default Weather; 