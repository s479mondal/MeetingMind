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

import org.springframework.beans.factory.annotation.Value;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class SummarizationService {

    @Autowired
    private SettingsService settingsService;

    @Value("${app.groq.api-key:}")
    private String groqApiKey;

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .readTimeout(90, TimeUnit.SECONDS)
            .build();

    public Map<String, Object> analyzeTranscript(String transcript, String title) throws Exception {
        SystemSettings settings = settingsService.getActiveSettings();
        
        String provider = settings.getSummaryProvider();
        if (provider == null) {
            provider = "groq"; // fallback
        }
        provider = provider.toLowerCase();

        String apiKey = null;
        String baseUrl = null;
        String modelName = null;

        if ("groq".equals(provider)) {
            apiKey = (groqApiKey != null && !groqApiKey.trim().isEmpty()) ? groqApiKey : settings.getOpenaiApiKey();
            baseUrl = "https://api.groq.com/openai/v1";
            modelName = "llama-3.3-70b-versatile";
        } else if ("gemini".equals(provider)) {
            apiKey = (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) ? geminiApiKey : settings.getOpenaiApiKey();
            baseUrl = "https://generativelanguage.googleapis.com/v1beta/openai";
            modelName = "gemini-2.5-flash";
        } else {
            // custom / default
            apiKey = settings.getOpenaiApiKey();
            baseUrl = settings.getOpenaiBaseUrl();
            modelName = settings.getLlmModel();
        }

        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IOException("API Key for " + provider + " is missing. Please configure it in your environment/settings.");
        }

        return analyzeWithLLM(transcript, apiKey, baseUrl, modelName);
    }

    private Map<String, Object> analyzeWithLLM(String transcript, String apiKey, String baseUrl, String modelName) throws Exception {
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
        payload.put("model", modelName);
        
        ArrayNode messages = payload.putArray("messages");
        ObjectNode systemMessage = messages.addObject();
        systemMessage.put("role", "system");
        systemMessage.put("content", "You are a helpful meeting assistant that outputs raw JSON.");
        
        ObjectNode userMessage = messages.addObject();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        
        payload.put("temperature", 0.1);

        String jsonPayload = objectMapper.writeValueAsString(payload);
        String url = baseUrl + "/chat/completions";

        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + apiKey)
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
}
