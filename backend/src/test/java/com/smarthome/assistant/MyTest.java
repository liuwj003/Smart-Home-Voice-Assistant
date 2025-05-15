package com.smarthome.assistant;

import com.smarthome.assistant.service.VoiceToTextService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class MyTest {
    @Autowired
    VoiceToTextService voiceToTextService;

    @Test
    public void test() {
        String result = null;
        try {
            result = voiceToTextService.vtot(null);
            System.out.println(result);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}