import LightIcon from '@mui/icons-material/Light';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WifiIcon from '@mui/icons-material/Wifi';
import LivingIcon from '@mui/icons-material/Weekend';
import KitchenIcon from '@mui/icons-material/Kitchen';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import React from 'react';

// 每个房间设备数据
export const roomDevices = {
  living: [
    {
      id: 'light1',
      title: '客厅灯',
      subtitle: '开',
      icon: <LightIcon />,
      active: true
    },
    {
      id: 'ac1',
      title: '客厅空调',
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
    },
    {
      id: 'light2',
      title: '茶几灯',
      subtitle: '关',
      icon: <LightIcon />,
      active: false
    }
  ],
  kitchen: [
    {
      id: 'light3',
      title: '厨房吊灯',
      subtitle: '关',
      icon: <LightIcon />,
      active: false
    },
    {
      id: 'light4',
      title: '橱柜灯',
      subtitle: '关',
      icon: <LightIcon />,
      active: false
    },
    {
      id: 'ac2',
      title: '排风扇',
      subtitle: '关',
      icon: <ThermostatIcon />,
      active: false
    }
  ],
  bedroom: [
    {
      id: 'light5',
      title: '卧室灯',
      subtitle: '关',
      icon: <LightIcon />,
      active: false
    },
    {
      id: 'ac3',
      title: '卧室空调',
      subtitle: '26°C',
      icon: <ThermostatIcon />,
      active: true
    },
    {
      id: 'light6',
      title: '床头灯',
      subtitle: '关',
      icon: <LightIcon />,
      active: false
    },
    {
      id: 'light7',
      title: '阅读灯',
      subtitle: '关',
      icon: <LightIcon />,
      active: false
    },
    {
      id: 'light8',
      title: '衣柜灯',
      subtitle: '关',
      icon: <LightIcon />,
      active: false
    }
  ],
  bathroom: [
    {
      id: 'light9',
      title: '浴室灯',
      subtitle: '关',
      icon: <LightIcon />,
      active: false
    },
    {
      id: 'ac4',
      title: '浴霸',
      subtitle: '关',
      icon: <ThermostatIcon />,
      active: false
    }
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