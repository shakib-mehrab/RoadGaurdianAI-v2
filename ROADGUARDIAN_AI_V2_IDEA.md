# RoadGuardian AI — Autonomous Emergency Intelligence for Inclusive Road Safety

## Project Name

RoadGuardian AI — Autonomous Emergency Intelligence for Inclusive Road Safety

## One-Line Elevator Pitch

“A multi-agent AI emergency copilot that autonomously coordinates rescue, delivers offline-first multilingual guidance, and learns from every road incident — built for 3 billion underserved road users across BIMSTEC.”

## Public Summary

RoadGuardian AI is an autonomous, multi-agent emergency response platform that combines real-time AI triage, RAG-powered multilingual first-aid guidance, MCP-connected hospital/police dispatch APIs, computer vision road hazard detection, and accessibility-first inclusive design into a single life-saving system. It operates in low-bandwidth environments, supports deaf, visually impaired, speech-impaired, and elderly users, and uses a coordinated swarm of specialized AI agents to compress emergency response time from 15+ minutes to under 90 seconds. Every incident feeds a living knowledge graph that makes the system smarter with every crash.

## Problem Statement

Every 4 minutes, someone dies in a road accident in South/Southeast Asia.

The core failure cascade is:

1. Victim panics → no coherent action
2. Network unavailable → apps fail completely
3. Bystanders don’t know what to do → golden hour wasted
4. Emergency dispatch is manual, slow, uncoordinated
5. Specially abled users have zero purpose-built emergency tools
6. No system learns from incidents to prevent the next one

700,000+ annual road deaths across BIMSTEC nations. Existing apps show you a hospital list. That is not emergency response.

## Why Existing Solutions Fail

| Solution         | Failure Mode                            |
| ---------------- | --------------------------------------- |
| Google Maps      | Shows hospitals, no triage guidance     |
| Uber/Grab SOS    | Internet-dependent, no medical guidance |
| National 999/112 | Language barriers, slow dispatch        |
| FirstAid apps    | No real-time AI, not accessible         |
| Hospital apps    | Siloed, no cross-system coordination    |

None offer: offline AI + multi-agent coordination + accessibility + RAG medical guidance + learning from incidents.

## Full Technical Architecture

### The 7-Agent Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                           │
│              (LangGraph StateGraph Master)                      │
│         Routes context → assigns sub-agents → monitors          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐──────────────┐
        ▼              ▼              ▼              ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
  │  TRIAGE  │  │  LOCATE  │  │ DISPATCH │  │  GUIDANCE    │
  │  AGENT   │  │  AGENT   │  │  AGENT   │  │  AGENT       │
  │(Medic AI)│  │(Geo AI)  │  │(MCP Hub) │  │(RAG + LLM)   │
  └──────────┘  └──────────┘  └──────────┘  └──────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
  │HAZARD    │  │TRANSLATE │  │OBSERVE   │  │  SAFETY      │
  │DETECT    │  │  AGENT   │  │  AGENT   │  │  GUARD AGENT │
  │AGENT     │  │(i18n AI) │  │(Traces)  │  │(Guardrails)  │
  └──────────┘  └──────────┘  └──────────┘  └──────────────┘
