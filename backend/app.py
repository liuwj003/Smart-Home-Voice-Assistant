import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from voice_module.src import create_voice_processor, create_audio_processor
import tempfile
import wave
import json

app = Flask(__name__)
CORS(app)  # 启用CORS支持

# 创建语音处理器
voice_processor = create_voice_processor(
    stt_engine_type="whisper",
    nlu_engine_type="rule_based"
)

# 创建音频处理器
audio_processor = create_audio_processor(
    voice_processor,
    silence_threshold=0.01,
    silence_duration=1.0,
    min_speech_duration=0.5
)

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        "status": "ok",
        "message": "Voice assistant API is running"
    })

@app.route('/api/process_audio', methods=['POST'])
def process_audio():
    """处理音频数据接口"""
    try:
        # 检查请求数据
        if 'audio' not in request.files:
            return jsonify({
                "status": "error",
                "message": "No audio file provided"
            }), 400
        
        audio_file = request.files['audio']
        
        # 保存音频数据到临时文件
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            audio_file.save(temp_file.name)
            
            # 读取音频数据
            with wave.open(temp_file.name, 'rb') as wav_file:
                audio_data = wav_file.readframes(wav_file.getnframes())
        
        # 处理语音命令
        result = voice_processor.process_voice_command(audio_data)
        
        # 删除临时文件
        os.unlink(temp_file.name)
        
        return jsonify({
            "status": "success",
            "data": result
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/start_listening', methods=['POST'])
def start_listening():
    """开始监听接口"""
    try:
        audio_processor.start_listening()
        return jsonify({
            "status": "success",
            "message": "Started listening"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/stop_listening', methods=['POST'])
def stop_listening():
    """停止监听接口"""
    try:
        audio_processor.stop_listening()
        return jsonify({
            "status": "success",
            "message": "Stopped listening"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/get_audio_buffer', methods=['GET'])
def get_audio_buffer():
    """获取音频缓冲区数据接口"""
    try:
        if not audio_processor.audio_buffer:
            return jsonify({
                "status": "success",
                "data": None
            })
        
        # 处理音频数据
        audio_data = b''.join(audio_processor.audio_buffer)
        result = voice_processor.process_voice_command(audio_data)
        
        # 清空缓冲区
        audio_processor.audio_buffer = []
        
        return jsonify({
            "status": "success",
            "data": result
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 