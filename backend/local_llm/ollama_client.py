import httpx
import json
from typing import Optional

OLLAMA_BASE = "http://localhost:11434"


async def ollama_generate(model: str, prompt: str, timeout: int = 60) -> str:
    """Raw call to Ollama generate endpoint."""
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(
            f"{OLLAMA_BASE}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False}
        )
        response.raise_for_status()
        return response.json()["response"]


async def phi3_guidance(query: str) -> dict:
    """
    Uses Phi-3 Mini to generate offline emergency first-aid guidance.
    Called when Groq API is unreachable (no internet or API limit hit).
    """
    prompt = f"""You are a certified emergency first-aid assistant.
Your role: provide clear step-by-step instructions to bystanders
during road accidents. Be concise. Use numbered steps.
Never guess about medical diagnoses.
User emergency query: {query}
Respond with numbered steps only. No preamble."""
    try:
        text = await ollama_generate("phi3:mini", prompt)
        return {"guidance": text, "model": "phi3:mini", "mode": "offline"}
    except Exception as e:
        print(f"Error calling local Phi-3: {e}")
        return {
            "guidance": "1. Ensure scene safety. Do not touch or move the victim if a neck/spine injury is suspected.\n2. Call emergency services immediately.\n3. Apply direct pressure to any bleeding wounds with a clean cloth.\n4. Keep patient calm, warm, and reassured.",
            "model": "phi3:mini-fallback",
            "mode": "offline"
        }


async def deepseek_triage(description: str) -> dict:
    """
    Uses DeepSeek-R1-Distill to classify emergency severity.
    Returns structured JSON for LangGraph routing decisions.
    """
    prompt = f"""Classify this road accident emergency.
Emergency description: {description}
Return ONLY valid JSON, no extra text:
{{"severity": "low|medium|critical",
  "type": "trauma|cardiac|respiratory|fracture|other",
  "conscious": true or false,
  "priority_action": "one sentence"}}"""
    try:
        text = await ollama_generate("deepseek-r1:1.5b", prompt, timeout=30)
        # Strip any reasoning tags DeepSeek adds
        clean = text.split("</think>")[-1].strip()
        return json.loads(clean)
    except Exception as e:
        print(f"Error calling local DeepSeek-R1: {e}")
        return {
            "severity": "medium",
            "type": "other",
            "conscious": True,
            "priority_action": "Call emergency services immediately"
        }


async def check_ollama_available() -> bool:
    """Health check — returns True if Ollama is running locally."""
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            r = await client.get(f"{OLLAMA_BASE}/api/tags")
            return r.status_code == 200
    except Exception:
        return False
