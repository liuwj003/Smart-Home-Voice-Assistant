import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Container, Button, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import SmartphoneIcon from '@mui/icons-material/Smartphone';

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="static" 
        sx={{ 
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
          backgroundColor: '#FFFFFF',
          color: '#5f6368'
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: '500', 
              fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
              color: '#1a73e8'
            }}
          >
            智能家居语音助手
          </Typography>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
            startIcon={<HomeIcon />}
            sx={{ 
              mx: 1, 
              textTransform: 'none', 
              fontWeight: '500',
              fontSize: '0.9rem',
              '&:hover': {
                backgroundColor: 'rgba(26, 115, 232, 0.04)',
                color: '#1a73e8'
              }
            }}
          >
            主界面
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/phone"
            startIcon={<SmartphoneIcon />}
            sx={{ 
              ml: 1, 
              textTransform: 'none', 
              fontWeight: '500',
              fontSize: '0.9rem',
              '&:hover': {
                backgroundColor: 'rgba(26, 115, 232, 0.04)',
                color: '#1a73e8'
              }
            }}
          >
            手机端演示
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout; 