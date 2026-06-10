import { create } from 'zustand'

const AGENTS = [
  { id: 'orchestrator', name: 'Orchestrator',  icon: '🧠', color: '#0A84FF', desc: 'LangGraph StateGraph Master' },
  { id: 'triage',       name: 'Triage',        icon: '🩺', color: '#FF9F0A', desc: 'Medical AI — injury severity' },
  { id: 'locate',       name: 'Locate',        icon: '📍', color: '#30D158', desc: 'Geo AI — nearest facilities' },
  { id: 'dispatch',     name: 'Dispatch',      icon: '📡', color: '#FF375F', desc: 'MCP Hub — ambulance & police' },
  { id: 'guidance',     name: 'Guidance',      icon: '💬', color: '#64D2FF', desc: 'RAG + LLM — first-aid stream' },
  { id: 'hazard',       name: 'Hazard',        icon: '⚠️',  color: '#FFD60A', desc: 'Vision AI — road detection' },
  { id: 'guard',        name: 'SafeGuard',     icon: '🛡️',  color: '#BF5AF2', desc: 'NeMo Guardrails — safety' },
]

const INCIDENT_STATES = ['IDLE', 'DETECTED', 'TRIAGED', 'DISPATCHED', 'GUIDED', 'RESOLVED']

const MOCK_LOG_MESSAGES = {
  orchestrator: [
    'Incident triggered — classifying severity...',
    'Severity: CRITICAL (Level 4) — parallelizing sub-agents',
    'State: DETECTED → TRIAGED',
    'All agents acknowledged. Monitoring...',
    'State: DISPATCHED → GUIDED',
    'Incident state: RESOLVED ✓',
  ],
  triage: [
    'Analyzing reported symptoms...',
    'RAG retrieval: WHO Trauma Protocol §3.2',
    'Identified: possible head trauma + laceration',
    'Severity: HIGH — immediate attention required',
    'Flags: DO NOT move patient. Airway clear?',
    'Triage complete ✓',
  ],
  locate: [
    'Acquiring GPS coordinates...',
    'GPS locked: 23.8103°N, 90.4125°E',
    'Querying OSM Overpass API...',
    'Found 4 trauma centers within 8km',
    'Ranked by: accessibility + ETA + specialization',
    'Nearest: Dhaka Medical College (2.3km, ~6 min) ✓',
  ],
  dispatch: [
    'Connecting to MCP server...',
    'MCP tool: dispatch_ambulance() → calling',
    'Payload: {gps, severity:4, blood_group:"B+"}',
    'MCP tool: notify_family() → calling',
    'MCP tool: send_police_alert() → calling',
    'All dispatch tools acknowledged ✓',
  ],
  guidance: [
    'Embedding query: "head trauma bleeding"...',
    'HyDE expansion complete',
    'Vector search: Qdrant cosine similarity',
    'Retrieved 5 chunks — reranking...',
    'Cross-encoder score: 0.94',
    'Streaming first-aid guidance... ✓',
  ],
  hazard: [
    'Road image received — running YOLOv8n...',
    'Detected: pothole (conf: 0.91)',
    'Detected: debris (conf: 0.78)',
    'Geo-tagging hazard at incident location',
    'Hazard report created in Supabase',
    'n8n webhook triggered → municipal digest ✓',
  ],
  guard: [
    'Monitoring all agent outputs...',
    'Validating medical advice against guidelines',
    'No hallucinated hospital names detected',
    'Dosage check: PASS',
    'Confidence score: 0.94 — within threshold',
    'All outputs cleared ✓',
  ],
}

const MOCK_TRIAGE_RESULT = {
  severity: 4,
  label: 'CRITICAL',
  injuries: ['Possible Left Arm Fracture', 'Forearm Laceration', 'Trauma Shock'],
  actions: [
    'Confirm 999 case #999-INC-28491 dispatcher routing',
    'Do NOT move the patient — suspected cervical/spinal trauma',
    'Apply direct pressure to left forearm laceration',
    'Hold left arm still, do not force alignment',
    'Check responsiveness using visual cues (Deaf user flag active)',
  ],
  warnings: ['DO NOT remove helmet', 'Ensure scene safety near Kanchpur Bridge'],
  doNotMove: true,
  confidence: 0.94,
}

