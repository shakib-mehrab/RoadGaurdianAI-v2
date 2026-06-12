import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useWebSocket } from '../hooks/useWebSocket'
import SOSButton from '../components/SOSButton'
import { ShieldAlert, Activity, Heart, Car, MapPin, Compass, AlertTriangle } from 'lucide-react'

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
    userProfile,
  } = useStore()

  const [description, setDescription] = useState('')
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsCoords, setGpsCoords] = useState({ lat: 23.6922, lng: 90.5186 }) // Default to Kanchpur Bridge (Riya's Incident)
  const [gpsError, setGpsError] = useState(null)

  const [showCalculator, setShowCalculator] = useState(false)
  const [calcInput, setCalcInput] = useState('')
  const [calcResult, setCalcResult] = useState('')

  const handleSilentSOS = () => {
    const payload = {
      userId: 'riya-akter-24',
      emergencyType: 'women_safety_silent',
      location: gpsCoords,
      accessibilityMode: 'silent',
      message: 'Silent SOS triggered via Women Safety Calculator mode.',
      familyMembers: userProfile?.familyMembers || []
    }
    const sent = sendSOS(payload)
    if (!sent) {
      triggerSOS(gpsCoords, true)
    }
    navigate('/dashboard')
  }

  const handleCalcKeyPress = (val) => {
    if (val === 'C') {
      setCalcInput('')
      setCalcResult('')
    } else if (val === '=') {
      if (calcInput === '999') {
        handleSilentSOS()
      } else {
        try {
          const clean = calcInput.replace(/x/g, '*').replace(/÷/g, '/')
          const res = Function(`"use strict"; return (${clean})`)()
          setCalcResult(String(res))
        } catch (e) {
          setCalcResult('Error')
        }
      }
    } else {
      const newInput = calcInput + val
      setCalcInput(newInput)
      if (newInput === '999') {
        handleSilentSOS()
      }
    }
  }

  // Shake gesture detection
  useEffect(() => {
    if (!showCalculator) return

    let lastX = null, lastY = null, lastZ = null
    let threshold = 15 // Shake sensitivity threshold

    const handleMotion = (event) => {
      const acceleration = event.accelerationIncludingGravity
      if (!acceleration) return

      const { x, y, z } = acceleration
      if (lastX !== null) {
        const deltaX = Math.abs(x - lastX)
        const deltaY = Math.abs(y - lastY)
        const deltaZ = Math.abs(z - lastZ)

        if ((deltaX > threshold && deltaY > threshold) || (deltaX > threshold && deltaZ > threshold) || (deltaY > threshold && deltaZ > threshold)) {
          if ('vibrate' in navigator) {
            navigator.vibrate([150, 50, 150])
          }
          handleSilentSOS()
        }
      }

      lastX = x
      lastY = y
      lastZ = z
    }

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion)
    }

    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleMotion)
      }
    }
  }, [showCalculator, gpsCoords])

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

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
 
  useEffect(() => {
    // Proactively acquire real location on mount so it's ready when SOS is clicked
    acquireLocation(true)
 
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Geolocation is defaulted to Kanchpur Bridge for Riya's simulation.

  const handleSOSTrigger = () => {
    const payload = {
      userId: 'riya-akter-24',
      emergencyType: emergencyType || 'general',
      location: gpsCoords,
      accessibilityMode: a11yMode || 'default',
      message: description || `SOS emergency trigger. Blood group: ${bloodGroup}. Type: ${emergencyType || 'general'}`,
      familyMembers: userProfile?.familyMembers || []
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

  if (showCalculator) {
    const keys = [
      'C', '±', '%', '÷',
      '7', '8', '9', 'x',
      '4', '5', '6', '-',
      '1', '2', '3', '+',
      '0', '.', '='
    ]

    return (
      <div className="page-container" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: isMobile ? '72px' : '88px', paddingRight: isMobile ? '12px' : '24px', paddingBottom: isMobile ? '72px' : '40px', paddingLeft: isMobile ? '12px' : '24px' }}>
        <div className="glass-card animate-float-up" style={{ width: '100%', maxWidth: 380, padding: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(20,20,25,0.7)', backdropFilter: 'blur(20px)' }}>
          {/* Top Info Header for Demo purposes */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calculator Vault</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255, 55, 95, 0.8)', fontWeight: 600 }}>Women Safety Shield Enabled</div>
            </div>
            <button 
              onClick={() => {
                setShowCalculator(false)
                setCalcInput('')
                setCalcResult('')
              }}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: '0.7rem',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              Exit Shield
            </button>
          </div>

          {/* Calculator Screen */}
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            textAlign: 'right',
            fontFamily: 'monospace',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', minHeight: '1.2rem', wordBreak: 'break-all' }}>
              {calcInput || '0'}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginTop: '8px', minHeight: '2.4rem', wordBreak: 'break-all' }}>
              {calcResult || '0'}
            </div>
          </div>

          {/* Grid of keys */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px'
          }}>
            {keys.map((key) => {
              const isOperator = ['÷', 'x', '-', '+', '='].includes(key)
              const isClear = key === 'C'
              
              // Spanning for zero button
              const gridColumn = key === '0' ? 'span 2' : 'auto'

              return (
                <button
                  key={key}
                  onClick={() => handleCalcKeyPress(key)}
                  style={{
                    gridColumn,
                    padding: '16px',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    background: isOperator 
                      ? 'var(--blue-500)' 
                      : isClear 
                        ? 'rgba(239, 68, 68, 0.15)' 
                        : 'rgba(255,255,255,0.04)',
                    color: isOperator 
                      ? '#fff' 
                      : isClear 
                        ? 'var(--red-400)' 
                        : 'var(--text-primary)',
                    transition: 'all 0.1s ease',
                  }}
                >
                  {key}
                </button>
              )
            })}
          </div>

          {/* Shake Simulation and Guide */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={() => {
                if ('vibrate' in navigator) {
                  navigator.vibrate([150, 50, 150])
                }
                handleSilentSOS()
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, rgba(191, 90, 242, 0.2) 0%, rgba(255, 55, 95, 0.2) 100%)',
                border: '1px solid rgba(191, 90, 242, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>📳</span> Simulate Haptic Shake Trigger
            </button>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textAlign: 'center', margin: 0 }}>
              *Enter <strong>999</strong> or shake device dynamically to dispatch instant Silent SOS alerts to trusted contacts.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: isMobile ? '72px' : '88px', paddingRight: isMobile ? '12px' : '24px', paddingBottom: isMobile ? '72px' : '40px', paddingLeft: isMobile ? '12px' : '24px' }}>
      <div className="glass-card animate-float-up" style={{ width: '100%', maxWidth: 520, padding: isMobile ? '16px 20px' : '32px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: isMobile ? '14px' : '28px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? '1.4rem' : '2rem', fontWeight: 900, marginBottom: isMobile ? 4 : 8, display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, justifyContent: 'center' }}>
            <ShieldAlert style={{ color: 'var(--red-500)' }} size={isMobile ? 24 : 32} /> Emergency Dispatch
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? '0.78rem' : '0.85rem', lineHeight: 1.4 }}>
            Configure emergency parameters before triggering or hold the SOS button directly.
          </p>
        </div>
 
        {/* Form Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 20 }}>

          {/* Women Safety Mode Toggle/Shield */}
          <div 
            onClick={() => setShowCalculator(true)}
            style={{
              background: 'linear-gradient(135deg, rgba(191, 90, 242, 0.15) 0%, rgba(255, 55, 95, 0.15) 100%)',
              border: '1px solid rgba(191, 90, 242, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.01)'
              e.currentTarget.style.borderColor = 'rgba(191, 90, 242, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.borderColor = 'rgba(191, 90, 242, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: 'rgba(191, 90, 242, 0.2)', padding: 8, borderRadius: '50%', color: '#BF5AF2' }}>
                <ShieldAlert size={18} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Women Safety Mode</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Click to activate hidden SOS Calculator Shield</div>
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#BF5AF2', fontWeight: 700 }}>Enable →</div>
          </div>
          
          {/* Emergency Type Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Emergency Category
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: isMobile ? 6 : 8 }}>
              {[
                { id: 'general', label: 'General', icon: Activity },
                { id: 'road_accident', label: 'Accident', icon: Car },
                { id: 'medical', label: 'Cardiac/CPR', icon: Heart }
              ].map(type => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setEmergencyType(type.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: isMobile ? '4px' : '8px',
                      padding: isMobile ? '8px 4px' : '12px 8px',
                      fontSize: isMobile ? '0.72rem' : '0.8rem',
                      background: emergencyType === type.id ? 'var(--blue-500)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${emergencyType === type.id ? 'var(--blue-400)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: emergencyType === type.id ? 700 : 500,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={isMobile ? 16 : 20} style={{ color: emergencyType === type.id ? '#fff' : 'var(--text-secondary)' }} />
                    <span>{type.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Blood Group Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Blood Group (If Known)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: isMobile ? 6 : 8 }}>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setBloodGroup(bg)}
                  style={{
                    padding: isMobile ? '6px' : '8px',
                    fontSize: isMobile ? '0.72rem' : '0.78rem',
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
            <label htmlFor="accident-desc" style={{ display: 'block', fontSize: isMobile ? '0.75rem' : '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: isMobile ? 4 : 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Describe Situation (e.g., "head injury bleeding")
            </label>
            <textarea
              id="accident-desc"
              rows={isMobile ? 2 : 3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Car crash on highway, two victims. One unconscious and bleeding from head."
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                padding: isMobile ? '8px 10px' : '12px 14px',
                fontSize: isMobile ? '0.78rem' : '0.85rem',
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
            <label htmlFor="simulate-region" style={{ display: 'block', fontSize: isMobile ? '0.75rem' : '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: isMobile ? 4 : 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                padding: isMobile ? '6px 8px' : '10px',
                fontSize: isMobile ? '0.78rem' : '0.82rem',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 4 : 8, background: 'rgba(255,255,255,0.03)', padding: isMobile ? '8px 10px' : '12px 14px', borderRadius: 'var(--radius-md)', border: `1px solid ${gpsError ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10 }}>
              <MapPin size={isMobile ? 16 : 20} style={{ color: 'var(--blue-400)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: isMobile ? '0.72rem' : '0.78rem', fontWeight: 700 }}>GPS Location Lock</div>
                <div style={{ fontSize: isMobile ? '0.65rem' : '0.7rem', color: gpsError ? 'var(--red-400)' : 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {gpsLoading ? 'Acquiring location...' : `Lat: ${gpsCoords.lat.toFixed(6)} | Lng: ${gpsCoords.lng.toFixed(6)}`}
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => acquireLocation(true)}
                disabled={gpsLoading}
                style={{
                  padding: isMobile ? '4px 8px' : '6px 10px',
                  fontSize: isMobile ? '0.65rem' : '0.7rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)' }}
              >
                {gpsLoading ? (
                  'Locking...'
                ) : (
                  <>
                    <Compass size={12} />
                    <span>Detect</span>
                  </>
                )}
              </button>
            </div>
            
            {gpsError && (
              <div style={{ fontSize: '0.68rem', color: 'var(--red-400)', background: 'rgba(239, 68, 68, 0.08)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={12} />
                <span>{gpsError}</span>
              </div>
            )}
          </div>
        </div>

        {/* SOS Button Section */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: isMobile ? 0 : 10 }}>
          <SOSButton onTrigger={handleSOSTrigger} />
        </div>

      </div>
    </div>
  )
}
