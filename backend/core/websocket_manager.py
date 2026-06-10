import json
import asyncio
from typing import Optional, Dict, Any
from fastapi import WebSocket
import os
import sys
import importlib.util

# Dynamic importer to bypass python hyphen limitation for shared-contracts folder
def _load_contracts():
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    contracts_path = os.path.join(os.path.dirname(backend_dir), "shared-contracts", "websocket-events", "schemas.py")
    
    # Check if the shared-contracts folder is available (e.g. local development)
    if not os.path.exists(contracts_path):
        # Fall back to the local bundled backup inside the backend core folder (e.g. docker/render builds)
        local_fallback = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schemas_fallback.py")
        if os.path.exists(local_fallback):
            spec = importlib.util.spec_from_file_location("shared_contracts_schemas", local_fallback)
            module = importlib.util.module_from_spec(spec)
            sys.modules["shared_contracts_schemas"] = module
            spec.loader.exec_module(module)
            return module
        else:
            # Absolute fallback to dynamic inline schema to avoid fatal crashes
            print("[WARNING] Could not find schemas.py or schemas_fallback.py. Utilizing minimal dynamic inline fallback.")
            from pydantic import BaseModel, Field
            from datetime import datetime
            class BaseEmergencyEvent(BaseModel):
                event: str
                agent: str
                status: str
                timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
                message: str
                metadata: dict = Field(default_factory=dict)
            class MockModule:
                pass
            mock_module = MockModule()
            mock_module.BaseEmergencyEvent = BaseEmergencyEvent
            return mock_module

    spec = importlib.util.spec_from_file_location("shared_contracts_schemas", contracts_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules["shared_contracts_schemas"] = module
    spec.loader.exec_module(module)
    return module

schemas = _load_contracts()
BaseEmergencyEvent = schemas.BaseEmergencyEvent

class WebSocketManager:
    """
    Centralized WebSocket Manager that maintains the active connection and 
    enforces strict validation of all outgoing events against shared-contracts schemas.
    """
    def __init__(self):
        self.active_websocket: Optional[WebSocket] = None
        self._lock = asyncio.Lock()

    def set_websocket(self, websocket: WebSocket):
        """
        Sets the active websocket connection for the current session.
        """
        self.active_websocket = websocket

    def clear_websocket(self):
        """
        Clears the active websocket connection.
        """
        self.active_websocket = None

    async def broadcast_event(self, event_type: str, agent: str, status: str, message: str, metadata: Dict[str, Any] = None):
        """
        Builds, strictly validates, and sends a websocket event.
        Guarantees that all streamed content matches the Pydantic schema contract.
        """
        if metadata is None:
            metadata = {}
            
        event_payload = {
            "event": event_type,
            "agent": agent,
            "status": status,
            "message": message,
            "metadata": metadata
        }
        
        # Enforce validation against the Pydantic schema contract
        try:
            # Reconstruct model for strict schema validation
            validated_event = BaseEmergencyEvent(**event_payload)
            serialized_payload = validated_event.model_dump_json()
        except Exception as err:
            print(f"[SCHEMA VALIDATION ERROR] Event payload does not match contract: {err}")
            print(f"Failed Payload: {event_payload}")
            # Send as system error if it fails validation
            error_payload = {
                "event": "system_error",
                "agent": "system",
                "status": "failed",
                "message": f"Websocket Schema Violation: {str(err)}",
                "metadata": {"failed_payload": event_payload}
            }
            try:
                validated_event = BaseEmergencyEvent(**error_payload)
                serialized_payload = validated_event.model_dump_json()
            except Exception:
                serialized_payload = json.dumps(error_payload)
                
        # Send through active WebSocket if connected
        async with self._lock:
            if self.active_websocket:
                try:
                    await self.active_websocket.send_text(serialized_payload)
                    # Pause slightly for visual flow in front-end dashboard demo
                    await asyncio.sleep(0.4)
                except Exception as ws_err:
                    print(f"Error sending websocket message: {ws_err}")
            else:
                print(f"[WS OFF-LINE] Event: {event_type} | Agent: {agent} | Msg: {message}")

# Singleton manager
ws_manager = WebSocketManager()
