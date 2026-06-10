import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'

const A11Y_MODES = [
  {
    id: 'standard',
    icon: '👁️',
    label: 'Standard Profile',
    desc: 'Default interface layout. Standard contrast, typography, and response streams designed for normal screen readability.',
    color: 'var(--blue-400)',
    tags: ['Default', 'All Users']
  },
  {
    id: 'low-vision',
    icon: '🔍',
    label: 'Low Vision Profile',
    desc: 'Increases base font size by 35% and boosts contrast ratios to conform with WCAG 2.1 AAA guidelines. Boldens key indicators.',
    color: 'var(--amber-400)',
    tags: ['Big Text', 'AAA Contrast']
  },
  {
    id: 'elderly',
    icon: '🧓',
    label: 'Elderly Assistant',
    desc: 'Enlarges tap targets to at least 60px, simplifies dashboard panels, and uses large icons for stress-free emergency input.',
    color: 'var(--green-400)',
    tags: ['Simple UI', 'Big Buttons']
  },
  {
    id: 'high-contrast',
    icon: '⬛',
    label: 'High Contrast Profile',
    desc: 'Overrides variables to pure blacks, whites, and high-intensity yellows. Eliminates non-critical gradients and shadows.',
    color: 'var(--text-primary)',
    tags: ['Monochrome', 'Tactical']
  },
  {
    id: 'deaf',
    icon: '🦻',
    label: 'Deaf & Hard of Hearing',
    desc: 'Mutes audio assists. Introduces prominent flash alerts, live captions for dispatcher notes, and custom vibration warning patterns.',
    color: '#BF5AF2',
    tags: ['Flash Alerts', 'Captions']
  },
]

export default function Accessibility() {
  const { a11yMode, setA11yMode } = useStore()
  const [ttsVolume, setTtsVolume] = useState(80)
  const [vibrationFeedback, setVibrationFeedback] = useState(true)
  const [screenReaderBorder, setScreenReaderBorder] = useState(false)

  // Update HTML data-a11y attribute on change
  useEffect(() => {
    document.documentElement.setAttribute('data-a11y', a11yMode)
  }, [a11yMode])

  const testVibration = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
      alert('Vibration feedback active! (100ms pulse, 50ms pause, 100ms pulse)')
    } else {
      alert('Mock Haptic Feedback: Short-pulse vibration triggered on device.')
    }
  }

  return (
    <div className="page-container" style={{ paddingTop: '88px', paddingRight: '16px', paddingBottom: '24px', paddingLeft: '16px', background: 'var(--bg-primary)', minHeight: '92vh' }}>
      
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900 }}>
          ♿ Accessibility Center
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Customize typography, contrasts, and feedback methods to suit your situational requirements.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
        
        {/* Main mode selectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {A11Y_MODES.map((mode) => {
            const active = a11yMode === mode.id
            return (
              <div
                key={mode.id}
                onClick={() => setA11yMode(mode.id)}
                style={{
                  padding: 20,
                  background: active ? `rgba(${mode.id === 'high-contrast' ? '255,255,255' : '10,132,255'},0.05)` : 'var(--bg-elevated)',
                  border: `2px solid ${active ? mode.color : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'all 0.25s var(--ease-out)',
                  boxShadow: active ? `0 0 20px ${mode.color}22` : 'none',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start'
                }}
              >
                <span style={{ fontSize: '2.2rem', flexShrink: 0, marginTop: 4 }}>{mode.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: active ? mode.color : 'var(--text-primary)' }}>
                      {mode.label}
                    </h2>
                    {active && <span style={{ color: mode.color, fontWeight: 'bold', fontSize: '0.9rem' }}>✓ Active</span>}
                  </div>
                  
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                    {mode.desc}
                  </p>

                  <div style={{ display: 'flex', gap: 6 }}>
                    {mode.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.62rem',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Fine Tuning Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div className="glass-card" style={{ padding: 24, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              Fine-Tune Settings
            </h2>

            {/* TTS volume */}
            <div>
              <label htmlFor="tts-range" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
                <span>Voice Guidance Volume</span>
                <span>{ttsVolume}%</span>
              </label>
              <input
                id="tts-range"
                type="range"
                min="0"
                max="100"
                value={ttsVolume}
                onChange={e => setTtsVolume(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--blue-500)',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={vibrationFeedback}
                  onChange={e => setVibrationFeedback(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--red-500)' }}
                />
                <div>
                  <strong>Haptic Pulse Feedback</strong>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Vibrate device during important timer updates</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={screenReaderBorder}
                  onChange={e => setScreenReaderBorder(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--blue-500)' }}
                />
                <div>
                  <strong>High-Focus Borders</strong>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Render thick high-visibility outlines on active elements</span>
                </div>
              </label>
            </div>

            {/* Test buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={testVibration}
                className="btn btn-ghost"
                style={{ minHeight: 40, width: '100%', fontSize: '0.82rem', justifyContent: 'center' }}
              >
                📳 Test Vibration Feedback
              </button>
            </div>
          </div>

          {/* Visual Demo Card */}
          <div className="glass-card" style={{ padding: 24, border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              Live Visual Preview
            </h2>
            <div
              style={{
                padding: 16,
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 'var(--radius-md)',
                border: screenReaderBorder ? '3px solid var(--blue-400)' : '1px solid var(--border)'
              }}
            >
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Preview Card</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                This is a live representation of text components inside the Mission Control stream. It scales automatically based on your active profile parameters.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
