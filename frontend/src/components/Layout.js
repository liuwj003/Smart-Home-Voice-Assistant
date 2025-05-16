import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Container, Button, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Settings as SettingsIcon } from '@mui/icons-material';

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ boxShadow: '0 1px 8px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>智能家居语音助手</Typography>
          <Button color="inherit" component={RouterLink} to="/">首页</Button>
          <Button color="inherit" component={RouterLink} to="/weather">天气</Button>
          <IconButton 
            color="inherit" 
            component={RouterLink} 
            to="/settings"
            sx={{ ml: 1 }}
          >
            <SettingsIcon />
          </IconButton>
          <Button color="inherit" component={RouterLink} to="/phone">手机端</Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout; 