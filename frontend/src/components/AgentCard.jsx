import { useStore } from '../store/useStore'

export default function AgentCard({ agent }) {
  const { agentStatuses, agentLogs, agentProgress } = useStore()
  const status = agentStatuses[agent.id] || 'idle'
  const logs = agentLogs[agent.id] || []
  const progress = agentProgress[agent.id] || 0

  const statusConfig = {
    idle:   { label: 'Idle',       dotClass: 'idle',   badgeClass: 'badge-muted' },
    active: { label: 'Processing', dotClass: 'active',  badgeClass: 'badge-amber' },
    done:   { label: 'Complete',   dotClass: 'done',    badgeClass: 'badge-green' },
    error:  { label: 'Error',      dotClass: 'error',   badgeClass: 'badge-red' },
  }
  const { label, dotClass, badgeClass } = statusConfig[status] || statusConfig.idle

  const isActive = status === 'active'
  const isDone = status === 'done'

  return (
    <div
      className={`glass-card animate-agent-wake`}
      style={{
        padding: 16,
        border: `1px solid ${
          isActive ? `rgba(255,159,10,0.4)` :
          isDone   ? `rgba(48,209,88,0.3)` :
          'var(--border)'
        }`,
        boxShadow: isActive ? `0 0 20px rgba(255,159,10,0.1)` :
                   isDone   ? `0 0 16px rgba(48,209,88,0.08)` : 'none',
        transition: 'all 0.3s var(--ease-out)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minHeight: 160,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '1.4rem' }}>{agent.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: isDone ? agent.color : isActive ? agent.color : 'var(--text-primary)',
            }}>
              {agent.name}
            </span>
            <span className={`badge ${badgeClass}`} style={{ fontSize: '0.6rem', padding: '2px 7px' }}>
              <span className={`status-dot ${dotClass}`} style={{ width: 6, height: 6 }} />
              {label}
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: 1 }}>
            {agent.desc}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {(isActive || isDone) && (
        <div className="confidence-bar">
          <div
            className="confidence-bar-fill"
            style={{
              width: `${progress}%`,
              background: isDone
                ? 'linear-gradient(90deg, var(--green-500), var(--green-400))'
                : `linear-gradient(90deg, ${agent.color}, ${agent.color}aa)`,
            }}
          />
        </div>
      )}

      {/* Log messages */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        maxHeight: 100,
        overflowY: 'auto',
      }} className="scroll-y">
        {logs.length === 0 ? (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>
            Waiting for activation...
          </span>
        ) : (
          logs.map((msg, i) => (
            <div
              key={i}
              className="animate-slide-up"
              style={{
                fontSize: '0.72rem',
                color: i === logs.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                lineHeight: 1.5,
                display: 'flex',
                gap: 6,
                alignItems: 'flex-start',
              }}
            >
              <span style={{
                color: i === logs.length - 1 ? agent.color : 'var(--text-muted)',
                flexShrink: 0,
                marginTop: 2,
              }}>›</span>
              <span>{msg}</span>
            </div>
          ))
        )}
        {isActive && (
          <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: 4, height: 4,
                borderRadius: '50%',
                background: agent.color,
                animation: `pulse-glow 1s ease-in-out ${i * 0.2}s infinite`,
                display: 'inline-block',
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
