import os
import sys

# Add the project root to sys.path to allow absolute imports like 'from backend.xxx import yyy'
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.websocket.stream import router as websocket_router
from backend.api.routes import router as api_router

app = FastAPI(title="RoadGuardian AI Backend")

# Allow CORS for the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(websocket_router)

@app.on_event("startup")
def startup_event():
    # Automatically seed the database on startup if the ChromaDB directory does not exist or is empty
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
    CHROMA_DB_DIR = os.path.join(CURRENT_DIR, "rag", "chroma_db")
    if not os.path.exists(CHROMA_DB_DIR) or not os.listdir(CHROMA_DB_DIR):
        print("ChromaDB directory not found or empty. Seeding RAG database...")
        try:
            from backend.rag.ingest.seed_rag import seed_database
            seed_database()
        except Exception as e:
            print(f"Error seeding database on startup: {e}")
    else:
        print("ChromaDB database already seeded.")

@app.get("/")
def read_root():
    return {"status": "running", "message": "RoadGuardian AI Backend is active."}

@app.get("/models/status")
async def models_status():
    from backend.local_llm.ollama_client import check_ollama_available
    ollama_up = await check_ollama_available()
    return {
        "groq_cloud": "llama-3.1-8b-instant",
        "local_ollama": ollama_up,
        "local_models": ["phi3:mini", "deepseek-r1:1.5b"] if ollama_up else [],
    }

@app.get("/mcp/servers")
async def list_mcp_servers():
    """Lists all registered MCP servers and their tool counts."""
    return {
        "servers": [
            {
                "name": "roadguardian-emergency-tools",
                "transport": "stdio",
                "tool_count": 4,
                "tools": [
                    "locate_nearest_hospital",
                    "dispatch_ambulance",
                    "notify_family_contacts",
                    "report_hazard"
                ],
            },
            {
                "name": "crashsense-telemetry-tools",
                "transport": "stdio",
                "tool_count": 3,
                "tools": [
                    "analyze_crash_telemetry",
                    "get_crash_threshold_config",
                    "log_crash_event"
                ],
            },
            {
                "name": "emergency-translator-tools",
                "transport": "stdio",
                "tool_count": 3,
                "tools": [
                    "translate_emergency_phrase",
                    "get_available_languages",
                    "get_bystander_card"
                ],
            },
        ],
        "total_tools": 10,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)


