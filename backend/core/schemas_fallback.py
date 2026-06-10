from datetime import datetime
from typing import Literal, Dict, Any, List, Optional
from pydantic import BaseModel, Field

# Constants matching TypeScript literals
EventType = Literal[
    "sos_triggered",
    "orchestrator_started",
    "agent_activated",
    "rag_retrieval_started",
    "rag_chunk_stream",
    "rag_completed",
    "dispatch_started",
    "dispatch_completed",
    "hazard_detected",
    "emergency_resolved",
    "system_error"
]

AgentName = Literal[
    "orchestrator",
    "triage",
    "guidance",
    "locate",
    "dispatch",
    "hazard",
    "system"
]

AgentStatus = Literal[
    "idle",
    "running",
    "streaming",
    "completed",
    "failed",
    "resolved"
]

# Base event model matching BaseEmergencyEvent
class BaseEmergencyEvent(BaseModel):
    event: EventType
    agent: AgentName
    status: AgentStatus
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    message: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

# 1. SOS Triggered Event
class Location(BaseModel):
    lat: float
    lng: float

class SOSTriggeredMetadata(BaseModel):
    userId: str
    emergencyType: str
    location: Location
    accessibilityMode: Literal["voice", "visual", "vibration", "high_contrast", "default"] = "default"

class SOSTriggeredEvent(BaseEmergencyEvent):
    event: Literal["sos_triggered"] = "sos_triggered"
    agent: Literal["system"] = "system"
    status: Literal["running"] = "running"
    metadata: SOSTriggeredMetadata

# 2. Orchestrator Started Event
class OrchestratorStartedMetadata(BaseModel):
    initialQuery: str
    plannedAgents: List[AgentName]

class OrchestratorStartedEvent(BaseEmergencyEvent):
    event: Literal["orchestrator_started"] = "orchestrator_started"
    agent: Literal["orchestrator"] = "orchestrator"
    status: Literal["running"] = "running"
    metadata: OrchestratorStartedMetadata

# 3. Agent Activated Event
class AgentActivatedMetadata(BaseModel):
    priority: Literal["high", "medium", "low"] = "medium"
    details: Optional[Dict[str, Any]] = None

class AgentActivatedEvent(BaseEmergencyEvent):
    event: Literal["agent_activated"] = "agent_activated"
    agent: AgentName
    status: Literal["running"] = "running"
    metadata: AgentActivatedMetadata = Field(default_factory=AgentActivatedMetadata)

# 4. RAG Retrieval Started Event
class RAGRetrievalStartedMetadata(BaseModel):
    query: str
    datasetSources: List[str]

class RAGRetrievalStartedEvent(BaseEmergencyEvent):
    event: Literal["rag_retrieval_started"] = "rag_retrieval_started"
    agent: Literal["guidance"] = "guidance"
    status: Literal["running"] = "running"
    metadata: RAGRetrievalStartedMetadata

# 5. RAG Chunk Stream Event
class RAGChunkStreamMetadata(BaseModel):
    chunk: str
    source: str
    confidence: float
    page: Optional[int] = None

class RAGChunkStreamEvent(BaseEmergencyEvent):
    event: Literal["rag_chunk_stream"] = "rag_chunk_stream"
    agent: Literal["guidance"] = "guidance"
    status: Literal["streaming"] = "streaming"
    metadata: RAGChunkStreamMetadata

# 6. RAG Completed Event
class Citation(BaseModel):
    source: str
    content: str
    confidence: float

class RAGCompletedMetadata(BaseModel):
    fullGuidance: str
    citations: List[Citation]
    averageConfidence: float

class RAGCompletedEvent(BaseEmergencyEvent):
    event: Literal["rag_completed"] = "rag_completed"
    agent: Literal["guidance"] = "guidance"
    status: Literal["completed"] = "completed"
    metadata: RAGCompletedMetadata

# 7. Dispatch Started Event
class DispatchStartedMetadata(BaseModel):
    targetHospital: str
    notificationSentToFamily: bool

class DispatchStartedEvent(BaseEmergencyEvent):
    event: Literal["dispatch_started"] = "dispatch_started"
    agent: Literal["dispatch"] = "dispatch"
    status: Literal["running"] = "running"
    metadata: DispatchStartedMetadata

# 8. Dispatch Completed Event
class DispatchCompletedMetadata(BaseModel):
    hospital: str
    eta: str
    vehicleId: str
    status: Literal["dispatched", "enroute", "arrived"]

class DispatchCompletedEvent(BaseEmergencyEvent):
    event: Literal["dispatch_completed"] = "dispatch_completed"
    agent: Literal["dispatch"] = "dispatch"
    status: Literal["completed"] = "completed"
    metadata: DispatchCompletedMetadata

# 9. Hazard Detected Event
class HazardDetectedMetadata(BaseModel):
    hazard_type: str
    severity: Literal["low", "medium", "high"]
    location: Location

class HazardDetectedEvent(BaseEmergencyEvent):
    event: Literal["hazard_detected"] = "hazard_detected"
    agent: Literal["hazard"] = "hazard"
    status: Literal["completed"] = "completed"
    metadata: HazardDetectedMetadata

# 10. Emergency Resolved Event
class EmergencyResolvedMetadata(BaseModel):
    durationSeconds: float
    actionsTaken: List[str]
    summary: str

class EmergencyResolvedEvent(BaseEmergencyEvent):
    event: Literal["emergency_resolved"] = "emergency_resolved"
    agent: Literal["orchestrator"] = "orchestrator"
    status: Literal["resolved"] = "resolved"
    metadata: EmergencyResolvedMetadata

# 11. System Error Event
class SystemErrorMetadata(BaseModel):
    errorType: str
    errorMessage: str
    details: Optional[str] = None

class SystemErrorEvent(BaseEmergencyEvent):
    event: Literal["system_error"] = "system_error"
    agent: AgentName = "system"
    status: Literal["failed"] = "failed"
    metadata: SystemErrorMetadata
