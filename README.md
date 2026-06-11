---
title: RoadGuardian AI
emoji: 🚑
colorFrom: red
colorTo: black
sdk: docker
app_port: 7860
---

# 🚑 RoadGuardian AI
### Autonomous Emergency Intelligence & Inclusive Safety Infrastructure

<p align="center">
  <img src="docs/assets/banner.png" alt="RoadGuardian AI Banner" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/CloudCamp-InfinityFest-blueviolet" alt="Hackathon" />
  <img src="https://img.shields.io/badge/Status-Active-success" alt="Status" />
  <img src="https://img.shields.io/badge/AI-Multi--Agent-orange" alt="AI" />
  <img src="https://img.shields.io/badge/RAG-ChromaDB-red" alt="RAG" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688" alt="Backend" />
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB" alt="Frontend" />
  <img src="https://img.shields.io/badge/PWA-Installable-blue" alt="PWA" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

> **RoadGuardian AI is an AI-native emergency safety and telematics platform built for underserved, low-connectivity, and accessibility-critical regions across the BIMSTEC countries.**

An offline-first, multi-agent emergency coordination system that combines real-time AI orchestration, on-device first-aid RAG, Model Context Protocol (MCP) dispatch services, and a panic-optimized, accessibility-first user interface into an installable Progressive Web Application (PWA).

---

## 🎥 Pitch Demo & Mockup Previews

* **⚡ Pitch Walkthrough Timeline (`/demo-graph`)**: A dual-pane presentation panel showing Riya Akter’s Kanchpur Bridge scenario chronological stepper (6:12 PM to 7:08 PM) synced to the simulated mobile device views automatically.
* **🆘 Emergency Rescue (`/emergency`)**: Accessibility-first visual/tactile SOS trigger with visual vibration pulses, high-contrast indicators, and bystander support cards.
* **📊 Mission Control (`/dashboard`)**: A dark-mode operator console displaying multi-agent telemetry pipelines, nearest hospital routes, and the Emergency Ride Dispatch panel (integrated with Pathao, oBhai, and Uber).
* **⚠️ Hazard Reporter (`/hazard`)**: Edge-AI vision telemetry upload and safe route AI alternative pathways analyzer.
* **♿ Accessibility Hub (`/accessibility`)**: Toggle deaf/dyslexia accessibility modes and download a custom-generated SVG/PNG medical ID QR Lockscreen overlay.

---

## 🌍 The Problem: The "Golden Hour" Crisis
Road accidents claim over **300,000 lives annually across BIMSTEC countries**. Most preventable deaths occur during the **Golden Hour** (the first 60 minutes after crash impact) due to:
1. **Network Blindspots**: Rural highways and mountain corridors lack stable cellular data.
2. **Access Barriers**: Traditional emergency dispatch calls (999/112) assume vocal and hearing capabilities, excluding specially abled users (deaf, speech-impaired).
3. **Information Void**: First responders arrive with no patient data (blood groups, medical allergies), and bystanders lack immediate, step-by-step first-aid guidance.
4. **Language Gaps**: Tourists and cross-border travelers cannot communicate critical trauma symptoms to local responders.

---

## 💡 The Solution: Autonomous Telematics & PWA Orchestration
RoadGuardian AI replaces slow, manual voice emergency calls with automated, hardware-verified emergency telemetry pipelines.

```text
                  [ CRASHSENSE TELEMETRY FLOW ]
                  
     Accident Occurs ──> Sensor Fusion detects 4.2g G-force & GPS drop
                     ──> Mobile PWA switches to Deaf-Visual Panic countdown
                     ──> SOS triggers automated multi-agent pipeline
                     ──> SMS fallback alerts family & dispatches ambulance
                     ──> Pre-arrival medical ID parsed by trauma ER
```

---

## ✨ Core Feature Matrices

