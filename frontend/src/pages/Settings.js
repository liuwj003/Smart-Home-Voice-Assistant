import React from 'react';
import { Typography, Paper, Grid, List, ListItem, ListItemText, Switch } from '@mui/material';

const Settings = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        系统设置
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>基本设置</Typography>
            <List>
              <ListItem>
                <ListItemText primary="语音识别" secondary="启用/禁用语音识别功能" />
                <Switch />
              </ListItem>
              <ListItem>
                <ListItemText primary="自动更新" secondary="自动检查并更新系统" />
                <Switch />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Settings; 