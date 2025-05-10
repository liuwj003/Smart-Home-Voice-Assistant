import React from 'react';
import { Typography, Grid, Paper } from '@mui/material';

const Home = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        智能家居控制面板
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">设备状态</Typography>
            {/* 设备状态列表将在这里 */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">语音控制</Typography>
            {/* 语音控制界面将在这里 */}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Home; 