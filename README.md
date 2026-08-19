# 🧠 MeetingMind — AI Meeting Intelligence Platform

> **Assignment:** Meeting Summarizer | AI-powered transcription, summarization, and action-item extraction from meeting audio recordings.

MeetingMind is a full-stack, production-quality AI meeting summarizer. Users upload meeting audio recordings, and the system automatically:
- **Transcribes** the audio using OpenAI Whisper (ASR)
- **Summarizes** the discussion using GPT-4o-mini (LLM)
- **Extracts** key decisions, action items (with assignees & deadlines), and AI insights

It includes a polished React frontend, a Spring Boot REST backend, and MongoDB Atlas for persistence — with a built-in **demo/mock mode** that works without any API key.

---

## 📺 Demo Video

> 🎬 **[Watch the Demo Video](#)** ← *(link to be added)*

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎙️ **ASR Transcription** | Uploads audio to OpenAI Whisper (`whisper-1`) → returns full text transcript |
| 📝 **Executive Summary** | LLM-generated paragraph summarizing the discussion |
| ✅ **Action Items** | Structured tasks with assignee, deadline, priority (HIGH/MEDIUM/LOW), and completion status |
| 🎯 **Key Decisions** | Bullet list of decisions made during the meeting |
| 🤖 **AI Insights** | Topics covered, risks identified, follow-up suggestions, overall tone/sentiment |
| 📊 **Dashboard** | Real-time metrics: meetings processed, action item stats, total audio minutes analyzed |
| 🔍 **Meeting History** | Searchable, sortable list of all past meetings |
| 📋 **Action Item Board** | Cross-meeting task aggregation (like a project board) |
| ⚙️ **Settings UI** | Configure API key, LLM model, and ASR mode from the browser — no code changes needed |
| 🌗 **Dark Mode** | Full dark/light theme support with `localStorage` persistence |
| 🧪 **Mock/Demo Mode** | Fully functional demo with preset realistic transcripts and analysis — no API key needed |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Router v7, Axios, Lucide React |
| **Backend** | Java 17, Spring Boot 3.3, Spring Data MongoDB, OkHttp 4 |
| **Database** | MongoDB Atlas (cloud) |
| **ASR (Speech-to-Text)** | OpenAI Whisper API (`whisper-1`) |
| **LLM (Summarization)** | OpenAI Chat Completions API (`gpt-4o-mini`) |
| **Build Tools** | Maven (backend), npm (frontend) |

---

## 🔄 How It Works

```
User uploads audio file
        ↓
Backend validates & saves initial record → status: UPLOADING
        ↓
Returns HTTP 202 immediately (non-blocking async processing)
        ↓  (background thread)
┌──────────────────────────────────────┐
│  STEP 1 — TRANSCRIBING               │
│  → OpenAI Whisper API                │
│  → Audio file → plain text transcript│
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│  STEP 2 — ANALYZING                  │
│  → GPT-4o-mini with structured prompt│
│  → Returns JSON: summary,            │
│    keyDecisions, actionItems,        │
│    aiInsights (topics/risks/followUps│
│    /sentiment)                       │
└──────────────────────────────────────┘
        ↓
Saved to MongoDB → status: COMPLETED
User views full results in the UI
```

### LLM Prompt Strategy

The summarization prompt is carefully engineered to return a **strict JSON schema** (no markdown wrappers). Example:

```
You are a professional meeting intelligence AI. Analyze the following meeting transcript.
Extract:
1. A concise executive summary (1-2 paragraphs)
2. A list of key decisions made
3. Action items with: task, assignee, deadline, priority (HIGH/MEDIUM/LOW)
4. AI insights: topics (with duration), risks, follow-ups, sentiment

IMPORTANT: Return ONLY valid JSON. Do NOT wrap in markdown code blocks.
```

This ensures reliable, structured extraction that maps directly to the data model — no post-processing ambiguity.

---

## 📁 Project Structure

```
MeetingMind/
├── .env                          ← Environment variables (copy from .env.example)
├── .env.example                  ← Template with all required variables
├── backend/                      ← Spring Boot REST API
│   ├── src/main/java/com/meetingmind/
│   │   ├── MeetingMindApplication.java   ← Entry point (@EnableAsync, @EnableMongoAuditing)
│   │   ├── config/
│   │   │   ├── CorsConfig.java           ← CORS (allows :5173)
│   │   │   └── MongoConfig.java          ← Auto-creates collections + indexes
│   │   ├── controller/
│   │   │   ├── MeetingController.java    ← Upload, list, get, delete endpoints
│   │   │   ├── ActionItemController.java ← PATCH / DELETE action items
│   │   │   └── SystemSettingsController.java ← API key & model config
│   │   ├── model/
│   │   │   ├── Meeting.java              ← MongoDB document (with embedded ActionItems)
│   │   │   ├── ActionItem.java           ← Embedded task model
│   │   │   └── SystemSettings.java       ← Singleton config document
│   │   ├── repository/
│   │   │   ├── MeetingRepository.java    ← Full-text search query
│   │   │   └── SystemSettingsRepository.java
│   │   └── service/
│   │       ├── MeetingService.java       ← Orchestrates async pipeline
│   │       ├── TranscriptionService.java ← Whisper API / mock transcript
│   │       ├── SummarizationService.java ← GPT API / mock analysis
│   │       └── SettingsService.java      ← Shared settings accessor
│   └── pom.xml
└── frontend/                     ← React + Vite SPA
    └── src/
        ├── App.jsx                       ← Router + dark mode init
        ├── components/Sidebar.jsx        ← Navigation
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── Dashboard.jsx
        │   ├── UploadMeeting.jsx
        │   ├── MeetingHistory.jsx
        │   ├── MeetingDetail.jsx
        │   ├── ActionItemsPage.jsx
        │   └── Settings.jsx
        └── services/api.js               ← Axios service layer
```

---

## 🚀 Setup & Running

### Prerequisites

| Requirement | Version |
|---|---|
| Java JDK | 17 or higher |
| Node.js | 18 or higher |
| MongoDB | Atlas URI (or local `mongodb://localhost:27017`) |
| OpenAI API Key | Optional — app works in Mock Mode without it |

---

### Step 1 — Configure Environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# ── MongoDB ──────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/meetingmind

# ── OpenAI (optional — leave as-is for Demo Mode) ─
OPENAI_API_KEY=sk-...          # Your key from platform.openai.com/api-keys
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_LLM_MODEL=gpt-4o-mini
ASR_PROVIDER=openai-whisper    # Change to 'mock' for Demo Mode

# ── Frontend ──────────────────────────────────────
VITE_API_URL=http://localhost:8080/api
```

> 💡 **No OpenAI key?** Set `ASR_PROVIDER=mock` — the app will run fully in Demo Mode with realistic preset data.

---

### Step 2 — Start the Backend

```bash
cd backend

# Option A: Using the bundled Maven wrapper
..\maven\bin\mvn.cmd spring-boot:run

# Option B: Using system Maven
mvn spring-boot:run

# Option C: Using the included batch file (Windows)
start.bat
```

Backend starts at **http://localhost:8080**

---

### Step 3 — Start the Frontend

```bash
cd frontend
npm install      # First time only
npm run dev
```

Frontend starts at **http://localhost:5173**

---

### Step 4 — Open the App

Navigate to **http://localhost:5173** in your browser.

---

## 🧪 Demo Mode (No API Key Required)

The app has a built-in **Mock/Demo Mode** — no OpenAI account needed.

The mock engine keyword-matches the meeting title and returns realistic, pre-written transcripts and analysis:

| Meeting title contains | Preset scenario |
|---|---|
| `sprint`, `planning`, `project` | Release timeline, QA testing, deployment decisions |
| `client`, `sync`, `design` | Figma review, dark mode feedback, payment gateway risk |
| *(any other title)* | Feature sync, backend/frontend coordination |

To enable: set `ASR_PROVIDER=mock` in `.env` **or** go to **Settings → ASR Provider → Demo Mode → Save**.

---

## 📡 REST API Reference

### Meetings

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/meetings/upload` | Upload audio file (multipart: `file`, optional `title`) |
| `GET` | `/api/meetings` | List all meetings (`?search=`, `?sortBy=`, `?sortDir=`) |
| `GET` | `/api/meetings/{id}` | Get full meeting details |
| `DELETE` | `/api/meetings/{id}` | Delete meeting and all its data |
| `GET` | `/api/meetings/{id}/transcript` | Get raw transcript text |
| `GET` | `/api/meetings/{id}/summary` | Get summary only |
| `GET` | `/api/meetings/{id}/action-items` | Get action items list |

### Action Items

| Method | Endpoint | Description |
|---|---|---|
| `PATCH` | `/api/action-items/{meetingId}/{itemId}` | Update status / assignee / task / priority / deadline |
| `DELETE` | `/api/action-items/{meetingId}/{itemId}` | Delete a single action item |

### System Settings

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/system/settings` | Get current AI configuration |
| `POST` | `/api/system/settings` | Save API key + model + ASR provider |

---

## 📊 Data Model

```
Meeting {
  id, title, fileName, duration (min), status,
  transcript, summary,
  keyDecisions: [string],
  actionItems: [{ id, task, assignee, deadline, priority, status }],
  aiInsights: { topics, risks, followUps, sentiment },
  createdAt, updatedAt
}
```

Meeting status lifecycle: `UPLOADING → TRANSCRIBING → ANALYZING → COMPLETED / FAILED`

---

## 🔮 Future Improvements

1. **Audio Player Sync** — Highlight transcript in real time as audio plays
2. **Speaker Diarization** — Auto-detect and label different speakers
3. **Export to Jira / Trello / Slack** — Push action items directly to project tools
4. **Google Drive Import** — Import recordings directly from cloud storage
5. **Email Digest** — Auto-send meeting summaries to participants
