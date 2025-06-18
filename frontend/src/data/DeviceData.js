import LightIcon from '@mui/icons-material/Light';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WifiIcon from '@mui/icons-material/Wifi';
import LivingIcon from '@mui/icons-material/Weekend';
import KitchenIcon from '@mui/icons-material/Kitchen';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import React from 'react';

// 存储从API获取的设备数据
let _apiDeviceData = [];

// 获取API数据
export const getApiDeviceData = () => _apiDeviceData;

// 更新API数据
export const updateApiDeviceData = (data) => {
  _apiDeviceData = data;
};

// 清空所有房间的设备
export const clearRoomDevices = () => {
  roomDevices.living = [];
  roomDevices.kitchen = [];
  roomDevices.bedroom = [];
  roomDevices.bathroom = [];
  
  // 更新场景中的设备数量
  scenes.forEach(scene => {
    scene.devices = 0;
  });
  
  console.log('所有房间设备已清空');
};

// 处理API数据并更新到roomDevices
export const processApiData = (data) => {
  console.log('processApiData被调用，数据:', data);
  
  if (!data || !Array.isArray(data)) {
    console.error('processApiData: 数据无效或不是数组');
    return;
  }

  console.log('开始处理设备数据，设备数量:', data.length);

  data.forEach((device, index) => {
    console.log(`处理第${index + 1}个设备:`, device);
    
    // 根据设备名称选择图标
    const getDeviceIcon = (deviceName) => {
      if (deviceName.toLowerCase().includes('灯')) {
        return <LightIcon />;
      } else if (deviceName.toLowerCase().includes('路由器')) {
        return <WifiIcon />;
      } else {
        return <ThermostatIcon />;
      }
    };

    const deviceObj = {
      id: device.id || `device_${Math.random().toString(36).substr(2, 9)}`,
      title: `${device.id || '未知ID'}-${device.name}`,
      subtitle: device.data || '',
      icon: getDeviceIcon(device.name),
      active: device.state === 1
    };

    // 打印每个处理后的设备对象
    console.log('处理后的设备对象:', deviceObj);

    // 根据roomName分配到对应房间
    switch(device.roomName) {
      case 'living':
      case '客厅':
        console.log('添加到客厅');
        roomDevices.living.push(deviceObj);
        break;
      case 'bedroom':
      case '卧室':
        console.log('添加到卧室');
        roomDevices.bedroom.push(deviceObj);
        break;
      case 'kitchen':
      case '厨房':
        console.log('添加到厨房');
        roomDevices.kitchen.push(deviceObj);
        break;
      case 'bathroom':
      case '浴室':
        console.log('添加到浴室');
        roomDevices.bathroom.push(deviceObj);
        break;
      default:
        console.log('未知房间类型:', device.roomName);
        break;
    }
  });

  // 更新scenes中的设备数量
  scenes.forEach(scene => {
    scene.devices = roomDevices[scene.id].length;
  });

  console.log('所有设备处理完成，当前房间设备数量:', {
    living: roomDevices.living.length,
    bedroom: roomDevices.bedroom.length,
    kitchen: roomDevices.kitchen.length,
    bathroom: roomDevices.bathroom.length
  });
};

export const roomDevices = {
  living: [
    
  ],
  kitchen: [

  ],
  bedroom: [
    
  ],
  bathroom: [
  
  ]
};

// 房间场景数据
export const scenes = [
  {
    id: 'living',
    title: '客厅',
    icon: <LivingIcon />,
    devices: roomDevices.living.length,
    image: '/images/living.jpg'
  },
  {
    id: 'kitchen',
    title: '厨房',
    icon: <KitchenIcon />,
    devices: roomDevices.kitchen.length,
    image: '/images/kitchen.jpg'
  },
  {
    id: 'bedroom',
    title: '卧室',
    icon: <BedIcon />,
    devices: roomDevices.bedroom.length,
    image: '/images/bedroom.jpg'
  },
  {
    id: 'bathroom',
    title: '浴室',
    icon: <BathtubIcon />,
    devices: roomDevices.bathroom.length,
    image: '/images/bathroom.jpg'
  }
];

// 收藏设备数据
export const favoriteDevices = [
  {
    id: 'light1',
    title: '客厅灯',
    subtitle: '开',
    icon: <LightIcon />,
    active: true
  },
  {
    id: 'ac1',
    title: '空调',
    subtitle: '27°C',
    icon: <ThermostatIcon />,
    active: false
  },
  {
    id: 'wifi1',
    title: 'WiFi',
    subtitle: '已连接',
    icon: <WifiIcon />,
    active: false
  }
]; 