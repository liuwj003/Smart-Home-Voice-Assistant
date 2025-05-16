import sys
import os
import traceback
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from flask import Flask, request, jsonify
from flask_cors import CORS
from voice_module.src import create_voice_processor, create_audio_processor
import tempfile
import wave
import json
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # 启用CORS支持

# 创建语音处理器
voice_processor = create_voice_processor(
    # stt_engine_type="whisper", 会从hugging face上下载6G多的大模型
    stt_engine_type="simulated",
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

@app.route('/api/voice/command', methods=['POST'])
def voice_command():
    """处理前端发送的语音命令"""
    try:
        logger.info("接收到语音命令请求")
        
        # 检查请求数据
        if 'audio' not in request.files:
            logger.error("请求中没有音频文件")
            return jsonify({
                "status": "error",
                "message": "No audio file provided",
                "text": "未提供音频文件"
            }), 400
        
        audio_file = request.files['audio']
        content_type = audio_file.content_type
        filename = audio_file.filename
        logger.info(f"收到的音频文件类型: {content_type}, 文件名: {filename}")
        
        # 临时简化处理: 返回一个硬编码的响应以测试前端功能
        logger.info("返回模拟响应进行前端测试")
        return jsonify({
            "text": "已接收到您的语音命令",
            "intent": "test_intent",
            "entities": {"device": "测试设备"},
            "confidence": 0.95
        })
        
        # 以下代码暂时忽略，稍后完善音频处理
        """
        # 保存音频数据到临时文件
        try:
            with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_file:
                logger.info(f"创建临时文件: {temp_file.name}")
                audio_file.save(temp_file.name)
                logger.info(f"音频数据已保存到临时文件")
                
                # 转换音频格式从WebM到WAV
                wav_temp_file = temp_file.name + ".wav"
                try:
                    # 这里需要添加WebM到WAV的转换代码
                    # TODO: 完善此部分
                    
                    # 读取转换后的WAV文件
                    with wave.open(wav_temp_file, 'rb') as wav_file:
                        logger.info(f"成功打开WAV文件，通道数: {wav_file.getnchannels()}, 采样率: {wav_file.getframerate()}")
                        audio_data = wav_file.readframes(wav_file.getnframes())
                        logger.info(f"读取到 {len(audio_data)} 字节的音频数据")
                except Exception as wave_err:
                    logger.error(f"音频处理失败: {wave_err}")
                    return jsonify({
                        "status": "error",
                        "message": f"音频处理失败: {str(wave_err)}",
                        "text": "音频格式不支持"
                    }), 400
            
            # 处理语音命令
            logger.info("开始处理语音命令")
            result = voice_processor.process_voice_command(audio_data)
            logger.info(f"处理结果: {result}")
            
            # 删除临时文件
            try:
                os.unlink(temp_file.name)
                os.unlink(wav_temp_file) if os.path.exists(wav_temp_file) else None
                logger.info("临时文件已删除")
            except Exception as unlink_err:
                logger.error(f"删除临时文件失败: {unlink_err}")
            
            # 返回结果
            return jsonify({
                "text": result.get("transcription", "无法识别语音"),
                "intent": result.get("intent", "unknown"),
                "entities": result.get("entities", {}),
                "confidence": result.get("confidence", 0.0)
            })
        except Exception as file_err:
            logger.error(f"处理临时文件时发生错误: {file_err}")
            return jsonify({
                "status": "error",
                "message": f"处理音频文件时发生错误: {str(file_err)}",
                "text": "处理语音时出现问题"
            }), 500
        """
        
    except Exception as e:
        # 打印详细的异常堆栈跟踪
        traceback_str = traceback.format_exc()
        logger.error(f"语音命令处理失败: {e}")
        logger.error(f"详细错误信息: {traceback_str}")
        
        return jsonify({
            "status": "error",
            "message": f"处理语音命令失败: {str(e)}",
            "text": "服务器处理语音时出现问题，请稍后再试"
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

@app.route('/api/voice/status', methods=['GET'])
def voice_status():
    """获取语音识别状态"""
    return jsonify({
        "status": "success",
        "is_listening": audio_processor.is_listening,
        "has_data": len(audio_processor.audio_buffer) > 0
    })

@app.route('/api/devices', methods=['GET'])
def get_devices():
    """获取虚拟设备列表接口"""
    devices = [
        {
            "id": "light_1",
            "name": "客厅灯",
            "type": "light",
            "status": "on",
            "brightness": 80,
            "color": "warm_white"
        },
        {
            "id": "ac_1",
            "name": "卧室空调",
            "type": "ac",
            "status": "off",
            "temperature": 26,
            "mode": "cool",
            "fan_speed": "medium"
        },
        {
            "id": "curtain_1",
            "name": "阳台窗帘",
            "type": "curtain",
            "status": "closed",
            "position": 0
        },
        {
            "id": "tv_1",
            "name": "客厅电视",
            "type": "tv",
            "status": "on",
            "volume": 15,
            "channel": 5
        },
        {
            "id": "humidifier_1",
            "name": "加湿器",
            "type": "humidifier",
            "status": "on",
            "humidity": 45
        },
        {
            "id": "fan_1",
            "name": "风扇",
            "type": "fan",
            "status": "off",
            "speed": "low"
        },
        {
            "id": "sensor_1",
            "name": "温湿度传感器",
            "type": "sensor",
            "temperature": 24.5,
            "humidity": 50
        },
        {
            "id": "kitchen_light_1",
            "name": "厨房灯",
            "type": "light",
            "status": "off",
            "brightness": 70,
            "color": "cool_white"
        },
        {
            "id": "kitchen_fan_1",
            "name": "厨房排气扇",
            "type": "fan",
            "status": "off",
            "speed": "medium"
        },
        {
            "id": "bathroom_light_1",
            "name": "浴室灯",
            "type": "light",
            "status": "off",
            "brightness": 80,
            "color": "daylight"
        }
    ]
    return jsonify(devices)

@app.route('/api/voice/settings', methods=['GET', 'POST'])
def voice_settings():
    """语音设置接口"""
    # 获取当前设置
    if request.method == 'GET':
        settings = {
            "language": voice_processor.language if hasattr(voice_processor, 'language') else "zh",
            "stt_engine": voice_processor.stt_engine_type if hasattr(voice_processor, 'stt_engine_type') else "simulated",
            "voice_feedback": voice_processor.voice_feedback if hasattr(voice_processor, 'voice_feedback') else True,
        }
        return jsonify(settings)
    
    # 更新设置
    elif request.method == 'POST':
        try:
            logger.info("接收到语音设置更新请求")
            data = request.get_json()
            
            if not data:
                logger.error("请求中没有JSON数据")
                return jsonify({
                    "status": "error",
                    "message": "No JSON data in request"
                }), 400
            
            # 验证数据
            if 'language' in data:
                voice_processor.language = data['language']
                logger.info(f"已设置语言: {data['language']}")
            
            if 'stt_engine' in data:
                # 暂存当前设置，后续可能用于实际更改STT引擎
                voice_processor.stt_engine_type = data['stt_engine']
                logger.info(f"已设置STT引擎: {data['stt_engine']}")
            
            if 'voice_feedback' in data:
                voice_processor.voice_feedback = data['voice_feedback']
                logger.info(f"已设置语音反馈: {data['voice_feedback']}")
            
            return jsonify({
                "status": "success",
                "message": "Settings updated successfully"
            })
            
        except Exception as e:
            logger.error(f"更新语音设置失败: {e}")
            traceback_str = traceback.format_exc()
            logger.error(f"详细错误信息: {traceback_str}")
            
            return jsonify({
                "status": "error",
                "message": f"Failed to update settings: {str(e)}"
            }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 