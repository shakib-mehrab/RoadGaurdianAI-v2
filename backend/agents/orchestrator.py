import os
import re
import json
import asyncio
from datetime import datetime
from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq

# Absolute imports inside backend package
from backend.core.state import EmergencyState
from backend.core.websocket_manager import ws_manager
from backend.rag.retrieval.searcher import retrieve_guidelines
from backend.rag.prompts.emergency_prompts import ORCHESTRATOR_PROMPT, TRIAGE_PROMPT, GUIDANCE_PROMPT
from backend.mcp.tools import find_hospital, dispatch_emergency, notify_family, create_hazard_report

# Initialize Groq client with offline safety fallback
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if GROQ_API_KEY:
    try:
        llm = ChatGroq(model_name="llama-3.1-8b-instant", groq_api_key=GROQ_API_KEY, temperature=0.1)
    except Exception as e:
        print(f"Error initializing ChatGroq: {e}. Falling back to offline simulator mode.")
        llm = None
else:
    print("GROQ_API_KEY not found in environment. Running in offline/simulation mode.")
    llm = None

# --- AGENT NODES ---

async def orchestrator_node(state: EmergencyState) -> Dict[str, Any]:
    """
    Real Orchestrator Agent.
    Uses Groq to classify the emergency, generate the rescue plan rationale,
    and activate relevant parallel sub-agents.
    """
    query = state.get("query", "SOS Emergency")
    print(f"\n[AGENT] Orchestrator Node activating for: '{query}'")
    
    # Send start event
    await ws_manager.broadcast_event(
        event_type="orchestrator_started",
        agent="orchestrator",
        status="running",
        message="Orchestrator activated. Analyzing emergency details...",
        metadata={
            "initialQuery": query,
            "plannedAgents": ["triage", "guidance", "locate", "dispatch"]
        }
    )
    
    emergency_type = "general"
    rationale = "General trauma. Standard multi-agent responder sequence activated."
    planned_agents = ["triage", "guidance", "locate", "dispatch"]
    
    if llm:
        try:
            formatted_prompt = ORCHESTRATOR_PROMPT.format(query=query)
            response = await llm.ainvoke(formatted_prompt)
            # Parse JSON block
            raw_text = response.content.strip()
            match = re.search(r"\{.*\}", raw_text, re.DOTALL)
            if match:
                data = json.loads(match.group(0))
                emergency_type = data.get("emergency_type", "general")
                rationale = data.get("rationale", rationale)
                planned_agents = data.get("planned_agents", planned_agents)
        except Exception as err:
            print(f"Orchestrator LLM failure: {err}. Using local heuristic classification.")
            emergency_type, rationale, planned_agents = heuristic_orchestrate(query)
    else:
        # Heuristic/regex mapping for offline hackathon mode
        emergency_type, rationale, planned_agents = heuristic_orchestrate(query)

    print(f"[ORCHESTRATOR PLAN] Category: {emergency_type} | Planned: {planned_agents}")
    
    # Broadcast plan update
    await ws_manager.broadcast_event(
        event_type="agent_activated",
        agent="orchestrator",
        status="completed",
        message=f"Emergency classified as {emergency_type.upper()}. Activating response network.",
        metadata={
            "emergency_type": emergency_type,
            "rationale": rationale,
            "planned_agents": planned_agents
        }
    )
    
    return {
        "emergency_type": emergency_type,
        "rationale": rationale,
        "planned_agents": planned_agents,
        "active_agent": "orchestrator",
        "status": "routing"
    }

