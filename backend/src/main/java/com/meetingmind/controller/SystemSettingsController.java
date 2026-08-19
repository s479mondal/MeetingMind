package com.meetingmind.controller;

import com.meetingmind.model.SystemSettings;
import com.meetingmind.repository.SystemSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/system/settings")
public class SystemSettingsController {

    @Autowired
    private SystemSettingsRepository settingsRepository;

    @Value("${app.openai.api-key:}")
    private String defaultApiKey;

    @Value("${app.openai.base-url:https://api.openai.com/v1}")
    private String defaultBaseUrl;

    @Value("${app.openai.llm-model:gpt-4o-mini}")
    private String defaultLlmModel;

    @Value("${app.asr.provider:mock}")
    private String defaultAsrProvider;

    @Value("${app.asr.model:whisper-large-v3}")
    private String defaultAsrModel;

    @GetMapping
    public ResponseEntity<SystemSettings> getSettings() {
        List<SystemSettings> list = settingsRepository.findAll();
        if (list.isEmpty()) {
            SystemSettings defaultSettings = SystemSettings.builder()
                    .openaiApiKey(defaultApiKey)
                    .openaiBaseUrl(defaultBaseUrl)
                    .llmModel(defaultLlmModel)
                    .asrProvider(defaultAsrProvider)
                    .asrModel(defaultAsrModel)
                    .build();
            defaultSettings = settingsRepository.save(defaultSettings);
            return ResponseEntity.ok(defaultSettings);
        }
        
        SystemSettings settings = list.get(0);
        return ResponseEntity.ok(settings);
    }

    @PostMapping
    public ResponseEntity<SystemSettings> saveSettings(@RequestBody SystemSettings newSettings) {
        List<SystemSettings> list = settingsRepository.findAll();
        SystemSettings existing;
        if (list.isEmpty()) {
            existing = new SystemSettings();
        } else {
            existing = list.get(0);
        }

        // Update fields
        existing.setOpenaiBaseUrl(newSettings.getOpenaiBaseUrl());
        existing.setLlmModel(newSettings.getLlmModel());
        existing.setAsrProvider(newSettings.getAsrProvider());
        if (newSettings.getAsrModel() != null && !newSettings.getAsrModel().trim().isEmpty()) {
            existing.setAsrModel(newSettings.getAsrModel());
        }

        // Update key only if it's not empty and not masked
        String newKey = newSettings.getOpenaiApiKey();
        if (newKey != null && !newKey.trim().isEmpty() && !newKey.contains("••••")) {
            existing.setOpenaiApiKey(newKey.trim());
        }

        existing = settingsRepository.save(existing);
        
        // Hide key for response
        SystemSettings responseSettings = SystemSettings.builder()
                .id(existing.getId())
                .openaiBaseUrl(existing.getOpenaiBaseUrl())
                .llmModel(existing.getLlmModel())
                .asrProvider(existing.getAsrProvider())
                .openaiApiKey(existing.getOpenaiApiKey() != null && !existing.getOpenaiApiKey().isEmpty() ? "••••••••••••••••••••••••" : "")
                .build();

        return ResponseEntity.ok(responseSettings);
    }
}
