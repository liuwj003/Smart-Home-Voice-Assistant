import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Weather from './pages/Weather';
import Settings from './pages/Settings';
import MobileOnboarding from './pages/MobileOnboarding';
import MobilePhoneView from './pages/MobilePhoneView';
import Bezel from './components/Bezel';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <Routes>
          {/* Main layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* Mobile phone view */}
          <Route path="/phone" element={
            <Bezel>
              <MobileOnboarding />
            </Bezel>
          } />
          <Route path="/phone/home" element={
            <Bezel>
              <MobilePhoneView />
            </Bezel>
          } />
        </Routes>
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App; 