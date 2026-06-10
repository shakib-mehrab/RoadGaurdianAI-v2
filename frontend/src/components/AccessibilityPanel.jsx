import { useStore } from '../store/useStore'

const A11Y_MODES = [
  {
    id: 'standard',
    icon: '👁️',
    label: 'Standard',
    desc: 'Default interface for all users',
    color: 'var(--blue-400)',
  },
  {
    id: 'low-vision',
    icon: '🔍',
    label: 'Low Vision',
    desc: 'Enhanced contrast + 35% larger text',
    color: 'var(--amber-400)',
  },
  {
    id: 'elderly',
    icon: '🧓',
    label: 'Elderly',
    desc: 'Larger tap targets + simplified layout',
    color: 'var(--green-400)',
  },
  {
    id: 'high-contrast',
    icon: '⬛',
    label: 'High Contrast',
    desc: 'Pure black/white for maximum visibility',
    color: 'var(--text-primary)',
  },
  {
    id: 'deaf',
    icon: '🦻',
    label: 'Deaf / HoH',
    desc: 'Visual-only alerts, vibration patterns, no audio',
    color: '#BF5AF2',
  },
]

export default function AccessibilityPanel() {
  const { a11yMode, setA11yMode } = useStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {A11Y_MODES.map((mode) => {
        const active = a11yMode === mode.id
        return (
          <button
            key={mode.id}
            id={`a11y-mode-${mode.id}`}
            onClick={() => setA11yMode(mode.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              background: active ? `rgba(${mode.id === 'high-contrast' ? '255,255,255' : '10,132,255'},0.07)` : 'var(--bg-elevated)',
              border: `1px solid ${active ? mode.color : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.2s var(--ease-out)',
              boxShadow: active ? `0 0 16px ${mode.color}22` : 'none',
            }}
          >
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{mode.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 700,
                fontSize: '0.9rem',
                color: active ? mode.color : 'var(--text-primary)',
                marginBottom: 2,
              }}>
                {mode.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {mode.desc}
              </div>
            </div>
            {active && (
              <div style={{
                width: 20, height: 20,
                borderRadius: '50%',
                background: mode.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem',
                color: '#000',
                fontWeight: 900,
                flexShrink: 0,
                animation: 'tick-in 0.3s var(--ease-spring)',
              }}>
                ✓
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