```

### Agent Descriptions

1. Orchestrator Agent (LangGraph StateGraph)
   - Receives incident trigger (voice/tap/crash sensor)
   - Classifies severity (1–5 scale) using structured LLM output
   - Routes to relevant sub-agents in parallel
   - Manages state machine: DETECTED → TRIAGED → DISPATCHED → GUIDED → RESOLVED

2. Triage Agent (Medical AI)
   - Input: user-described symptoms + vitals if available
   - RAG over: WHO first-aid protocols, Bangladesh/India emergency medical guidelines, BIMSTEC trauma care PDFs
   - Output: prioritized action list, severity classification, “do NOT move patient” flags
   - Model: Llama 3.1 8B (local/Groq) fine-tuned prompts for medical triage

3. Locate Agent (Geo AI)
   - Real-time GPS + offline cached maps
   - Finds: nearest trauma center, blood bank, accessible hospital
   - Filters by: accessibility features, specialization (burns, ortho, neuro), real-time bed availability (where API exists)
   - Uses: OpenStreetMap Overpass API + Nominatim + cached GeoJSON

4. Dispatch Agent (MCP Hub)
   - THIS IS YOUR MCP INTEGRATION
   - Connects via MCP protocol to:
     - Hospital dispatch MCP server
     - Police emergency MCP server
     - Ambulance service MCP server
     - SMS gateway MCP server (Twilio/local)
     - Family notification MCP server
   - Sends structured emergency payload: GPS, blood group, injury type, accessibility needs
   - Tracks acknowledgment, retries on failure

5. Guidance Agent (RAG + LLM)
   - Hybrid RAG: dense (embeddings) + sparse (BM25) + reranker
   - Knowledge base: 500+ first-aid protocols, 8 languages, accessibility-adapted
   - Streams step-by-step instructions in user’s language
   - Adapts output format: text, large-font visual cards, voice, vibration sequences
   - Multimodal: can receive photo of wound and give visual-grounded guidance

6. Hazard Detection Agent (Vision AI)
   - YOLOv8 + custom pothole/flood/debris dataset
   - Processes uploaded road images
   - Creates geo-tagged hazard reports
   - Feeds into community hazard map
   - Aggregates patterns → weekly municipal hazard digest

7. Safety Guard Agent (Guardrails)
   - Runs on EVERY agent output
   - Detects: hallucinated hospital names, dangerous medical advice, incorrect dosage
   - Uses: NeMo Guardrails + custom ruleset
   - Flags low-confidence outputs for human review
   - Critical for medical advice credibility

## MCP Architecture (Deep Integration)

RoadGuardian MCP Server

```
├── tools/
│   ├── dispatch_ambulance(location, severity, blood_group)
│   ├── notify_family(contact_list, gps, status)
│   ├── find_hospital(lat, lng, accessibility_needs, specialization)
│   ├── send_police_alert(location, incident_type)
│   ├── get_blood_availability(hospital_id, blood_group)
│   └── create_hazard_report(image, location, type)
├── resources/
│   ├── emergency_contacts://bangladesh
│   ├── first_aid_protocols://who
│   └── hospital_registry://bimstec
└── prompts/
    ├── triage_prompt
    ├── accessibility_guidance_prompt
    └── multilingual_emergency_prompt
