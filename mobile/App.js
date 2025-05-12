import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert, SafeAreaView, StatusBar } from 'react-native';

const App = () => {
  const [devices, setDevices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = () => {
    fetch('http://192.168.1.2:5000/api/devices')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setDevices(data.devices);
        } else {
          Alert.alert('Error', '获取设备数据失败');
        }
      })
      .catch(err => Alert.alert('Error', '无法连接到后端服务器，请确保后端服务正在运行。'));
  };

  const handleVoiceInput = () => {
    Alert.alert('语音输入', '模拟语音输入接口，点击确定后模拟发送语音命令。', [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: () => Alert.alert('模拟语音命令', '已模拟发送语音命令，后端将处理该命令。') }
    ]);
  };

  const renderDeviceItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text>类型: {item.type}</Text>
      <Text>状态: {item.status}</Text>
      {item.brightness !== undefined && <Text>亮度: {item.brightness}%</Text>}
      {item.temperature !== undefined && <Text>温度: {item.temperature}°C</Text>}
      {item.humidity !== undefined && <Text>湿度: {item.humidity}%</Text>}
      {item.volume !== undefined && <Text>音量: {item.volume}</Text>}
      {item.speed !== undefined && <Text>风速: {item.speed}</Text>}
      {item.position !== undefined && <Text>位置: {item.position}%</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.header}>智能家居语音助手</Text>
      <FlatList
        data={devices}
        renderItem={renderDeviceItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity style={styles.voiceButton} onPress={handleVoiceInput}>
        <Text style={styles.voiceButtonText}>语音输入</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  list: { padding: 10 },
  card: { backgroundColor: 'white', borderRadius: 8, padding: 15, marginVertical: 5, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  voiceButton: { position: 'absolute', bottom: 20, alignSelf: 'center', backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3.84 },
  voiceButtonText: { color: 'white', fontWeight: 'bold' }
});

export default App; 