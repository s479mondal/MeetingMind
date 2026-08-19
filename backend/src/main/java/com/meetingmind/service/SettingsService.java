package com.meetingmind.service;

import com.meetingmind.model.SystemSettings;
import com.meetingmind.repository.SystemSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Shared service for retrieving the active system configuration.
 * Centralizes settings access to avoid duplication across services.
 */
@Service
public class SettingsService {

    @Autowired
    private SystemSettingsRepository settingsRepository;

    /**
     * Returns the first (and only) system settings document from MongoDB.
     * Falls back to a default {@link SystemSettings} instance if none exists.
     */
    public SystemSettings getActiveSettings() {
        List<SystemSettings> allSettings = settingsRepository.findAll();
        if (allSettings.isEmpty()) {
            return new SystemSettings();
        }
        return allSettings.get(0);
    }
}
