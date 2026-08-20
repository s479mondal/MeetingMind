package com.meetingmind.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "meetings")
public class Meeting {
    @Id
    private String id;
    
    @Indexed
    private String title;
    
    private String fileName;
    private double duration; // in minutes
    
    private Status status;
    private String transcript;
    
    private String summary;
    
    @Builder.Default
    private List<String> keyDecisions = new ArrayList<>();
    
    @Builder.Default
    private List<ActionItem> actionItems = new ArrayList<>();
    
    @Builder.Default
    private Map<String, Object> aiInsights = new HashMap<>();

    private String summarizerModel;
    private String summarizerProvider;
    
    @CreatedDate
    private Instant createdAt;
    
    @LastModifiedDate
    private Instant updatedAt;

    public enum Status {
        UPLOADING,
        TRANSCRIBING,
        ANALYZING,
        COMPLETED,
        FAILED
    }
}
