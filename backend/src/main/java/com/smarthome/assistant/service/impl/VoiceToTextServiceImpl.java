package com.smarthome.assistant.service.impl;

import com.alibaba.fastjson.JSONObject;
import com.smarthome.assistant.service.VoiceToTextService;
import okhttp3.*;
import com.smarthome.assistant.util.GetFileContentAsBase64;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class VoiceToTextServiceImpl implements VoiceToTextService {
    public static final OkHttpClient HTTP_CLIENT = new OkHttpClient().newBuilder().readTimeout(300, TimeUnit.SECONDS).build();

    @Override
    public String vtot(MultipartFile audioFile) throws IOException {
        MediaType mediaType = MediaType.parse("application/json");
        byte[] b = audioFile.getBytes();
        String base64Speech = GetFileContentAsBase64.getFileContentAsBase64(audioFile, false);
        int length = b.length;


        JSONObject json = new JSONObject();
        json.put("format", "m4a");
        json.put("rate", 16000);
        json.put("channel", 1);
        json.put("cuid", "rpNoeczyXQe5V58AJrb1JDHTET2j2SMo");
        json.put("token", "24.65cf31fc5b393d7962446d49df4beeaa.2592000.1749823571.282335-118878215");
        json.put("speech", base64Speech);
        json.put("len", length);

//        MediaType mediaType = MediaType.parse("application/json");
        RequestBody body = RequestBody.create(mediaType, json.toString());

           Request request = new Request.Builder()
                .url("https://vop.baidu.com/server_api")
                .method("POST", body)
                .addHeader("Content-Type", "application/json")
                .addHeader("Accept", "application/json")
                .addHeader("Authorization", "Bearer ")
                .build();
        Response response = HTTP_CLIENT.newCall(request).execute();

        String result = response.body().string();
        Map<String, Object> map = JSONObject.parseObject(result);
        if(map.containsKey("result")) {
            result = map.get("result").toString();
        }
        else
        {
            result = map.get("err_msg").toString();
        }

        return result;
    }

}
