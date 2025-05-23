import { useState, useRef } from 'react';

/**
 * 自定义Hook处理下拉刷新功能
 * 
 * @param {Function} onRefresh - 刷新时执行的回调函数
 * @param {Number} threshold - 触发刷新所需的拉动距离，默认为80
 * @returns {Object} - 包含刷新状态和相关处理函数
 */
const usePullToRefresh = (onRefresh, threshold = 80) => {
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const contentRef = useRef(null);
  const refreshIndicatorRef = useRef(null);

  // 刷新数据函数
  const refreshData = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('刷新数据失败', error);
    } finally {
      setRefreshing(false);
      setPullDistance(0);
    }
  };
  
  // 触摸开始事件
  const handleTouchStart = (e) => {
    if (contentRef.current && contentRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };
  
  // 触摸移动事件
  const handleTouchMove = (e) => {
    if (touchStartY.current === 0 || refreshing) return;
    
    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStartY.current;
    
    // 仅当在内容顶部并且下拉时激活
    if (distance > 0 && contentRef.current && contentRef.current.scrollTop === 0) {
      // 使用阻力系数使下拉感觉更自然
      const newPullDistance = Math.min(distance * 0.5, threshold * 1.5);
      setPullDistance(newPullDistance);
      
      // 防止下拉时的默认滚动行为
      e.preventDefault();
    }
  };
  
  // 触摸结束事件
  const handleTouchEnd = () => {
    if (pullDistance > threshold && !refreshing) {
      refreshData();
    } else {
      setPullDistance(0);
    }
    touchStartY.current = 0;
  };

  return {
    refreshing,
    pullDistance,
    contentRef,
    refreshIndicatorRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    threshold
  };
};

export default usePullToRefresh; 