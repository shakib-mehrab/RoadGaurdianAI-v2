import operator
from typing import TypedDict, Annotated, List, Optional, Dict, Any

class EmergencyState(TypedDict):
    # Core system states
    messages: Annotated[List[dict], operator.add]
    query: str
    active_agent: str
    status: str
    
    # Location context
    lat: float
    lng: float
    userId: str
    accessibilityMode: str
    family_members: Optional[List[Dict[str, str]]]

    # Orchestrator output
    emergency_type: Optional[str]
    rationale: Optional[str]
    planned_agents: List[str]
    
    # Triage Agent output
    triage_severity: Optional[str]   # "high" | "medium" | "low"
    triage_summary: Optional[str]
    triage_vital_checks: Optional[List[str]]
    
    # Guidance Agent output (RAG)
    rag_guidance: Optional[str]
    citations: Optional[List[Dict[str, Any]]]
    average_confidence: Optional[float]
    
    # Locate Agent output (MCP find_hospital)
    nearest_hospital: Optional[Dict[str, Any]]
    
    # Dispatch Agent output (MCP dispatch_emergency, notify_family)
    dispatch_status: Optional[Dict[str, Any]]
    
    # Hazard Agent output
    hazards: Optional[List[Dict[str, Any]]]
