package com.meetingmind;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableMongoAuditing
@EnableAsync
public class MeetingMindApplication {
    public static void main(String[] args) {
        SpringApplication.run(MeetingMindApplication.class, args);
    }
}

