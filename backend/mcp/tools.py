import math
import random
import asyncio
from typing import Dict, Any
import httpx
from backend.core.websocket_manager import ws_manager

async def notify_family(contact_info: str) -> Dict[str, Any]:
    """
    Simulates sending an SMS/Viber emergency alert to the victim's family.
    """
    print(f"[MCP TOOL] notify_family activated with: {contact_info}")
    
    # Broadcast progress
    await ws_manager.broadcast_event(
        event_type="agent_activated",
        agent="dispatch",
        status="running",
        message=f"Notifying family contacts: {contact_info}...",
        metadata={"priority": "high", "details": {"action": "send_sms"}}
    )
    
    await asyncio.sleep(1.0)
    
    return {
        "tool": "notify_family",
        "status": "success",
        "recipient": contact_info,
        "message": "Emergency broadcast successfully sent to family member."
    }

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes the great-circle distance between two points on the sphere in kilometers.
    """
    R = 6371.0 # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

async def find_hospital(lat: float, lng: float) -> Dict[str, Any]:
    """
    Finds real nearby trauma medical facilities from OpenStreetMap Overpass API.
    Falls back to a local database of Bangladesh hospitals if API queries fail.
    """
    print(f"[MCP TOOL] find_hospital activated with coordinates: ({lat}, {lng})")
    
    # Broadcast locate start
    await ws_manager.broadcast_event(
        event_type="agent_activated",
        agent="locate",
        status="running",
        message="Locating nearest emergency medical facilities...",
        metadata={"priority": "high", "coordinates": {"lat": lat, "lng": lng}}
    )
    
    # Query OSM Overpass API
    query = f"""[out:json][timeout:12];
    (
      node["amenity"="hospital"](around:10000, {lat}, {lng});
      way["amenity"="hospital"](around:10000, {lat}, {lng});
      relation["amenity"="hospital"](around:10000, {lat}, {lng});
    );
    out center;"""
    
    endpoints = [
        "https://overpass-api.de/api/interpreter",
        "https://lz4.overpass-api.de/api/interpreter",
        "https://z.overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
        "https://overpass.osm.ch/api/interpreter"
    ]
    headers = {
        "User-Agent": "RoadGuardianAI-HospitalLocator/1.0 (contact: support@roadguardian.ai)"
    }
    
    elements = []
    success_endpoint = None
    for url in endpoints:
        print(f"[OSM] Querying Overpass mirror: {url}...")
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, data={"data": query}, headers=headers, timeout=8.0)
                if response.status_code == 200:
                    data = response.json()
                    elements = data.get("elements", [])
                    success_endpoint = url
                    print(f"[OSM] Success from {url}! Found {len(elements)} items.")
                    break
                else:
                    print(f"[OSM] Mirror {url} returned status code: {response.status_code}")
        except Exception as e:
            print(f"[OSM] Mirror {url} error: {e}")
            
    hospitals = []
    
    # Parse OSM results
    if success_endpoint and elements:
        for elem in elements:
            name = elem.get("tags", {}).get("name")
            if not name:
                brand = elem.get("tags", {}).get("brand")
                name = brand if brand else "Emergency Medical Clinic"
            
            elem_lat = elem.get("lat") or elem.get("center", {}).get("lat")
            elem_lng = elem.get("lon") or elem.get("center", {}).get("lon")
            
            if elem_lat is not None and elem_lng is not None:
                dist = haversine_distance(lat, lng, float(elem_lat), float(elem_lng))
                
                # Determine specialty tag
                specialty = "General Emergency"
                name_lower = name.lower()
                if "trauma" in name_lower:
                    specialty = "Level 2 Trauma Care"
                elif "burn" in name_lower or "cancer" in name_lower:
                    specialty = "Specialty Center"
                elif "medical college" in name_lower or "general hospital" in name_lower:
                    specialty = "Level 1 Trauma & Surgical Care"
                elif "clinic" in name_lower or "health complex" in name_lower:
                    specialty = "Primary & Emergency Triage"
                
                hospitals.append({
                    "name": name,
                    "lat": float(elem_lat),
                    "lng": float(elem_lng),
                    "specialty": specialty,
                    "distance_km": round(dist, 1)
                })
                
        # De-duplicate by name
        seen = set()
        deduped = []
        for h in hospitals:
            name_key = h["name"].lower()
            if name_key not in seen:
                seen.add(name_key)
                deduped.append(h)
        hospitals = deduped

    # Fallback to local BD hospitals if no results from Overpass API
    if not hospitals:
        print("[OSM] Query failed or empty. Falling back to local offline hospital list.")
        local_db = [
            {"name": "Dhaka Medical College Hospital", "lat": 23.7258, "lng": 90.3980, "specialty": "Level 1 Trauma & Burn Care"},
            {"name": "Square Hospital Dhaka", "lat": 23.7516, "lng": 90.3815, "specialty": "Multi-specialty Emergency"},
            {"name": "Sylhet MAG Osmani Medical College", "lat": 24.8997, "lng": 91.8624, "specialty": "Level 1 Trauma & Surgical Care"},
            {"name": "Sylhet Trauma Center", "lat": 24.8872, "lng": 91.8615, "specialty": "Trauma & Orthopedic Surgery"},
            {"name": "Tangail General Hospital", "lat": 24.2498, "lng": 89.9196, "specialty": "General & Trauma Emergency"},
            {"name": "Evercare Hospital Chittagong", "lat": 22.3700, "lng": 91.8400, "specialty": "Full Emergency Suite"}
        ]
        for item in local_db:
            dist = haversine_distance(lat, lng, item["lat"], item["lng"])
            hospitals.append({
                "name": item["name"],
                "lat": item["lat"],
                "lng": item["lng"],
                "specialty": item["specialty"],
                "distance_km": round(dist, 1)
            })

    # Sort all by physical distance in km
    hospitals.sort(key=lambda x: x["distance_km"])
    
    # Calculate ETA for each
    for h in hospitals:
        eta_mins = max(2, int(round(h["distance_km"] * 1.5 + 2)))
        h["eta"] = f"{eta_mins} mins"
        
    closest = hospitals[0]
    
    # Broadcast completion with full list of top 5 nearby hospitals
    top_5 = hospitals[:5]
    await ws_manager.broadcast_event(
        event_type="agent_activated",
        agent="locate",
        status="completed",
        message=f"Nearest hospital identified: {closest['name']} ({closest['distance_km']} km away).",
        metadata={
            "priority": "high",
            "hospital": closest["name"],
            "specialty": closest["specialty"],
            "distance_km": closest["distance_km"],
            "eta": closest["eta"],
            "lat": closest["lat"],
            "lng": closest["lng"],
            "hospitals": top_5
        }
    )
    
    return {
        "tool": "find_hospital",
        "status": "success",
        "hospital": closest["name"],
        "specialty": closest["specialty"],
        "distance_km": closest["distance_km"],
        "eta": closest["eta"],
        "lat": closest["lat"],
        "lng": closest["lng"],
        "hospitals": top_5
    }

async def dispatch_emergency(hospital_name: str, lat: float, lng: float) -> Dict[str, Any]:
    """
    Simulates triggering a rapid responder/ambulance dispatch.
    """
    print(f"[MCP TOOL] dispatch_emergency to hospital: {hospital_name}")
    
    # Broadcast dispatch start
    await ws_manager.broadcast_event(
        event_type="dispatch_started",
        agent="dispatch",
        status="running",
        message=f"Requesting rapid ambulance dispatch from {hospital_name}...",
        metadata={
            "targetHospital": hospital_name,
            "notificationSentToFamily": True
        }
    )
    
    await asyncio.sleep(1.5)
    
    vehicle_id = f"AMB-{random.randint(100, 999)}"
    eta_mins = random.randint(8, 15)
    eta_str = f"{eta_mins} mins"
    
    # Broadcast dispatch completion
    await ws_manager.broadcast_event(
        event_type="dispatch_completed",
        agent="dispatch",
        status="completed",
        message=f"Ambulance {vehicle_id} dispatched from {hospital_name}. ETA: {eta_str}.",
        metadata={
            "hospital": hospital_name,
            "eta": eta_str,
            "vehicleId": vehicle_id,
            "status": "dispatched"
        }
    )
    
    return {
        "tool": "dispatch_emergency",
        "status": "success",
        "hospital": hospital_name,
        "eta": eta_str,
        "vehicle_id": vehicle_id
    }

async def create_hazard_report(hazard_type: str, lat: float, lng: float, severity: str) -> Dict[str, Any]:
    """
    Simulates logging a road hazard alert (e.g. pothole, accident scene)
    and pinpoints it on the shared dashboard map.
    """
    print(f"[MCP TOOL] create_hazard_report: {hazard_type} | Severity: {severity}")
    
    # Broadcast hazard detection
    await ws_manager.broadcast_event(
        event_type="hazard_detected",
        agent="hazard",
        status="completed",
        message=f"New hazard logged: {hazard_type} ({severity} severity) mapped at ({lat}, {lng}).",
        metadata={
            "hazard_type": hazard_type,
            "severity": severity,
            "location": {"lat": lat, "lng": lng}
        }
    )
    
    return {
        "tool": "create_hazard_report",
        "status": "success",
        "hazard_type": hazard_type,
        "severity": severity,
        "location": {"lat": lat, "lng": lng}
    }
