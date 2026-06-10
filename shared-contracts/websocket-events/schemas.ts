/**
 * RoadGuardian AI - WebSocket Event Contracts
 * 
 * This file serves as the strict contract between the FastAPI backend
 * and Zahid's Mission Control Dashboard (frontend).
 * All messages streamed over WS /stream MUST adhere to these TypeScript definitions.
 */

export type EventType =
  | "sos_triggered"
  | "orchestrator_started"
  | "agent_activated"
  | "rag_retrieval_started"
  | "rag_chunk_stream"
  | "rag_completed"
  | "dispatch_started"
  | "dispatch_completed"
  | "hazard_detected"
  | "emergency_resolved"
  | "system_error";

export type AgentName =
  | "orchestrator"
  | "triage"
  | "guidance"
  | "locate"
  | "dispatch"
  | "hazard"
  | "system";

export type AgentStatus =
  | "idle"
  | "running"
  | "streaming"
  | "completed"
  | "failed"
  | "resolved";

export interface BaseEmergencyEvent {
  event: EventType;
  agent: AgentName;
  status: AgentStatus;
  timestamp: string; // ISO 8601 Format (e.g., "2026-05-26T10:20:00Z")
  message: string;   // Human-readable log message
  metadata: Record<string, any>;
}

// 1. SOS Triggered Event
export interface SOSTriggeredEvent extends BaseEmergencyEvent {
  event: "sos_triggered";
  agent: "system";
  status: "running";
  metadata: {
    userId: string;
    emergencyType: string;
    location: {
      lat: number;
      lng: number;
    };
    accessibilityMode?: "voice" | "visual" | "vibration" | "high_contrast" | "default";
  };
}

// 2. Orchestrator Started Event
export interface OrchestratorStartedEvent extends BaseEmergencyEvent {
  event: "orchestrator_started";
  agent: "orchestrator";
  status: "running";
  metadata: {
    initialQuery: string;
    plannedAgents: AgentName[];
  };
}

// 3. Agent Activated Event
export interface AgentActivatedEvent extends BaseEmergencyEvent {
  event: "agent_activated";
  agent: Exclude<AgentName, "system">;
  status: "running";
  metadata: {
    priority: "high" | "medium" | "low";
    [key: string]: any;
  };
}

// 4. RAG Retrieval Started Event
export interface RAGRetrievalStartedEvent extends BaseEmergencyEvent {
  event: "rag_retrieval_started";
  agent: "guidance";
  status: "running";
  metadata: {
    query: string;
    datasetSources: string[];
  };
}

// 5. RAG Chunk Stream Event
export interface RAGChunkStreamEvent extends BaseEmergencyEvent {
  event: "rag_chunk_stream";
  agent: "guidance";
  status: "streaming";
  metadata: {
    chunk: string;        // The new token or text chunk
    source: string;       // Document reference (e.g., "WHO First Aid Guidelines")
    confidence: number;   // Retrieval confidence score (0.0 to 1.0)
    page?: number;
  };
}

// 6. RAG Completed Event
export interface RAGCompletedEvent extends BaseEmergencyEvent {
  event: "rag_completed";
  agent: "guidance";
  status: "completed";
  metadata: {
    fullGuidance: string;
    citations: Array<{
      source: string;
      content: string;
      confidence: number;
    }>;
    averageConfidence: number;
  };
}

// 7. Dispatch Started Event
export interface DispatchStartedEvent extends BaseEmergencyEvent {
  event: "dispatch_started";
  agent: "dispatch";
  status: "running";
  metadata: {
    targetHospital: string;
    notificationSentToFamily: boolean;
  };
}

// 8. Dispatch Completed Event
export interface DispatchCompletedEvent extends BaseEmergencyEvent {
  event: "dispatch_completed";
  agent: "dispatch";
  status: "completed";
  metadata: {
    hospital: string;
    eta: string;         // e.g., "12 mins"
    vehicleId: string;   // e.g., "AMB-204"
    status: "dispatched" | "enroute" | "arrived";
  };
}

// 9. Hazard Detected Event
export interface HazardDetectedEvent extends BaseEmergencyEvent {
  event: "hazard_detected";
  agent: "hazard";
  status: "completed";
  metadata: {
    hazard_type: string;  // e.g., "pothole", "accident", "debris"
    severity: "low" | "medium" | "high";
    location: {
      lat: number;
      lng: number;
    };
  };
}

// 10. Emergency Resolved Event
export interface EmergencyResolvedEvent extends BaseEmergencyEvent {
  event: "emergency_resolved";
  agent: "orchestrator";
  status: "resolved";
  metadata: {
    durationSeconds: number;
    actionsTaken: string[];
    summary: string;
  };
}

// 11. System Error Event
export interface SystemErrorEvent extends BaseEmergencyEvent {
  event: "system_error";
  agent: AgentName;
  status: "failed";
  metadata: {
    errorType: string;
    errorMessage: string;
    details?: string;
  };
}

export type RoadGuardianWSMessage =
  | SOSTriggeredEvent
  | OrchestratorStartedEvent
  | AgentActivatedEvent
  | RAGRetrievalStartedEvent
  | RAGChunkStreamEvent
  | RAGCompletedEvent
  | DispatchStartedEvent
  | DispatchCompletedEvent
  | HazardDetectedEvent
  | EmergencyResolvedEvent
  | SystemErrorEvent;
