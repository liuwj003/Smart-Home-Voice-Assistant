import React from 'react';
import { Typography, Paper, Grid } from '@mui/material';

const Weather = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        天气信息
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">当前天气</Typography>
            {/* 天气信息将在这里显示 */}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Weather; 