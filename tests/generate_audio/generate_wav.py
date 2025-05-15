from gtts import gTTS
from pydub import AudioSegment
import io

def create_wav_file(text, language='zh-cn', filename="打开客厅灯.wav"):
    """
    根据给定文本生成WAV音频文件。

    参数:
    text (str): 需要转换为语音的文本。
    language (str): 语音的语言代码 (例如 'zh-cn' 代表中文普通话)。
    filename (str): 输出的WAV文件名。
    """
    try:
        # 1. 使用 gTTS 生成语音并保存到内存中的字节流 (MP3格式)
        tts = gTTS(text=text, lang=language, slow=False)
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)  # 重置指针到字节流的开头

        # 2. 使用 pydub 从内存中的MP3数据加载音频
        audio = AudioSegment.from_file(mp3_fp, format="mp3")

        # 3. 将音频导出为WAV格式
        audio.export(filename, format="wav")
        print(f"成功生成WAV文件: {filename}")

    except ImportError:
        print("错误：请确保已安装 gTTS 和 pydub 库。")
        print("您可以使用以下命令安装：")
        print("pip install gTTS pydub")
    except Exception as e:
        print(f"生成WAV文件时发生错误: {e}")

if __name__ == "__main__":
    text_to_speak = "打开客厅灯"
    output_filename = "打开客厅灯.wav"
    create_wav_file(text_to_speak, filename=output_filename)