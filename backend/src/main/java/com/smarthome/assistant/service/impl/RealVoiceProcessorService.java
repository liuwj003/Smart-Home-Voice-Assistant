package com.smarthome.assistant.service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.smarthome.assistant.model.VoiceCommand;
import com.smarthome.assistant.service.VoiceProcessorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;

@Slf4j
@Service
@ConditionalOnProperty(name = "voice.processor.type", havingValue = "real")
public class RealVoiceProcessorService implements VoiceProcessorService {

    @Value("${voice.stt.engine-type:google}")
    private String sttEngineType;
    
    @Value("${voice.nlu.engine-type:bert}")
    private String nluEngineType;
    
    @Value("${voice.module.path:./voice_module}")
    private String voiceModulePath;
    
    private boolean listening = false;
    
    @Override
    public VoiceCommand processVoiceCommand(MultipartFile audioFile) {
        log.info("处理语音命令，文件名：{}", audioFile.getOriginalFilename());
        
        try {
            // 保存音频文件到临时目录
            Path tempFile = Files.createTempFile("voice_", ".wav");
            audioFile.transferTo(tempFile.toFile());
            
            // 构建Python处理命令
            ProcessBuilder processBuilder = new ProcessBuilder(
                "python", "-c",
                "import sys; sys.path.append('.' if not '.' in sys.path else ''); " + 
                "from voice_module import create_voice_processor; " +
                "import json; import sys; " +
                "config = {'stt_engine_type': '" + sttEngineType + "', 'nlp_engine_type': '" + nluEngineType + "'}; " +
                "processor = create_voice_processor(stt_engine_type='" + sttEngineType + "', nlp_engine_type='" + nluEngineType + "', config=config); " +
                "with open('" + tempFile.toString().replace("\\", "\\\\") + "', 'rb') as f: " +
                "    audio_data = f.read(); " +
                "result = processor.process_voice_command(audio_data); " +
                "print(json.dumps(result));"
            );
            
            // 设置工作目录
            processBuilder.directory(new File(voiceModulePath));
            
            // 执行命令并获取输出
            Process process = processBuilder.start();
            
            // 读取输出
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line);
                }
            }
            
            // 等待进程完成
            int exitCode = process.waitFor();
            
            // 删除临时文件
            Files.deleteIfExists(tempFile);
            
            if (exitCode == 0) {
                // 解析JSON结果
                JSONObject result = JSON.parseObject(output.toString());
                
                VoiceCommand command = new VoiceCommand();
                command.setText(result.getString("transcription"));
                command.setIntent(result.getString("intent"));
                command.setEntities(result.getJSONObject("entities"));
                command.setConfidence(result.getDoubleValue("confidence"));
                return command;
            } else {
                log.error("Python处理出错，退出代码: {}", exitCode);
                throw new RuntimeException("Voice processing failed with exit code: " + exitCode);
            }
        } catch (IOException | InterruptedException e) {
            log.error("处理语音命令时发生错误", e);
            throw new RuntimeException("Error processing voice command", e);
        }
    }
    
    @Override
    public void startListening() {
        log.info("开始语音监听");
        this.listening = true;
    }
    
    @Override
    public void stopListening() {
        log.info("停止语音监听");
        this.listening = false;
    }
    
    @Override
    public boolean isListening() {
        return this.listening;
    }
} 