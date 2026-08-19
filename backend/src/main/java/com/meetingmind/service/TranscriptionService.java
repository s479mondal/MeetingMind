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
        
        boolean useMock = "mock".equalsIgnoreCase(settings.getAsrProvider()) 
                || settings.getOpenaiApiKey() == null 
                || settings.getOpenaiApiKey().trim().isEmpty()
                || settings.getOpenaiApiKey().contains("••••"); // masked key

        if (useMock) {
            return generateMockTranscript(title);
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



    private String generateMockTranscript(String title) {
        String lowerTitle = title != null ? title.toLowerCase() : "";
        
        if (lowerTitle.contains("sprint") || lowerTitle.contains("planning") || lowerTitle.contains("project")) {
            return "Rahul:\n" +
                   "Welcome team to our Sprint planning sync. We need to lock down our release target for this sprint cycle. I'm proposing we push the application live this Friday.\n\n" +
                   "Priya:\n" +
                   "Friday release sounds doable, but we have to ensure all testing cycles are completed before Thursday. We cannot deploy unchecked code to production.\n\n" +
                   "Rahul:\n" +
                   "Agreed. Priya, can you coordinate the regression suite tests? They must be fully run and signed off by Wednesday evening.\n\n" +
                   "Priya:\n" +
                   "Yes, I will handle regression testing and will sync with the QA team to ensure we meet the Wednesday EOD cutoff.\n\n" +
                   "Soumen:\n" +
                   "From a deployment perspective, I will package the final builds on Thursday once Priya finishes validation. I need the final approval from Rahul before kicking off the actual deployment pipelines on Friday morning.\n\n" +
                   "Rahul:\n" +
                   "Excellent. So the timeline is: Priya finishes testing by Wednesday/Thursday, Soumen preps the deployment packages, and I'll review and give the go-ahead on Friday. Let's make sure the database migrations are also double-checked before the rollout.";
        }
        
        if (lowerTitle.contains("client") || lowerTitle.contains("sync") || lowerTitle.contains("design")) {
            return "Sarah:\n" +
                   "Thanks for joining. We are reviewing the initial Figma wireframes for the user portal. We need the client's sign-off on the dashboard layout by tomorrow morning.\n\n" +
                   "Amit:\n" +
                   "The feedback from the client was quite clear: they want a dark mode default theme and a more compact layout for the metric cards. I have updated the components today.\n\n" +
                   "Sarah:\n" +
                   "Great work. Amit, could you export the high-fidelity mockups and upload them to the shared Drive folder today? I will compile them into the client presentation.\n\n" +
                   "Amit:\n" +
                   "Will do, I'll send you the Drive link by 5 PM today.\n\n" +
                   "Vikram:\n" +
                   "Regarding the backend API integrations, I've verified the mock responses. However, we have a risk with the payment gateway latency. We should highlight to the client that production keys might need an extra day for approval.\n\n" +
                   "Sarah:\n" +
                   "Good point, Vikram. Please write a brief risk assessment about the gateway timelines and send it to me. I'll include it as an appendix in our update.";
        }

        // Generic default transcript
        return "Rahul:\n" +
               "Let's review outstanding tasks. We've got a few feature tasks that are currently pending. First, the user profile settings page needs to be completed by tomorrow.\n\n" +
               "Priya:\n" +
               "I'm working on that. I've finished the frontend UI, but I need some adjustments on the backend update API. I'll sync with Soumen to check the DTO mappings.\n\n" +
               "Soumen:\n" +
               "No problem, Priya. The DTO endpoint is ready, I just need to add validation checks. I will complete the backend validation today.\n\n" +
               "Rahul:\n" +
               "Great. Once the profile page is integrated, we need to start writing unit tests for the core service classes. Let's set a deadline of Thursday for writing these tests. Soumen, can you take care of the test coverage?\n\n" +
               "Soumen:\n" +
               "Yes, I will write the JUnit integration tests by Thursday afternoon.\n\n" +
               "Rahul:\n" +
               "Excellent. Let's touch base again tomorrow morning to review progress.";
    }
}