const MOCK_HOSPITALS = [
  { name: 'Dhaka Medical College Hospital', dist: '2.3 km', eta: '6 min', type: 'Level 1 Trauma Care', accessible: true, blood: true },
  { name: 'Square Hospital Emergency', dist: '3.8 km', eta: '10 min', type: 'Multi-specialty Care', accessible: true, blood: true },
  { name: 'Sheikh Hasina Burn Institute', dist: '2.4 km', eta: '7 min', type: 'Specialty Burn Center', accessible: true, blood: true },
]

const MOCK_MCP_TOOLS = [
  { tool: 'dispatch_emergency', status: 'success', payload: { location: 'Kanchpur Bridge', vehicle: 'AMB-204' }, response: 'Ambulance AMB-204 dispatched — ETA 6 min' },
  { tool: 'notify_family', status: 'success', payload: { contact: 'Amina Akter', role: 'Mother' }, response: 'SMS delivered to Amina Akter' },
  { tool: 'report_hazard', status: 'success', payload: { type: 'accident_scene', location: 'Kanchpur Bridge' }, response: 'Incident logged in 999 dashboard' },
]

const MOCK_GUIDANCE_STREAM = `**Immediate First Aid for Arm Fracture & Bleeding**

*Source: WHO First Aid Guidelines, §4.3 | Confidence: 94%*

---

**Step 1 — Ensure Scene Safety** 🔴
Verify that traffic is stopped near Kanchpur Bridge before assisting.

**Step 2 — Do NOT Move the Patient** ⚠️
Suspected spinal injury — keep Riya Akter still. Only move if in immediate danger.

**Step 3 — Control Bleeding**
For the left forearm laceration: apply direct pressure with a clean cloth. Elevate if possible.

**Step 4 — Support Fracture**
Immobilize the left arm in the position found. Do not force alignment.

**Step 5 — Monitor Vitals**
Monitor breathing. Look for visual cues, since she is Deaf.

*Ambulance ETA: 6 mins to Dhaka Medical.*`

