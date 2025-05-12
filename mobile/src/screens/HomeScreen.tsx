import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AudioRecord from 'react-native-audio-record';
import RNFS from 'react-native-fs';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const API_BASE_URL = 'http://localhost:5000/api';

const HomeScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [devices, setDevices] = useState([
    { id: 'light_1', name: '客厅灯', type: 'light', status: false },
    { id: 'ac_1', name: '空调', type: 'ac', status: false, temperature: 26 },
    { id: 'tv_1', name: '电视', type: 'tv', status: false },
    { id: 'curtain_1', name: '窗帘', type: 'curtain', status: false },
  ]);

  const navigation = useNavigation();

  useEffect(() => {
    // 初始化音频录制
    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: AudioRecord.AUDIO_SOURCE_MIC,
      wavFile: 'recording.wav',
    };

    AudioRecord.init(options);

    return () => {
      AudioRecord.stop();
    };
  }, []);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      await AudioRecord.start();
      
      // 开始监听
      await axios.post(`${API_BASE_URL}/start_listening`);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('错误', '无法开始录音');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      const audioFile = await AudioRecord.stop();
      setIsRecording(false);
      
      // 停止监听
      await axios.post(`${API_BASE_URL}/stop_listening`);
      
      // 处理录音文件
      const audioData = await RNFS.readFile(audioFile, 'base64');
      const formData = new FormData();
      formData.append('audio', {
        uri: `file://${audioFile}`,
        type: 'audio/wav',
        name: 'recording.wav',
      });

      // 发送音频数据到服务器
      const response = await axios.post(`${API_BASE_URL}/process_audio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        handleCommand(response.data.data);
      }

      // 删除临时文件
      await RNFS.unlink(audioFile);
    } catch (error) {
      console.error('Error processing recording:', error);
      Alert.alert('错误', '处理录音时出错');
    }
  };

  const handleCommand = (command: any) => {
    if (!command || command.intent === 'UNKNOWN') {
      Alert.alert('提示', '未能识别命令');
      return;
    }

    const { intent, entities } = command;
    
    switch (intent) {
      case 'DEVICE_CONTROL':
        handleDeviceControl(entities);
        break;
      case 'SET_PARAMETER':
        handleParameterSetting(entities);
        break;
      case 'ADJUST_PARAMETER':
        handleParameterAdjustment(entities);
        break;
      case 'QUERY_WEATHER':
        handleWeatherQuery(entities);
        break;
      default:
        Alert.alert('提示', '不支持的命令类型');
    }
  };

  const handleDeviceControl = (entities: any) => {
    const { device_id, action } = entities;
    if (!device_id || !action) return;

    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.id === device_id
          ? { ...device, status: action === 'ON' }
          : device
      )
    );

    Alert.alert('成功', `已${action === 'ON' ? '开启' : '关闭'}${getDeviceName(device_id)}`);
  };

  const handleParameterSetting = (entities: any) => {
    const { device_id, parameter, value } = entities;
    if (!device_id || !parameter || value === undefined) return;

    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.id === device_id
          ? { ...device, [parameter.toLowerCase()]: value }
          : device
      )
    );

    Alert.alert('成功', `已将${getDeviceName(device_id)}的${parameter}设置为${value}`);
  };

  const handleParameterAdjustment = (entities: any) => {
    const { device_id, parameter, direction } = entities;
    if (!device_id || !parameter || !direction) return;

    setDevices(prevDevices =>
      prevDevices.map(device => {
        if (device.id === device_id) {
          const currentValue = device[parameter.toLowerCase()] || 0;
          const adjustment = direction === 'UP' ? 1 : -1;
          return {
            ...device,
            [parameter.toLowerCase()]: currentValue + adjustment,
          };
        }
        return device;
      })
    );

    Alert.alert('成功', `已${direction === 'UP' ? '增加' : '减少'}${getDeviceName(device_id)}的${parameter}`);
  };

  const handleWeatherQuery = (entities: any) => {
    const { city } = entities;
    Alert.alert('天气查询', `正在查询${city || '当前城市'}的天气...`);
  };

  const getDeviceName = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    return device ? device.name : deviceId;
  };

  const renderDeviceItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => navigation.navigate('DeviceControl', { device: item })}>
      <Icon
        name={getDeviceIcon(item.type)}
        size={24}
        color={item.status ? '#4CAF50' : '#757575'}
      />
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceStatus}>
          {item.status ? '开启' : '关闭'}
          {item.temperature !== undefined && ` · ${item.temperature}°C`}
        </Text>
      </View>
      <Icon name="chevron-right" size={24} color="#757575" />
    </TouchableOpacity>
  );

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'light':
        return 'lightbulb';
      case 'ac':
        return 'ac-unit';
      case 'tv':
        return 'tv';
      case 'curtain':
        return 'view-day';
      default:
        return 'devices';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.voiceButtonContainer}>
        <TouchableOpacity
          style={[styles.voiceButton, isRecording && styles.recordingButton]}
          onPressIn={startRecording}
          onPressOut={stopRecording}>
          <Icon
            name={isRecording ? 'mic' : 'mic-none'}
            size={32}
            color="#fff"
          />
        </TouchableOpacity>
        <Text style={styles.voiceButtonText}>
          {isRecording ? '松开结束' : '按住说话'}
        </Text>
      </View>

      <FlatList
        data={devices}
        renderItem={renderDeviceItem}
        keyExtractor={item => item.id}
        style={styles.deviceList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  voiceButtonContainer: {
    alignItems: 'center',
    padding: 20,
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  recordingButton: {
    backgroundColor: '#f44336',
  },
  voiceButtonText: {
    marginTop: 8,
    fontSize: 16,
    color: '#757575',
  },
  deviceList: {
    flex: 1,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 16,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  deviceStatus: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
});

export default HomeScreen; 