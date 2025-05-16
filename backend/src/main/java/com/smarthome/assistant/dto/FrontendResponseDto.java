package com.smarthome.assistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 统一返回给前端的响应DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FrontendResponseDto {
    
    /**
     * STT识别的文本（语音输入时填充）
     */
    private String sttText;
    
    /**
     * 简化的NLU结果
     */
    private NluResultDisplayDto nluResult;
    
    /**
     * 设备操作的结果消息
     */
    private String deviceActionFeedback;
    
    /**
     * 命令是否成功处理
     */
    private boolean commandSuccess;
    
    /**
     * 错误信息，仅当处理失败时填充
     */
    private String errorMessage;
    
    /**
     * 来自NLP服务的TTS输出引用（可选）
     */
    private String ttsOutputReference;
} 