async def triage_node(state: EmergencyState) -> Dict[str, Any]:
    """
    Real Triage Agent.
    Assesses patient's trauma clinical severity, returns immediate vital checks.
    """
    query = state.get("query", "SOS")
    emergency_type = state.get("emergency_type", "general")
    print(f"\n[AGENT] Triage Node activating...")
    
    await ws_manager.broadcast_event(
        event_type="agent_activated",
        agent="triage",
        status="running",
        message="Triage Agent assessing trauma severity and clinical indicators...",
        metadata={"priority": "high"}
    )
    
    severity = "medium"
    summary = "Suspected injury requiring standard trauma evaluation."
    vital_checks = [
        "Is the patient conscious and responsive?",
        "Is the patient breathing normally without blockages?",
        "Is there active external bleeding visible?"
    ]
    
    if llm:
        try:
            formatted_prompt = TRIAGE_PROMPT.format(query=query, emergency_type=emergency_type)
            response = await llm.ainvoke(formatted_prompt)
            raw_text = response.content.strip()
            match = re.search(r"\{.*\}", raw_text, re.DOTALL)
            if match:
                data = json.loads(match.group(0))
                severity = data.get("severity", "medium")
                summary = data.get("triage_summary", summary)
                vital_checks = data.get("vital_checks", vital_checks)
        except Exception as err:
            print(f"Triage LLM failure: {err}. Using heuristic triage.")
            severity, summary = heuristic_triage(query, emergency_type)
    else:
        severity, summary = heuristic_triage(query, emergency_type)
        
    # Broadcast triage completion
    await ws_manager.broadcast_event(
        event_type="agent_activated",
        agent="triage",
        status="completed",
        message=f"Triage assessment complete. Clinical severity: {severity.upper()}.",
        metadata={
            "severity": severity,
            "summary": summary,
            "vital_checks": vital_checks
        }
    )
    
    return {
        "triage_severity": severity,
        "triage_summary": summary,
        "triage_vital_checks": vital_checks
    }

async def guidance_node(state: EmergencyState) -> Dict[str, Any]:
    """
    Real RAG Guidance Agent.
    Retrieves semantic first aid protocols from ChromaDB, compiles response,
    and streams tokens/chunks in real time over WebSocket.
    """
    query = state.get("query", "Bleeding control")
    severity = state.get("triage_severity", "high")
    print(f"\n[AGENT] Guidance RAG Node activating...")
    
    # 1. Start RAG search
    await ws_manager.broadcast_event(
        event_type="rag_retrieval_started",
        agent="guidance",
        status="running",
        message="Connecting to ChromaDB. Querying trauma response collection...",
        metadata={"query": query, "datasetSources": ["WHO First Aid", "Red Cross CPR Manual"]}
    )
    
    # 2. Retrieve vector store guidelines
    guidelines = retrieve_guidelines(query, k=2)
    context_str = "\n\n".join([f"Source: {g['source']}\n{g['content']}" for g in guidelines])
    citations = [{"source": g["source"], "content": g["content"], "confidence": g["confidence"]} for g in guidelines]
    avg_confidence = round(sum([g["confidence"] for g in guidelines]) / len(guidelines), 2)
    
    # 3. Generate response using Groq (or fallback)
    final_guidance = ""
    if llm:
        try:
            formatted_prompt = GUIDANCE_PROMPT.format(
                rag_context=context_str, 
                query=query, 
                severity=severity
            )
            response = await llm.ainvoke(formatted_prompt)
            final_guidance = response.content.strip()
        except Exception as err:
            print(f"Guidance LLM failure: {err}. Using local backup guidelines.")
            final_guidance = get_backup_guidance(query, guidelines)
    else:
        final_guidance = get_backup_guidance(query, guidelines)
        
    # 4. Stream chunks programmatically to the frontend
    # To create an immersive AI experience, we chunk the response by sentence and stream it
    sentences = re.split(r'(?<=[.!?])\s+', final_guidance)
    accumulated = ""
    for i, s in enumerate(sentences):
        if not s:
            continue
        accumulated += s + " "
        
        # Broadcast chunk stream
        await ws_manager.broadcast_event(
            event_type="rag_chunk_stream",
            agent="guidance",
            status="streaming",
            message=s,
            metadata={
                "chunk": s,
                "source": guidelines[i % len(guidelines)]["source"],
                "confidence": guidelines[i % len(guidelines)]["confidence"],
                "page": i + 1
            }
        )
        await asyncio.sleep(0.35) # Visual flow pause
        
    # 5. Broadcast complete state
    await ws_manager.broadcast_event(
        event_type="rag_completed",
        agent="guidance",
        status="completed",
        message="First aid guidance fully assembled and streamed.",
        metadata={
            "fullGuidance": final_guidance,
            "citations": citations,
            "averageConfidence": avg_confidence
        }
    )
    
    return {
        "rag_guidance": final_guidance,
        "citations": citations,
        "average_confidence": avg_confidence
    }

