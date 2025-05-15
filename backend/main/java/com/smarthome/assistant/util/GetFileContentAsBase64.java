package com.smarthome.assistant.util;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.util.Base64;

/**
 * 获取文件base64编码
 *
 *
 * @param urlEncode 如果Content-Type是application/x-www-form-urlencoded时,传true
 * @return base64编码信息，不带文件头
 * @throws IOException IO异常
 */
public class GetFileContentAsBase64 {

    public static String getFileContentAsBase64(MultipartFile audioFile, boolean urlEncode) throws IOException {
        byte[] b = audioFile.getBytes();

        String base64 = Base64.getEncoder().encodeToString(b);
        if (urlEncode) {
            base64 = URLEncoder.encode(base64, "utf-8");
        }
        return base64;
    }
}
