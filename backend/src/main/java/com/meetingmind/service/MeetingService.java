package com.meetingmind.service;

import com.meetingmind.model.ActionItem;
import com.meetingmind.model.Meeting;
import com.meetingmind.repository.MeetingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MeetingService {

    private static final Logger log = LoggerFactory.getLogger(MeetingService.class);

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private TranscriptionService transcriptionService;

    @Autowired
    private SummarizationService summarizationService;

    public Meeting initiateMeetingUpload(MultipartFile file, String customTitle) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String title = (customTitle != null && !customTitle.trim().isEmpty()) 
                ? customTitle.trim() 
                : (originalFilename != null ? originalFilename.replaceAll("\\.[^/.]+$", "") : "Untitled Meeting");


        // Create initial record
        Meeting meeting = Meeting.builder()
                .title(title)
                .fileName(originalFilename)
                .duration(0.0) // Will estimate from file size or transcribe duration
                .status(Meeting.Status.UPLOADING)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return meetingRepository.save(meeting);
    }

    @Async
    public void processMeetingAsync(String meetingId, File tempFile, String title) {
        Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
        if (meetingOpt.isEmpty()) {
            // Cleanup temp file if meeting record disappeared
            tempFile.delete();
            return;
        }

        Meeting meeting = meetingOpt.get();
        
        try {
            // 1. Estimate duration (1 MB of standard audio is roughly 1 minute of speech for mock purposes)
            double sizeInMb = (double) tempFile.length() / (1024 * 1024);
            double estimatedDuration = Math.max(0.5, Math.min(60.0, sizeInMb * 1.5));
            meeting.setDuration(estimatedDuration);
            
            // 2. Transcribe Audio (Status: TRANSCRIBING)
            meeting.setStatus(Meeting.Status.TRANSCRIBING);
            meetingRepository.save(meeting);
            
            String transcript = transcriptionService.transcribe(tempFile, title);
            meeting.setTranscript(transcript);
            
            // 3. Summarize Transcript (Status: ANALYZING)
            meeting.setStatus(Meeting.Status.ANALYZING);
            meetingRepository.save(meeting);
            
            Map<String, Object> analysis = summarizationService.analyzeTranscript(transcript, title);
            
            // 4. Save analysis details
            meeting.setSummary((String) analysis.get("summary"));
            meeting.setKeyDecisions((List<String>) analysis.get("keyDecisions"));
            meeting.setActionItems((List<ActionItem>) analysis.get("actionItems"));
            meeting.setAiInsights((Map<String, Object>) analysis.get("aiInsights"));
            
            meeting.setStatus(Meeting.Status.COMPLETED);
            meeting.setUpdatedAt(Instant.now());
            meetingRepository.save(meeting);

        } catch (Exception e) {
            log.error("Pipeline failed for meeting {}: {}", meetingId, e.getMessage(), e);
            meeting.setStatus(Meeting.Status.FAILED);
            meetingRepository.save(meeting);
        } finally {
            // Delete temporary audio file
            if (tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    public List<Meeting> getAllMeetings(String search, String sortBy, String sortDir) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sortBy != null && !sortBy.isEmpty()) {
            Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
            sort = Sort.by(direction, sortBy);
        }
        
        if (search != null && !search.trim().isEmpty()) {
            // Page request to fetch matching values
            Page<Meeting> page = meetingRepository.searchMeetings(search, PageRequest.of(0, 100, sort));
            return page.getContent();
        }
        
        return meetingRepository.findAll(sort);
    }

    public Optional<Meeting> getMeetingById(String id) {
        return meetingRepository.findById(id);
    }

    public void deleteMeeting(String id) {
        meetingRepository.deleteById(id);
    }

    public Meeting saveMeeting(Meeting meeting) {
        meeting.setUpdatedAt(Instant.now());
        return meetingRepository.save(meeting);
    }
}