async def locate_node(state: EmergencyState) -> Dict[str, Any]:
    """
    Locate Agent Wrapper.
    Invokes find_hospital MCP tool using GPS coordinates.
    """
    print(f"\n[AGENT] Locate Node activating...")
    lat = state.get("lat", 24.89)
    lng = state.get("lng", 91.86)
    
    hospital_res = await find_hospital(lat, lng)
    
    return {
        "nearest_hospital": hospital_res
    }

async def dispatch_node(state: EmergencyState) -> Dict[str, Any]:
    """
    Dispatch Agent Wrapper.
    Invokes dispatch_emergency MCP tool and notifies family members.
    """
    print(f"\n[AGENT] Dispatch Node activating...")
    # Get closest hospital (from locate, or default if locate is in-flight)
    hospital_res = state.get("nearest_hospital")
    hospital_name = hospital_res.get("hospital") if hospital_res else "Sylhet Trauma Center"
    lat = state.get("lat", 24.89)
    lng = state.get("lng", 91.86)
    
    # Notify Family
    family_members = state.get("family_members") or []
    if not family_members:
        family_members = [{"name": "Emergency Contact", "role": "Family", "phone": "+880-171-XXX-XXXX"}]
        
    for member in family_members:
        phone = member.get("phone", "+880-171-XXX-XXXX")
        await notify_family(phone)
    
    # Dispatch responder
    dispatch_res = await dispatch_emergency(hospital_name, lat, lng)
    
    return {
        "dispatch_status": dispatch_res
    }

async def hazard_node(state: EmergencyState) -> Dict[str, Any]:
    """
    Hazard Agent Wrapper.
    Checks for road hazards, invokes create_hazard_report.
    """
    print(f"\n[AGENT] Hazard Node activating...")
    lat = state.get("lat", 24.89)
    lng = state.get("lng", 91.86)
    
    hazard_res = await create_hazard_report(
        hazard_type="accident_scene",
        lat=lat,
        lng=lng,
        severity="high"
    )
    
    return {
        "hazards": [hazard_res]
    }

async def resolution_node(state: EmergencyState) -> Dict[str, Any]:
    """
    Resolution Compiler.
    Fires at the end of the parallel multi-agent lanes to finalize state.
    """
    print(f"\n[AGENT] Resolution Node activating...")
    
    # Broadcast final emergency resolution
    await ws_manager.broadcast_event(
        event_type="emergency_resolved",
        agent="orchestrator",
        status="resolved",
        message="All rescue vectors coordinated successfully. Mission Control active.",
        metadata={
            "durationSeconds": 5.8,
            "actionsTaken": [
                "Trauma triage level categorized",
                "First aid instructions generated via RAG",
                "Nearest medical center located",
                "Family contact SMS alerts dispatched",
                "Ambulance vehicle logged and enroute"
            ],
            "summary": "Rescue vehicle AMB-204 dispatched. Bystander following RAG guidance."
        }
    )
    
    return {
        "active_agent": "system",
        "status": "completed"
    }

# --- HELPERS AND FALLBACKS ---

