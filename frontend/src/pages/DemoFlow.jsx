import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import MobileAppContainer from './MobileAppContainer'

const DEMO_STEPS = [
  {
    phase: 1,
    time: "6:12 PM",
    title: "Pathao Ride Commences",
    desc: "Riya starts her motorcycle ride-sharing trip from Comilla University, heading towards Dhaka. The background monitoring systems link her profile.",
    screen: "home",
    badge: "Active Ride",
    badgeColor: "bg-blue-600",
    actions: ["Initialize CrashSense sensor listener", "Load Riya's Deaf accessibility flags", "Map trip #PT-24891 route details"],
    stateUpdates: {
      sosActive: false,
      incidentState: "IDLE",
      partnerIntegrations: {
        rideId: 'PT-24891',
        driverName: 'Md. Rahim',
        vehicleType: 'Motorcycle',
        tripStatus: 'Ride Active',
        locationStart: 'Comilla University',
        locationEnd: 'Dhaka',
        emergencySharing: 'Enabled'
      }
    }
  },
  {
    phase: 2,
    time: "6:47 PM",
    title: "Motorcycle Collision Occurs",
    desc: "A sudden collision occurs near Kanchpur Bridge, Dhaka. The IMU telemetry logging registered an immediate impact force.",
    screen: "home",
    badge: "Crash Event",
    badgeColor: "bg-red-500",
    actions: ["Sensor magnitude logs 4.2g force threshold", "Telemetry packet recorded locally", "Activate regional backup cache"],
    stateUpdates: {
      sosActive: false,
      incidentState: "DETECTED",
      partnerIntegrations: {
        rideId: 'PT-24891',
        driverName: 'Md. Rahim',
        vehicleType: 'Motorcycle',
        tripStatus: 'Accident Detected',
        locationStart: 'Comilla University',
        locationEnd: 'Dhaka',
        emergencySharing: 'Enabled'
      }
    }
  },
  {
    phase: 3,
    time: "6:47 PM",
    title: "Deaf Mode Automatically Activates",
    desc: "RoadGuardian AI identifies Riya's accessibility preference. To bypass speech/hearing limitations, the system disables sound alerts, triggers high-frequency haptic vibrations, and displays a fullscreen flashing alarm.",
    screen: "alert",
    badge: "A11y Response",
    badgeColor: "bg-orange-500",
    actions: ["Visual flash alarm rendered", "Start 30-second countdown verification", "Send specific haptic pulse loop to phone motor"],
    stateUpdates: {
      sosActive: false,
      incidentState: "DETECTED",
      a11yMode: "deaf"
    }
  },
  {
    phase: 4,
    time: "6:48 PM",
    title: "Automatic SOS Triggered",
    desc: "No feedback or dismiss interaction is registered on Riya's screen during the 30-second verification sequence. The system flags the victim as disoriented or unconscious and triggers SOS automatically.",
    screen: "alert",
    badge: "Auto SOS Dispatch",
    badgeColor: "bg-red-600",
    actions: ["Timeout verification loop", "Compile LangGraph EmergencyState payloads", "Establish WebSocket data link"],
    stateUpdates: {
      sosActive: true,
      incidentState: "TRIAGED"
    }
  },
  {
    phase: 5,
    time: "6:48 PM",
    title: "999 National Services Dispatched",
    desc: "RoadGuardian coordinates with the national 999 operations server, passing GPS coordinates and crucial accessibility indicators.",
    screen: "sos",
    badge: "999 Integration",
    badgeColor: "bg-red-700",
    actions: ["Incident case #999-INC-28491 created", "Telemetry coordinate lock shared", "Flag 'DEAF_USER_LAWS' injected"],
    stateUpdates: {
      sosActive: true,
      incidentState: "DISPATCHED"
    }
  },
  {
    phase: 6,
    time: "6:49 PM",
    title: "Hospital Prepared (Dhaka Medical)",
    desc: "Locate Agent ranks nearby trauma services. Dhaka Medical College Hospital (2.3 km away) is selected, and the pre-arrival clinical summary is pushed to the ER coordinator.",
    screen: "sos",
    badge: "Hospital Alert",
    badgeColor: "bg-yellow-600",
    actions: ["Hospital priority selection locked", "Pre-admission patient log created", "Alert ER beds occupancy index"],
    stateUpdates: {
      sosActive: true,
      incidentState: "DISPATCHED",
      hospitals: [
        { name: 'Dhaka Medical College Hospital', dist: '2.3 km', eta: '6 min', type: 'Level 1 Trauma Care', accessible: true, blood: true }
      ]
    }
  },
  {
    phase: 7,
    time: "6:49 PM",
    title: "Ambulance AMB-204 Assigned",
    desc: "A rapid responder team is dispatched from Dhaka Medical. Real-time telemetry tracking starts on both the dashboard and Riya's device.",
    screen: "sos",
    badge: "Vehicle Dispatched",
    badgeColor: "bg-green-600",
    actions: ["Ambulance AMB-204 logs route", "ETA calculation lock: 6 minutes", "Activate driver dashboard coordinate link"],
    stateUpdates: {
      sosActive: true,
      incidentState: "DISPATCHED"
    }
  },
  {
    phase: 8,
    time: "6:49 PM",
    title: "Mother (Amina Akter) Notified",
    desc: "Because internet connectivity is unstable on highways, a compressed SMS fallback message is sent to Riya's mother (Amina Akter) containing GPS coordinates, injury status, and a tracker link.",
    screen: "contacts",
    badge: "Family SMS Alert",
    badgeColor: "bg-purple-600",
    actions: ["SMS dispatch verified by operator", "Mother contact index read successfully", "Live tracking broadcast updated"],
    stateUpdates: {
      sosActive: true,
      incidentState: "DISPATCHED"
    }
  },
  {
    phase: 9,
    time: "6:50 PM",
    title: "Bystander Emergency Card Rendered",
    desc: "A fullscreen, high-contrast bystander assistance card displays on Riya's screen. Any stranger arriving at the scene can immediately read crucial clinical information in Bangla and English.",
    screen: "bystander",
    badge: "Bystander Assistance",
    badgeColor: "bg-teal-600",
    actions: ["Disable lock screen security wrapper", "Render fullscreen high-contrast card", "Display localized translation: 'She is Deaf'"],
    stateUpdates: {
      sosActive: true,
      incidentState: "GUIDED"
    }
  },
  {
    phase: 10,
    time: "7:08 PM",
    title: "Hospital Arrival & Safe Recovery",
    desc: "Riya arrives safely at Dhaka Medical College Hospital. The ER staff is prepared with her blood type (O+) and accessibility requirements. The incident resolves successfully.",
    screen: "profile",
    badge: "Mission Completed",
    badgeColor: "bg-green-700",
    actions: ["ER patient admission logged", "Close incident #RG-2026-0147", "Notify family contact of safe arrival"],
    stateUpdates: {
      sosActive: true,
      incidentState: "RESOLVED"
    }
  }
]

