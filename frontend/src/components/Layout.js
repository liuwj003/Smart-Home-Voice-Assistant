import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>智能家居语音助手</Typography>
          <Button color="inherit" component={RouterLink} to="/">首页</Button>
          <Button color="inherit" component={RouterLink} to="/weather">天气</Button>
          <Button color="inherit" component={RouterLink} to="/settings">设置</Button>
          <Button color="inherit" component={RouterLink} to="/mobile">移动视图</Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout; 