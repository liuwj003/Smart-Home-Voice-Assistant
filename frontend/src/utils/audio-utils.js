/**
 * 音频播放工具
 * 用于处理TTS音频播放，防止重复播放，并处理不同类型的音频引用
 */

// 播放状态标记，防止重复播放
let isPlaying = false;

/**
 * 播放TTS音频
 * @param {string|Blob|Object} audioReference - 音频引用，可能是URL、Base64、Blob或对象
 */
export const playTTSAudio = async (audioReference) => {
  // 如果没有音频引用或已经在播放，则不处理
  if (!audioReference || isPlaying) return;
  
  try {
    isPlaying = true;
    console.log('尝试播放音频:', typeof audioReference, audioReference);
    
    let audioUrl = null;
    let audioObj = null;
    
    // 处理不同类型的音频引用
    if (typeof audioReference === 'string') {
      // 字符串类型处理
      if (audioReference.startsWith('data:audio')) {
        // Base64格式，直接使用
        audioUrl = audioReference;
      } else if (audioReference.startsWith('http')) {
        // 完整URL，直接使用
        audioUrl = audioReference;
      } else if (audioReference.includes('nlp_service') && audioReference.includes('temp_audio')) {
        // 处理服务器本地文件路径 (例如 E:\...\nlp_service\data\temp_audio\xxx.wav)
        // 提取文件名，创建API URL
        const filename = audioReference.split('\\').pop().split('/').pop();
        audioUrl = `http://localhost:8080/api/voice/audio/${filename}`;
        console.log('转换服务器文件路径为API URL:', audioUrl);
      } else if (audioReference.includes('data/temp_audio')) {
        // 处理相对路径格式 (例如 data/temp_audio/xxxx.wav)
        const filename = audioReference.split('/').pop();
        audioUrl = `http://localhost:8080/api/voice/audio/${filename}`;
        console.log('转换相对文件路径为API URL:', audioUrl);
      } else if (!audioReference.startsWith('/')) {
        // 其他相对路径，添加前缀
        const baseUrl = 'http://localhost:8080';
        audioUrl = `${baseUrl}/${audioReference}`;
      } else {
        // 以/开头的路径
        const baseUrl = 'http://localhost:8080';
        audioUrl = `${baseUrl}${audioReference}`;
      }
    } else if (audioReference instanceof Blob) {
      // Blob直接创建URL
      audioUrl = URL.createObjectURL(audioReference);
    } else if (audioReference.audioData) {
      // 对象中包含音频数据（可能是Base64或二进制）
      if (typeof audioReference.audioData === 'string') {
        // 假设是Base64
        audioUrl = audioReference.audioData.startsWith('data:') ? 
          audioReference.audioData : 
          `data:audio/wav;base64,${audioReference.audioData}`;
      } else {
        // 假设是二进制数据，创建Blob
        const blob = new Blob([audioReference.audioData], { type: 'audio/wav' });
        audioUrl = URL.createObjectURL(blob);
      }
    }
    
    // 如果无法创建有效的音频URL，则退出
    if (!audioUrl) {
      console.error('无法创建有效的音频URL', audioReference);
      isPlaying = false;
      return;
    }
    
    // 创建音频对象
    audioObj = new Audio(audioUrl);
    
    // 设置事件处理器
    audioObj.onended = () => {
      console.log('音频播放完成');
      isPlaying = false;
      // 如果是Blob URL，需要释放
      if (audioReference instanceof Blob) {
        URL.revokeObjectURL(audioUrl);
      }
    };
    
    audioObj.onerror = (e) => {
      console.error('音频播放错误:', e);
      isPlaying = false;
      // 如果是Blob URL，需要释放
      if (audioReference instanceof Blob) {
        URL.revokeObjectURL(audioUrl);
      }
    };
    
    // 播放音频
    await audioObj.play();
  } catch (error) {
    console.error('播放TTS音频失败:', error);
    isPlaying = false;
  }
};

/**
 * 停止当前音频播放
 */
export const stopAudioPlayback = () => {
  isPlaying = false;
}; 