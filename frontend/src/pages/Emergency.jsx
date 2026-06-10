import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useWebSocket } from '../hooks/useWebSocket'
import SOSButton from '../components/SOSButton'

export default function Emergency() {
  const navigate = useNavigate()
  const { sendSOS } = useWebSocket()
  const {
    sosActive,
    triggerSOS,
    bloodGroup,
    setBloodGroup,
    emergencyType,
    setEmergencyType,
    a11yMode,
    setA11yMode,
  } = useStore()

  const [description, setDescription] = useState('')
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsCoords, setGpsCoords] = useState({ lat: 23.6922, lng: 90.5186 }) // Default to Kanchpur Bridge (Riya's Incident)
  const [gpsError, setGpsError] = useState(null)

  const acquireLocation = (forceHighAccuracy = true) => {
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser.')
      return
    }

    setGpsLoading(true)
    setGpsError(null)

    const options = {
      enableHighAccuracy: forceHighAccuracy,
      timeout: forceHighAccuracy ? 10000 : 15000,
      maximumAge: 0
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsLoading(false)
        setGpsError(null)
      },
      (err) => {
        console.warn(`Geolocation error (HighAccuracy=${forceHighAccuracy}):`, err.message)
        
        // If high accuracy failed due to timeout or unavailability, retry with coarse accuracy
        if (forceHighAccuracy && (err.code === 3 || err.code === 2)) {
          console.log('Retrying with coarse accuracy...')
          acquireLocation(false)
        } else {
          let errMsg = 'Failed to acquire location.'
          if (err.code === 1) {
            errMsg = 'Permission denied. Please allow location access in your browser settings.'
          } else if (err.code === 2) {
            errMsg = 'Position unavailable. Check your device location settings.'
          } else if (err.code === 3) {
            errMsg = 'GPS search timed out.'
          }
          setGpsError(errMsg)
          setGpsLoading(false)
        }
      },
      options
    )
  }

  useEffect(() => {
    if (sosActive) {
      navigate('/dashboard')
    }
  }, [sosActive, navigate])

  useEffect(() => {
    // Proactively acquire real location on mount so it's ready when SOS is clicked
    acquireLocation(true)
  }, [])

  // Geolocation is defaulted to Kanchpur Bridge for Riya's simulation.

  const handleSOSTrigger = () => {
    const payload = {
      userId: 'riya-akter-24',
      emergencyType: emergencyType || 'general',
      location: gpsCoords,
      accessibilityMode: a11yMode || 'default',
      message: description || `SOS emergency trigger. Blood group: ${bloodGroup}. Type: ${emergencyType || 'general'}`
    }

    // Try sending over websocket first
    const sent = sendSOS(payload)
    if (!sent) {
      console.log('WS not connected. Running mock simulation flow.')
      // Fallback to local store orchestration
      triggerSOS(gpsCoords)
    }
    navigate('/dashboard')
  }

  return (
    <div className="page-container" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '88px', paddingRight: '24px', paddingBottom: '40px', paddingLeft: '24px' }}>
      <div className="glass-card animate-float-up" style={{ width: '100%', maxWidth: 520, padding: 32, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 28 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, marginBottom: 8 }}>
            🚨 Emergency Dispatch
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Configure emergency parameters before triggering or hold the SOS button directly.
          </p>
        </div>

        {/* Form Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Emergency Type Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Emergency Category
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { id: 'general', label: '🤕 General' },
                { id: 'road_accident', label: '🚗 Accident' },
                { id: 'medical', label: '🩺 Cardiac/CPR' }
              ].map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setEmergencyType(type.id)}
                  style={{
                    padding: '10px 8px',
                    fontSize: '0.8rem',
                    background: emergencyType === type.id ? 'var(--blue-500)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${emergencyType === type.id ? 'var(--blue-400)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: emergencyType === type.id ? 700 : 500,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Blood Group Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Blood Group (If Known)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setBloodGroup(bg)}
                  style={{
                    padding: '8px',
                    fontSize: '0.78rem',
                    background: bloodGroup === bg ? 'var(--red-500)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${bloodGroup === bg ? 'var(--red-400)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: bloodGroup === bg ? 700 : 500,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Incident Description */}
          <div>
            <label htmlFor="accident-desc" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Describe Situation (e.g., "head injury bleeding")
            </label>
            <textarea
              id="accident-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Car crash on highway, two victims. One unconscious and bleeding from head."
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                padding: '12px 14px',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--blue-500)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Region Simulator Selector */}
          <div>
            <label htmlFor="simulate-region" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Simulate Location / Region
            </label>
            <select
              id="simulate-region"
              value={gpsCoords.lat === 23.6922 && gpsCoords.lng === 90.5186 ? 'kanchpur' : gpsCoords.lat === 23.8103 && gpsCoords.lng === 90.4125 ? 'dhaka' : gpsCoords.lat === 23.4357 && gpsCoords.lng === 91.1350 ? 'comilla' : 'gps'}
              onChange={(e) => {
                const val = e.target.value
                if (val === 'kanchpur') {
                  setGpsCoords({ lat: 23.6922, lng: 90.5186 })
                  setGpsError(null)
                } else if (val === 'dhaka') {
                  setGpsCoords({ lat: 23.8103, lng: 90.4125 })
                  setGpsError(null)
                } else if (val === 'comilla') {
                  setGpsCoords({ lat: 23.4357, lng: 91.1350 })
                  setGpsError(null)
                } else {
                  acquireLocation(true)
                }
              }}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                padding: '10px',
                fontSize: '0.82rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="kanchpur" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Kanchpur Bridge (Riya's Incident Site)</option>
              <option value="dhaka" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Dhaka (Capital District)</option>
              <option value="comilla" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Comilla University (Ride Start)</option>
              <option value="gps" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Use Live Browser Geolocation</option>
            </select>
          </div>

          {/* Location Lock Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: `1px solid ${gpsError ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.1rem' }}>📍</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>GPS Location Lock</div>
                <div style={{ fontSize: '0.7rem', color: gpsError ? 'var(--red-400)' : 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {gpsLoading ? 'Acquiring location...' : `Lat: ${gpsCoords.lat.toFixed(6)} | Lng: ${gpsCoords.lng.toFixed(6)}`}
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => acquireLocation(true)}
                disabled={gpsLoading}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.7rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)' }}
              >
                {gpsLoading ? 'Locking...' : '🎯 Detect'}
              </button>
            </div>
            
            {gpsError && (
              <div style={{ fontSize: '0.68rem', color: 'var(--red-400)', background: 'rgba(239, 68, 68, 0.08)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                ⚠️ {gpsError}
              </div>
            )}
          </div>
        </div>

        {/* SOS Button Section */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <SOSButton onTrigger={handleSOSTrigger} />
        </div>

      </div>
    </div>
  )
}
