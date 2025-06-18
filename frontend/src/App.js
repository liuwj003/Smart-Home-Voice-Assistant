import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MobileOnboarding from './pages/MobileOnboarding';
import MobilePhoneView from './pages/MobilePhoneView';
import MobileSettings from './pages/MobileSettings';
import MobileWeather from './pages/MobileWeather';
import Bezel from './components/Bezel';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <Routes>
          {/* 主页 */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
          </Route>
          
          {/* 手机视图 */}
          <Route path="/phone" element={
            <Bezel>
              <MobileOnboarding />
            </Bezel>
          } />
          <Route path="/mobile" element={
            <Bezel>
              <MobilePhoneView />
            </Bezel>
          } />
          <Route path="/phone/home" element={
            <Bezel>
              <MobilePhoneView />
            </Bezel>
          } />
          <Route path="/phone/settings" element={
            <Bezel>
              <MobileSettings />
            </Bezel>
          } />
          <Route path="/phone/weather" element={
            <Bezel>
              <MobileWeather />
            </Bezel>
          } />
        </Routes>
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App; 