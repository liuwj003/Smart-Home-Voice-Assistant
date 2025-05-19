import React from 'react';
import { Box } from '@mui/material';
import '../MobileApp.css';

/**
 * Bezel - A device bezel component from Figma design
 * 
 * This component creates a realistic phone bezel container that wraps
 * the mobile content, including notch, buttons, and other hardware details.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to display within the bezel
 */
const Bezel = ({ children }) => {
  return (
    <Box className="device-bezel-container">
      {/* Device Frame */}
      <Box className="device-bezel">
        {/* Device Top */}
        <Box className="device-top">
          <Box className="device-notch">
            <Box className="device-camera" />
            <Box className="device-speaker" />
          </Box>
        </Box>
        
        {/* Device Sides */}
        <Box className="device-sides">
          <Box className="device-left-buttons">
            <Box className="device-silent-button"></Box>
            <Box className="device-volume-up"></Box>
            <Box className="device-volume-down"></Box>
          </Box>
          
          <Box className="device-content">
            {children}
          </Box>
          
          <Box className="device-right-buttons">
            <Box className="device-power-button"></Box>
          </Box>
        </Box>
        
        {/* Device Bottom */}
        <Box className="device-bottom">
          <Box className="device-port" />
        </Box>
      </Box>
    </Box>
  );
};

export default Bezel; 