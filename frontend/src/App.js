import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Weather from './pages/Weather';
import Settings from './pages/Settings';
import MobileView from './pages/MobileView';

function App() {
  return (
    <Routes>
      {/* 移动应用视图 - 不使用Layout包装 */}
      <Route path="/mobile" element={<MobileView />} />
      
      {/* 标准Web视图 - 使用Layout包装 */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App; 