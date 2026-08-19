package com.meetingmind.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "system_settings")
public class SystemSettings {
    @Id
    private String id;
    
    private String openaiApiKey;
    
    @Builder.Default
    private String openaiBaseUrl = "https://api.openai.com/v1";
    
    @Builder.Default
    private String llmModel = "gpt-4o-mini";
    
    @Builder.Default
    private String asrProvider = "openai-whisper"; // openai-whisper or mock

    @Builder.Default
    private String asrModel = "whisper-large-v3"; // whisper-1 (OpenAI) or whisper-large-v3 (Groq)
}
