from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from typing import Dict, Any, Optional

router = APIRouter()

class SOSPayloadSchema(BaseModel):
    userId: str
    emergencyType: str
    message: str
    location: Dict[str, float]
    accessibilityMode: Optional[str] = "default"

class RAGQuerySchema(BaseModel):
    query: str
    offline_mode: bool = False
    k: Optional[int] = 3

class MCPDispatchSchema(BaseModel):
    tool: str   # find_hospital | dispatch_emergency | notify_family | create_hazard_report
    params: Dict[str, Any]

@router.post("/sos")
async def trigger_sos(payload: SOSPayloadSchema):
    """
    REST fallback endpoint to trigger SOS.
    Returns immediate acknowledgment. The primary orchestration occurs over WebSockets.
    """
    print(f"[REST SOS] Triggered for user {payload.userId}")
    return {
        "status": "success",
        "message": "SOS alert registered. Handing over to Multi-Agent Orchestrator stream.",
        "payload_received": {
            "userId": payload.userId,
            "emergencyType": payload.emergencyType,
            "location": payload.location
        }
    }

@router.post("/hazard-detect")
async def detect_hazard(
    file: Optional[UploadFile] = File(None),
    lat: Optional[float] = Form(23.91),
    lng: Optional[float] = Form(90.21),
    description: Optional[str] = Form("Active road anomaly")
):
    """
    Phase 5 Hazard Detection Endpoint.
    Analyzes uploaded road images/videos for anomalies.
    Returns detected road hazards mapped for the Mission Control dashboard.
    """
    filename = file.filename if file else "sensor_stream.jpg"
    print(f"[HAZARD DETECT] Analyzing telemetry file: {filename} at coordinates ({lat}, {lng})")
    
    # In a full production build, we load a local YOLOv8n model here:
    # model = YOLO("yolov8n.pt")
    # results = model(file.file)
    
    # Realistic mockup detection based on description keywords
    desc_lower = description.lower() if description else ""
    hazard_type = "pothole"
    severity = "medium"
    
    if "accident" in desc_lower or "crash" in desc_lower:
        hazard_type = "accident_scene"
        severity = "high"
    elif "water" in desc_lower or "flood" in desc_lower:
        hazard_type = "flooding"
        severity = "high"
    elif "obstruction" in desc_lower or "debris" in desc_lower:
        hazard_type = "road_debris"
        severity = "medium"
        
    return {
        "status": "success",
        "telemetry_source": filename,
        "hazard_type": hazard_type,
        "severity": severity,
        "location": {
            "lat": lat,
            "lng": lng
        },
        "ai_confidence": 0.89,
        "remediation_suggestion": "Instructing Locate Agent to mark danger zone on community maps."
    }

# ─────────────────────────────────────────────────────────────────────────────
# POST /rag/query  — Direct RAG retrieval endpoint (Blueprint Phase 2)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/rag/query")
async def rag_query(payload: RAGQuerySchema):
    """
    Direct RAG retrieval endpoint.
    Queries the ChromaDB vector store with a natural language emergency query
    and returns the top-k semantically matched first-aid protocol chunks with citations.
    Falls back to local Phi-3 via Ollama or cached offline protocols if ChromaDB is unavailable.
    """
    print(f"[RAG QUERY] '{payload.query}' | offline_mode={payload.offline_mode}")
    try:
        from backend.rag.retrieval.searcher import get_guidance
        result = await get_guidance(payload.query, use_offline=payload.offline_mode)
        return {
            "status": "success" if result.get("mode") == "online" else "fallback",
            "query": payload.query,
            "guidance": result.get("guidance", ""),
            "mode": result.get("mode", "online"),
            "model": result.get("model", "llama-3.1-8b-instant"),
            "results": result.get("results", [])
        }
    except Exception as e:
        print(f"[RAG QUERY ERROR] {e}")
        from backend.rag.retrieval.searcher import get_offline_fallback
        fallback = get_offline_fallback(payload.query)
        fallback_text = "\n\n".join([f"{g['title']}: {g['content']}" for g in fallback])
        return {
            "status": "fallback",
            "query": payload.query,
            "guidance": fallback_text,
            "mode": "offline",
            "model": "regex-fallback",
            "results": fallback,
            "warning": "ChromaDB and Ollama unavailable — serving cached emergency protocols"
        }


# ─────────────────────────────────────────────────────────────────────────────
# POST /mcp/dispatch  — Direct MCP tool dispatch endpoint (Blueprint Phase 2)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/mcp/dispatch")
async def mcp_dispatch(payload: MCPDispatchSchema):
    """
    Direct MCP tool dispatch endpoint.
    Calls MCP tools explicitly from the frontend for demo and manual triggers.
    Supported tools: find_hospital, dispatch_emergency, notify_family, create_hazard_report
    """
    print(f"[MCP DISPATCH] Tool: '{payload.tool}' | Params: {payload.params}")
    try:
        from backend.mcp.tools import (
            find_hospital,
            dispatch_emergency,
            notify_family,
            create_hazard_report
        )
        tool = payload.tool
        p = payload.params

        if tool == "find_hospital":
            result = await find_hospital(
                lat=float(p.get("lat", 24.2502)),
                lng=float(p.get("lng", 89.9167))
            )
        elif tool == "dispatch_emergency":
            result = await dispatch_emergency(
                hospital_name=p.get("hospital_name", "Tangail General Hospital"),
                lat=float(p.get("lat", 24.2502)),
                lng=float(p.get("lng", 89.9167))
            )
        elif tool == "notify_family":
            result = await notify_family(
                contact_info=p.get("contact_info", "emergency_contact")
            )
        elif tool == "create_hazard_report":
            result = await create_hazard_report(
                hazard_type=p.get("hazard_type", "pothole"),
                lat=float(p.get("lat", 24.2502)),
                lng=float(p.get("lng", 89.9167)),
                severity=p.get("severity", "medium")
            )
        else:
            return {
                "status": "error",
                "message": f"Unknown MCP tool: '{tool}'. Available: find_hospital, dispatch_emergency, notify_family, create_hazard_report"
            }

        return {"status": "success", "tool": tool, "result": result}

    except Exception as e:
        print(f"[MCP DISPATCH ERROR] {e}")
        return {"status": "error", "tool": payload.tool, "message": str(e)}
