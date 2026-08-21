# 🧠 MeetingMind — AI Meeting Intelligence Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
[![OpenAI](https://img.shields.io/badge/OpenAI-Whisper%20%26%20GPT--4o--mini-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)

> **Meeting Summarizer & Intelligence Platform** | Transform raw meeting audio recordings into automated ASR transcriptions, concise executive summaries, actionable key decisions, and structured task assignments.

MeetingMind is a full-stack AI platform designed to automate meeting documentation. Users upload meeting audio files (MP3, WAV, M4A, WEBM, FLAC), and the system automatically transcribes, analyzes, and extracts key insights. It supports both **live AI mode** (via OpenAI API) and a **zero-dependency Demo/Mock mode** for offline testing.

---

## 📺 Demo Video

> 🎬 **[Watch the MeetingMind Walkthrough Video](#)** *(Video link available in project documentation)*

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎙️ **ASR Speech-to-Text** | Automatic audio transcription via **OpenAI Whisper (`whisper-1`)** with background async execution |
| 📝 **Executive Summary** | AI-generated executive summaries capturing meeting context and key discussion points |
| ✅ **Action Items Board** | Structured task extraction featuring assignees, deadlines, priorities (`HIGH`, `MEDIUM`, `LOW`), and status tracking |
| 🎯 **Key Decisions** | Highlighted bullet points of binding decisions made during the discussion |
| 🤖 **AI Deep Insights** | Automated extraction of key topics covered, identified project risks, follow-up suggestions, and overall sentiment analysis |
| 📊 **Analytics Dashboard** | Live real-time statistics covering total audio hours processed, active action items, and meeting counts |
| 🔍 **Search & Filters** | Instant full-text search across meeting titles, summaries, and transcripts with multi-field sorting |
| ⚙️ **System Settings UI** | Dynamic browser-based AI provider configuration (switch between Live API & Demo/Mock mode without restarting) |
| 🌗 **Dark / Light Theme** | Premium glassmorphism design with seamless theme toggling and persistent browser preference |
| 🧪 **Offline Demo Mode** | Built-in realistic mock engine with sample audio scenarios — no OpenAI API key required |

---

## 🏗️ Technical Architecture & Tech Stack

### Technology Matrix

| Layer | Technology & Framework |
|---|---|
| **Frontend UI** | React 19, Vite 8, Tailwind CSS v4, React Router v7, Axios, Lucide Icons |
| **Backend API** | Java 17, Spring Boot 3.3, Spring Data MongoDB, OkHttp 3/4, Jackson |
| **Database** | MongoDB Atlas (Cloud Cluster) / Local MongoDB instance |
| **Speech Recognition** | OpenAI Whisper API (`whisper-1`) / Built-in Mock Transcriber |
| **Intelligence Engine** | OpenAI Chat Completions API (`gpt-4o-mini`) / Mock Analyzer |
| **Build & Tooling** | Maven 3.8+ (Backend), Node.js 18+ & npm (Frontend) |

### System Workflow Pipeline

```
                     ┌───────────────────────────┐
                     │   User Uploads Audio      │
                     └─────────────┬─────────────┘
                                   │ (Multipart HTTP POST)
                                   ▼
                     ┌───────────────────────────┐
                     │   Spring Boot Controller  │
                     │  Creates record: UPLOADING│
                     └─────────────┬─────────────┘
                                   │ Returns HTTP 202 Accepted
                                   ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │               ASYNCHRONOUS PIPELINE (Background Thread)              │
 │                                                                       │
 │  [Step 1: Speech-to-Text (ASR)]                                       │
 │   • Status -> TRANSCRIBING                                            │
 │   • Audio file sent to OpenAI Whisper API (or Mock Engine)            │
 │   • Output: Full text transcript string                               │
 │                                                                       │
 │  [Step 2: AI Summarization & Analytics (LLM)]                         │
 │   • Status -> ANALYZING                                               │
 │   • Transcript sent to GPT-4o-mini with structured JSON system prompt │
 │   • Output: Summary, Key Decisions, Action Items, AI Insights          │
 │                                                                       │
 │  [Step 3: Persistence]                                                │
 │   • Status -> COMPLETED                                               │
 │   • Document updated in MongoDB Atlas                                 │
 └───────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                     ┌───────────────────────────┐
                     │   React Frontend Displays │
                     │   Full Results & Dashboard│
                     └───────────────────────────┘
```

---

## 📁 Repository Structure

```
MeetingMind/
├── .env                              ← Global environment configuration
├── .env.example                      ← Configuration template
├── backend/                          ← Spring Boot Server Application
│   ├── src/main/java/com/meetingmind/
│   │   ├── MeetingMindApplication.java   ← App Entrypoint (@EnableAsync, @EnableMongoAuditing)
│   │   ├── config/                   ← CORS configuration & Mongo index builders
│   │   ├── controller/               ← REST API controllers (Meetings, ActionItems, Settings)
│   │   ├── model/                    ← Data entities (Meeting, ActionItem, SystemSettings)
│   │   ├── repository/               ← Spring Data Mongo Repositories
│   │   └── service/                  ← Business logic & Async processing engine
│   ├── start.bat                     ← One-click Windows starter script
│   └── pom.xml                       ← Maven project declaration & dependencies
├── frontend/                         ← React + Vite Web Application
│   ├── src/
│   │   ├── components/               ← Reusable components (Sidebar, Modals, Badges)
│   │   ├── pages/                    ← Views (Dashboard, Upload, History, Detail, Settings)
│   │   ├── services/                 ← Axios HTTP API service wrapper
│   │   ├── App.jsx                   ← App Router & Layout setup
│   │   └── index.css                 ← Tailwind CSS rules & Custom Design Tokens
│   ├── package.json                  ← Frontend dependencies & build scripts
│   └── vite.config.js                ← Vite build & proxy settings
└── maven/                            ← Bundled Maven wrapper binaries
```

---

## 🚀 Quick Start Guide

### Prerequisites

Ensure you have the following installed on your local development machine:

- **Java Development Kit (JDK)**: Version 17 or higher (`java -version`)
- **Node.js**: Version 18.0.0 or higher (`node -v`)
- **npm**: Version 9.0.0 or higher (`npm -v`)
- **MongoDB**: Access to a MongoDB Atlas cluster URL or local MongoDB instance

---

### Step 1: Environment Setup

Clone the repository and copy the environment variables template:

```bash
# Clone repository
git clone https://github.com/your-username/MeetingMind.git
cd MeetingMind

# Create your .env file
cp .env.example .env
```

Edit `.env` with your preferred credentials:

```ini
# MongoDB Connection
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/meetingmind?retryWrites=true&w=majority

# OpenAI Integration (Optional - set provider to 'mock' if no API key)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_LLM_MODEL=gpt-4o-mini
ASR_PROVIDER=openai-whisper

# Application Ports & URLs
SERVER_PORT=8080
VITE_API_URL=http://localhost:8080/api
```

---

### Step 2: Launch the Backend (Spring Boot)

Navigate to the `backend` directory and start the Spring Boot server:

#### On Windows:
```cmd
cd backend
..\maven\bin\mvn.cmd spring-boot:run
```
*Or simply double-click `backend/start.bat`.*

#### On Linux / macOS:
```bash
cd backend
mvn spring-boot:run
```

The REST API server will start on **`http://localhost:8080`**.

---

### Step 3: Launch the Frontend (React + Vite)

In a separate terminal window, start the React application:

```bash
cd frontend

# Install dependencies (first-time setup)
npm install

# Run Vite dev server
npm run dev
```

The frontend application will open at **`http://localhost:5173`**.

---

## 🧪 Demo / Mock Mode (Zero-API Key Required)

If you do not have an active OpenAI API key, MeetingMind comes with a built-in **Mock Processing Engine**.

### How to Enable Mock Mode:
1. **Option A (via `.env`)**: Set `ASR_PROVIDER=mock` in your `.env` file before launching the backend.
2. **Option B (via Web UI)**: Go to **Settings** in the web app UI → select **Demo Mode (Mock Engine)** under ASR Provider → Click **Save Settings**.

### Preset Mock Scenarios:
When uploading audio in Mock Mode, the engine intelligently evaluates the meeting title to provide realistic context:

| Meeting Title Keyword | Generated Mock Scenario |
|---|---|
| `sprint`, `planning`, `agile` | Software Development Sprint Planning, QA milestones, & Release timelines |
| `client`, `design`, `sync` | Product UX review, payment gateway integration, & Dark Mode feedback |
| *(Any other title)* | General Engineering Sync, cross-team collaboration, & task handoffs |

---

## 📡 REST API Reference

### Meeting Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/meetings/upload` | Upload audio file (`multipart/form-data`) with optional title |
| `GET` | `/api/meetings` | List meetings with filtering (`search`, `sortBy`, `sortDir`) |
| `GET` | `/api/meetings/{id}` | Retrieve complete details of a specific meeting |
| `DELETE` | `/api/meetings/{id}` | Permanently delete a meeting and its analytics |
| `GET` | `/api/meetings/{id}/transcript` | Get plain-text transcript |
| `GET` | `/api/meetings/{id}/summary` | Get executive summary |
| `GET` | `/api/meetings/{id}/action-items` | Get action items array for specific meeting |

### Action Item Endpoints

| Method | Path | Description |
|---|---|---|
| `PATCH` | `/api/action-items/{meetingId}/{itemId}` | Update task status, assignee, priority, or deadline |
| `DELETE` | `/api/action-items/{meetingId}/{itemId}` | Delete a single action item |

### System & Settings Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/system/settings` | Get current AI engine settings & provider mode |
| `POST` | `/api/system/settings` | Save updated OpenAI key, model selection, or provider |

---

## 📊 Data Model Overview

The core `Meeting` MongoDB Document schema:

```json
{
  "_id": "66c5a1f2e4b0123456789abc",
  "title": "Q3 Product Architecture Review",
  "fileName": "audio_recording_q3.mp3",
  "fileSizeBytes": 4512000,
  "durationSeconds": 1420,
  "status": "COMPLETED",
  "transcript": "Hello everyone, welcome to the architecture sync...",
  "summary": "The team discussed transitioning to microservices...",
  "keyDecisions": [
    "Approved migration of user service to Spring Boot 3",
    "Selected MongoDB Atlas for cloud document storage"
  ],
  "actionItems": [
    {
      "id": "act_01",
      "task": "Set up MongoDB Atlas indexes",
      "assignee": "Alex",
      "priority": "HIGH",
      "deadline": "2026-08-30",
      "status": "PENDING"
    }
  ],
  "aiInsights": {
    "topics": ["Architecture", "Database Migration", "API Specs"],
    "risks": ["Potential downtime during schema update"],
    "followUps": ["Schedule load testing session"],
    "sentiment": "POSITIVE"
  },
  "createdAt": "2026-08-21T18:30:00Z",
  "updatedAt": "2026-08-21T18:35:00Z"
}
```

---

## 🛠️ Troubleshooting & FAQ

<details>
<summary><b>Q: The frontend displays CORS error when calling backend API</b></summary>

> Ensure `CorsConfig.java` in backend permits `http://localhost:5173`. Also verify that `VITE_API_URL` in `.env` is set to `http://localhost:8080/api`.
</details>

<details>
<summary><b>Q: Spring Boot fails to connect to MongoDB</b></summary>

> Check that your IP address is whitelisted in MongoDB Atlas Network Access rules (`0.0.0.0/0` for dev mode) and that `MONGODB_URI` has special characters in password URL-encoded properly.
</details>

<details>
<summary><b>Q: Audio upload returns error "File size exceeds maximum permitted"</b></summary>

> The Spring Boot configuration supports multipart uploads up to 50MB by default. For larger audio files, compress to MP3/M4A format or increase limit in `application.properties`.
</details>

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p center>Crafted with ❤️ for seamless meeting productivity and AI intelligence.</p>
