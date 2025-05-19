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
          {/* 主界面 - 使用Layout包装 */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* 手机端视图 - 使用Bezel组件包装 */}
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
          {/* 临时移除未实现的组件路由
          <Route path="/phone/weather" element={
            <Bezel>
              <MobileWeather />
            </Bezel>
          } />
          <Route path="/phone/settings" element={
            <Bezel>
              <MobileSettings />
            </Bezel>
          } />
          */}
        </Routes>
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App; 