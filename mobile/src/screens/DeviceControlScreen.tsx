import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Slider,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation } from '@react-navigation/native';

const DeviceControlScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { device } = route.params as { device: any };

  const [status, setStatus] = useState(device.status);
  const [temperature, setTemperature] = useState(device.temperature || 26);
  const [brightness, setBrightness] = useState(device.brightness || 50);
  const [volume, setVolume] = useState(device.volume || 50);

  const handleStatusChange = (value: boolean) => {
    setStatus(value);
    // TODO: 发送设备控制命令到服务器
  };

  const handleTemperatureChange = (value: number) => {
    setTemperature(Math.round(value));
    // TODO: 发送温度设置命令到服务器
  };

  const handleBrightnessChange = (value: number) => {
    setBrightness(Math.round(value));
    // TODO: 发送亮度设置命令到服务器
  };

  const handleVolumeChange = (value: number) => {
    setVolume(Math.round(value));
    // TODO: 发送音量设置命令到服务器
  };

  const renderControl = () => {
    switch (device.type) {
      case 'light':
        return (
          <View style={styles.controlContainer}>
            <View style={styles.controlItem}>
              <Text style={styles.controlLabel}>亮度</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={brightness}
                onValueChange={handleBrightnessChange}
                minimumTrackTintColor="#2196F3"
                maximumTrackTintColor="#BDBDBD"
                thumbTintColor="#2196F3"
              />
              <Text style={styles.controlValue}>{brightness}%</Text>
            </View>
          </View>
        );

      case 'ac':
        return (
          <View style={styles.controlContainer}>
            <View style={styles.controlItem}>
              <Text style={styles.controlLabel}>温度</Text>
              <Slider
                style={styles.slider}
                minimumValue={16}
                maximumValue={30}
                value={temperature}
                onValueChange={handleTemperatureChange}
                minimumTrackTintColor="#2196F3"
                maximumTrackTintColor="#BDBDBD"
                thumbTintColor="#2196F3"
              />
              <Text style={styles.controlValue}>{temperature}°C</Text>
            </View>
          </View>
        );

      case 'tv':
        return (
          <View style={styles.controlContainer}>
            <View style={styles.controlItem}>
              <Text style={styles.controlLabel}>音量</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={volume}
                onValueChange={handleVolumeChange}
                minimumTrackTintColor="#2196F3"
                maximumTrackTintColor="#BDBDBD"
                thumbTintColor="#2196F3"
              />
              <Text style={styles.controlValue}>{volume}%</Text>
            </View>
          </View>
        );

      case 'curtain':
        return (
          <View style={styles.controlContainer}>
            <View style={styles.controlItem}>
              <Text style={styles.controlLabel}>窗帘控制</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => {/* TODO: 发送开窗帘命令 */}}>
                  <Icon name="open-in-new" size={24} color="#fff" />
                  <Text style={styles.buttonText}>打开</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => {/* TODO: 发送关窗帘命令 */}}>
                  <Icon name="close" size={24} color="#fff" />
                  <Text style={styles.buttonText}>关闭</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon
          name={getDeviceIcon(device.type)}
          size={48}
          color={status ? '#4CAF50' : '#757575'}
        />
        <Text style={styles.deviceName}>{device.name}</Text>
        <Switch
          value={status}
          onValueChange={handleStatusChange}
          trackColor={{ false: '#BDBDBD', true: '#81C784' }}
          thumbColor="#fff"
        />
      </View>

      {status && renderControl()}
    </View>
  );
};

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  deviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
    marginLeft: 16,
  },
  controlContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  controlItem: {
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  controlValue: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'right',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default DeviceControlScreen; 