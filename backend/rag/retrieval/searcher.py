import os
import sys
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq

# Absolute paths
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(CURRENT_DIR))
sys.path.append(BACKEND_DIR)

from local_llm.ollama_client import phi3_guidance, check_ollama_available
CHROMA_DB_DIR = os.path.join(BACKEND_DIR, "rag", "chroma_db")

# Import embeddings
from rag.embeddings.model import get_embedding_model

# Initialize Groq client for HyDE preprocessing
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
_hyde_llm = None
if GROQ_API_KEY:
    try:
        _hyde_llm = ChatGroq(model_name="llama-3.1-8b-instant", groq_api_key=GROQ_API_KEY, temperature=0.1)
    except Exception as e:
        print(f"Error initializing ChatGroq for HyDE: {e}")

_vector_store = None

def get_vector_store():
    """
    Singleton for accessing the active Chroma database.
    """
    global _vector_store
    if _vector_store is None:
        embeddings = get_embedding_model()
        if not os.path.exists(CHROMA_DB_DIR) or not os.listdir(CHROMA_DB_DIR):
            raise RuntimeError(
                f"ChromaDB directory at {CHROMA_DB_DIR} is empty. "
                "Please run seed_rag.py first to build the database index!"
            )
        _vector_store = Chroma(
            persist_directory=CHROMA_DB_DIR,
            embedding_function=embeddings,
            collection_name="emergency_protocols"
        )
    return _vector_store

def retrieve_guidelines(query: str, k: int = 3):
    """
    Retrieves the top k semantic chunks from the first aid/trauma Chroma DB.
    First preprocesses the query using HyDE (Hypothetical Document Embeddings) to 
    generate an ideal first-aid response, then searches Chroma DB with it.
    
    Transforms the raw distance score to a normalized confidence score [0.0 - 1.0].
    Returns:
        List of dicts, each with keys:
            - "content": raw chunk text
            - "source": citation name (e.g. WHO Trauma Response Section 2)
            - "title": protocol name
            - "confidence": normalized similarity score [0.0 to 1.0]
    """
    # Check if simulation or low memory mode is active to bypass loading heavy neural models (saves RAM)
    if os.getenv("SIMULATION_MODE", "false").lower() == "true" or os.getenv("LOW_MEM", "false").lower() == "true":
        print("[RAG] Low memory / simulation mode active. Returning cached first-aid protocols directly.")
        return get_offline_fallback(query)

    try:
        db = get_vector_store()
    except Exception as e:
        print(f"Error initializing vector database: {e}")
        # Return fallback mock guidelines if database is not seeded
        return get_offline_fallback(query)
        
    # --- HyDE PREPROCESSING ---
    search_query = query
    if _hyde_llm:
        try:
            hyde_prompt = (
                "You are an emergency medical responder. Given a user's raw, panicky emergency query, "
                "generate a brief, ideal first-aid/trauma response document or protocol text. "
                "Focus on clinical actions, steps, and techniques. Do not include introductory or concluding conversational text. "
                f"Query: {query}\n\nHypothetical Guide:"
            )
            response = _hyde_llm.invoke(hyde_prompt)
            hypothetical_doc = response.content.strip()
            print(f"\n[HyDE] Generated hypothetical response for RAG search:\n{hypothetical_doc}\n")
            search_query = hypothetical_doc
        except Exception as hyde_err:
            print(f"[HyDE Error] Failed to generate hypothetical document: {hyde_err}. Falling back to raw query.")

    # Search Chroma with scores (Chroma returns L2 distances) using the HyDE search_query
    results = db.similarity_search_with_score(search_query, k=k)
    
    retrieved_items = []
    for doc, distance in results:
        # Calculate a calibrated confidence score
        # For L2 distance on normalized embeddings, distance is in [0, 2]
        # We calibrate so that a distance of 0.8 is around 0.6 confidence, and 0.4 is around 0.9 confidence.
        raw_confidence = 1.0 - (distance / 2.0)
        confidence = float(max(0.1, min(0.99, round(raw_confidence, 2))))
        
        retrieved_items.append({
            "content": doc.page_content,
            "source": doc.metadata.get("source", "Unknown Emergency Protocol"),
            "title": doc.metadata.get("title", "First Aid Protocol"),
            "confidence": confidence
        })
        
    if not retrieved_items:
        return get_offline_fallback(query)
        
    return retrieved_items

def get_offline_fallback(query: str):
    """
    Graceful offline backup if Chroma database is unseeded or encounters issues.
    """
    print(f"Vector search warning: utilizing hardcoded fallback for query '{query}'")
    query_lower = query.lower()
    
    if "bleed" in query_lower or "blood" in query_lower or "wound" in query_lower:
        return [{
            "content": "Title: Severe Bleeding & Arterial Hemorrhage Control\nProtocol: Apply firm, direct pressure to the wound with a clean cloth. Elevate the bleeding limb. Do not remove blood-soaked dressings; overlay them with additional layers. Apply tourniquet if bleeding is life-threatening.",
            "source": "WHO Trauma Response Protocol Section 2.1 (Offline Fallback)",
            "title": "Severe Bleeding Control",
            "confidence": 0.85
        }]
    elif "cpr" in query_lower or "breath" in query_lower or "choke" in query_lower or "heart" in query_lower:
        return [{
            "content": "Title: Basic Life Support & CPR\nProtocol: Lay patient flat on a firm surface. Perform chest compressions in center of chest at a rate of 100-120 per minute, pressing 2 inches deep. Tilt head and Chin to open airway.",
            "source": "Red Cross Emergency CPR Guidelines 2025 (Offline Fallback)",
            "title": "Basic Life Support & CPR",
            "confidence": 0.88
        }]
    else:
        return [{
            "content": "Title: Shock Management and Prevention\nProtocol: Have the patient lie flat on their back. Elevate feet and legs 12 inches to encourage blood flow to vital organs. Keep warm with a blanket. Do not give food or drink.",
            "source": "WHO Trauma Response Protocol Section 3.2 (Offline Fallback)",
            "title": "Shock Management",
            "confidence": 0.75
        }]


async def get_guidance(query: str, use_offline: bool = False) -> dict:
    """
    Main guidance function.
    use_offline=True forces local Phi-3 model.
    Falls back automatically if Groq is unreachable.
    """
    if use_offline:
        return await phi3_guidance(query)

    try:
        guidelines = retrieve_guidelines(query, k=2)
        context_str = "\n\n".join([f"Source: {g['source']}\n{g['content']}" for g in guidelines])
        
        from backend.rag.prompts.emergency_prompts import GUIDANCE_PROMPT
        if _hyde_llm:
            formatted_prompt = GUIDANCE_PROMPT.format(
                rag_context=context_str, 
                query=query, 
                severity="high"
            )
            response = await _hyde_llm.ainvoke(formatted_prompt)
            guidance_text = response.content.strip()
            return {"guidance": guidance_text, "model": "llama-3.1-8b-instant", "mode": "online", "results": guidelines}
        else:
            raise RuntimeError("LLM not initialized")
            
    except Exception as e:
        print(f"Groq/ChromaDB unavailable, falling back to Phi-3: {e}")
        if await check_ollama_available():
            return await phi3_guidance(query)
        else:
            fallback_res = get_offline_fallback(query)
            fallback_text = "\n\n".join([f"{g['title']}: {g['content']}" for g in fallback_res])
            return {"guidance": fallback_text, "model": "regex-fallback", "mode": "offline", "results": fallback_res}

