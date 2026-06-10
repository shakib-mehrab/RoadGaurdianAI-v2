import { useStore } from '../store/useStore'

const SEVERITY_CONFIG = {
  1: { label: 'MINOR',    color: 'var(--green-400)',  bg: 'rgba(48,209,88,0.1)',    border: 'rgba(48,209,88,0.3)' },
  2: { label: 'MODERATE', color: 'var(--blue-400)',   bg: 'rgba(10,132,255,0.1)',   border: 'rgba(10,132,255,0.3)' },
  3: { label: 'SERIOUS',  color: 'var(--amber-400)',  bg: 'rgba(255,159,10,0.1)',   border: 'rgba(255,159,10,0.3)' },
  4: { label: 'CRITICAL', color: 'var(--red-400)',    bg: 'rgba(255,59,48,0.1)',    border: 'rgba(255,59,48,0.3)' },
  5: { label: 'FATAL',    color: '#FF2D20',           bg: 'rgba(255,45,32,0.15)',   border: 'rgba(255,45,32,0.4)' },
}

export default function TriagePanel() {
  const { triageResult } = useStore()

  if (!triageResult) {
    return (
      <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>🩺</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Triage assessment will appear after SOS is triggered
        </p>
      </div>
    )
  }

  const cfg = SEVERITY_CONFIG[triageResult.severity] || SEVERITY_CONFIG[3]

  return (
    <div className="glass-card animate-float-up" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: '1.4rem' }}>🩺</span>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
            Triage Assessment
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Medical AI evaluation complete</div>
        </div>

        {/* Severity badge */}
        <div style={{
          marginLeft: 'auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        }}>
          <div style={{
            padding: '6px 16px',
            borderRadius: 'var(--radius-md)',
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            color: cfg.color,
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: '1rem',
            letterSpacing: '0.04em',
            animation: triageResult.severity >= 4 ? 'pulse-glow 1.5s infinite' : 'none',
          }}>
            {cfg.label}
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            Level {triageResult.severity}/5 • Confidence {Math.round(triageResult.confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Do not move warning */}
      {triageResult.doNotMove && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(255,59,48,0.1)',
          border: '1px solid rgba(255,59,48,0.35)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 16,
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <span style={{ fontSize: '1.1rem' }}>⚠️</span>
          <span style={{ color: 'var(--red-400)', fontWeight: 700, fontSize: '0.85rem' }}>
            DO NOT MOVE THE PATIENT — Possible spinal injury
          </span>
        </div>
      )}

      {/* Injuries */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>
          IDENTIFIED INJURIES
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {triageResult.injuries.map((inj, i) => (
            <span key={i} className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
              {inj}
            </span>
          ))}
        </div>
      </div>

      {/* Immediate actions */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>
          IMMEDIATE ACTIONS
        </div>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {triageResult.actions.map((action, i) => (
            <li key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              fontSize: '0.82rem', color: 'var(--text-secondary)',
              padding: '6px 10px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              animation: `slide-in-left 0.4s var(--ease-out) ${i * 0.1}s both`,
            }}>
              <span style={{
                width: 20, height: 20,
                borderRadius: '50%',
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.color,
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{i + 1}</span>
              <span>{action}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Warnings */}
      {triageResult.warnings && triageResult.warnings.length > 0 && (
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>
            ⚠️ WARNINGS
          </div>
          {triageResult.warnings.map((w, i) => (
            <div key={i} style={{
              fontSize: '0.8rem', color: 'var(--amber-400)',
              padding: '6px 10px',
              background: 'rgba(255,159,10,0.08)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255,159,10,0.2)',
              marginBottom: 4,
            }}>
              {w}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