### 🧠 Multi-Agent Orchestrator (LangGraph Stack)
* **Orchestrator Agent**: Master loop managing state transitions between `DETECTED`, `TRIAGED`, `DISPATCHED`, and `RESOLVED`.
* **Triage Agent**: Estimates injury severity (1-100 scale) and flags high-risk conditions (e.g. spinal fracture risk).
* **Locate Agent**: Coordinates live geospatial lookup for the closest specialized trauma facilities.
* **Dispatch Agent**: Invokes MCP tools to assign emergency vehicles and alert municipal contacts.
* **Hazard Agent**: Crowdsources edge-AI camera frames to tag dangerous highway coordinates.

### 🌐 PWA & Mobile-First Redirection
* **Dynamic Viewport Switching**: When window width drops below `768px` (or accessed from mobile), the app hides the desktop headers and frames, rendering the PWA layout fullscreen to mimic a native application.
* **Persistent Bottom Navigation**: Fast, one-handed navigation between **Home (🏠)**, **SOS Tracker (🆘)**, **Hospitals (🏥)**, **Medical ID (👤)**, and **A11y (♿)**.
* **PWA Caching & Manifests**: Fully installable on iOS and Android with custom app launchers, launch splash screens, and cached assets for offline stand-alone execution.

### ♿ Accessibility & Multilingual Inclusivity
* **Deaf Mode**: Visual vibration countdown pulsing, high-contrast flashing emergency cards, and text-to-speech voice readouts.
* **Dyslexia Mode**: Full-app override applying dyslexia-friendly typography and line-spacing.
* **BIMSTEC Translations**: Instant English, Bangla, Hindi, Burmese, Thai, Nepali, and Sinhala translation matrices for emergency bystanders.

### 🔌 Model Context Protocol (MCP) Infrastructure
1. **RoadGuardian Emergency MCP Server**: Handles `locate_nearest_hospital()`, `dispatch_ambulance()`, and `notify_family_contacts()`.
2. **CrashSense Telemetry MCP Server**: Analyzes vehicle G-force vectors via `analyze_crash_telemetry()`.
3. **Emergency Translator MCP Server**: Compiles bilingual bystander cards and localized safety phrases via `translate_emergency_phrase()`.

---

## 📊 Project Status: Live vs. Simulated

| Feature | Status | Technology / Implementation |
| :--- | :--- | :--- |
| **PWA Mobile Redirects** | 🟢 **Live** | Viewport checking listeners auto-switch layout & hide navigation when `< 768px`. |
| **Service Worker Caching** | 🟢 **Live** | Custom Service Worker (`sw.js`) caches static assets for offline capability. |
| **Hospital Locator** | 🟢 **Live** | Queries 5 live Overpass OSM API mirrors with client-side Haversine fallbacks. |
| **B2B Claims Generator** | 🟢 **Live** | Compiles crash telemetry, impact force, and dispatch details into a verifiable claims modal. |
| **Emergency Ride Dispatch** | 🟢 **Live** | Dashboard panel integrated with Pathao, oBhai, and Uber with GPS quick-copy capabilities. |
| **Downloadable QR Lockscreen** | 🟢 **Live** | Custom HTML5 Canvas renderer drawing personalized emergency wallpaper (notch, vitals) with immediate PNG download. |
| **BIMSTEC Bystander Cards** | 🟢 **Live** | Regional Translation Agent producing bilingual helper modals. |
| **Local LLM Fallback** | 🟡 **Simulated** | Emulates local Phi-3 / DeepSeek-R1 responses if no Groq Cloud Key is present. |
| **999 Emergency Dispatch** | 🟡 **Simulated** | Emulates dispatcher confirmation workflows and confirmation tickets. |

---

## 🏗️ Folder Structure
```text
roadguardian-ai/
├── frontend/                     # React + Vite + PWA web application
│   ├── public/                   # App icons, service worker files
│   └── src/
│       ├── components/           # MobileMockup frames, Navbars
│       ├── hooks/                # WebSocket hooks, Offline checks
│       ├── pages/                # PwaDemo, DemoFlow, MobileAppContainer
│       └── store/                # Zustand global store slices
├── backend/                      # FastAPI Backend Server
│   ├── api/                      # REST endpoints for SOS and telemetry
│   ├── local_llm/                # Local Ollama client wrappers
│   ├── mcp/                      # Custom MCP Servers (CrashSense, Translator)
│   ├── n8n_workflows/            # Exported JSON alert pipelines
│   ├── rag/                      # Document seeding and semantic search
│   └── websocket/                # Multi-agent websocket loop
└── shared-contracts/             # Shared WS payload schemas
```

