# MeetingMind — AI Meeting Intelligence

MeetingMind is a modern, production-quality AI Meeting Summarizer application. It allows users to upload meeting voice recordings, automatically transcribe them using speech-to-text (ASR), analyze the transcript with an LLM, and display an actionable meeting summary with executive summaries, structured action items, key decisions, and conversation insights.

---

## Tech Stack
* **Frontend:** React, Vite, Tailwind CSS, Lucide React, Axios, React Router
* **Backend:** Java 17, Spring Boot, Spring Web, Spring Data MongoDB
* **Database:** MongoDB
* **AI Engine:** OpenAI Whisper (ASR API) and OpenAI Chat Completion (GPT-4o-mini)

---

## Key Features
1. **ASR Speech-to-Text:** Automatic high-accuracy transcription of audio files (MP3, WAV, M4A).
2. **Executive Summaries:** AI-generated high-level overviews of the discussion.
3. **Key Decisions Timeline:** Chronological highlight of decisions made.
4. **Interactive Action Items:** Structured task list showing assignees, priorities (LOW, MEDIUM, HIGH), deadlines, and togglable completion states.
5. **AI Insights:** Automated extraction of main topics, potential risks, unresolved issues, follow-up suggestions, and tone.
6. **Central Action Center:** Unified board aggregating action items from all meetings.
7. **Repository:** Searchable, sortable historical record of all processed meetings.
8. **Demo / Mock Mode:** Allows testing the application immediately without inputting OpenAI keys.

---

## Project Structure
```
MeetingMind/
├── backend/                  # Spring Boot Application
│   ├── src/                  # Java Sources & Config Resources
│   └── pom.xml               # Maven dependencies
├── frontend/                 # Vite + React Client
│   ├── src/                  # React components, pages, api layers
│   └── index.html            # Main markup entry
└── README.md                 # Project instructions
```

---

## Setup Instructions

### 1. Prerequisites
* **Java:** JDK 17 or higher
* **Node.js:** Node 18+ (comes with npm)
* **MongoDB:** Installed and running locally (e.g., `mongodb://localhost:27017`) or an Atlas URI

### 2. Environment Variables
Create a `.env` file in the root or set these in your shell before starting:
```bash
# MongoDB Connection String (defaults to local if omitted)
MONGODB_URI=mongodb://localhost:27017/meetingmind

# Optional OpenAI API Configuration
# If not set, the application runs in a fully functional Demo/Mock Mode.
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_URL=https://api.openai.com/v1
```

### 3. Launching the Backend
Navigate to the `backend` folder and run the Maven wrapper or compile using the maven executable:
```bash
# Clean and run package
../maven/bin/mvn.cmd clean package

# Start the Spring Boot Application
../maven/bin/mvn.cmd spring-boot:run
```
The REST API server will start on [http://localhost:8080](http://localhost:8080).

### 4. Launching the Frontend
Navigate to the `frontend` folder, install packages, and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
The application will launch on [http://localhost:5173](http://localhost:5173).

---

## API Documentation

### Meetings
* `POST   /api/meetings/upload` - Upload meeting audio file (accepts `file` parameter as Multipart file and optional `title` parameter)
* `GET    /api/meetings` - Fetch all meetings (supports optional query params: `search`, `sortBy` e.g., `createdAt` or `duration`, `sortDir` e.g., `desc`/`asc`)
* `GET    /api/meetings/{id}` - Fetch specific meeting details
* `DELETE /api/meetings/{id}` - Delete meeting record and all associated summary/transcripts
* `GET    /api/meetings/{id}/transcript` - Fetch meeting transcript
* `GET    /api/meetings/{id}/summary` - Fetch meeting summary
* `GET    /api/meetings/{id}/action-items` - Fetch action items list

### Action Items
* `PATCH  /api/action-items/{meetingId}/{actionItemId}` - Update fields (status: `PENDING`/`IN_PROGRESS`/`COMPLETED`, assignee, task, priority: `LOW`/`MEDIUM`/`HIGH`, deadline)
* `DELETE /api/action-items/{meetingId}/{actionItemId}` - Remove task

### Settings
* `GET    /api/system/settings` - Retrieve system configuration state
* `POST   /api/system/settings` - Update OpenAI credentials and settings

---

## Future Improvements
1. **Audio Player Sync:** Synchronize the audio player playback timeline with highlighting inside the transcript.
2. **Speaker Identification (Diarization):** Integrate speaker segmentation endpoints to differentiate voice tracks automatically.
3. **Export Reports:** Expand options to export action items directly to Jira, Trello, or Slack.
4. **Google Drive Integration:** Enable importing recordings directly from user cloud storage paths.
