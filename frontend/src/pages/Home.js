import React, { useState, useEffect } from 'react';
import { Typography, Grid, Paper } from '@mui/material';
import VoiceInput from '../components/VoiceInput';
import { deviceApi } from '../services/api';

const Home = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await deviceApi.getAllDevices();
        setDevices(response.data);
      } catch (error) {
        console.error('获取设备列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        智能家居控制面板
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">设备状态</Typography>
            {loading ? (
              <Typography>加载中...</Typography>
            ) : (
              devices.length > 0 ? (
                devices.map((device) => (
                  <div key={device.id}>
                    <Typography>{device.name}: {device.status ? '开启' : '关闭'}</Typography>
                  </div>
                ))
              ) : (
                <Typography>没有可用设备</Typography>
              )
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">语音控制</Typography>
            <VoiceInput />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Home; 