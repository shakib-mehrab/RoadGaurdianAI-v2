import { useStore } from '../store/useStore'

export default function HospitalPanel() {
  const { hospitals } = useStore()

  if (!hospitals || hospitals.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>📍</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Nearest hospitals will appear after location is confirmed
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card animate-float-up" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: '1.2rem' }}>📍</span>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>
            Nearest Medical Facilities
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Ranked by: accessibility + ETA + specialization
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {hospitals.map((h, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              background: i === 0 ? 'rgba(48,209,88,0.06)' : 'var(--bg-elevated)',
              border: `1px solid ${i === 0 ? 'rgba(48,209,88,0.25)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              animation: `slide-in-right 0.4s var(--ease-out) ${i * 0.15}s both`,
              transition: 'all 0.2s',
            }}
          >
            {/* Rank */}
            <div style={{
              width: 28, height: 28,
              borderRadius: '50%',
              background: i === 0 ? 'rgba(48,209,88,0.2)' : 'var(--bg-card)',
              border: `1px solid ${i === 0 ? 'rgba(48,209,88,0.4)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: i === 0 ? 'var(--green-400)' : 'var(--text-muted)',
              flexShrink: 0,
            }}>
              {i === 0 ? '★' : i + 1}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 600,
                fontSize: '0.85rem',
                color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                marginBottom: 2,
              }}>
                {h.name}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-blue" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                  {h.type}
                </span>
                {h.accessible && (
                  <span className="badge badge-green" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                    ♿ Accessible
                  </span>
                )}
                {h.blood && (
                  <span className="badge badge-red" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                    🩸 Blood Bank
                  </span>
                )}
              </div>
            </div>

            {/* ETA + Distance */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1rem',
                color: i === 0 ? 'var(--green-400)' : 'var(--text-primary)',
              }}>
                {h.eta}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{h.dist}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch indicator */}
      <div style={{
        marginTop: 14,
        padding: '8px 12px',
        background: 'rgba(10,132,255,0.08)',
        border: '1px solid rgba(10,132,255,0.2)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.75rem',
        color: 'var(--blue-400)',
        display: 'flex', gap: 6, alignItems: 'center',
      }}>
        <span>📡</span>
        <span>Ambulance dispatched to {hospitals[0]?.name} via MCP protocol</span>
      </div>
    </div>
  )
}