---

## ⚙️ Installation & Running the Stack

### Prerequisites
* **Node.js**: v20+
* **Python**: v3.10+
* **ChromaDB** and **SentenceTransformers** python packages.

### Step 1: Clone and Configure Environment
```bash
git clone https://github.com/shakeraema/RoadGaurdian-AI.git
cd RoadGaurdian-AI
```

Create a `.env` file inside the `backend` folder:
```env
GROQ_API_KEY=your_groq_api_key_here
CHROMA_DB_PATH=./rag/chroma_db
```

### Step 2: Seed RAG Database & Run Backend
On first startup, the backend automatically seeds the vector store using trauma care documents inside `backend/rag/ingest`. To run:
- **Windows (PowerShell):**
  ```powershell
  .\.venv\Scripts\python.exe backend/main.py
  ```
- **Linux/macOS:**
  ```bash
  PYTHONPATH=. python3 backend/main.py
  ```
*Backend API will listen on:* `http://localhost:8000`

### Step 3: Run Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend interface will run on:* `http://localhost:5173`

---

## 🚀 Deployment & CI/CD Pipeline
- **Production Integration Roadmap:** See [REAL_DATA_WORKFLOW.md](file:///f:/HACKATHON/Inifnity/update/RoadGaurdianAI/RoadGaurdianAI/REAL_DATA_WORKFLOW.md) for planning transitioning mock components to real-world services.
- **Step-by-step Live Deployment Guide:** See [DEPLOYMENT_GUIDE.md](file:///f:/HACKATHON/Inifnity/update/RoadGaurdianAI/RoadGaurdianAI/DEPLOYMENT_GUIDE.md) to set up hosting on Vercel and Render.
- **GitHub CI/CD Automation:** The project features a GitHub Actions workflow in [.github/workflows/deploy.yml](file:///f:/HACKATHON/Inifnity/update/RoadGaurdianAI/RoadGaurdianAI/.github/workflows/deploy.yml) that builds the frontend and verifies backend syntax compilation on pull requests or commits.

---

## 🚀 The Commercial Path: InsurTech & Ride-Share Wedges
While emergency response is traditionally a low-monetization, slow-moving GovTech sale, RoadGuardian AI operates as a **B2B2C Telematics Risk Registry**:

1. **Ride-Share Safety Bundling (Pathao / oBhai / Uber)**: Embedding the CrashSense SDK into active passenger apps to decrease driver liability and secure lower fleet insurance rates.
2. **Insurance Claims Notarization**: Charging auto insurers a transactional fee ($5/report) to download hardware-verified, cryptographic "Incident Certificates" containing raw impact G-force, timestamps, and locations to eradicate claim fraud.
3. **Trauma ER Intake SaaS**: SaaS portals ($500 - $1,500/mo) for private healthcare networks that streamline intake billing pre-authorization, reducing ER intake delays from 25 minutes to zero.

*Note: The Social Impact Metrics and Commercial Business Model sections are dynamically rendered directly on the [Home landing page](file:///f:/HACKATHON/Inifnity/update/RoadGaurdianAI/RoadGaurdianAI/frontend/src/pages/Home.jsx).*

*For the complete YC-partner critique, risk analysis, and Year 1 to Year 10 execution roadmaps, see the strategic report:*  
📄 [roadguardian_business_analysis.md](file:///f:/HACKATHON/Inifnity/update/RoadGaurdianAI/RoadGaurdianAI/roadguardian_business_analysis.md)

---

## 👥 The Team

* **Zahid Hasan** (Frontend & UX Design)
* **Shakera Ema** (Backend & AI Infrastructure)
* **Mehrab Shakib** (Research & Planning)

*Licensed under the MIT License.*