export const useStore = create((set, get) => ({
  // ---- WebSocket State ----
  wsConnected: false,
  wsEvents: [],
  setWsConnected: (connected) => set({ wsConnected: connected }),
  addWsEvent: (event) => set(s => ({ wsEvents: [...s.wsEvents, event] })),

  // ---- PWA Install States ----
  pwaInstallPrompt: null,
  pwaInstalled: false,
  setPwaInstallPrompt: (prompt) => set({ pwaInstallPrompt: prompt }),
  setPwaInstalled: (installed) => set({ pwaInstalled: installed }),

  // ---- Accessibility ----
  a11yMode: 'deaf',
  setA11yMode: (mode) => set({ a11yMode: mode }),

  // ---- Mobile App Screen Router ----
  currentMobileScreen: 'home',
  setMobileScreen: (screen) => set({ currentMobileScreen: screen }),

  // ---- Riya Akter Real Profile ----
  userProfile: {
    name: 'Riya Akter',
    age: 24,
    location: 'Kanchpur Bridge, Dhaka',
    occupation: 'University Student',
    accessibilityNeed: 'Deaf User',
    bloodGroup: 'O+',
    emergencyContactName: 'Amina Akter',
    emergencyContactRole: 'Mother',
    emergencyContactPhone: '+880-171-XXX-XXXX',
    preferredLanguage: 'bn', // বাংলা
    accessibilityMode: 'deaf',
    medicalNotes: 'No major chronic illness',
    preferredHospital: 'Dhaka Medical College Hospital'
  },
  
  // ---- Partner Integrations ----
  partnerIntegrations: {
    provider: 'Pathao',
    rideId: 'PT-24891',
    driverName: 'Md. Rahim',
    vehicleType: 'Motorcycle',
    tripStatus: 'Ride Active',
    locationStart: 'Comilla University',
    locationEnd: 'Dhaka',
    emergencySharing: 'Enabled'
  },
  setPartnerProvider: (provider) => set(s => {
    if (provider === 'Grab') {
      return {
        partnerIntegrations: {
          provider: 'Grab',
          rideId: 'GB-99201',
          driverName: 'Somchai (GrabCar)',
          vehicleType: 'GrabCar Premium',
          tripStatus: 'Active & Verified',
          locationStart: 'Dhaka Airport',
          locationEnd: 'Gulshan-2, Dhaka',
          emergencySharing: 'Active via Grab Safety Link'
        }
      }
    } else {
      return {
        partnerIntegrations: {
          provider: 'Pathao',
          rideId: 'PT-24891',
          driverName: 'Md. Rahim',
          vehicleType: 'Motorcycle',
          tripStatus: 'Ride Active',
          locationStart: 'Comilla University',
          locationEnd: 'Dhaka',
          emergencySharing: 'Enabled'
        }
      }
    }
  }),

  // ---- Interactive Demo Walkthrough ----
  demoActive: false,
  demoStep: 0,
  setDemoStep: (step) => set({ demoStep: step }),
  setDemoActive: (active) => set({ demoActive: active }),

  // ---- Incident State Machine ----
  incidentState: 'IDLE',
  incidentStates: INCIDENT_STATES,
  setIncidentState: (s) => set({ incidentState: s }),

  // ---- Agents ----
  agents: AGENTS,
  agentStatuses: Object.fromEntries(AGENTS.map(a => [a.id, 'idle'])),
  agentLogs:     Object.fromEntries(AGENTS.map(a => [a.id, []])),
  agentProgress: Object.fromEntries(AGENTS.map(a => [a.id, 0])),

  // ---- SOS Flow ----
  sosActive: false,
  sosTimestamp: null,
  location: null,
  bloodGroup: 'O+',
  emergencyType: '',

  setBloodGroup: (bg) => set({ bloodGroup: bg }),
  setEmergencyType: (et) => set({ emergencyType: et }),

  // ---- RAG ----
  ragQuery: '',
  ragResponse: '',
  ragSources: [],
  ragStreaming: false,
  ragLanguage: 'en',
  setRagQuery: (q) => set({ ragQuery: q }),
  setRagLanguage: (l) => set({ ragLanguage: l }),

  // ---- Triage ----
  triageResult: null,
  hospitals: MOCK_HOSPITALS,
  mcpTools: [],
  guidanceStream: '',

  // ---- Hazard ----
  hazards: [],
  addHazard: (h) => set(s => ({ hazards: [h, ...s.hazards] })),

  // ---- Offline ----
  isOnline: navigator.onLine,
  setOnline: (v) => set({ isOnline: v }),

  // ---- Reset ----
  resetIncident: () => set({
    sosActive: false,
    sosTimestamp: null,
    incidentState: 'IDLE',
    agentStatuses: Object.fromEntries(AGENTS.map(a => [a.id, 'idle'])),
    agentLogs:     Object.fromEntries(AGENTS.map(a => [a.id, []])),
    agentProgress: Object.fromEntries(AGENTS.map(a => [a.id, 0])),
    triageResult: null,
    hospitals: MOCK_HOSPITALS,
    mcpTools: [],
    guidanceStream: '',
    currentMobileScreen: 'home',
    demoActive: false,
    demoStep: 0,
    a11yMode: 'deaf',
    partnerIntegrations: {
      provider: 'Pathao',
      rideId: 'PT-24891',
      driverName: 'Md. Rahim',
      vehicleType: 'Motorcycle',
      tripStatus: 'Ride Active',
      locationStart: 'Comilla University',
      locationEnd: 'Dhaka',
      emergencySharing: 'Enabled'
    }
  }),

  // ---- WebSocket Event Interpreter ----
  setAgentFromWs: (data) => {
    const { event, agent, status, message, metadata } = data
    if (!event) return

    // 1. SOS Triggered Event
    if (event === 'sos_triggered') {
      set({
        sosActive: true,
        sosTimestamp: Date.now(),
        location: metadata?.location || null,
        a11yMode: metadata?.accessibilityMode || 'standard',
        incidentState: 'DETECTED',
        agentStatuses: Object.fromEntries(AGENTS.map(a => [a.id, 'idle'])),
        agentLogs: Object.fromEntries(AGENTS.map(a => [a.id, []])),
        agentProgress: Object.fromEntries(AGENTS.map(a => [a.id, 0])),
        triageResult: null,
        hospitals: [],
        mcpTools: [],
        guidanceStream: '',
      })
      return
    }

    // 2. Orchestrator Started Event
    if (event === 'orchestrator_started') {
      set(s => ({
        agentStatuses: { ...s.agentStatuses, orchestrator: 'active' },
        agentLogs: { ...s.agentLogs, orchestrator: [...(s.agentLogs.orchestrator || []), message] },
        agentProgress: { ...s.agentProgress, orchestrator: 20 },
        incidentState: 'DETECTED',
      }))
      return
    }

    // 3. Agent Activated Event
    if (event === 'agent_activated') {
      const activeAgent = agent
      const newStatus = status === 'running' ? 'active' : status === 'completed' ? 'done' : status === 'failed' ? 'error' : 'idle'
      set(s => {
        const prevLogs = s.agentLogs[activeAgent] || []
        const updatedLogs = message ? [...prevLogs, message] : prevLogs
        const newProgress = newStatus === 'done' ? 100 : newStatus === 'active' ? 50 : 0
        return {
          agentStatuses: { ...s.agentStatuses, [activeAgent]: newStatus },
          agentLogs: { ...s.agentLogs, [activeAgent]: updatedLogs },
          agentProgress: { ...s.agentProgress, [activeAgent]: newProgress },
        }
      })

      // Special metadata updates for triage & locate
      if (activeAgent === 'triage' && status === 'completed' && metadata) {
        set({
          triageResult: {
            severity: metadata.severity === 'high' ? 4 : metadata.severity === 'medium' ? 2 : 1,
            label: metadata.severity?.toUpperCase() || 'UNKNOWN',
            injuries: metadata.summary ? [metadata.summary] : [],
            actions: metadata.vital_checks || [],
            warnings: [],
            doNotMove: metadata.severity === 'high',
            confidence: 0.9
          }
        })
      }

      if (activeAgent === 'locate' && status === 'completed' && metadata) {
        if (metadata.hospitals && metadata.hospitals.length > 0) {
          set({
            hospitals: metadata.hospitals.map(h => ({
              name: h.name,
              dist: `${h.distance_km} km`,
              eta: h.eta,
              type: h.specialty || 'General Emergency',
              accessible: true,
              blood: true,
              lat: h.lat,
              lng: h.lng
            }))
          })
        } else {
          set({
            hospitals: [
              {
                name: metadata.hospital || 'Dhaka Medical College Hospital',
                dist: metadata.distance_km ? `${metadata.distance_km} km` : 'Unknown',
                eta: metadata.eta || 'Calculating...',
                type: metadata.specialty || 'General Emergency',
                accessible: true,
                blood: true,
                lat: metadata.lat,
                lng: metadata.lng
              }
            ]
          })
        }
      }
      return
    }

    // 4. RAG Retrieval Started Event
    if (event === 'rag_retrieval_started') {
      set(s => ({
        agentStatuses: { ...s.agentStatuses, guidance: 'active' },
        agentLogs: { ...s.agentLogs, guidance: [...(s.agentLogs.guidance || []), message] },
        agentProgress: { ...s.agentProgress, guidance: 10 },
        ragStreaming: true,
      }))
      return
    }

    // 5. RAG Chunk Stream Event
    if (event === 'rag_chunk_stream') {
      set(s => {
        const currentStream = s.guidanceStream || ''
        const chunk = metadata?.chunk || message || ''
        const newStream = currentStream + (currentStream ? ' ' : '') + chunk
        return {
          agentStatuses: { ...s.agentStatuses, guidance: 'active' },
          guidanceStream: newStream,
          ragResponse: newStream,
          agentProgress: { ...s.agentProgress, guidance: 50 },
        }
      })
      return
    }

    // 6. RAG Completed Event
    if (event === 'rag_completed') {
      set(s => ({
        agentStatuses: { ...s.agentStatuses, guidance: 'done' },
        agentLogs: { ...s.agentLogs, guidance: [...(s.agentLogs.guidance || []), message] },
        agentProgress: { ...s.agentProgress, guidance: 100 },
        guidanceStream: metadata?.fullGuidance || s.guidanceStream,
        ragResponse: metadata?.fullGuidance || s.ragResponse,
        ragSources: metadata?.citations || [],
        ragStreaming: false,
      }))
      return
    }

    // 7. Dispatch Started Event
    if (event === 'dispatch_started') {
      set(s => ({
        agentStatuses: { ...s.agentStatuses, dispatch: 'active' },
        agentLogs: { ...s.agentLogs, dispatch: [...(s.agentLogs.dispatch || []), message] },
        agentProgress: { ...s.agentProgress, dispatch: 30 },
        incidentState: 'DISPATCHED',
      }))
      return
    }

    // 8. Dispatch Completed Event
    if (event === 'dispatch_completed') {
      set(s => {
        const toolLog = {
          tool: 'dispatch_emergency',
          status: 'success',
          payload: { hospital: metadata?.hospital },
          response: `Vehicle ${metadata?.vehicleId || 'AMB'} dispatched. ETA ${metadata?.eta || 'N/A'}`
        }
        return {
          agentStatuses: { ...s.agentStatuses, dispatch: 'done' },
          agentLogs: { ...s.agentLogs, dispatch: [...(s.agentLogs.dispatch || []), message] },
          agentProgress: { ...s.agentProgress, dispatch: 100 },
          mcpTools: [...(s.mcpTools || []), toolLog]
        }
      })
      return
    }

    // 9. Hazard Detected Event
    if (event === 'hazard_detected') {
      set(s => {
        const newHazard = {
          type: metadata?.hazard_type || 'Accident Obstruction',
          hazard_type: metadata?.hazard_type || 'Accident Obstruction',
          severity: metadata?.severity || 'medium',
          location: metadata?.location || s.location,
        }
        return {
          agentStatuses: { ...s.agentStatuses, hazard: 'done' },
          agentLogs: { ...s.agentLogs, hazard: [...(s.agentLogs.hazard || []), message] },
          agentProgress: { ...s.agentProgress, hazard: 100 },
          hazards: [newHazard, ...s.hazards],
        }
      })
      return
    }

    // 10. Emergency Resolved Event
    if (event === 'emergency_resolved') {
      set(s => ({
        agentStatuses: { ...s.agentStatuses, orchestrator: 'done' },
        agentLogs: { ...s.agentLogs, orchestrator: [...(s.agentLogs.orchestrator || []), message] },
        agentProgress: { ...s.agentProgress, orchestrator: 100 },
        incidentState: 'RESOLVED',
      }))
      return
    }

    // 11. System Error Event
    if (event === 'system_error') {
      set(s => ({
        agentStatuses: { ...s.agentStatuses, system: 'error' },
        agentLogs: { ...s.agentLogs, system: [...(s.agentLogs.system || []), message] },
      }))
      return
    }
  },

  // ---- SOS Trigger (mock orchestration) ----
  triggerSOS: (location) => {
    const store = get()
    if (store.sosActive) return

    set({ sosActive: true, sosTimestamp: Date.now(), location, incidentState: 'DETECTED' })

    const delay = (ms) => new Promise(r => setTimeout(r, ms))
    const agentOrder = ['orchestrator', 'triage', 'locate', 'dispatch', 'guidance', 'hazard', 'guard']

    const runAgent = async (agentId, startDelay) => {
      await delay(startDelay)
      set(s => ({
        agentStatuses: { ...s.agentStatuses, [agentId]: 'active' },
      }))

      const messages = MOCK_LOG_MESSAGES[agentId] || []
      for (let i = 0; i < messages.length; i++) {
        await delay(600 + Math.random() * 400)
        set(s => ({
          agentLogs:     { ...s.agentLogs,     [agentId]: [...s.agentLogs[agentId], messages[i]] },
          agentProgress: { ...s.agentProgress, [agentId]: Math.round(((i + 1) / messages.length) * 100) },
        }))
      }

      set(s => ({ agentStatuses: { ...s.agentStatuses, [agentId]: 'done' } }))
    }

    // Orchestrator first, then parallel fan-out
    ;(async () => {
      await runAgent('orchestrator', 200)
      set({ incidentState: 'TRIAGED' })

      // Parallel agents
      await Promise.all([
        runAgent('triage',   200),
        runAgent('locate',   400),
        runAgent('dispatch', 600),
        runAgent('guidance', 800),
        runAgent('hazard',   1000),
        runAgent('guard',    300),
      ])

      set({ incidentState: 'DISPATCHED' })
      await delay(800)

      // Dynamically calculate nearest hospitals based on coordinates
      const loc = location || { lat: 23.6922, lng: 90.5186 }
      
      const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371.0
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
      }

      let simulatedHospitals = []
      let fetchedSuccessfully = false

      if (navigator.onLine) {
        const query = `[out:json][timeout:15];
        (
          node["amenity"="hospital"](around:10000, ${loc.lat}, ${loc.lng});
          way["amenity"="hospital"](around:10000, ${loc.lat}, ${loc.lng});
          relation["amenity"="hospital"](around:10000, ${loc.lat}, ${loc.lng});
        );
        out center;`
        
        const endpoints = [
          "https://overpass-api.de/api/interpreter",
          "https://lz4.overpass-api.de/api/interpreter",
          "https://z.overpass-api.de/api/interpreter",
          "https://overpass.kumi.systems/api/interpreter",
          "https://overpass.osm.ch/api/interpreter"
        ]

        for (const url of endpoints) {
          try {
            console.log(`[OSM Client] Fetching from ${url}...`)
            const response = await fetch(url, {
              method: "POST",
              body: "data=" + encodeURIComponent(query),
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              }
            })
            if (response.ok) {
              const data = await response.json()
              const elements = data.elements || []
              if (elements.length > 0) {
                const osmList = elements.map(elem => {
                  const name = elem.tags?.name || elem.tags?.brand || "Emergency Medical Clinic"
                  const elLat = elem.lat || elem.center?.lat
                  const elLng = elem.lon || elem.center?.lon
                  
                  if (elLat && elLng) {
                    const distKm = getHaversineDistance(loc.lat, loc.lng, elLat, elLng)
                    const etaMins = Math.max(2, Math.round(distKm * 1.5 + 2))
                    
                    let specialty = "General Emergency"
                    const nameLower = name.toLowerCase()
                    if (nameLower.includes("trauma")) {
                      specialty = "Level 2 Trauma Care"
                    } else if (nameLower.includes("burn") || nameLower.includes("cancer")) {
                      specialty = "Specialty Center"
                    } else if (nameLower.includes("medical college") || nameLower.includes("general hospital")) {
                      specialty = "Level 1 Trauma & Surgical Care"
                    } else if (nameLower.includes("clinic") || nameLower.includes("health complex")) {
                      specialty = "Primary & Emergency Triage"
                    }

                    return {
                      name,
                      dist: `${distKm.toFixed(1)} km`,
                      eta: `${etaMins} min`,
                      type: specialty,
                      accessible: true,
                      blood: true,
                      lat: elLat,
                      lng: elLng
                    }
                  }
                  return null
                }).filter(Boolean)

                const seen = new Set()
                const deduped = []
                for (const h of osmList) {
                  const key = h.name.toLowerCase()
                  if (!seen.has(key)) {
                    seen.add(key)
                    deduped.push(h)
                  }
                }

                simulatedHospitals = deduped.sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist)).slice(0, 5)
                fetchedSuccessfully = true
                console.log(`[OSM Client] Successfully loaded ${simulatedHospitals.length} hospitals.`)
                break
              }
            }
          } catch (e) {
            console.warn(`[OSM Client] Mirror ${url} failed:`, e)
          }
        }
      }

      if (!fetchedSuccessfully) {
        console.log("[OSM Client] Falling back to local/offline hospitals list.")
        const localHospitalsDB = [
          { name: "Dhaka Medical College Hospital", lat: 23.7258, lng: 90.3980, type: "Level 1 Trauma & Burn Care", accessible: true, blood: true },
          { name: "Square Hospital Dhaka", lat: 23.7516, lng: 90.3815, type: "Multi-specialty Emergency", accessible: true, blood: true },
          { name: "Sylhet MAG Osmani Medical College", lat: 24.8997, lng: 91.8624, type: "Level 1 Trauma & Surgical Care", accessible: true, blood: true },
          { name: "Sylhet Trauma Center", lat: 24.8872, lng: 91.8615, type: "Trauma & Orthopedic Surgery", accessible: true, blood: true },
          { name: "Tangail General Hospital", lat: 24.2498, lng: 89.9196, type: "General & Trauma Emergency", accessible: true, blood: true },
          { name: "Evercare Hospital Chittagong", lat: 22.3700, lng: 91.8400, type: "Full Emergency Suite", accessible: true, blood: true }
        ]

        simulatedHospitals = localHospitalsDB.map(h => {
          let distKm, etaMins
          if (h.name === "Dhaka Medical College Hospital" && Math.abs(loc.lat - 23.6922) < 0.01 && Math.abs(loc.lng - 90.5186) < 0.01) {
            distKm = 2.3
            etaMins = 6
          } else {
            distKm = getHaversineDistance(loc.lat, loc.lng, h.lat, h.lng)
            etaMins = Math.max(2, Math.round(distKm * 1.5 + 2))
          }
          return {
            name: h.name,
            dist: `${distKm.toFixed(1)} km`,
            eta: `${etaMins} min`,
            type: h.type,
            accessible: h.accessible,
            blood: h.blood,
            lat: h.lat,
            lng: h.lng
          }
        }).sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist)).slice(0, 3)
      }

      set({
        triageResult: MOCK_TRIAGE_RESULT,
        hospitals: simulatedHospitals,
        mcpTools: MOCK_MCP_TOOLS
      })

      // Stream guidance
      set({ incidentState: 'GUIDED', guidanceStream: '' })
      const words = MOCK_GUIDANCE_STREAM.split(' ')
      for (let i = 0; i < words.length; i++) {
        await delay(40 + Math.random() * 30)
        set(s => ({ guidanceStream: s.guidanceStream + (i === 0 ? '' : ' ') + words[i] }))
      }

      await delay(1500)
      set({ incidentState: 'RESOLVED' })
    })()
  },

  // ---- RAG Query (mock) ----
  queryRAG: async (question, language) => {
    set({ ragStreaming: true, ragResponse: '', ragSources: [] })

    await new Promise(r => setTimeout(r, 800))

    const sources = [
      { title: 'WHO First Aid Manual 2024', section: '§4.3 Head Trauma', score: 0.94, chunk: 'For head trauma injuries, the primary concern is maintaining airway, breathing, and circulation...' },
      { title: 'Bangladesh DGHS Emergency Protocol', section: 'Road Accident Response', score: 0.88, chunk: 'Bystander first aid in road accidents should prioritize scene safety before patient assessment...' },
      { title: 'Red Cross First Aid Guidelines', section: 'Bleeding Control', score: 0.81, chunk: 'Direct pressure is the most effective method for controlling external bleeding...' },
    ]

    set({ ragSources: sources })

    const response = language === 'bn'
      ? `**মাথার আঘাতের জন্য প্রাথমিক চিকিৎসা**\n\n*উৎস: WHO প্রথম সহায়তা নির্দেশিকা | নির্ভরযোগ্যতা: ৯৪%*\n\n**পদক্ষেপ ১:** রোগীকে সরাবেন না — মেরুদণ্ডে আঘাত হতে পারে।\n\n**পদক্ষেপ ২:** শ্বাস-প্রশ্বাস পরীক্ষা করুন। শ্বাসনালী পরিষ্কার রাখুন।\n\n**পদক্ষেপ ৩:** রক্তক্ষরণ নিয়ন্ত্রণ করুন — সরাসরি চাপ দিন।\n\n**পদক্ষেপ ৪:** জরুরি সেবা কল করুন — ৯৯৯ বা ১৯৯।\n\n**পদক্ষেপ ৫:** রোগীকে সচেতন রাখুন — কথা বলুন।`
      : MOCK_GUIDANCE_STREAM

    const words = response.split(' ')
    for (let i = 0; i < words.length; i++) {
      await new Promise(r => setTimeout(r, 35 + Math.random() * 25))
      set(s => ({ ragResponse: s.ragResponse + (i === 0 ? '' : ' ') + words[i] }))
    }

    set({ ragStreaming: false })
  },
}))
