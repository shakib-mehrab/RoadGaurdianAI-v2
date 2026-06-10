import json
import asyncio
import websockets

async def simulate_emergency_stream():
    """
    Connects to the FastAPI backend WebSocket stream and triggers a sample SOS emergency.
    Logs each structured orchestration event received from the multi-agent graph.
    """
    uri = "ws://localhost:8000/stream"
    print(f"=== CONNECTING TO WEBSOCKET: {uri} ===")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected successfully. Preparing SOS payload...")
            
            # Conforms exactly to Stage 1 SOSPayload Schema Contract
            sos_payload = {
                "userId": "usr-zahid-99",
                "emergencyType": "bleeding",
                "message": "Victim is bleeding heavily from a deep head wound, partially conscious.",
                "location": {
                  "lat": 24.8954,
                  "lng": 91.8681
                },
                "accessibilityMode": "vibration"
            }
            
            # Send the payload
            print(f"Sending SOS payload: {json.dumps(sos_payload, indent=2)}")
            await websocket.send(json.dumps(sos_payload))
            
            # Listen to incoming event streams from LangGraph & MCP Tools
            print("\n=== LIVE ORCHESTRATION EVENT STREAM ===")
            while True:
                response = await websocket.recv()
                event_data = json.loads(response)
                
                # Format nicely
                event_name = event_data.get("event", "UNKNOWN")
                agent = event_data.get("agent", "UNKNOWN")
                status = event_data.get("status", "UNKNOWN")
                msg = event_data.get("message", "")
                metadata = event_data.get("metadata", {})
                
                print(f"\n[EVENT] {event_name.upper()} | Agent: {agent} | Status: {status}")
                print(f" > Message: {msg}")
                if metadata:
                    print(f" > Metadata: {json.dumps(metadata, indent=2)}")
                    
                # Exit when the entire orchestration flow resolves
                if event_name == "emergency_resolved":
                    print("\n=== RESCUE PIPELINE RESOLVED. SIMULATION SUCCESSFUL ===")
                    break
                    
    except ConnectionRefusedError:
        print("\n[ERROR] Connection refused. Is the FastAPI server running on http://localhost:8000?")
        print("Run 'uvicorn backend.main:app --reload' in a separate shell first.")
    except Exception as e:
        print(f"\n[ERROR] Simulation failed: {e}")

if __name__ == "__main__":
    asyncio.run(simulate_emergency_stream())
