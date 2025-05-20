import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

/**
 * A reusable typing animation component
 * 
 * @param {string} text - The text to animate
 * @param {number} speed - Speed of typing in milliseconds (default: 70)
 * @param {function} onComplete - Callback when animation completes
 * @param {object} typographyProps - Additional props to pass to Typography component
 * @returns {JSX.Element}
 */
const TypingAnimation = ({ text, speed = 70, onComplete, ...typographyProps }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timer);
    } else if (!isCompleted) {
      setIsCompleted(true);
      if (onComplete) onComplete();
    }
  }, [text, currentIndex, speed, isCompleted, onComplete]);

  return <Typography {...typographyProps}>{displayText}</Typography>;
};

export default TypingAnimation; 