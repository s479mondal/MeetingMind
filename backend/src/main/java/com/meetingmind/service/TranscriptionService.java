package com.meetingmind.service;

import com.meetingmind.model.SystemSettings;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Service
public class TranscriptionService {

    @Autowired
    private SettingsService settingsService;

    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .readTimeout(90, TimeUnit.SECONDS)
            .build();

    public String transcribe(File audioFile, String title) throws IOException {
        SystemSettings settings = settingsService.getActiveSettings();
        
        if (settings.getOpenaiApiKey() == null 
                || settings.getOpenaiApiKey().trim().isEmpty()) {
            throw new IOException("API Key is missing. Please configure your API key in Settings.");
        }

        return transcribeWithWhisper(audioFile, settings);
    }

    private String transcribeWithWhisper(File audioFile, SystemSettings settings) throws IOException {
        RequestBody fileBody = RequestBody.create(audioFile, MediaType.parse("audio/*"));
        
        MultipartBody requestBody = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("file", audioFile.getName(), fileBody)
                .addFormDataPart("model", settings.getAsrModel() != null ? settings.getAsrModel() : "whisper-large-v3")
                .addFormDataPart("response_format", "text")
                .build();

        String url = settings.getOpenaiBaseUrl() + "/audio/transcriptions";
        
        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + settings.getOpenaiApiKey())
                .post(requestBody)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "Empty response body";
                throw new IOException("ASR API error: HTTP " + response.code() + " - " + errorBody);
            }
            return response.body().string().trim();
        }
    }
}
