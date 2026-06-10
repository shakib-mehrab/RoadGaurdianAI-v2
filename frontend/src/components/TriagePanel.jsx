import { useStore } from '../store/useStore'
import { Activity, AlertTriangle } from 'lucide-react'

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
      <div className="glass-card" style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <Activity size={32} style={{ color: 'var(--text-muted)' }} />
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
        <Activity size={24} style={{ color: 'var(--blue-400)' }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
            Triage Assessment
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Medical AI evaluation complete</div>
        </div>

        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            Level {triageResult.severity}/5 • Confidence {Math.round(triageResult.confidence * 100)}%
          </span>
        </div>
      </div>

      {/* AI Triage Severity Ring and Priority Row */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: 16 }}>
        {/* SVG Circular Ring for Score */}
        <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
          <svg width="56" height="56" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="3.5"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={cfg.color}
              strokeWidth="3.5"
              strokeDasharray={`${triageResult.triageScore || 87}, 100`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s ease-out' }}
            />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.82rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#fff' }}>
            {triageResult.triageScore || 87}%
          </div>
        </div>

        {/* Priority Level Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Severity Score</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#fff' }}>
              {triageResult.triageScore || 87}/100
            </span>
            <span style={{
              fontSize: '0.65rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              background: cfg.bg,
              color: cfg.color,
              border: `1px solid ${cfg.border}`,
              fontWeight: 800,
              letterSpacing: '0.04em',
              animation: triageResult.severity >= 4 ? 'pulse-glow 1.5s infinite' : 'none',
            }}>
              {triageResult.priorityLevel || cfg.label}
            </span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Recommended Dispatch Priority: <strong style={{ color: cfg.color }}>{triageResult.priorityLevel || cfg.label}</strong>
          </div>
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
          <AlertTriangle size={18} style={{ color: 'var(--red-400)', flexShrink: 0 }} />
          <span style={{ color: 'var(--red-400)', fontWeight: 700, fontSize: '0.85rem' }}>
            DO NOT MOVE THE PATIENT — Possible spinal injury
          </span>
        </div>
      )}

      {/* Diagnostic conditions */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>
          AI DIAGNOSTIC CONDITIONS SUMMARY
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(triageResult.conditions || ['Head trauma risk', 'Fracture risk', 'Consciousness uncertain']).map((cond, i) => (
            <span key={i} className="badge badge-blue" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
              {cond}
            </span>
          ))}
        </div>
      </div>

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
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={14} style={{ color: 'var(--amber-400)' }} />
            <span>WARNINGS</span>
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
