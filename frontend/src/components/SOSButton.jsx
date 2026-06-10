import { useState, useRef } from 'react'
import { useStore } from '../store/useStore'

export default function SOSButton({ onTrigger }) {
  const { sosActive } = useStore()
  const [holding, setHolding] = useState(false)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef(null)
  const holdDuration = 1500 // ms to hold

  const startHold = () => {
    if (sosActive) return
    setHolding(true)
    const startTime = Date.now()
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min(100, (elapsed / holdDuration) * 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(intervalRef.current)
        setHolding(false)
        setProgress(0)
        onTrigger && onTrigger()
      }
    }, 30)
  }

  const cancelHold = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setHolding(false)
    setProgress(0)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Pulse rings */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {(sosActive || holding) && (
          <>
            <div style={{
              position: 'absolute',
              width: 180, height: 180,
              borderRadius: '50%',
              border: '2px solid var(--red-500)',
              animation: 'pulse-ring 1.5s ease-out infinite',
              opacity: 0.6,
            }} />
            <div style={{
              position: 'absolute',
              width: 180, height: 180,
              borderRadius: '50%',
              border: '2px solid var(--red-500)',
              animation: 'pulse-ring 1.5s ease-out infinite',
              animationDelay: '0.5s',
              opacity: 0.4,
            }} />
            <div style={{
              position: 'absolute',
              width: 180, height: 180,
              borderRadius: '50%',
              border: '2px solid var(--red-500)',
              animation: 'pulse-ring 1.5s ease-out infinite',
              animationDelay: '1s',
              opacity: 0.2,
            }} />
          </>
        )}

        {/* Circular progress ring */}
        {holding && (
          <svg style={{ position: 'absolute', width: 200, height: 200, transform: 'rotate(-90deg)' }}>
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,59,48,0.2)" strokeWidth="6" />
            <circle
              cx="100" cy="100" r="90"
              fill="none"
              stroke="var(--red-500)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 30ms linear' }}
            />
          </svg>
        )}

        {/* Main Button */}
        <button
          id="sos-button"
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          aria-label={sosActive ? 'Emergency SOS Active' : 'Hold to activate Emergency SOS'}
          disabled={sosActive}
          style={{
            width: 160, height: 160,
            borderRadius: '50%',
            border: 'none',
            cursor: sosActive ? 'default' : 'pointer',
            background: sosActive
              ? 'radial-gradient(circle at 35% 35%, #FF5A52, #CC2F26)'
              : holding
              ? 'radial-gradient(circle at 35% 35%, #FF5A52, var(--red-500))'
              : 'radial-gradient(circle at 35% 35%, #FF5A52, var(--red-600))',
            boxShadow: sosActive
              ? '0 0 60px rgba(255,59,48,0.7), 0 0 120px rgba(255,59,48,0.3), inset 0 2px 0 rgba(255,255,255,0.2)'
              : holding
              ? '0 0 50px rgba(255,59,48,0.6), 0 0 100px rgba(255,59,48,0.25)'
              : '0 0 30px rgba(255,59,48,0.4), 0 8px 32px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.15)',
            transform: holding ? 'scale(0.96)' : 'scale(1)',
            transition: 'all 0.15s var(--ease-out)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            animation: sosActive ? 'pulse-glow 2s ease-in-out infinite' : 'none',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>🚨</span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: sosActive ? '1.5rem' : '2rem',
            color: '#fff',
            letterSpacing: '-0.02em',
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}>
            {sosActive ? 'ACTIVE' : 'SOS'}
          </span>
          {!sosActive && (
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500, letterSpacing: '0.08em' }}>
              HOLD TO ACTIVATE
            </span>
          )}
        </button>
      </div>

      {/* Help text */}
      {!sosActive && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', maxWidth: 220 }}>
          {holding
            ? `Activating... ${Math.round(progress)}%`
            : 'Hold the button for 1.5 seconds to trigger emergency response'
          }
        </p>
      )}
      {sosActive && (
        <p style={{ color: 'var(--red-400)', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
          Emergency active — AI agents coordinating rescue
        </p>
      )}
    </div>
  )
}
