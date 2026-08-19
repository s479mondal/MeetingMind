package com.meetingmind.controller;

import com.meetingmind.model.ActionItem;
import com.meetingmind.model.Meeting;
import com.meetingmind.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    @Autowired
    private MeetingService meetingService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadMeeting(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Uploaded audio file cannot be empty."));
        }

        // Guard against null filename (can happen with certain HTTP clients)
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        String contentType = file.getContentType();
        boolean isAudioContentType = contentType != null && contentType.startsWith("audio/");
        boolean isAudioExtension = originalFilename.endsWith(".mp3") || originalFilename.endsWith(".wav")
                || originalFilename.endsWith(".m4a") || originalFilename.endsWith(".ogg")
                || originalFilename.endsWith(".flac") || originalFilename.endsWith(".webm");

        if (!isAudioContentType && !isAudioExtension) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                    .body(Map.of("message", "Unsupported media format. Please upload an MP3, WAV, M4A, OGG, FLAC or WebM audio file."));
        }

        try {
            // Save initial status record in MongoDB
            Meeting meeting = meetingService.initiateMeetingUpload(file, title);
            
            // Create a temp file on server to process
            File tempFile = File.createTempFile("meeting-mind-upload-", "-" + file.getOriginalFilename());
            file.transferTo(tempFile);
            
            // Trigger asynchronous background processing pipeline
            meetingService.processMeetingAsync(meeting.getId(), tempFile, meeting.getTitle());
            
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(meeting);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to store and buffer file on server. " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Meeting>> getMeetings(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "sortBy", required = false) String sortBy,
            @RequestParam(value = "sortDir", required = false) String sortDir) {
        List<Meeting> meetings = meetingService.getAllMeetings(search, sortBy, sortDir);
        return ResponseEntity.ok(meetings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMeeting(@PathVariable("id") String id) {
        Optional<Meeting> meetingOpt = meetingService.getMeetingById(id);
        if (meetingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(meetingOpt.get());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMeeting(@PathVariable("id") String id) {
        Optional<Meeting> meetingOpt = meetingService.getMeetingById(id);
        if (meetingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        meetingService.deleteMeeting(id);
        return ResponseEntity.ok().body(Map.of("message", "Meeting records deleted successfully."));
    }

    @GetMapping("/{id}/transcript")
    public ResponseEntity<?> getTranscript(@PathVariable("id") String id) {
        Optional<Meeting> meetingOpt = meetingService.getMeetingById(id);
        if (meetingOpt.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(Map.of("transcript", meetingOpt.get().getTranscript()));
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<?> getSummary(@PathVariable("id") String id) {
        Optional<Meeting> meetingOpt = meetingService.getMeetingById(id);
        if (meetingOpt.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(Map.of("summary", meetingOpt.get().getSummary()));
    }

    @GetMapping("/{id}/action-items")
    public ResponseEntity<List<ActionItem>> getActionItems(@PathVariable("id") String id) {
        Optional<Meeting> meetingOpt = meetingService.getMeetingById(id);
        if (meetingOpt.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(meetingOpt.get().getActionItems());
    }
}