```

RoadGuardian exposes its own MCP server — other apps (ride-hailing, logistics, insurance) can connect to it, making it an emergency infrastructure layer.

## RAG Pipeline (Full Sophistication)

### INGESTION PIPELINE

- Raw Docs (PDFs, Guidelines, Hospital Data)
- Document Chunking (semantic, 512 tokens, 50 overlap)
- Multilingual Embedding (multilingual-e5-large)
- Qdrant Vector DB (hosted + edge-cached)
- BM25 Index (for keyword fallback)

### RETRIEVAL PIPELINE

- User Query (voice/text/image)
- Query Expansion (HyDE — Hypothetical Document Embedding)
- Hybrid Search: Dense (cosine) + Sparse (BM25)
- Cross-Encoder Reranker (ms-marco-MiniLM-L-6-v2)
- Top-5 chunks → Context window
- LLM Generation (Groq Llama 3.1 / Gemini Flash)
- Safety Guard validation
- Streamed response to user

### Why this RAG is sophisticated

- HyDE query expansion for better retrieval on panicked/incomplete queries
- Multilingual embeddings (Bengali, Hindi, Tamil, Thai, Sinhala, English, Burmese)
- Cross-encoder reranking for precision
- Image-grounded RAG (wound photo → visual retrieval)
- Adaptive chunking by document type (procedures vs. contact lists vs. maps)

## Full Tech Stack

### FRONTEND

- React 18 + Vite
- TailwindCSS + Framer Motion
- PWA (Workbox service workers)
- IndexedDB (Dexie.js) — offline storage
- Leaflet.js + OpenStreetMap
- Web Speech API (voice input)
- Vibration API (accessibility)
- shadcn/ui components

### BACKEND

- FastAPI (Python 3.11)
- LangGraph (agent orchestration)
- LangChain (RAG chains)
- NeMo Guardrails (safety layer)
- Celery + Redis (async task queue)
- WebSockets (real-time streaming)

### AI / ML

- Groq API — Llama 3.1 8B/70B (primary LLM, fast inference)
- Gemini 1.5 Flash (multimodal, image analysis)
- multilingual-e5-large (embeddings)
- ms-marco-MiniLM (reranker)
- YOLOv8n (hazard detection, runs on-device via ONNX)
- Whisper (speech-to-text, offline capable)

### VECTOR DATABASE

- Qdrant (primary, hosted)
- ChromaDB (fallback, local/offline)

### DATA LAYER

- Supabase (PostgreSQL + Auth + Realtime)
- PostGIS (geo queries)
- Redis (cache + pub/sub)
- MinIO / Supabase Storage (media)

### OBSERVABILITY

- LangSmith (LLM tracing)
- Prometheus + Grafana (metrics)
- Sentry (error tracking)

### AUTOMATION

- n8n (workflow automation)
  - Weekly hazard digest → municipal email
  - Incident report → insurance API
  - New hospital data → re-index RAG
  - Alert escalation flows
- GitHub Actions (CI/CD)

### MCP

- Custom RoadGuardian MCP Server (FastAPI + MCP SDK)
- Exposes 6 emergency tools
- Consumed by: Dispatch Agent + external integrations

### DEPLOYMENT

- Vercel (frontend)
- Railway (FastAPI backend)
- Qdrant Cloud (vector DB)
- Supabase Cloud (database)
- Cloudflare Workers (edge MCP endpoints)

### LOCAL / OFFLINE

- YOLOv8n ONNX (runs in browser via ONNX Runtime Web)
- Whisper.cpp (voice, mobile)
- Phi-3 Mini (emergency LLM fallback, GGUF)
- IndexedDB (cached protocols, maps, contacts)

## Data Lifecycle (End-to-End)

1. DATA ACQUISITION
   - WHO first-aid PDFs → ingested via pipeline
   - OpenStreetMap hospital/POI data → PostGIS
   - User incident reports → Supabase
   - Road images (YOLOv8) → MinIO
   - Real-time GPS → Redis streams

2. DATA PROCESSING
   - PDF chunking → LangChain text splitters
   - Multilingual translation → Gemini API
   - Image analysis → YOLOv8 + Gemini Vision
   - GPS clustering → PostGIS spatial queries
   - Incident classification → LLM structured output

3. DATA STORAGE
   - Vector embeddings → Qdrant
   - Structured records → Supabase/PostgreSQL
   - Media files → Supabase Storage
   - Cache layer → Redis
   - Offline → IndexedDB

4. DATA SERVING
   - RAG retrieval → Qdrant hybrid search
   - Geo queries → PostGIS
   - Real-time → WebSockets + Supabase Realtime
   - Offline → Service Worker cache

5. DATA LEARNING
   - Incident outcomes → feedback loop
   - RAG retrieval quality → LangSmith traces
   - Hazard reports → re-validate YOLOv8
   - Response times → analytics dashboard

## Observability & Governance

- LangSmith traces every agent call with latency, token usage, retrieval quality
- Confidence scoring: every RAG response shows retrieval confidence (0.0–1.0)
- Medical advice flagging: NeMo Guardrails blocks hallucinated drug dosages
- Audit log: every SOS event logged immutably in Supabase
- Bias monitoring: language/region distribution checked monthly
- Human-in-loop: low-confidence medical outputs escalate to human operator dashboard

## Evaluation Pipeline

AUTOMATED EVALS (runs nightly via GitHub Actions)

- RAG Precision@5 — are retrieved chunks relevant?
- Answer faithfulness — does output match retrieved context?
- Triage accuracy — benchmark against WHO triage protocols
- Response latency — P50/P95/P99 per agent
- Safety violation rate — % outputs blocked by guardrails
- Offline fallback success rate
- Multilingual quality (BLEU score per language)

TOOLS: RAGAS framework + custom eval harness

## Demo Flow

### 30-Second Demo Pitch

"Imagine you’re a deaf biker. You crash on a rural road in Bangladesh. No internet. You can’t speak. You’re bleeding.

RoadGuardian detects the crash via your phone’s accelerometer. Offline. Instantly, vibration alerts fire. Visual emergency cards appear. One tap sends your GPS + blood group via SMS to your family AND the nearest hospital.

Meanwhile, 7 AI agents are working in parallel: triaging your injury, finding the nearest trauma center with wheelchair access, dispatching an ambulance via MCP protocol, streaming Bengali first-aid guidance, and logging a pothole hazard that caused your crash.

All of this. In 90 seconds. Offline. For everyone."

### 2-Minute Judge Presentation Outline

0:00–0:15 — Open with the stat: “Someone died on a BIMSTEC road in the last 4 minutes.”

0:15–0:35 — Show the problem cascade (panic → no network → no guidance → death)

0:35–1:00 — Live demo: crash simulation → agent activation → parallel agent dashboard → SOS sent

1:00–1:20 — Show the RAG pipeline: ask “I’m bleeding from my head” → watch retrieval + reranking → streamed answer

1:20–1:35 — Show MCP dispatch: hospital receives structured emergency payload

1:35–1:50 — Show hazard detection: upload road photo → YOLOv8 flags pothole → map marker appears

1:50–2:00 — Close: “We’re not building another app. We’re building emergency infrastructure. An MCP server that any app in this region can plug into.”

## The “WOW FACTOR” Feature

### The Living Incident Knowledge Graph

Every road accident in the system feeds a Neo4j knowledge graph that connects:

- Road segments → incident frequency → hazard type
- Hospital → specialization → response time → outcome
- Weather → road condition → accident type
- Time of day → accident probability → route suggestion

The graph powers:

- Predictive hazard alerts: “This road has had 12 accidents this month in rain”
- Municipal dashboard: live map of danger zones
- Insurance risk scoring API

Demo moment: Show the knowledge graph visualized with D3.js — nodes lighting up as incidents come in. Judges will gasp.

## Monetization

| Stream                    | Description                                       | Year 1 Target               |
| ------------------------- | ------------------------------------------------- | --------------------------- |
| Municipal SaaS            | Hazard analytics dashboard for city corporations  | $2K–10K/city/year           |
| Hospital API              | Real-time bed availability + dispatch integration | Revenue share per dispatch  |
| Insurance API             | Incident evidence + risk scoring                  | $0.50 per verified incident |
| Emergency MCP Marketplace | Other apps pay to connect to our MCP server       | $99–499/month/app           |
| NGO/Grant                 | USAID, WHO, ADB road safety grants                | $50K–500K                   |
| Ride-hailing B2B          | SOS infrastructure for Pathao, Shohoz, Grab       | License fee                 |

## Frontend Design Direction

Design Philosophy: “Calm Technology in Crisis”

- Color system: Deep navy #0A1628 base + emergency red #FF3B30 + accessible green #30D158
- Typography: Large, high-contrast (min 18px body), dyslexia-friendly (OpenDyslexic optional)
- Motion: Framer Motion — smooth but purposeful, never distracting in emergency mode
- Accessibility: WCAG 2.1 AAA target, screen reader optimized, motor-impaired tap zones (min 48×48px)

### Key Screens

- Emergency Active Screen — Full-screen, single large SOS button, pulsing red animation, voice feedback
- Agent Activity Dashboard (demo-only visible) — Real-time swimlane showing 7 agents working, like a mission control panel
- RAG Response Stream — Shows retrieved document sources alongside streamed answer, with confidence bars
- Knowledge Graph View — D3.js force-directed graph, animated incident nodes
- Accessibility Mode Switcher — Prominent, always-visible toggle with 5 profiles

### Suggested Animations for Demo Day

1. Agent Activation Cascade — When SOS fires, watch each agent “wake up” with a status indicator, processing spinner, then green checkmark. Like a rocket launch sequence.
2. RAG Retrieval Visualization — Show vector space with query point, retrieved documents flying toward it, reranker sorting them by relevance bar.
3. SMS SOS Propagation — Map animation showing SOS ripple from victim location → hospital → family → police simultaneously.
4. Knowledge Graph Live Update — New incident node spawns and connects to existing nodes with animated edges.
5. Offline → Online Sync — Show data queued offline, then when network returns, watch it flush to server with satisfying progress animation.

## GitHub README Summary

# 🚨 RoadGuardian AI

### Autonomous Emergency Intelligence for Inclusive Road Safety

> Multi-agent AI emergency copilot supporting 3B+ underserved road users
> across BIMSTEC nations. Offline-first. Accessibility-native. MCP-powered.

## Architecture

- 7 specialized AI agents orchestrated via LangGraph
- Hybrid RAG (dense + sparse + reranked) in 8 languages
- Custom MCP server exposing emergency dispatch tools
- YOLOv8 road hazard detection (runs offline via ONNX)
- NeMo Guardrails medical safety layer
- Living incident knowledge graph (Neo4j)

## Stack

FastAPI · LangGraph · Qdrant · Groq · Gemini · React · PWA · n8n · LangSmith

## AI Depth Score: 94/110

## Quick Start

[Installation instructions here]

## Demo

[Link to live demo]

## Viral Launch Angle

Headline: “We built an AI that can save your life when you’re unconscious, offline, and can’t speak.”

Hook for social media:

“Every emergency app assumes you have internet. A working voice. Two working hands. We built for the other 3 billion people.”

ProductHunt tagline: “7 AI agents, 90 seconds, zero internet required. Emergency response for everyone.”

Press angle: “Bangladeshi team builds emergency AI that major tech companies ignored — for the 700,000 people dying on Asian roads each year.”

## AI Depth Score

| Category                  | Max | Your Score |
| ------------------------- | --- | ---------- |
| Prompt Engineering        | 8   | 7          |
| Token Optimization        | 6   | 5          |
| LLM Usage                 | 8   | 8          |
| RAG Sophistication        | 10  | 9          |
| MCP Usage                 | 8   | 8          |
| Multi-Agent Orchestration | 10  | 9          |
| Open Source Tooling       | 8   | 8          |
| Workflow Automation       | 6   | 5          |
| Observability/Governance  | 8   | 7          |
| Data Engineering          | 8   | 7          |
| Frontend AI Tooling       | 6   | 5          |
| AI Safety/Guardrails      | 8   | 8          |
| Evaluation Pipelines      | 6   | 5          |
| Real-time/Streaming       | 6   | 6          |
| Vector DB + Embeddings    | 6   | 6          |
| Hybrid Search + Reranking | 6   | 6          |
| Automation Pipelines      | 4   | 4          |
| API Integrations          | 4   | 4          |
| Local/Open-Weight Models  | 4   | 4          |
| TOTAL                     | 110 | ~94/110    |

## Future Roadmap

- 6 Months — Production launch in Bangladesh + India. Partner with 10 hospitals for live dispatch integration.
- 12 Months — Expand MCP marketplace. Integrate Pathao/Shohoz. Reach 100K users.
- 18 Months — Government contracts with BRTA (Bangladesh) and NHAI (India). Launch municipal hazard dashboard.
- 24 Months — Expand to all 8 BIMSTEC nations. Launch emergency infrastructure API. Series A target: $3M.
- 36 Months — White-label emergency AI platform. Become the Twilio of emergency dispatch for emerging markets.

## Bottom Line for Judges

Your existing RoadGuardian idea had a great heart but needed a spine. This upgraded version gives it:

- ✅ Real multi-agent architecture (LangGraph, 7 agents)
- ✅ Sophisticated RAG (HyDE + hybrid search + reranker)
- ✅ Custom MCP server (your biggest differentiator)
- ✅ Medical guardrails (NeMo, safety layer)
- ✅ Observability (LangSmith tracing)
- ✅ Evaluation pipeline (RAGAS nightly evals)
- ✅ Living knowledge graph (wow factor)
- ✅ Offline-first (technical moat)
- ✅ Real monetization (MCP marketplace + municipal SaaS)
- ✅ Compelling story (inclusive emergency infrastructure)

The pitch shift: You’re not building an app. You’re building emergency infrastructure — an MCP server that becomes the backbone of emergency response for 1.8 billion people.

## Zahid’s Role: Frontend & Demo Execution

Zahid owns the frontend experience, accessibility, and mission control storytelling.

### Core Responsibilities

- Build the Vite + React UI and Tailwind design system
- Create the Emergency SOS screen with a large, high-contrast SOS button
- Implement the Agent Activity Dashboard and live orchestration swimlanes
- Build the streaming AI response interface and RAG citation display
- Add accessibility features: large-mode UI, voice guidance, vibration alerts, high-contrast mode
- Implement the demo-ready map and hazard detection result visualization
- Create the PWA experience with offline caching for emergency data
- Optimize the demo flow for smooth storytelling and judge impact

### Today’s Highest Priority

- Set up the frontend skeleton in `frontend/`
- Build the SOS screen and agent timeline components
- Connect websocket listeners for live backend update display
- Design the visual mission control dashboard for parallel agent execution
- Make the first demo visually compelling, even if backend data is mocked

### Why Zahid’s Part Matters

This is the part judges see first. A polished, accessible, and emotionally resonant frontend makes the AI depth feel real.

### Success Criteria

- The SOS flow looks and feels like a working emergency system
- Agent activation is visible immediately on screen
- Streaming RAG and dispatch messages appear in real time
- Accessibility mode can be toggled and works during the demo
- Offline fallback screens are present and believable
