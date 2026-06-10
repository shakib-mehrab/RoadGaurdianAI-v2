import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.agents.orchestrator import build_graph
from backend.core.websocket_manager import ws_manager

router = APIRouter()

@router.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint that powers Zahid's Mission Control Dashboard.
    Accepts the initial SOS trigger payload, starts multi-agent orchestration,
    and streams structured updates in real time.
    """
    await websocket.accept()
    print("[WS CONNECTED] Client established stream channel.")
    
    # Register the websocket in our connection manager
    ws_manager.set_websocket(websocket)
    graph = build_graph()
    
    try:
        while True:
            # Wait for the client to send the initial SOS trigger
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
            except json.JSONDecodeError:
                print(f"[WS ERROR] Received non-JSON input: {data}")
                await ws_manager.broadcast_event(
                    event_type="system_error",
                    agent="system",
                    status="failed",
                    message="Invalid payload. Request must be valid JSON.",
                    metadata={"errorType": "JSONDecodeError", "errorMessage": "Input was not JSON"}
                )
                continue
            
            print(f"[SOS TRIGGERED] Payload received: {payload}")
            
            # Extract attributes conforming to the SOSPayload contract
            message_text = payload.get("message", "SOS EMERGENCY REQUESTED")
            user_id = payload.get("userId", "anonymous-user")
            emergency_type = payload.get("emergencyType", "general")
            loc_data = payload.get("location", {"lat": 24.89, "lng": 91.86})
            acc_mode = payload.get("accessibilityMode", "default")
            
            # 1. Stream the initial 'sos_triggered' event (Strict Contract Event 1)
            await ws_manager.broadcast_event(
                event_type="sos_triggered",
                agent="system",
                status="running",
                message="SOS connection initialized. Locating user via cell tower triangulation...",
                metadata={
                    "userId": user_id,
                    "emergencyType": emergency_type,
                    "location": loc_data,
                    "accessibilityMode": acc_mode
                }
            )
            
            # 2. Build the initial LangGraph State
            initial_state = {
                "messages": [{"role": "user", "content": message_text}],
                "query": message_text,
                "lat": float(loc_data.get("lat", 24.89)),
                "lng": float(loc_data.get("lng", 91.86)),
                "userId": user_id,
                "accessibilityMode": acc_mode,
                
                "emergency_type": None,
                "rationale": None,
                "planned_agents": [],
                
                "triage_severity": None,
                "triage_summary": None,
                "triage_vital_checks": None,
                
                "rag_guidance": None,
                "citations": None,
                "average_confidence": None,
                
                "nearest_hospital": None,
                "dispatch_status": None,
                "hazards": None,
                
                "active_agent": "system",
                "status": "processing"
            }
            
            # 3. Invoke the LangGraph multi-agent flow
            # The agent nodes will directly stream progress through the registered ws_manager
            print("[LANGGRAPH] Starting graph execution...")
            final_state = await graph.ainvoke(initial_state)
            print(f"[LANGGRAPH] Graph execution completed. Final status: {final_state.get('status')}")
            
    except WebSocketDisconnect:
        print("[WS DISCONNECTED] Client disconnected from stream.")
    except Exception as e:
        print(f"[WS SERVER ERROR] {e}")
        try:
            await ws_manager.broadcast_event(
                event_type="system_error",
                agent="system",
                status="failed",
                message=f"Internal Server Exception: {str(e)}",
                metadata={"errorType": "InternalException", "errorMessage": str(e)}
            )
        except:
            pass
    finally:
        ws_manager.clear_websocket()