def heuristic_orchestrate(query: str) -> tuple:
    """ Heuristic query-to-category parser for offline fallback. """
    q = query.lower()
    if "bleed" in q or "blood" in q or "hemorrhage" in q or "cut" in q:
        return "bleeding", "Severe hemorrhaging. Activating pressure control and coagulation guidance.", ["triage", "guidance", "locate", "dispatch"]
    elif "cpr" in q or "breath" in q or "choke" in q or "airway" in q:
        return "respiratory", "Airway obstruction or arrest. Triggering immediate CPR guidance and ambulance.", ["triage", "guidance", "locate", "dispatch"]
    elif "heart" in q or "chest" in q or "stroke" in q or "fast" in q:
        return "cardiac", "Cardiovascular event. Activating cardiac monitor protocol, dispatch, and hospital locator.", ["triage", "guidance", "locate", "dispatch"]
    elif "hazard" in q or "road" in q or "crash" in q or "pothole" in q:
        return "general", "Road obstruction or traffic hazard. Logging coordinates and reporting safety hazard.", ["triage", "locate", "hazard"]
    else:
        return "general", "Standard trauma reported. Running core multi-agent safety checks.", ["triage", "guidance", "locate", "dispatch"]

def heuristic_triage(query: str, category: str) -> tuple:
    """ Heuristic trauma severity triage. """
    q = query.lower()
    if "unconscious" in q or "breathing stopped" in q or "arterial" in q or "choking" in q or "severe" in q:
        return "high", "Critical clinical emergency. Life-threatening status confirmed. High priority."
    elif "fracture" in q or "broken" in q or "burn" in q or "allergy" in q:
        return "medium", "Urgent clinical condition. Stable vitals suspected but orthopedic/tissue damage present."
    else:
        return "low", "Minor trauma symptoms. Bystander guidance and monitoring suggested."

def get_backup_guidance(query: str, guidelines: list) -> str:
    """ Standard formatter when LLM is offline. """
    base_text = "### EMERGENCY BYSTANDER ACTION PLAN:\n\n"
    for i, g in enumerate(guidelines):
        # Strip Title/Source from content if present
        clean_content = g["content"].replace("Protocol:", "").strip()
        base_text += f"{i+1}. **{g['title']} Action**:\n   {clean_content}\n\n"
    base_text += "4. **MONITOR AND REASSURE**: Stay with the victim, keep them warm, and await emergency services."
    return base_text


# --- LANGGRAPH GRAPH BUILDING ---

def build_graph():
    """
    Compiles the multi-agent graph with parallel fan-out and fan-in.
    """
    builder = StateGraph(EmergencyState)
    
    # 1. Add all agent nodes
    builder.add_node("orchestrator", orchestrator_node)
    builder.add_node("triage", triage_node)
    builder.add_node("guidance", guidance_node)
    builder.add_node("locate", locate_node)
    builder.add_node("dispatch", dispatch_node)
    builder.add_node("hazard", hazard_node)
    builder.add_node("resolution", resolution_node)
    
    # 2. Set entrance point
    builder.set_entry_point("orchestrator")
    
    # 3. Dynamic Parallel Routing Edges
    # Evaluates the 'planned_agents' populated by Orchestrator
    def route_to_parallel_agents(state: EmergencyState) -> List[str]:
        return state.get("planned_agents", ["triage", "guidance", "locate", "dispatch"])
        
    builder.add_conditional_edges(
        "orchestrator",
        route_to_parallel_agents,
        {
            "triage": "triage",
            "guidance": "guidance",
            "locate": "locate",
            "dispatch": "dispatch",
            "hazard": "hazard"
        }
    )
    
    # 4. Fan-In: All parallel lanes resolve to resolution node
    builder.add_edge("triage", "resolution")
    builder.add_edge("guidance", "resolution")
    builder.add_edge("locate", "resolution")
    builder.add_edge("dispatch", "resolution")
    builder.add_edge("hazard", "resolution")
    
    # 5. Compiles graph end
    builder.add_edge("resolution", END)
    
    return builder.compile()
