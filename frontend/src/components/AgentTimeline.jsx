import { useStore } from '../store/useStore'
import AgentCard from './AgentCard'

const INCIDENT_STATES = ['IDLE', 'DETECTED', 'TRIAGED', 'DISPATCHED', 'GUIDED', 'RESOLVED']

export default function AgentTimeline() {
  const { agents, incidentState } = useStore()
  const currentIdx = INCIDENT_STATES.indexOf(incidentState)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Incident State Machine */}
      <div className="glass-card-sm" style={{ padding: '14px 20px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 12 }}>
          INCIDENT STATE MACHINE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
          {INCIDENT_STATES.map((s, i) => {
            const isPast = i < currentIdx
            const isCurrent = i === currentIdx
            const isFuture = i > currentIdx
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < INCIDENT_STATES.length - 1 ? '1 1 0' : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 32, height: 32,
                    borderRadius: '50%',
                    border: `2px solid ${
                      isCurrent ? 'var(--red-500)' :
                      isPast    ? 'var(--green-500)' :
                      'var(--border)'
                    }`,
                    background: isCurrent ? 'rgba(255,59,48,0.15)' : isPast ? 'rgba(48,209,88,0.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem',
                    color: isCurrent ? 'var(--red-400)' : isPast ? 'var(--green-400)' : 'var(--text-muted)',
                    fontWeight: 700,
                    transition: 'all 0.4s var(--ease-out)',
                    animation: isCurrent ? 'pulse-glow 1.5s ease-in-out infinite' : 'none',
                    flexShrink: 0,
                  }}>
                    {isPast ? '✓' : i + 1}
                  </div>
                  <span style={{
                    fontSize: '0.6rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--red-400)' : isPast ? 'var(--green-400)' : 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.04em',
                  }}>
                    {s}
                  </span>
                </div>
                {i < INCIDENT_STATES.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: 2,
                    background: isPast ? 'var(--green-500)' : 'var(--border)',
                    marginBottom: 18,
                    transition: 'background 0.4s',
                    minWidth: 16,
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Agent grid */}
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 12 }}>
          AGENT ACTIVATION GRID — {agents.length} AGENTS
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
        }}>
          {agents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  )
}
