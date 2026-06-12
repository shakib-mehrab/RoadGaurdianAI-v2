import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useWebSocket } from '../hooks/useWebSocket'
import { Camera, AlertTriangle, ShieldAlert, CheckCircle, MapPin, Compass, Sparkles, Heart, Activity } from 'lucide-react'

export default function Bystander() {
  const navigate = useNavigate()
  const { sendSOS } = useWebSocket()
  const { triggerSOS, sosActive, userProfile } = useStore()

  const [description, setDescription] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  
  const [gpsCoords, setGpsCoords] = useState({ lat: 23.6922, lng: 90.5186 }) // Default to Kanchpur Bridge
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState(null)

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)

  // Redirect to dashboard if SOS is already active
  useEffect(() => {
    if (sosActive) {
      navigate('/dashboard')
    }
  }, [sosActive, navigate])

  // Get GPS on mount
  useEffect(() => {
    acquireLocation(true)
  }, [])

  const acquireLocation = (forceHighAccuracy = true) => {
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser.')
      return
    }

    setGpsLoading(true)
    setGpsError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsLoading(false)
      },
      (err) => {
        console.warn('Geolocation error:', err.message)
        setGpsLoading(false)
        setGpsError('GPS offline. Simulating incident corridor coordinates.')
      },
      { enableHighAccuracy: forceHighAccuracy, timeout: 8000 }
    )
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  // Pre-load a mock crash picture option for demo convenience
  const handleSimulateCrashPhoto = () => {
    setPhotoPreview('https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=600')
    setDescription('Motorcycle crash at the junction. Rider thrown off, unresponsive, head laceration bleeding on asphalt.')
  }

  const handleRunAITriage = (e) => {
    e.preventDefault()
    if (!photoPreview && !description) {
      alert('Please provide either a photo or a description to run AI analysis!')
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)

    // Simulate Vision AI processing
    setTimeout(() => {
      setIsAnalyzing(false)
      setAnalysisResult({
        hazardType: 'Critical Vehicular Collision (Motorcycle/Obstacle)',
        severity: 'CRITICAL (Level 4)',
        confidence: 0.94,
        observations: [
          'High probability of severe head/spinal trauma',
          'Active cranial bleeding detected from crash image feed',
          'Victim remains unresponsive; suspected loss of consciousness'
        ],
        bystanderActions: [
          '⚠️ Scene Safety First: Signal oncoming vehicles to avoid secondary collision.',
          '🚨 DO NOT move the victim’s neck or spine unless in immediate fire danger.',
          '🩸 Control Bleeding: Apply firm, direct pressure to the head wound with clean fabric.',
          '🏥 Clear Airway: Gently check if the helmet strap is choking the victim, but DO NOT remove the helmet.'
        ],
        suggestedSosMessage: description || 'Severe motorcycle crash. Unconscious rider with head bleeding.'
      })
    }, 1800)
  }

  const handleTriggerSOS = () => {
    const finalDescription = analysisResult
      ? `[Bystander Quick-SOS] AI Vision Analysis: ${analysisResult.hazardType}. Observations: ${analysisResult.suggestedSosMessage}`
      : description || 'Bystander SOS trigger. Accident scene witness.'

    const payload = {
      userId: 'bystander-witness-99',
      emergencyType: 'road_accident',
      location: gpsCoords,
      accessibilityMode: 'bystander',
      message: finalDescription,
      familyMembers: userProfile?.familyMembers || []
    }

    // Attempt sending over WebSocket, otherwise fall back to local store trigger
    const sent = sendSOS(payload)
    if (!sent) {
      console.log('WS not connected. Running local mock trigger.')
      triggerSOS(gpsCoords)
    }
    navigate('/dashboard')
  }

  const [isMobile] = useState(window.innerWidth < 768)

  return (
    <div className="page-container" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: isMobile ? '72px' : '88px', paddingRight: '12px', paddingBottom: '72px', paddingLeft: '12px', background: 'var(--bg-primary)' }}>
      <div className="glass-card animate-float-up" style={{ width: '100%', maxWidth: 540, padding: isMobile ? '16px 20px' : '32px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255, 159, 10, 0.12)', border: '1.5px solid rgba(255, 159, 10, 0.4)', borderRadius: '50%', padding: 10, color: 'var(--amber-400)', marginBottom: 12 }}>
            <ShieldAlert size={28} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 900, marginBottom: 4 }}>
            Bystander Emergency Console
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4, maxWidth: 420 }}>
            Did you witness a road accident? Snap a photo or write what you see. RoadGuardian AI will analyze the scene and dispatch help instantly.
          </p>
        </div>

        {/* Quick Simulation Help Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10, 132, 255, 0.08)', border: '1px solid rgba(10, 132, 255, 0.25)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--blue-400)' }}>Demo Helper</span>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>Load simulated crash photo and description automatically.</p>
          </div>
          <button 
            onClick={handleSimulateCrashPhoto}
            style={{
              padding: '6px 12px',
              fontSize: '0.7rem',
              fontWeight: 800,
              background: 'var(--blue-500)',
              border: 'none',
              color: '#fff',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Simulate Scene
          </button>
        </div>

        {/* Input Form */}
        {!analysisResult && !isAnalyzing && (
          <form onSubmit={handleRunAITriage} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Camera Upload Container */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
                Capture / Upload Crash Scene
              </label>
              <input 
                id="bystander-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="bystander-photo"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius-md)',
                  height: 140,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  background: 'rgba(0,0,0,0.25)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Crash scene preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                    <Camera size={28} />
                    <span style={{ fontSize: '0.75rem' }}>Snap Photo or Select File</span>
                  </div>
                )}
              </label>
            </div>

            {/* Description Textarea */}
            <div>
              <label htmlFor="bystander-desc" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>
                What happened? (Explain details)
              </label>
              <textarea
                id="bystander-desc"
                rows="3"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Motorcycle hit a pole. The driver is lying on the road, not moving, bleeding from the head."
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  padding: '10px 12px',
                  fontSize: '0.8rem',
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none'
                }}
              />
            </div>

            {/* Location Check */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.75rem' }}>
              <MapPin size={16} style={{ color: 'var(--blue-400)' }} />
              <div style={{ flex: 1 }}>
                <strong>GPS Lock:</strong> {gpsLoading ? 'Acquiring Coords...' : `${gpsCoords.lat.toFixed(5)}, ${gpsCoords.lng.toFixed(5)}`}
              </div>
              <button 
                type="button" 
                onClick={() => acquireLocation(true)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid var(--border)',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.65rem',
                  cursor: 'pointer'
                }}
              >
                Refresh
              </button>
            </div>

            {/* Submit Triage */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, var(--blue-500) 0%, rgba(10,132,255,0.8) 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Sparkles size={16} /> Run Vision AI Scene Triage
            </button>
          </form>
        )}

        {/* Loading Spinner */}
        {isAnalyzing && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 16 }}>
            <div className="animate-spin" style={{ width: 44, height: 44, border: '4px solid rgba(10, 132, 255, 0.1)', borderTopColor: 'var(--blue-400)', borderRadius: '50%' }} />
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Analyzing Accident Threat...</span>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Vision algorithms executing YOLOv8 model layers...</p>
            </div>
          </div>
        )}

        {/* AI Analysis Result Panel */}
        {analysisResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fade-in">
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--red-400)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertTriangle size={16} /> Vision AI Injury Triage Result
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div>Hazard Classification: <strong style={{ color: '#fff' }}>{analysisResult.hazardType}</strong></div>
                <div>Estimated Severity: <strong style={{ color: 'var(--red-400)' }}>{analysisResult.severity}</strong></div>
                <div>Model Confidence Score: <strong style={{ color: 'var(--green-400)' }}>{(analysisResult.confidence * 100).toFixed(0)}%</strong></div>
              </div>
            </div>

            {/* Bystander Quick Action items */}
            <div style={{ border: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-md)', padding: 16 }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Heart size={14} style={{ color: 'var(--blue-400)' }} />
                <span>Immediate Bystander Actions Required</span>
              </h4>
              
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 0, margin: 0, listStyle: 'none' }}>
                {analysisResult.bystanderActions.map((act, i) => (
                  <li key={i} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ color: 'var(--blue-400)', fontWeight: 800 }}>•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* SOS Dispatch Action Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              <button
                onClick={handleTriggerSOS}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, var(--red-500) 0%, rgba(239,68,68,0.8) 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 20px rgba(239, 68, 68, 0.2)'
                }}
              >
                <ShieldAlert size={18} />
                <span>ACTIVATE SOS DISPATCH</span>
              </button>

              <button
                onClick={() => setAnalysisResult(null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                ← Back to Input
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
