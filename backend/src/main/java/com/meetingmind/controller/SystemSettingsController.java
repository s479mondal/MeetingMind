package com.meetingmind.controller;

import com.meetingmind.model.SystemSettings;
import com.meetingmind.repository.SystemSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/system/settings")
public class SystemSettingsController {

    @Autowired
    private SystemSettingsRepository settingsRepository;

    @GetMapping
    public ResponseEntity<SystemSettings> getSettings() {
        List<SystemSettings> list = settingsRepository.findAll();
        if (list.isEmpty()) {
            SystemSettings defaultSettings = SystemSettings.builder()
                    .openaiApiKey("")
                    .openaiBaseUrl("https://api.openai.com/v1")
                    .llmModel("gpt-4o-mini")
                    .asrProvider("mock") // Default to mock mode — no API key needed out of the box
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
