package com.meetingmind.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.meetingmind.model.ActionItem;
import com.meetingmind.model.SystemSettings;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class SummarizationService {

    @Autowired
    private SettingsService settingsService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .readTimeout(90, TimeUnit.SECONDS)
            .build();

    public Map<String, Object> analyzeTranscript(String transcript, String title) throws Exception {
        SystemSettings settings = settingsService.getActiveSettings();
        
        boolean useMock = "mock".equalsIgnoreCase(settings.getAsrProvider()) 
                || settings.getOpenaiApiKey() == null 
                || settings.getOpenaiApiKey().trim().isEmpty()
                || settings.getOpenaiApiKey().contains("••••");

        if (useMock) {
            return generateMockAnalysis(title);
        }

        return analyzeWithLLM(transcript, settings);
    }

    private Map<String, Object> analyzeWithLLM(String transcript, SystemSettings settings) throws Exception {
        String prompt = "You are a professional meeting intelligence AI. Analyze the following meeting transcript. " +
                "Extract: \n" +
                "1. A concise executive summary of the discussion (1-2 paragraphs).\n" +
                "2. A list of key decisions made during the meeting.\n" +
                "3. A list of clear action items. For each action item, identify: \n" +
                "   - 'task': the description of the task\n" +
                "   - 'assignee': the person responsible (ONLY if explicitly mentioned in the text, otherwise 'Unassigned')\n" +
                "   - 'deadline': the deadline mentioned (ONLY if explicitly stated, otherwise 'Not specified')\n" +
                "   - 'priority': high, medium, or low priority based on context (must be one of 'HIGH', 'MEDIUM', 'LOW')\n" +
                "4. Additional AI insights: \n" +
                "   - 'topics': list of main topics discussed (each with a 'name' and optional 'duration' e.g. '15 min')\n" +
                "   - 'risks': list of risks or unresolved issues mentioned\n" +
                "   - 'followUps': list of suggested follow-up actions\n" +
                "   - 'sentiment': overall tone of the meeting (1 sentence)\n\n" +
                "IMPORTANT: Return ONLY a valid JSON object matching the following structure. Do NOT wrap the JSON in markdown code blocks (e.g. do NOT use ```json). Never fabricate information not present in the transcript.\n\n" +
                "JSON Structure:\n" +
                "{\n" +
                "  \"summary\": \"Executive summary text...\",\n" +
                "  \"keyDecisions\": [\"Decision 1\", \"Decision 2\"],\n" +
                "  \"actionItems\": [\n" +
                "    {\n" +
                "      \"task\": \"Task details\",\n" +
                "      \"assignee\": \"Person name\",\n" +
                "      \"deadline\": \"Deadline date/time\",\n" +
                "      \"priority\": \"HIGH\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"aiInsights\": {\n" +
                "    \"topics\": [{\"name\": \"Topic name\", \"duration\": \"10 min\"}],\n" +
                "    \"risks\": [\"Risk detail\"],\n" +
                "    \"followUps\": [\"Follow-up detail\"],\n" +
                "    \"sentiment\": \"Overall tone...\"\n" +
                "  }\n" +
                "}\n\n" +
                "Transcript to analyze:\n" +
                transcript;

        // Construct Chat Completion Payload
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("model", settings.getLlmModel());
        
        ArrayNode messages = payload.putArray("messages");
        ObjectNode systemMessage = messages.addObject();
        systemMessage.put("role", "system");
        systemMessage.put("content", "You are a helpful meeting assistant that outputs raw JSON.");
        
        ObjectNode userMessage = messages.addObject();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        
        payload.put("temperature", 0.1);

        String jsonPayload = objectMapper.writeValueAsString(payload);
        String url = settings.getOpenaiBaseUrl() + "/chat/completions";

        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + settings.getOpenaiApiKey())
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create(jsonPayload, MediaType.parse("application/json")))
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "Empty response body";
                throw new IOException("LLM API error: HTTP " + response.code() + " - " + errorBody);
            }
            
            String responseBody = response.body().string();
            JsonNode responseJson = objectMapper.readTree(responseBody);
            String aiResponseText = responseJson.path("choices").get(0).path("message").path("content").asText().trim();
            
            // Clean markdown block wrappers if LLM still returned them
            if (aiResponseText.startsWith("```")) {
                aiResponseText = aiResponseText.replaceAll("^```json\\s*", "").replaceAll("```$", "").trim();
            }

            JsonNode parsedAnalysis = objectMapper.readTree(aiResponseText);
            
            // Convert to Map format for service layer
            Map<String, Object> result = new HashMap<>();
            result.put("summary", parsedAnalysis.path("summary").asText());
            
            List<String> decisions = new ArrayList<>();
            parsedAnalysis.path("keyDecisions").forEach(d -> decisions.add(d.asText()));
            result.put("keyDecisions", decisions);

            List<ActionItem> actionItems = new ArrayList<>();
            parsedAnalysis.path("actionItems").forEach(item -> {
                actionItems.add(ActionItem.builder()
                        .id(UUID.randomUUID().toString())
                        .task(item.path("task").asText())
                        .assignee(item.path("assignee").asText())
                        .deadline(item.path("deadline").asText())
                        .priority(ActionItem.Priority.valueOf(item.path("priority").asText("MEDIUM").toUpperCase()))
                        .status(ActionItem.Status.PENDING)
                        .build());
            });
            result.put("actionItems", actionItems);

            Map<String, Object> insights = new HashMap<>();
            JsonNode insightsNode = parsedAnalysis.path("aiInsights");
            
            List<Map<String, String>> topics = new ArrayList<>();
            insightsNode.path("topics").forEach(t -> {
                Map<String, String> topicMap = new HashMap<>();
                topicMap.put("name", t.path("name").asText());
                topicMap.put("duration", t.path("duration").asText());
                topics.add(topicMap);
            });
            insights.put("topics", topics);

            List<String> risks = new ArrayList<>();
            insightsNode.path("risks").forEach(r -> risks.add(r.asText()));
            insights.put("risks", risks);

            List<String> followUps = new ArrayList<>();
            insightsNode.path("followUps").forEach(f -> followUps.add(f.asText()));
            insights.put("followUps", followUps);

            insights.put("sentiment", insightsNode.path("sentiment").asText());
            result.put("aiInsights", insights);

            return result;
        }
    }



    private Map<String, Object> generateMockAnalysis(String title) {
        String lowerTitle = title != null ? title.toLowerCase() : "";
        Map<String, Object> result = new HashMap<>();
        
        List<String> decisions = new ArrayList<>();
        List<ActionItem> actionItems = new ArrayList<>();
        Map<String, Object> insights = new HashMap<>();

        if (lowerTitle.contains("sprint") || lowerTitle.contains("planning") || lowerTitle.contains("project")) {
            result.put("summary", "The team aligned on the timeline and requirements for the upcoming sprint release. The production launch is officially scheduled for Friday. Regression testing must be fully completed and approved by Wednesday evening to avoid bottlenecks. Deployment package wrapping will take place on Thursday pending final sign-off.");
            
            decisions.add("The official application production rollout is scheduled for Friday morning.");
            decisions.add("Code regression testing cycles must be finalized and signed off before Thursday.");
            decisions.add("Deployment package assemblies will begin on Thursday after successful QA validation.");
            
            actionItems.add(new ActionItem(UUID.randomUUID().toString(), "Run complete regression testing suite and sign off", "Priya", "Wednesday EOD", ActionItem.Priority.HIGH, ActionItem.Status.PENDING));
            actionItems.add(new ActionItem(UUID.randomUUID().toString(), "Assemble and pack final application deployment builds", "Soumen", "Thursday", ActionItem.Priority.HIGH, ActionItem.Status.PENDING));
            actionItems.add(new ActionItem(UUID.randomUUID().toString(), "Conduct final pre-deployment review and approve Friday release", "Rahul", "Friday Morning", ActionItem.Priority.MEDIUM, ActionItem.Status.PENDING));
            actionItems.add(new ActionItem(UUID.randomUUID().toString(), "Verify database migration scripts on staging database", "Soumen", "Thursday Morning", ActionItem.Priority.MEDIUM, ActionItem.Status.PENDING));
            
            List<Map<String, String>> topics = new ArrayList<>();
            topics.add(Map.of("name", "Release Timeline Alignment", "duration", "15 min"));
            topics.add(Map.of("name", "QA Testing Constraints", "duration", "12 min"));
            topics.add(Map.of("name", "Deployment & Rollback Strategy", "duration", "10 min"));
            insights.put("topics", topics);
            
            insights.put("risks", List.of(
                "Potential delays if regression tests uncover major block issues on Wednesday.",
                "Staging-to-production database synchronization mismatches."
            ));
            
            insights.put("followUps", List.of(
                "Priya to post intermediate QA status on Slack by Tuesday afternoon.",
                "Soumen to prepare dry-run rollout script by Wednesday."
            ));
            
            insights.put("sentiment", "Goal-oriented and highly collaborative with clear accountability and deadline alignment.");
        } else if (lowerTitle.contains("client") || lowerTitle.contains("sync") || lowerTitle.contains("design")) {
            result.put("summary", "The design sync focused on updating Figma portals based on client guidelines. The client requested a default dark mode layout and condensed metric displays. Amit updated these dashboard assets and will sync Drive links by 5 PM. Vikram highlighted potential latent latency issues regarding payment gateway keys.");
            
            decisions.add("The client dashboard default layout will be dark mode and utilize compressed cards.");
            decisions.add("Production payment gateway key latency will be flagged as an external project risk.");
            
            actionItems.add(new ActionItem(UUID.randomUUID().toString(), "Export updated dark mode high-fidelity mockups to Drive", "Amit", "Today by 5 PM", ActionItem.Priority.HIGH, ActionItem.Status.PENDING));
            actionItems.add(new ActionItem(UUID.randomUUID().toString(), "Write payment gateway risk assessment overview document", "Vikram", "Thursday", ActionItem.Priority.MEDIUM, ActionItem.Status.PENDING));
            actionItems.add(new ActionItem(UUID.randomUUID().toString(), "Compile client presentation and attach design assets", "Sarah", "Tomorrow morning", ActionItem.Priority.HIGH, ActionItem.Status.PENDING));

            List<Map<String, String>> topics = new ArrayList<>();
            topics.add(Map.of("name", "Figma Design Review", "duration", "20 min"));
            topics.add(Map.of("name", "Payment Gateway Security", "duration", "10 min"));
            insights.put("topics", topics);

            insights.put("risks", List.of(
                "Payment gateway provider takes longer than expected to issue live keys."
            ));

            insights.put("followUps", List.of(
                "Sarah to request early API sandbox access from payment provider."
            ));

            insights.put("sentiment", "Feedback-focused with a strong emphasis on refining user interfaces and managing integration risks.");
        } else {
            result.put("summary", "The weekly sync reviewed current feature progress. Priya has completed the frontend profile page and will coordinate with Soumen to align the backend REST DTO validation. Soumen will finish validation parameters today, and JUnit integration testing coverage is planned for Thursday.");
            
            decisions.add("Priya and Soumen will pair-program to resolve the backend API DTO validation discrepancies.");
            decisions.add("JUnit integration testing suite coverage targets will be finished by Thursday.");
            
            actionItems.add(new ActionItem(UUID.randomUUID().toString(), "Add backend validations to the user profile update API", "Soumen", "Today", ActionItem.Priority.HIGH, ActionItem.Status.PENDING));
            actionItems.add(new ActionItem(UUID.randomUUID().toString(), "Sync frontend DTO structures with backend endpoint", "Priya", "Tomorrow", ActionItem.Priority.MEDIUM, ActionItem.Status.PENDING));
            actionItems.add(new ActionItem(UUID.randomUUID().toString(), "Write JUnit core integration tests for the service layer", "Soumen", "Thursday afternoon", ActionItem.Priority.MEDIUM, ActionItem.Status.PENDING));

            List<Map<String, String>> topics = new ArrayList<>();
            topics.add(Map.of("name", "Profile Feature Sync", "duration", "10 min"));
            topics.add(Map.of("name", "Testing & Coverage Strategy", "duration", "15 min"));
            insights.put("topics", topics);

            insights.put("risks", List.of(
                "Integration delays if DTO data structure schemas mismatch."
            ));

            insights.put("followUps", List.of(
                "Priya to share updated API payload sample in Slack."
            ));

            insights.put("sentiment", "Technical, constructive, and execution-oriented.");
        }

        result.put("keyDecisions", decisions);
        result.put("actionItems", actionItems);
        result.put("aiInsights", insights);
        
        return result;
    }
}
