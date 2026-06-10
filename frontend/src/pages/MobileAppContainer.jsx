import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useNavigate } from 'react-router-dom'
import MobileFrame from '../components/MobileFrame'

export default function MobileAppContainer() {
  const navigate = useNavigate()
  const {
    currentMobileScreen,
    setMobileScreen,
    userProfile,
    partnerIntegrations,
    a11yMode,
    setA11yMode,
    sosActive,
    triggerSOS,
    resetIncident,
    incidentState,
    setIncidentState,
    guidanceStream,
    hospitals
  } = useStore()

  // Local state for layout zoom (guidance screen accessibility)
  const [textZoom, setTextZoom] = useState(100)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const [showClaimModal, setShowClaimModal] = useState(false)

  // Trigger simulated SOS trigger sequence from Mobile PWA Screen
  const handleTriggerSOS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          console.log("[PWA SOS] Acquired real coordinates:", coords)
          triggerSOS(coords)
          setMobileScreen('alert')
        },
        (err) => {
          console.warn("[PWA SOS] Geolocation failed or denied. Falling back to Kanchpur Bridge:", err.message)
          triggerSOS({ lat: 23.6922, lng: 90.5186 })
          setMobileScreen('alert')
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    } else {
      triggerSOS({ lat: 23.6922, lng: 90.5186 })
      setMobileScreen('alert')
    }
  }

  // Play text-to-speech mock voice guidance
  const toggleVoiceGuidance = () => {
    setIsPlayingVoice(!isPlayingVoice)
    if ('speechSynthesis' in window) {
      if (!isPlayingVoice) {
        const text = "First Aid guidance active. Keep neck still. Apply direct pressure to bleeding."
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.onend = () => setIsPlayingVoice(false)
        window.speechSynthesis.speak(utterance)
      } else {
        window.speechSynthesis.cancel()
      }
    } else {
      alert(isPlayingVoice ? "Voice guidance stopped." : "Playing mock voice guidance read-out.")
    }
  }

  return (
    <MobileFrame>
      
      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SCREEN 1: HOME SCREEN */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentMobileScreen === 'home' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Welcome Back,</span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{userProfile.name}</h2>
            </div>
            <button 
              onClick={() => setMobileScreen('profile')} 
              style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', fontSize: '1.1rem', cursor: 'pointer' }}
            >
              👤
            </button>
          </div>

          {/* Status Panel */}
          <div className="glass-card-sm" style={{ padding: '14px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green-400)' }}>🟢 CRASHSENSE ACTIVE</span>
              <span className="badge badge-blue" style={{ fontSize: '0.6rem' }}>Deaf Mode</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Active Ride: <strong style={{ color: '#fff' }}>{partnerIntegrations.provider === 'Grab' ? 'GrabCar Premium' : 'Pathao Bike'} #{partnerIntegrations.rideId}</strong> (Driver: {partnerIntegrations.driverName})
            </div>
          </div>

          {/* Crash Prediction & Safe Route AI */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            background: 'rgba(10,132,255,0.06)',
            border: '1px solid rgba(10,132,255,0.2)',
            borderRadius: '8px',
            fontSize: '0.68rem',
            color: 'var(--blue-400)'
          }}>
            <span style={{ fontSize: '1rem' }}>🛡️</span>
            <div style={{ lineHeight: 1.3, textAlign: 'left' }}>
              <strong>Safe Route Active:</strong> Detour selected around Kanchpur to avoid 2 hazard hotspots & crash cluster area.
            </div>
          </div>

          {/* Core SOS Button Target */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
            <button
              onClick={handleTriggerSOS}
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #FF5A52 0%, #FF3B30 100%)',
                border: '8px solid rgba(255, 59, 48, 0.2)',
                color: '#fff',
                fontSize: '1.8rem',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(255, 59, 48, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                animation: 'pulse-glow 1.5s infinite'
              }}
            >
              <span>🚨</span>
              <span style={{ fontSize: '1.2rem', trackingLetter: '0.05em' }}>SOS</span>
            </button>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '14px', textAlign: 'center' }}>
              Tap once to trigger emergency console demo
            </span>
          </div>

          {/* Quick Shortcuts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <button 
              onClick={() => setMobileScreen('contacts')}
              className="glass-card-sm"
              style={{ padding: '12px', textAlign: 'left', color: '#fff', border: '1px solid var(--border)', cursor: 'pointer' }}
            >
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>📞</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Contacts</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Amina Akter</div>
            </button>
            <button 
              onClick={() => setMobileScreen('hospitals')}
              className="glass-card-sm"
              style={{ padding: '12px', textAlign: 'left', color: '#fff', border: '1px solid var(--border)', cursor: 'pointer' }}
            >
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🏥</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Hospitals</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Dhaka Medical</div>
            </button>
          </div>

          {/* Settings Shortcut Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
            <button onClick={() => setMobileScreen('a11y')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ♿ Accessibility
            </button>
            <button onClick={() => setMobileScreen('language')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🌐 বাংলা (Preferred)
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SCREEN 2: CRASH ALERT COUNTDOWN SCREEN */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentMobileScreen === 'alert' && (
        <div style={{ background: 'var(--red-500)', color: '#fff', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'space-between', textAlign: 'center' }}>
          <div>
            <div className="badge animate-pulse-glow" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid #fff', fontSize: '0.7rem', color: '#fff', marginBottom: '14px' }}>
              🚨 CRASHSENSE IMPACT DETECTED
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '6px' }}>Are you okay?</h1>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)' }}>
              A 4.2g impact force was logged near Kanchpur Bridge.
            </p>
          </div>

          {/* Vibrations Status */}
          <div className="animate-vibrate" style={{ margin: '10px 0' }}>
            <div style={{ width: '130px', height: '130px', border: '6px solid #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>28</span>
              <span style={{ fontSize: '0.62rem', letterSpacing: '0.05em' }}>SECONDS</span>
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginTop: '12px', fontStyle: 'italic' }}>
              📳 Deaf vibration pattern pulsing...
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Direct Trigger */}
            <button
              onClick={() => {
                setIncidentState('TRIAGED')
                setMobileScreen('sos')
              }}
              style={{
                height: '72px',
                background: '#7F1D1D',
                border: 'none',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 900,
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                letterSpacing: '0.05em'
              }}
            >
              SEND SOS NOW
            </button>

            {/* Cancel/Dismiss */}
            <button
              onClick={() => {
                resetIncident()
                setMobileScreen('home')
              }}
              style={{
                height: '72px',
                background: '#fff',
                border: 'none',
                color: 'var(--red-500)',
                fontSize: '1rem',
                fontWeight: 900,
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              I'M OKAY
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SCREEN 3: SOS ACTIVE SCREEN */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentMobileScreen === 'sos' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.62rem', color: 'var(--red-400)', fontWeight: 700 }}>🚨 INCIDENT #RG-2026-0147</span>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Kanchpur Bridge, Dhaka</h2>
            </div>
            <button 
              onClick={() => {
                resetIncident()
                setMobileScreen('home')
              }} 
              style={{ background: 'none', border: 'none', color: 'var(--red-400)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
            >
              CANCEL
            </button>
          </div>

          {/* Large ETA Badge */}
          <div className="glass-card-sm" style={{ padding: '16px', textAlign: 'center', background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.25)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ambulance Assigned</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--red-400)', margin: '4px 0' }}>ETA: 6 Minutes</h1>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Dispatched from Dhaka Medical College Hospital</p>
          </div>

          {/* Status Dispatch checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Rescue Progress</label>
            
            {[
              { label: '999 Dispatch: Confirmed (Case #999-INC-28491)', active: true },
              { label: 'Ambulance Assigned (Vehicle: AMB-204)', active: true },
              { label: 'Hospital Prepared (Dhaka Medical alerted)', active: true },
              { label: 'Family SMS Alert Delivered (Amina Akter)', active: true },
              { label: `${partnerIntegrations.provider || 'Pathao'} Ride Trip #${partnerIntegrations.rideId} Synced`, active: true }
            ].map((item, index) => (
              <div 
                key={index}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  padding: '10px 12px', 
                  background: 'rgba(255,255,255,0.02)', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border)',
                  fontSize: '0.75rem'
                }}
              >
                <span style={{ color: 'var(--green-500)' }}>✓</span>
                <span style={{ color: 'var(--text-primary)' }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            <button
              onClick={() => setMobileScreen('bystander')}
              style={{
                height: '50px',
                background: 'var(--blue-500)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              🦻 SHOW BYSTANDER CARD
            </button>
            <button
              onClick={() => setMobileScreen('guidance')}
              style={{
                height: '50px',
                background: 'rgba(255,255,255,0.04)',
                color: '#fff',
                border: '1px solid var(--border)',
                fontWeight: 700,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              📋 FIRST AID GUIDANCE
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SCREEN 4: BYSTANDER EMERGENCY CARD */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentMobileScreen === 'bystander' && (
        <div style={{ background: '#fff', color: '#000', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyFrame: 'space-between' }}>
          {/* Warning Banner */}
          <div style={{ background: 'var(--red-500)', padding: '12px', borderRadius: '8px', textAlign: 'center', color: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 900 }}>EMERGENCY — THIS PERSON NEEDS HELP</h3>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, marginTop: '4px' }}>জরুরি অবস্থা — এই ব্যক্তির সাহায্য দরকার</h4>
          </div>

          {/* Profile Quick Read */}
          <div style={{ border: '2px solid #000', padding: '14px', borderRadius: '8px', background: '#f9fafb' }}>
            <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Victim Information</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '2px 0' }}>{userProfile.name}</h2>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '0.78rem' }}>
              <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Blood: {userProfile.bloodGroup}</span>
              <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>DEAF USER</span>
            </div>
          </div>

          {/* Visual Assist Message */}
          <div style={{ padding: '14px', border: '2px solid #ef4444', borderRadius: '8px', background: '#fef2f2', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#991b1b', lineHeight: 1.4 }}>
              "This person is deaf and may not hear you."
            </p>
            <p style={{ fontSize: '0.95rem', fontWeight: 900, color: '#991b1b', marginTop: '8px' }}>
              সে কানে শোনে না এবং কথা বলতে পারে না।
            </p>
          </div>

          {/* Status summary */}
          <div style={{ fontSize: '0.78rem', lineHeight: 1.5, color: '#374151' }}>
            🚑 **Ambulance ETA: 6 mins** enroute to **Dhaka Medical College Hospital**. Emergency departments have been notified of patient pre-arrival.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            {/* Call Action */}
            <button
              onClick={() => alert('Initiating mock emergency dispatch call to 999...')}
              style={{
                height: '72px',
                background: 'var(--red-500)',
                color: '#fff',
                border: 'none',
                fontWeight: 900,
                fontSize: '1.1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                letterSpacing: '0.04em'
              }}
            >
              TAP TO CALL 999
            </button>
            <button
              onClick={() => setMobileScreen('sos')}
              style={{
                height: '48px',
                background: 'none',
                color: '#000',
                border: '1px solid #d1d5db',
                fontWeight: 700,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Back to Tracker
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SCREEN 5: OFFLINE FIRST AID GUIDANCE */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentMobileScreen === 'guidance' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>First Aid Guidance</h2>
            <button 
              onClick={() => setMobileScreen('sos')} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              CLOSE
            </button>
          </div>

          {/* Orange Offline Banner */}
          <div style={{ background: '#EA580C', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, textAlign: 'center' }}>
            OFFLINE MODE — Phi-3 Local LLM active
          </div>

          {/* Zoom & Audio Controls */}
          <div style={{ display: 'flex', justifyFrame: 'space-between', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                onClick={() => setTextZoom(Math.max(80, textZoom - 10))} 
                style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                A-
              </button>
              <button 
                onClick={() => setTextZoom(Math.min(150, textZoom + 10))} 
                style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                A+
              </button>
            </div>
            <button
              onClick={toggleVoiceGuidance}
              style={{
                flex: 1,
                height: '32px',
                background: isPlayingVoice ? 'var(--red-500)' : 'var(--blue-500)',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isPlayingVoice ? "⏹ Stop Guidance" : "🔊 Read Out Guidance"}
            </button>
          </div>

          {/* Core guidance text panel */}
          <div 
            className="scroll-y" 
            style={{ 
              flex: 1, 
              background: 'var(--bg-elevated)', 
              padding: '14px', 
              borderRadius: '8px', 
              border: '1px solid var(--border)',
              fontSize: `${textZoom}%`,
              lineHeight: 1.6
            }}
          >
            <p style={{ fontWeight: 700, color: 'var(--red-400)', marginBottom: '8px', fontSize: '0.85rem' }}>
              Instructions for: Possible Left Arm Fracture + Laceration
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
              <p><strong>1. DO NOT MOVE THE PERSON</strong> if spinal injury is suspected. Keep head still.</p>
              <p><strong>2. CONTROL BLEEDING:</strong> Apply firm, direct pressure to the wound with a clean cloth.</p>
              <p><strong>3. IMMOBILIZE FRACTURE:</strong> Support the injured arm in the position found. Do not try to realign the bone.</p>
              <p><strong>4. STAY WITH PATIENT:</strong> Keep warm and await ambulance AMB-204.</p>
            </div>
          </div>

          {/* Citations Badges */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-muted" style={{ fontSize: '0.62rem' }}>WHO Guidelines · Ch 4</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--green-400)', fontWeight: 600 }}>94% Match</span>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SCREEN 6: NEARBY HOSPITALS */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentMobileScreen === 'hospitals' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Nearby Trauma Centers</h2>
            <button 
              onClick={() => setMobileScreen('home')} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              BACK
            </button>
          </div>

          <div className="glass-card-sm" style={{ padding: '10px', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            Hospital locator is active. Filtering by: **Level 1 Trauma Care** + **Accessibility Facilities**.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }} className="scroll-y">
            {hospitals.map((h, i) => (
              <div 
                key={i}
                style={{ 
                  padding: '12px', 
                  background: i === 0 ? 'rgba(10,132,255,0.08)' : 'var(--bg-elevated)', 
                  border: `1px solid ${i === 0 ? 'var(--blue-500)' : 'var(--border)'}`, 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: i === 0 ? 'var(--blue-400)' : '#fff' }}>{h.name}</h4>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{h.type}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{h.eta}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{h.dist}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SCREEN 7: EMERGENCY CONTACTS */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentMobileScreen === 'contacts' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Emergency Contacts</h2>
            <button 
              onClick={() => setMobileScreen('home')} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              BACK
            </button>
          </div>

          {/* Call Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,59,48,0.05)', border: '1px solid rgba(255,59,48,0.25)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Amina Akter ({userProfile.emergencyContactRole})</h4>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{userProfile.emergencyContactPhone}</p>
              </div>
              <span className="badge badge-red" style={{ fontSize: '0.6rem' }}>Primary</span>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Md. Rahim (Pathao Rider)</h4>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>+880-191-XXX-XXXX</p>
            </div>
          </div>

          {/* SMS Fallback Log Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'auto' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>SMS Fallback Protocol (Delivered)</label>
            <div style={{ background: '#1A293E', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.68rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              "ALERT: Riya Akter is in a road collision near Kanchpur Bridge. Coords: 23.6922N, 90.5186E. Deaf mode triggered. Ambulance enroute. Details: https://rg-ai.bd/inc/RG-2026-0147"
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SCREEN 8: ACCESSIBILITY CONFIGURATION SCREEN */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentMobileScreen === 'a11y' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Accessibility Center</h2>
            <button 
              onClick={() => setMobileScreen('home')} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              SAVE
            </button>
          </div>

          {/* Accessibility Option Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {[
              { id: 'standard', label: 'Standard UI Profile', icon: '👁️' },
              { id: 'deaf', label: 'Deaf & Hard of Hearing (Active)', icon: '🦻' },
              { id: 'voice', label: 'Voice Commands (Hands-Free)', icon: '🗣️' },
              { id: 'dyslexia', label: 'Dyslexia Readability Mode', icon: '📖' },
              { id: 'high-contrast', label: 'High Contrast Mode', icon: '⬛' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setA11yMode(mode.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: a11yMode === mode.id ? 'rgba(10,132,255,0.08)' : 'var(--bg-elevated)',
                  border: `2px solid ${a11yMode === mode.id ? 'var(--blue-500)' : 'var(--border)'}`,
                  color: '#fff',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{mode.icon}</span>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SCREEN 9: LANGUAGE SELECTOR SCREEN */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentMobileScreen === 'language' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Select Language</h2>
            <button 
              onClick={() => setMobileScreen('home')} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              SAVE
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', flex: 1 }}>
            {[
              { id: 'bn', label: '🇧🇩 বাংলা (Preferred)', active: true },
              { id: 'en', label: '🇺🇸 English', active: false },
              { id: 'hi', label: '🇮🇳 हिन्दी', active: false },
              { id: 'th', label: '🇹🇭 ไทย', active: false },
              { id: 'mm', label: '🇲🇲 မြန်မာဘာသာ', active: false },
              { id: 'np', label: '🇳🇵 नेपाली', active: false },
              { id: 'si', label: '🇱🇰 සිංহල', active: false }
            ].map(lang => (
              <button
                key={lang.id}
                onClick={() => alert(`Language switched to ${lang.label}`)}
                style={{
                  padding: '16px 10px',
                  background: lang.active ? 'rgba(10,132,255,0.08)' : 'var(--bg-elevated)',
                  border: `1px solid ${lang.active ? 'var(--blue-500)' : 'var(--border)'}`,
                  color: '#fff',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease'
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SCREEN 10: MEDICAL PROFILE SCREEN */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentMobileScreen === 'profile' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }} className="scroll-y">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Medical ID</h2>
            <button 
              onClick={() => setMobileScreen('home')} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              BACK
            </button>
          </div>

          <div style={{ textAlign: 'center', margin: '6px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '2px solid var(--border)', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              👩‍🎓
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginTop: '8px' }}>{userProfile.name}</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Age: {userProfile.age} · {userProfile.occupation}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.75rem' }}>
            <div style={{ padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.62rem', textTransform: 'uppercase' }}>Accessibility Need</span>
              <strong style={{ color: 'var(--blue-400)' }}>{userProfile.accessibilityNeed}</strong>
            </div>

            <div style={{ padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.62rem', textTransform: 'uppercase', marginBottom: '6px' }}>Ride-Sharing Partner Integration</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Pathao', 'Grab'].map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      useStore.getState().setPartnerProvider(p)
                    }}
                    style={{
                      flex: 1,
                      padding: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: partnerIntegrations.provider === p ? 'var(--blue-500)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${partnerIntegrations.provider === p ? 'var(--blue-400)' : 'var(--border)'}`,
                      color: '#fff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {p === 'Grab' ? 'Grab' : 'Pathao'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.62rem', textTransform: 'uppercase' }}>Blood Group</span>
              <strong style={{ color: 'var(--red-400)' }}>{userProfile.bloodGroup}</strong>
            </div>

            <div style={{ padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.62rem', textTransform: 'uppercase' }}>Preferred Trauma Center</span>
              <strong>{userProfile.preferredHospital}</strong>
            </div>

            <div style={{ padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.62rem', textTransform: 'uppercase' }}>Emergency Contact</span>
              <strong>{userProfile.emergencyContactName} ({userProfile.emergencyContactRole})</strong>
              <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{userProfile.emergencyContactPhone}</div>
            </div>

            {/* Lock Screen QR ID */}
            <div style={{
              padding: '12px',
              background: '#fff',
              color: '#000',
              borderRadius: '8px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid var(--border)'
            }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', display: 'block' }}>Lock Screen Emergency QR ID</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 8px)', gridTemplateRows: 'repeat(10, 8px)', gap: '1px', background: '#fff', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}>
                {Array.from({ length: 100 }).map((_, idx) => {
                  const isBlack = (idx * 7 + 13) % 3 === 0 || (idx < 20 && idx % 3 === 0) || (idx > 80 && idx % 2 === 0) || (idx % 10 < 3 && idx / 10 < 3) || (idx % 10 > 7 && idx / 10 < 3) || (idx % 10 < 3 && idx / 10 > 7);
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        background: isBlack ? '#000' : '#fff' 
                      }} 
                    />
                  )
                })}
              </div>
              <span style={{ fontSize: '0.58rem', color: '#555', fontWeight: 600, lineHeight: 1.3 }}>
                🚑 Paramedics: Scan QR on lock screen to load Riya's emergency data offline
              </span>
            </div>

            {/* B2B Insurance Claim Generator */}
            <div style={{ padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.62rem', textTransform: 'uppercase', marginBottom: '8px' }}>B2B Insurance Integration</span>
              <button
                onClick={() => setShowClaimModal(true)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'linear-gradient(135deg, var(--green-600) 0%, var(--green-700) 100%)',
                  border: '1px solid var(--green-500)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(48,209,88,0.2)',
                  transition: 'all 0.2s'
                }}
              >
                📄 Generate verified claim package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insurance Claim Modal Overlay */}
      {showClaimModal && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="glass-card animate-float-up" style={{
            width: '100%',
            padding: '20px',
            border: '2px solid var(--green-500)',
            background: 'var(--bg-card)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            fontSize: '0.75rem',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--green-400)' }}>📄 Verification Certificate</h3>
              <button 
                onClick={() => setShowClaimModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            <div style={{ borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>INCIDENT ID</div>
              <strong style={{ fontSize: '0.85rem' }}>#RG-2026-0147</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.58rem', color: 'var(--text-muted)' }}>PATIENT NAME</span>
                <strong>{userProfile.name}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.58rem', color: 'var(--text-muted)' }}>BLOOD GROUP</span>
                <strong>{userProfile.bloodGroup}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.58rem', color: 'var(--text-muted)' }}>COORDINATES</span>
                <strong style={{ fontFamily: 'monospace' }}>23.6922N, 90.5186E</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.58rem', color: 'var(--text-muted)' }}>IMPACT FORCE</span>
                <strong style={{ color: 'var(--red-400)' }}>4.2g Registered</strong>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <span style={{ display: 'block', fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: '4px' }}>DISPATCH LOGS</span>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                • 999 Incident Case: #999-INC-28491<br/>
                • Ambulance unit: AMB-204 dispatched<br/>
                • Admission Hospital: {userProfile.preferredHospital}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(48,209,88,0.06)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: '6px' }}>
              <span style={{ fontSize: '1.2rem' }}>🛡️</span>
              <div style={{ fontSize: '0.62rem', color: 'var(--green-400)', lineHeight: 1.3 }}>
                <strong>Verified by RoadGuardian AI:</strong> Safe Route telemetry and CrashSense logs compiled. Hash validated ✓
              </div>
            </div>

            <button
              onClick={() => {
                alert("Claim package generated! Mock JSON report successfully downloaded to device.")
                setShowClaimModal(false)
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--green-500)',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              📥 Download Verified Claims PDF
            </button>
          </div>
        </div>
      )}

    </MobileFrame>
  )
}
