import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'

export default function MobileFrame({ children }) {
  const { 
    currentMobileScreen, 
    setMobileScreen,
    wsConnected,
    isOnline,
    resetIncident,
    a11yMode,
    setA11yMode,
    incidentState
  } = useStore()

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
      setIsMobile(window.innerWidth < 768 || isStandalone)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const timeStr = "18:47" // Simulated crash hour (6:47 PM)

  const screens = [
    { id: 'home', label: '1. Home Screen', icon: '🏠' },
    { id: 'alert', label: '2. Crash Alert', icon: '🚨' },
    { id: 'sos', label: '3. SOS Active', icon: '🆘' },
    { id: 'bystander', label: '4. Bystander Card', icon: '🦻' },
    { id: 'guidance', label: '5. AI Guidance', icon: '📋' },
    { id: 'hospitals', label: '6. Hospitals', icon: '🏥' },
    { id: 'contacts', label: '7. Contacts', icon: '📞' },
    { id: 'a11y', label: '8. Accessibility', icon: '♿' },
    { id: 'language', label: '9. Language', icon: '🌐' },
    { id: 'profile', label: '10. Med Profile', icon: '👤' },
  ]

  if (isMobile) {
    return (
      <div 
        className="mobile-native-viewport scroll-y" 
        data-a11y={a11yMode} 
        style={{
          width: '100%',
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-primary)',
          position: 'relative',
          paddingTop: '64px',
        }}
      >
        {children}
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      gap: '40px',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 24px',
      background: 'radial-gradient(circle at center, #0F1E36 0%, #050B14 100%)',
      minHeight: 'calc(100vh - 64px)',
      flexWrap: 'wrap-reverse'
    }}>
      
      {/* Desktop Controller Sidebar */}
      <div className="glass-card" style={{
        padding: '28px',
        width: '320px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        border: '1px solid var(--border)',
        maxHeight: '812px',
        overflowY: 'auto'
      }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>📱 PWA Simulator</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Interact directly with Riya's phone interface on the right. Use this sidebar to jump to specific screens or reset the scenario.
          </p>
        </div>

        <div className="divider" style={{ margin: '4px 0' }} />

        {/* Screen selector buttons */}
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Jump to Figma Screen
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {screens.map(s => (
              <button
                key={s.id}
                onClick={() => setMobileScreen(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: currentMobileScreen === s.id ? 'var(--blue-500)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${currentMobileScreen === s.id ? 'var(--blue-400)' : 'var(--border)'}`,
                  color: '#fff',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="divider" style={{ margin: '4px 0' }} />

        {/* Reset & Quick triggers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {incidentState !== 'IDLE' && (
            <button
              onClick={resetIncident}
              className="btn btn-danger"
              style={{ minHeight: '42px', fontSize: '0.8rem', width: '100%' }}
            >
              🔄 Reset Incident / Standby
            </button>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>A11y Profile:</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--blue-400)', textTransform: 'uppercase' }}>{a11yMode} Mode</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Phone Frame */}
      <div className="phone-mockup-wrapper animate-float-up">
        {/* Notch */}
        <div className="phone-notch"></div>

        {/* Status Bar */}
        <div className="phone-status-bar">
          <span style={{ fontSize: '0.72rem', letterSpacing: '-0.01em' }}>{timeStr}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>📶</span>
            <span>{isOnline ? 'LTE' : '🔇'}</span>
            <span>🔋 88%</span>
          </div>
        </div>

        {/* Screen Contents */}
        <div className="phone-screen-content" data-a11y={a11yMode}>
          {children}
        </div>
      </div>

    </div>
  )
}
