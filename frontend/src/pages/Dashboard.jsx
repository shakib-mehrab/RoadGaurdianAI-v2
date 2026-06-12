import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import AgentTimeline from '../components/AgentTimeline'
import LiveMap from '../components/LiveMap'
import GuidanceStream from '../components/GuidanceStream'
import TriagePanel from '../components/TriagePanel'
import HospitalPanel from '../components/HospitalPanel'
import MCPToolsPanel from '../components/MCPToolsPanel'
import { Activity, AlertTriangle, Play, RefreshCw, BarChart2, Briefcase, MapPin, ShieldAlert, Bike, Car, Navigation, Siren, Copy, Check, MessageSquare, Sliders } from 'lucide-react'

function RescueNetworkFeeds() {
  const { rescueFeeds, userProfile, location } = useStore()
  const [feedTab, setFeedTab] = useState('family') // 'family' | 'community'
  const [showManualWhatsApp, setShowManualWhatsApp] = useState(false)

  const familyStatus = rescueFeeds?.familyStatus || []
  const responders = rescueFeeds?.responders || []

  const fMembers = userProfile.familyMembers || [
    { name: userProfile.emergencyContactName || 'Amina Akter', role: userProfile.emergencyContactRole || 'Mother', phone: userProfile.emergencyContactPhone || '+880-171-XXX-XXXX' }
  ]

  const handleSendWhatsAppContactAlert = (member) => {
    const phone = member.phone ? member.phone.replace(/[^\d+]/g, '') : ''
    if (!phone || phone.includes('X') || phone.length < 8) {
      alert('⚠️ Invalid Emergency Contact Number! Please configure a valid phone number in Settings.')
      return
    }
    const lat = location?.lat?.toFixed(4) ?? '23.6922'
    const lng = location?.lng?.toFixed(4) ?? '90.5186'
    const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`
    
    const message = `🚨 *ROADGUARD EMERGENCY ALERT* 🚨\n\n*Victim:* ${userProfile?.name || 'Riya Akter'}\n*Age / Blood:* ${userProfile?.age || 24} yrs / ${userProfile?.bloodGroup || 'O+'}\n*Accident Location:* ${lat}, ${lng}\n*Google Maps:* ${mapsLink}\n\n*Status:* Critical, dispatched ambulance AMB-204 from Dhaka Medical College Hospital.\n\n*Mission Control Dashboard:* ${window.location.origin}/dashboard`
    
    const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <div className="glass-card animate-float-up" style={{ padding: 20, border: '1px solid var(--border)' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        <ShieldAlert size={18} style={{ color: 'var(--blue-400)' }} />
        <span style={{ fontSize: '0.92rem', fontWeight: 800 }}>Rescue Network Live Feeds</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setFeedTab('family')}
          style={{
            flex: 1, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700,
            background: feedTab === 'family' ? 'rgba(10, 132, 255, 0.1)' : 'transparent',
            border: `1px solid ${feedTab === 'family' ? 'var(--blue-400)' : 'var(--border)'}`,
            color: feedTab === 'family' ? 'var(--blue-400)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer'
          }}
        >
          Family Command ({familyStatus.length})
        </button>
        <button
          onClick={() => setFeedTab('community')}
          style={{
            flex: 1, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700,
            background: feedTab === 'community' ? 'rgba(48, 209, 88, 0.1)' : 'transparent',
            border: `1px solid ${feedTab === 'community' ? 'var(--green-400)' : 'var(--border)'}`,
            color: feedTab === 'community' ? 'var(--green-400)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer'
          }}
        >
          Responders ({responders.length})
        </button>
      </div>

      {/* Content */}
      {feedTab === 'family' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Toggle manual WhatsApp button list */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Automated MCP Alerts Active</span>
            <button
              onClick={() => setShowManualWhatsApp(!showManualWhatsApp)}
              style={{
                background: 'transparent',
                border: 'none',
                color: showManualWhatsApp ? 'var(--blue-400)' : 'var(--text-secondary)',
                fontSize: '0.68rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Sliders size={12} />
              <span>Manual WhatsApp Triggers</span>
            </button>
          </div>

          {/* Optional manual WhatsApp button list */}
          {showManualWhatsApp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10, padding: 10, background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Manual Alert Contacts:</span>
              {fMembers.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', borderBottom: idx < fMembers.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', paddingBottom: idx < fMembers.length - 1 ? 4 : 0 }}>
                  <span>{m.name} <strong style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({m.role})</strong></span>
                  <button
                    onClick={() => handleSendWhatsAppContactAlert(m)}
                    style={{
                      background: 'rgba(37, 211, 102, 0.15)',
                      border: '1px solid rgba(37, 211, 102, 0.4)',
                      color: '#25D366',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.68rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <MessageSquare size={11} />
                    <span>Send</span>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }} className="scroll-y">
            {familyStatus.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: 8 }}>
                Scanning emergency contacts network...
              </div>
            ) : (
              familyStatus.map((status, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: 4, border: '1px solid var(--border)', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{status.text}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>{status.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }} className="scroll-y">
          {responders.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: 8 }}>
              Alerting nearby medical volunteers within 1km...
            </div>
          ) : (
            responders.map((resp, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(48,209,88,0.02)', padding: '8px 10px', borderRadius: 4, border: '1px solid rgba(48,209,88,0.15)', fontSize: '0.75rem' }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>{resp.name}</strong>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{resp.role} • {resp.dist} away</span>
                </div>
                <span className="badge badge-green" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>{resp.status}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function B2BSafetyHub() {
  const {
    telemetrySpeed,
    telemetryGForce,
    telemetryDriverScore,
    telemetryAlert,
    telemetryLogs,
    isSimulatingTelemetry,
    startTelemetrySimulation,
    stopTelemetrySimulation,
    partnerRiders,
    partnerIntegrations,
    setPartnerProvider
  } = useStore()

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    startTelemetrySimulation()
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => {
      stopTelemetrySimulation()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="glass-card animate-float-up" style={{ padding: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Briefcase size={18} style={{ color: 'var(--blue-400)' }} />
          <h2 style={{ fontSize: '0.92rem', fontWeight: 800 }}>B2B Ride-Sharing Safety Hub</h2>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {[
            { name: 'Pathao', logo: '/pathao.svg', activeColor: 'rgba(232, 25, 44, 0.15)', activeBorder: '#E8192C', activeText: '#E8192C' },
            { name: 'oBhai',  logo: '/obhai.png',  activeColor: 'rgba(0, 166, 81, 0.15)',   activeBorder: '#00A651', activeText: '#00A651' },
            { name: 'Uber',   logo: '/ubder.png',  activeColor: 'rgba(156,163,175,0.12)',   activeBorder: '#c0c9d6', activeText: '#c0c9d6' },
          ].map((p) => {
            const isActive = partnerIntegrations.provider === p.name
            return (
              <button
                key={p.name}
                onClick={() => setPartnerProvider(p.name)}
                title={p.name}
                style={{
                  padding: '3px 6px', fontSize: '0.62rem', fontWeight: 700, borderRadius: 4, cursor: 'pointer',
                  background: isActive ? p.activeColor : 'transparent',
                  border: `1px solid ${isActive ? p.activeBorder : 'var(--border)'}`,
                  color: isActive ? p.activeText : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'all 0.2s ease',
                }}
              >
                <img
                  src={p.logo}
                  alt={p.name}
                  style={{ width: 14, height: 14, objectFit: 'contain', borderRadius: 2 }}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
                {p.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Ride details info */}
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', fontSize: '0.72rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Driver:</span> <strong style={{ color: '#fff' }}>{partnerIntegrations.driverName}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Trip ID:</span> <strong style={{ color: '#fff' }}>{partnerIntegrations.rideId}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Telemetry:</span> <span style={{ color: isSimulatingTelemetry ? 'var(--green-400)' : 'var(--text-muted)', fontWeight: 'bold' }}>● {isSimulatingTelemetry ? 'Active' : 'Offline'}</span>
        </div>
      </div>

      {/* Grid of driver telemetry */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {/* Speedometer */}
        <div style={{
          background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 6, border: '1px solid var(--border)', textAlign: 'center',
          boxShadow: telemetrySpeed > 60 ? 'inset 0 0 15px rgba(239, 68, 68, 0.15)' : 'none'
        }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Speed</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: telemetrySpeed > 60 ? 'var(--red-400)' : '#fff', margin: '2px 0' }}>
            {telemetrySpeed} <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>km/h</span>
          </div>
          {telemetrySpeed > 60 ? (
            <span style={{ fontSize: '0.55rem', color: 'var(--red-400)', fontWeight: 700 }}>🚨 OVER SPEED</span>
          ) : (
            <span style={{ fontSize: '0.55rem', color: 'var(--green-400)', fontWeight: 700 }}>NORMAL</span>
          )}
        </div>

        {/* G-Force Sensor */}
        <div style={{
          background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 6, border: '1px solid var(--border)', textAlign: 'center',
          boxShadow: telemetryGForce > 1.3 ? 'inset 0 0 15px rgba(255, 159, 10, 0.15)' : 'none'
        }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>G-Sensor</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: telemetryGForce > 1.3 ? 'var(--amber-400)' : '#fff', margin: '2px 0' }}>
            {telemetryGForce.toFixed(2)} <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>G</span>
          </div>
          {telemetryGForce > 1.3 ? (
            <span style={{ fontSize: '0.55rem', color: 'var(--amber-400)', fontWeight: 700 }}>G-ALERT</span>
          ) : (
            <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>STABLE</span>
          )}
        </div>

        {/* Driver Safety Score */}
        <div style={{
          background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 6, border: '1px solid var(--border)', textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Driver Score</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: telemetryDriverScore > 80 ? 'var(--green-400)' : 'var(--amber-400)', margin: '2px 0' }}>
            {telemetryDriverScore}<span style={{ fontSize: '0.65rem', fontWeight: 500 }}>/100</span>
          </div>
          <span style={{ fontSize: '0.55rem', color: telemetryDriverScore > 80 ? 'var(--green-400)' : 'var(--amber-400)', fontWeight: 700 }}>
            {telemetryDriverScore > 90 ? 'EXCELLENT' : 'WARNING'}
          </span>
        </div>
      </div>

      {telemetryAlert && (
        <div style={{ fontSize: '0.68rem', color: 'var(--red-400)', background: 'rgba(239, 68, 68, 0.08)', padding: '6px 10px', borderRadius: 4, border: '1px solid rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertTriangle size={12} />
          <span>{telemetryAlert}</span>
        </div>
      )}

      {/* Row for logs and nearest riders */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr', gap: 12 }}>
        {/* Telemetry log list */}
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>G-Sensor Feed</div>
          <div style={{ height: 110, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6, display: 'flex', flexDirection: 'column' }} className="scroll-y">
            {telemetryLogs.slice(0, 5).map((log, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', borderBottom: '1px solid rgba(255,255,255,0.03)', padding: '4px 6px', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                <span style={{ color: 'var(--text-muted)' }}>{log.time.split(' ')[0]}</span>
                <span>{log.speed} km/h</span>
                <span style={{ color: log.status === 'Speeding' ? 'var(--red-400)' : log.status === 'G-Alert' ? 'var(--amber-400)' : 'var(--text-secondary)' }}>{log.gForce}G</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nearest riders list */}
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>Nearest Riders (&lt;500m)</div>
          <div style={{ height: 110, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 4, padding: 4 }} className="scroll-y">
            {partnerRiders.map((rider, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '4px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700 }}>{rider.name.split(' (')[0]}</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{rider.type} • {rider.dist}</div>
                </div>
                <span className="badge badge-green" style={{ fontSize: '0.55rem', padding: '1px 3px' }}>{rider.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toggle Simulation Button */}
      <button
        onClick={() => isSimulatingTelemetry ? stopTelemetrySimulation() : startTelemetrySimulation()}
        style={{
          width: '100%', padding: '8px', fontSize: '0.75rem', fontWeight: 700, borderRadius: 'var(--radius-md)', cursor: 'pointer',
          background: isSimulatingTelemetry ? 'rgba(255,255,255,0.04)' : 'var(--blue-500)',
          border: `1px solid ${isSimulatingTelemetry ? 'var(--border)' : 'var(--blue-400)'}`,
          color: '#fff', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
        }}
      >
        <RefreshCw size={12} className={isSimulatingTelemetry ? 'animate-spin' : ''} />
        <span>{isSimulatingTelemetry ? 'Pause Telemetry Simulation' : 'Resume Telemetry Simulation'}</span>
      </button>
    </div>
  )
}

function AITranslatorPanel() {
  const {
    translateEmergencyDialogue,
    translatedSpeechResult,
    isTranslating
  } = useStore()

  const [inputLang, setInputLang] = useState('en')
  const [outputLang, setOutputLang] = useState('bn')
  const [inputText, setInputText] = useState('')

  const dialogueShortcuts = [
    "Do not move the patient",
    "Where does it hurt?",
    "Ambulance is on the way",
    "Can you breathe?",
    "Apply pressure to the wound"
  ]

  const handleTranslate = async (text) => {
    if (!text) return
    await translateEmergencyDialogue(text, inputLang, outputLang)
  }

  const speakText = (text, lang) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang === 'bn' ? 'bn-BD' : lang === 'hi' ? 'hi-IN' : 'en-US'
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="glass-card animate-float-up" style={{ padding: 20, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        <Activity size={18} style={{ color: 'var(--blue-400)' }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>AI Emergency Dialogue Translator (BIMSTEC)</span>
      </div>

      {/* Language selectors */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Input (Speaker)</label>
          <select 
            value={inputLang} 
            onChange={(e) => setInputLang(e.target.value)}
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff', padding: '5px', borderRadius: 4, fontSize: '0.72rem', outline: 'none' }}
          >
            <option value="en" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>English</option>
            <option value="bn" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Bangla</option>
            <option value="hi" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Hindi</option>
          </select>
        </div>

        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', paddingTop: 10 }}>➔</div>

        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Output (Translation)</label>
          <select 
            value={outputLang} 
            onChange={(e) => setOutputLang(e.target.value)}
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#fff', padding: '5px', borderRadius: 4, fontSize: '0.72rem', outline: 'none' }}
          >
            <option value="bn" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Bangla</option>
            <option value="en" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>English</option>
            <option value="hi" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Hindi</option>
          </select>
        </div>
      </div>

      {/* Shortcuts */}
      <div>
        <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>Dialogue Shortcuts</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {dialogueShortcuts.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(phrase)
                handleTranslate(phrase)
              }}
              style={{
                padding: '4px 6px', fontSize: '0.65rem', background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)', color: 'var(--text-secondary)',
                borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* Free Text Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Or enter custom phrase..."
          style={{
            flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)',
            borderRadius: 6, color: '#fff', padding: '6px 10px', fontSize: '0.75rem', outline: 'none'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTranslate(inputText)
          }}
        />
        <button
          onClick={() => handleTranslate(inputText)}
          className="btn btn-primary"
          style={{ minHeight: 28, fontSize: '0.7rem', padding: '0 10px' }}
        >
          {isTranslating ? '...' : 'Translate'}
        </button>
      </div>

      {/* Output speech bubble */}
      {translatedSpeechResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.08) 0%, rgba(191, 90, 242, 0.08) 100%)',
            border: '1px solid rgba(10, 132, 255, 0.3)',
            borderRadius: 10, padding: '10px 14px', position: 'relative',
            boxShadow: '0 0 10px rgba(10, 132, 255, 0.05)'
          }}>
            <div style={{ fontSize: '0.58rem', color: 'var(--blue-400)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Translation Output</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', lineHeight: 1.3, paddingRight: 24 }}>
              "{translatedSpeechResult}"
            </div>
            
            {/* Speak TTS Button */}
            <button
              onClick={() => speakText(translatedSpeechResult, outputLang)}
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
                borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--blue-400)', fontSize: '0.75rem'
              }}
              title="Speak phrase"
            >
              🔊
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Emergency Ride Dispatch Panel ───────────────────────────────────────────
function EmergencyRidePanel() {
  const { location } = useStore()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [copiedCoords, setCopiedCoords] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const lat = location?.lat?.toFixed(4) ?? '23.6922'
  const lng = location?.lng?.toFixed(4) ?? '90.5186'
  const coordStr = `${lat}°N, ${lng}°E`

  const providers = [
    {
      id: 'pathao',
      name: 'Pathao',
      Icon: Bike,
      logo: '/pathao.svg',
      tagline: 'Bike & Car · BD',
      color: '#E8192C',
      bg: 'rgba(232, 25, 44, 0.10)',
      border: 'rgba(232, 25, 44, 0.32)',
      hoverShadow: 'rgba(232, 25, 44, 0.25)',
      url: 'https://pathao.com',
    },
    {
      id: 'obhai',
      name: 'oBhai',
      Icon: Car,
      logo: '/obhai.png',
      tagline: 'Ride + Ambulance',
      color: '#00A651',
      bg: 'rgba(0, 166, 81, 0.10)',
      border: 'rgba(0, 166, 81, 0.32)',
      hoverShadow: 'rgba(0, 166, 81, 0.25)',
      url: 'https://obhai.com.bd',
    },
    {
      id: 'uber',
      name: 'Uber',
      Icon: Navigation,
      logo: '/ubder.png',
      tagline: 'Global Coverage',
      color: '#c0c9d6',
      bg: 'rgba(156, 163, 175, 0.07)',
      border: 'rgba(156, 163, 175, 0.22)',
      hoverShadow: 'rgba(156, 163, 175, 0.20)',
      url: 'https://m.uber.com/ul/',
    },
  ]

  const handleCall = (provider) => {
    window.open(provider.url, '_blank', 'noopener,noreferrer')
  }

  const handleCopyCoords = () => {
    navigator.clipboard?.writeText(`${lat}, ${lng}`).then(() => {
      setCopiedCoords(true)
      setTimeout(() => setCopiedCoords(false), 2500)
    }).catch(() => {
      const el = document.createElement('textarea')
      el.value = `${lat}, ${lng}`
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopiedCoords(true)
      setTimeout(() => setCopiedCoords(false), 2500)
    })
  }

  return (
    <div
      className="glass-card animate-float-up"
      style={{
        padding: isMobile ? '14px 16px' : '18px 24px',
        border: '1px solid rgba(255, 159, 10, 0.28)',
        background: 'rgba(255, 159, 10, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        marginBottom: 4,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255, 159, 10, 0.14)',
            border: '1.5px solid rgba(255, 159, 10, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Siren size={18} style={{ color: 'var(--amber-400)' }} />
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '0.88rem' : '0.95rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
              Emergency Ride Dispatch
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--amber-400)', fontWeight: 600, marginTop: 2 }}>
              Ambulance too far? Get patient to hospital NOW
            </div>
          </div>
        </div>
        <span style={{
          fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em',
          padding: '3px 9px', borderRadius: '999px',
          background: 'rgba(255, 159, 10, 0.12)',
          border: '1px solid rgba(255, 159, 10, 0.35)',
          color: 'var(--amber-400)',
          textTransform: 'uppercase', whiteSpace: 'nowrap',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber-400)', display: 'inline-block', flexShrink: 0 }} />
          Always Available
        </span>
      </div>

      {/* Ride provider buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: isMobile ? 8 : 12,
      }}>
        {providers.map((p) => {
          const ProviderIcon = p.Icon
          return (
            <button
              key={p.id}
              id={`emergency-ride-${p.id}`}
              onClick={() => handleCall(p)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? 4 : 6,
                padding: isMobile ? '10px 6px' : '16px 10px',
                background: p.bg,
                border: `1.5px solid ${p.border}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 8px 24px ${p.hoverShadow}`
                e.currentTarget.style.borderColor = p.color
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = p.border
              }}
            >
              {/* Logo image with icon fallback */}
              <div style={{
                width: isMobile ? 36 : 48,
                height: isMobile ? 36 : 48,
                borderRadius: 'var(--radius-md)',
                background: `${p.color}12`,
                border: `1px solid ${p.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                <img
                  src={p.logo}
                  alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextSibling.style.display = 'flex'
                  }}
                />
                <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  <ProviderIcon size={isMobile ? 16 : 20} style={{ color: p.color }} />
                </div>
              </div>
              <span style={{ fontSize: isMobile ? '0.78rem' : '0.85rem', fontWeight: 800, color: p.color }}>{p.name}</span>
              <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>{p.tagline}</span>
              <span style={{
                marginTop: 2,
                fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.06em',
                padding: '2px 6px', borderRadius: '999px',
                background: `${p.color}18`,
                border: `1px solid ${p.color}44`,
                color: p.color,
                textTransform: 'uppercase',
              }}>Open App →</span>
            </button>
          )
        })}
      </div>

      {/* GPS coordinates + copy */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: '0.68rem',
        color: 'var(--text-muted)',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '7px 10px',
        flexWrap: 'wrap',
      }}>
        <MapPin size={13} style={{ color: 'var(--blue-400)', flexShrink: 0 }} />
        <span style={{ flex: 1 }}>
          Share pickup coords with driver:{' '}
          <strong style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            {coordStr}
          </strong>
        </span>
        <button
          onClick={handleCopyCoords}
          style={{
            flexShrink: 0,
            padding: '3px 9px', fontSize: '0.6rem', fontWeight: 700, borderRadius: 4,
            background: copiedCoords ? 'rgba(48, 209, 88, 0.12)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${copiedCoords ? 'rgba(48,209,88,0.4)' : 'var(--border)'}`,
            color: copiedCoords ? 'var(--green-400)' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          {copiedCoords
            ? <><Check size={11} /> Copied</>
            : <><Copy size={11} /> Copy</>
          }
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('tracker') // 'tracker' | 'impact' | 'business'
  const [showInsuranceModal, setShowInsuranceModal] = useState(false)
  const { 
    sosActive, wsConnected, resetIncident, triggerSOS, location, 
    userProfile, partnerIntegrations, incidentState, rescueFeeds, 
    insuranceClaim, fileInsuranceClaim, sosTimestamp 
  } = useStore()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const handleSendWhatsAppAlert = () => {
    const phone = userProfile?.emergencyContactPhone ? userProfile.emergencyContactPhone.replace(/[^\d+]/g, '') : ''
    if (!phone || phone.includes('X') || phone.length < 8) {
      alert('⚠️ Invalid Emergency Contact Number! Please navigate to "Accessibility & Vitals Center" to configure a valid phone number.')
      return
    }
    const lat = location?.lat?.toFixed(4) ?? '23.6922'
    const lng = location?.lng?.toFixed(4) ?? '90.5186'
    const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`
    
    const message = `🚨 *ROADGUARD EMERGENCY ALERT* 🚨\n\n*Victim:* ${userProfile?.name || 'Riya Akter'}\n*Age / Blood:* ${userProfile?.age || 24} yrs / ${userProfile?.bloodGroup || 'O+'}\n*Accident Location:* ${lat}, ${lng}\n*Google Maps:* ${mapsLink}\n\n*Status:* Critical, dispatched ambulance AMB-204 from Dhaka Medical College Hospital.\n\n*Mission Control Dashboard:* ${window.location.origin}/dashboard`
    
    const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setActiveTab('tracker') // Lock to tracker on mobile
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleReset = () => {
    resetIncident()
    navigate('/emergency')
  }

  const handleQuickDemo = () => {
    // Trigger with Kanchpur Bridge coords
    triggerSOS({ lat: 23.6922, lng: 90.5186 })
  }

  return (
    <div className="page-container" style={{ paddingTop: '88px', paddingRight: '16px', paddingBottom: '24px', paddingLeft: '16px', background: 'var(--bg-primary)', minHeight: '92vh' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={isMobile ? 20 : 24} style={{ color: 'var(--blue-400)' }} />
            <span>Emergency Tracker</span>
          </h1>
          {!isMobile && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
              Emergency operations dashboard for monitoring AI agents, RAG, and MCP dispatch flows.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {sosActive && !isMobile && (
            <button onClick={handleReset} className="btn btn-ghost" style={{ minHeight: 40, padding: '8px 16px', fontSize: '0.82rem', borderColor: 'var(--red-400)', color: 'var(--red-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} /> Terminate SOS / Reset
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation Row (Desktop Only) — Incident Tracker only */}
      {!isMobile && (
        <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <button
            style={{
              padding: '10px 20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: 'rgba(10, 132, 255, 0.12)',
              border: '1px solid var(--blue-400)',
              color: 'var(--blue-400)',
              borderRadius: 'var(--radius-md)',
              cursor: 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Activity size={16} />
            <span>Incident Tracker</span>
          </button>
        </div>
      )}

      {/* Tab 1: Real-time Incident Tracker */}
      {activeTab === 'tracker' && (
        <>
          {/* ── Emergency Ride Dispatch — always visible ── */}
          <EmergencyRidePanel />

          {!sosActive ? (
            /* Standby Grid containing Simulation Control & B2B Ride-sharing Safety Hub */
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24, alignItems: 'start' }} className="animate-fade-in">
              {/* Standby Control */}
              <div className="glass-card animate-float-up" style={{ padding: isMobile ? '24px 16px' : '32px 24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
                <Activity size={40} style={{ color: 'var(--text-muted)' }} />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800 }}>
                  Rescue Standby Mode
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                  The RoadGuardian AI emergency pipeline is currently on standby. Initiate an SOS dispatch from the emergency console to simulate a live event.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                  <button onClick={() => navigate('/emergency')} className="btn btn-danger" style={{ minHeight: 40, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <ShieldAlert size={16} /> Open Emergency Dispatch
                  </button>
                  <button onClick={handleQuickDemo} className="btn btn-primary" style={{ minHeight: 40, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Play size={16} /> Run Quick Simulation
                  </button>
                </div>
              </div>

              {/* B2B Ride-Sharing Safety Hub */}
              <B2BSafetyHub />
            </div>
          ) : (
            /* Active Emergency Console Grid */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
              {/* Active Incident Details Bar */}
              <div className="glass-card-sm" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', border: '1px solid rgba(255, 59, 48, 0.25)', background: 'rgba(255, 59, 48, 0.03)' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--red-400)', fontWeight: 700 }}>LIVE INCIDENT</span>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>#RG-2026-0147 (Kanchpur Bridge, Dhaka)</h3>
                </div>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.78rem', alignItems: 'center' }}>
                  <span>Patient: <strong>{userProfile.name} (Deaf)</strong></span>
                  <span>Blood: <strong style={{ color: 'var(--red-400)' }}>{userProfile.bloodGroup}</strong></span>
                  <span>Ambulance: <strong>AMB-204 (ETA 6m)</strong></span>
                  <span>999 Case: <strong>999-INC-28491</strong></span>
                  
                  <button
                    onClick={handleSendWhatsAppAlert}
                    style={{
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                      border: '1.5px solid #128C7E',
                      color: '#fff',
                      fontWeight: 800,
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 211, 102, 0.15)',
                      transition: 'transform 0.1s ease',
                      outline: 'none',
                      marginLeft: 8
                    }}
                    onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)' }}
                    onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                  >
                    <MessageSquare size={12} />
                    <span>WhatsApp Alert</span>
                  </button>
                </div>
              </div>
              
              {/* Agent Timeline Swimlane (Horizontal - Desktop Only) */}
              {!isMobile && (
                <div style={{ gridColumn: 'span 2' }}>
                  <AgentTimeline />
                </div>
              )}

              {/* Map and Main Panels */}
              {isMobile ? (
                /* ---------------- MOBILE UX DIRECT FLOW ---------------- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  
                  {/* 1. Triage Assessment */}
                  <TriagePanel />

                  {/* 2. First Aid Guidance */}
                  <GuidanceStream />

                  {/* AI Dialogues Translator */}
                  <AITranslatorPanel />

                  {/* 3. Nearby Hospitals */}
                  <HospitalPanel />

                  {/* Rescue feeds during active state */}
                  <RescueNetworkFeeds />

                  {/* Insurance Claim generated package if RESOLVED state */}
                  {incidentState === 'RESOLVED' && (
                    <div className="glass-card animate-float-up" style={{ padding: 20, border: '1.5px solid var(--green-400)', background: 'rgba(48,209,88,0.04)' }}>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--green-400)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <ShieldAlert size={18} />
                        <span>Incident Resolved Successfully</span>
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.4 }}>
                        All dispatch records, AI triage logs, and hospital entries have been compiled. You can file a direct insurance claim package now.
                      </p>
                      <button
                        onClick={() => setShowInsuranceModal(true)}
                        className="btn btn-primary"
                        style={{ width: '100%', minHeight: 40, fontSize: '0.8rem', background: 'var(--green-500)', borderColor: 'var(--green-600)' }}
                      >
                        Generate &amp; File Insurance Claim
                      </button>
                    </div>
                  )}

                  {/* 4. Live Leaflet Map */}
                  <div className="glass-card" style={{ border: '1px solid var(--border)', padding: 12 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> Location Map</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--blue-400)', textTransform: 'none' }}>
                        {location ? `${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E` : 'N/A'}
                      </span>
                    </div>
                    <LiveMap height={260} />
                  </div>

                  {/* 5. Emergency Cancel (Thumb accessible) */}
                  <button 
                    onClick={handleReset} 
                    className="btn btn-danger" 
                    style={{ width: '100%', minHeight: 48, marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
                  >
                    <AlertTriangle size={16} /> Terminate SOS / Reset Standby
                  </button>

                </div>
              ) : (
                /* ---------------- DESKTOP UX GRID FLOW ---------------- */
                 <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24, alignItems: 'start' }}>
                    
                    {/* Left Column panels */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <TriagePanel />
                      <HospitalPanel />
                      <MCPToolsPanel />

                      {/* Rescue feeds during active state */}
                      <RescueNetworkFeeds />

                      {/* Insurance Claim generated package if RESOLVED state */}
                      {incidentState === 'RESOLVED' && (
                        <div className="glass-card animate-float-up" style={{ padding: 20, border: '1.5px solid var(--green-400)', background: 'rgba(48,209,88,0.04)' }}>
                          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--green-400)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <ShieldAlert size={18} />
                            <span>Incident Resolved Successfully</span>
                          </h3>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.4 }}>
                            All dispatch records, AI triage logs, and hospital entries have been compiled. You can file a direct insurance claim package now.
                          </p>
                          <button
                            onClick={() => setShowInsuranceModal(true)}
                            className="btn btn-primary"
                            style={{ width: '100%', minHeight: 40, fontSize: '0.8rem', background: 'var(--green-500)', borderColor: 'var(--green-600)' }}
                          >
                            Generate &amp; File Insurance Claim
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right Column panels (Map and guidance) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      
                      {/* Live Leaflet Map */}
                      <div className="glass-card" style={{ border: '1px solid var(--border)', padding: 12 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> Real-time Geographical Plot</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--blue-400)', textTransform: 'none' }}>
                            Locked coords: {location ? `${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E` : 'N/A'}
                          </span>
                        </div>
                        <LiveMap height={320} />
                      </div>

                      {/* Streamed RAG Guidance */}
                      <GuidanceStream />

                      {/* AI Dialogues Translator */}
                      <AITranslatorPanel />
                    </div>

                  </div>
              )}
            </div>
          )}
        </>
      )}


      {/* Insurance Claim Modal */}
      {showInsuranceModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16
        }} className="animate-fade-in">
          <div className="glass-card" style={{ maxWidth: 480, width: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={20} style={{ color: 'var(--green-400)' }} />
              <span>Insurance Claims Package</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: 14, borderRadius: 8, border: '1px solid var(--border)' }}>
              <div>📍 <strong>Incident Location:</strong> {location?.lat?.toFixed(4)}°N, {location?.lng?.toFixed(4)}°E (Kanchpur Bridge)</div>
              <div>⏱️ <strong>Dispatched Time:</strong> {new Date(sosTimestamp || Date.now()).toLocaleTimeString()}</div>
              <div>🩺 <strong>AI Triage Severity:</strong> Critical (Score 87/100)</div>
              <div>🏥 <strong>Admitted Hospital:</strong> Dhaka Medical College Hospital</div>
              <div>🚗 <strong>Partner Ride ID:</strong> {partnerIntegrations.provider} {partnerIntegrations.rideId}</div>
              <div>🛡️ <strong>Health Insurer:</strong> {userProfile.insuranceProvider || 'Pragati Insurance Ltd.'}</div>
              <div>📜 <strong>Policy Number:</strong> {userProfile.policyNumber || 'PRG-2026-88491A'}</div>
            </div>

            {insuranceClaim?.status === 'submitted' ? (
              <div style={{ background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.2)', padding: 12, borderRadius: 'var(--radius-sm)', color: 'var(--green-400)', fontSize: '0.78rem' }}>
                <strong>Claim Filed Successfully!</strong><br />
                Claim Receipt ID: <strong style={{ textTransform: 'uppercase', color: '#fff' }}>{insuranceClaim.claimId}</strong><br />
                Status: {insuranceClaim.amountApproved}<br />
                Filed On: {insuranceClaim.timestamp}
              </div>
            ) : (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Clicking submit compiles this dossier and transmits it via secure API endpoint to {userProfile.insuranceProvider || 'Pragati Insurance Ltd.'} for instant reimbursement assessment.
              </p>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              <button
                onClick={() => setShowInsuranceModal(false)}
                className="btn btn-ghost"
                style={{ flex: 1, minHeight: 40, fontSize: '0.82rem', justifyContent: 'center' }}
              >
                Close
              </button>
              {insuranceClaim?.status !== 'submitted' && (
                <button
                  onClick={() => fileInsuranceClaim({ insurer: userProfile.insuranceProvider || 'Pragati Insurance Ltd.', policy: userProfile.policyNumber || 'PRG-2026-88491A' })}
                  className="btn btn-primary"
                  style={{ flex: 1, minHeight: 40, fontSize: '0.82rem', background: 'var(--green-500)', borderColor: 'var(--green-600)', justifyContent: 'center' }}
                  disabled={insuranceClaim?.status === 'submitting'}
                >
                  {insuranceClaim?.status === 'submitting' ? 'Submitting Claims...' : 'Submit Dossier'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