export default function DemoFlow() {
  const { setMobileScreen, resetIncident } = useStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const stepInfo = DEMO_STEPS[currentStep]

  // Synchronize state updates in Zustand when stepping
  useEffect(() => {
    // Reset/Trigger store state to simulate real steps
    const store = useStore.getState()
    
    // Merge state updates
    store.setMobileScreen(stepInfo.screen)
    store.setA11yMode(stepInfo.stateUpdates.a11yMode || "deaf")
    store.setIncidentState(stepInfo.stateUpdates.incidentState)
    
    if (stepInfo.stateUpdates.sosActive) {
      store.sosActive = true
      store.sosTimestamp = Date.now()
    } else {
      store.sosActive = false
    }

    if (stepInfo.stateUpdates.partnerIntegrations) {
      store.partnerIntegrations = stepInfo.stateUpdates.partnerIntegrations
    }

    if (stepInfo.stateUpdates.hospitals) {
      store.hospitals = stepInfo.stateUpdates.hospitals
    }
  }, [currentStep])

  // Handle auto-playing steps
  useEffect(() => {
    let timer
    if (isPlaying) {
      timer = setInterval(() => {
        if (currentStep < DEMO_STEPS.length - 1) {
          setCurrentStep(c => c + 1)
        } else {
          setIsPlaying(false)
        }
      }, 7000) // 7 seconds per slide
    }
    return () => clearInterval(timer)
  }, [isPlaying, currentStep])

  const handleRestart = () => {
    resetIncident()
    setCurrentStep(0)
    setIsPlaying(false)
  }

  return (
    <div style={{
      background: '#0B132B',
      minHeight: 'calc(100vh - 64px)',
      display: 'grid',
      gridTemplateColumns: 'minmax(400px, 1fr) auto',
      alignItems: 'stretch'
    }}>
      
      {/* LEFT: Presentation walkthrough controls */}
      <div style={{
        padding: '36px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 64px)'
      }}>
        
        {/* Header */}
        <div>
          <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: '100px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--red-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            DEMO PRESENTATION SYSTEM
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Riya's Emergency Rescue
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px', lineHeight: 1.5 }}>
            This walkthrough simulates Riya Akter's real-world emergency collision near Kanchpur Bridge. Watch the automated coordination unfold step-by-step.
          </p>
        </div>

        {/* Action controllers */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: '10px 20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: isPlaying ? 'var(--amber-500)' : 'var(--blue-500)',
              color: isPlaying ? '#000' : '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {isPlaying ? "⏸ Pause Auto" : "▶ Play Auto (7s)"}
          </button>
          
          <button 
            onClick={handleRestart}
            style={{
              padding: '10px 16px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Restart
          </button>

          <div style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            Phase {stepInfo.phase} of 10
          </div>
        </div>

        {/* Current phase highlight card */}
        <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--blue-400)', letterSpacing: '0.02em' }}>🕒 TIMELINE: {stepInfo.time}</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', color: '#fff', display: 'inline-block' }} className={stepInfo.badgeColor}>
              {stepInfo.badge}
            </span>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{stepInfo.title}</h2>
          
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {stepInfo.desc}
          </p>

          <div className="divider" style={{ margin: '8px 0' }} />

          {/* Core system activities logs */}
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              System Actions Triggered
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stepInfo.actions.map((act, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'start', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--blue-400)' }}>➔</span>
                  <span style={{ lineHeight: 1.4 }}>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Stepper buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '10px' }}>
          <button 
            onClick={() => setCurrentStep(c => Math.max(0, c - 1))}
            disabled={currentStep === 0}
            style={{
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.03)',
              color: currentStep === 0 ? 'var(--text-muted)' : '#fff',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            ← Previous Phase
          </button>
          
          <button 
            onClick={() => setCurrentStep(c => Math.min(DEMO_STEPS.length - 1, c + 1))}
            disabled={currentStep === DEMO_STEPS.length - 1}
            style={{
              padding: '12px 24px',
              background: 'var(--blue-500)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: currentStep === DEMO_STEPS.length - 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Next Phase →
          </button>
        </div>
      </div>

      {/* RIGHT: Live mobile frame container */}
      <div style={{ background: '#090F1E', display: 'flex', justify: 'center', alignItems: 'center' }}>
        <MobileAppContainer />
      </div>

    </div>
  )
}
