import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [apiUrl, setApiUrl] = useState('http://localhost:5000/api');
  const [useVoiceControl, setUseVoiceControl] = useState(true);
  const [autoStart, setAutoStart] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveSettings = () => {
    // TODO: 保存设置到本地存储
    Alert.alert('成功', '设置已保存');
    navigation.goBack();
  };

  const handleResetSettings = () => {
    Alert.alert(
      '重置设置',
      '确定要恢复默认设置吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确定',
          onPress: () => {
            setApiUrl('http://localhost:5000/api');
            setUseVoiceControl(true);
            setAutoStart(false);
            setDarkMode(false);
            Alert.alert('成功', '设置已重置');
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>服务器设置</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>API地址</Text>
          <TextInput
            style={styles.input}
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder="输入API服务器地址"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>语音控制</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>启用语音控制</Text>
            <Text style={styles.settingDescription}>
              允许通过语音命令控制设备
            </Text>
          </View>
          <Switch
            value={useVoiceControl}
            onValueChange={setUseVoiceControl}
            trackColor={{ false: '#BDBDBD', true: '#81C784' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>应用设置</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>开机自启</Text>
            <Text style={styles.settingDescription}>
              应用启动时自动开始监听
            </Text>
          </View>
          <Switch
            value={autoStart}
            onValueChange={setAutoStart}
            trackColor={{ false: '#BDBDBD', true: '#81C784' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>深色模式</Text>
            <Text style={styles.settingDescription}>
              使用深色主题
            </Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#BDBDBD', true: '#81C784' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleResetSettings}>
          <Icon name="restore" size={24} color="#fff" />
          <Text style={styles.buttonText}>重置设置</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSaveSettings}>
          <Icon name="save" size={24} color="#fff" />
          <Text style={styles.buttonText}>保存设置</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    color: '#212121',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#212121',
  },
  settingDescription: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 8,
  },
  resetButton: {
    backgroundColor: '#757575',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SettingsScreen; 