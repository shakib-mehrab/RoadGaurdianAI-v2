import { useStore } from '../store/useStore'
import { MapPin, Radio, Heart, Star } from 'lucide-react'

export default function HospitalPanel() {
  const { hospitals } = useStore()

  if (!hospitals || hospitals.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <MapPin size={32} style={{ color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Nearest hospitals will appear after location is confirmed
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card animate-float-up" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <MapPin size={18} style={{ color: 'var(--blue-400)' }} />
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
              flexDirection: 'column',
              gap: 8,
              padding: '14px 16px',
              background: i === 0 ? 'rgba(255,159,10,0.05)' : 'var(--bg-elevated)',
              border: `1.5px solid ${i === 0 ? 'var(--amber-400)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              animation: `slide-in-right 0.4s var(--ease-out) ${i * 0.15}s both`,
              transition: 'all 0.2s',
              boxShadow: i === 0 ? '0 0 12px rgba(255,159,10,0.1)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Rank */}
              <div style={{
                width: 28, height: 28,
                borderRadius: '50%',
                background: i === 0 ? 'rgba(255,159,10,0.2)' : 'var(--bg-card)',
                border: `1px solid ${i === 0 ? 'var(--amber-400)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: i === 0 ? 'var(--amber-400)' : 'var(--text-muted)',
                flexShrink: 0,
              }}>
                {i === 0 ? '★' : i + 1}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {i === 0 && (
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--amber-400)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
                    RECOMMENDED BY AI (Trauma Prepared)
                  </div>
                )}
                <div style={{
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                  marginBottom: 2,
                }}>
                  {h.name}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className="badge badge-blue" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                    {h.type}
                  </span>
                  {h.accessible && (
                    <span className="badge badge-green" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                      Accessible
                    </span>
                  )}
                  {h.blood && (
                    <span className="badge badge-red" style={{ fontSize: '0.62rem', padding: '1px 6px', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Heart size={8} fill="currentColor" /> Blood Bank
                    </span>
                  )}
                  {h.traumaBeds !== undefined && (
                    <span className="badge badge-amber" style={{ fontSize: '0.62rem', padding: '1px 6px', fontWeight: 800 }}>
                      {h.traumaBeds} Beds Free
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
                  color: i === 0 ? 'var(--amber-400)' : 'var(--text-primary)',
                }}>
                  {h.eta}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{h.dist}</div>
              </div>
            </div>

            {/* Specialist availability */}
            {h.specialists && h.specialists.length > 0 && (
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>ON-DUTY:</span>
                {h.specialists.map((spec, sIdx) => (
                  <span key={sIdx} style={{ background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    {spec}
                  </span>
                ))}
              </div>
            )}

            {/* Recommendation reason */}
            {h.recommendationReason && (
              <div style={{ fontSize: '0.7rem', color: i === 0 ? 'var(--amber-300)' : 'var(--text-secondary)', padding: '6px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.03)', fontStyle: 'italic' }}>
                Reason: {h.recommendationReason}
              </div>
            )}
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
        <Radio size={14} style={{ color: 'var(--blue-400)' }} />
        <span>Ambulance dispatched to {hospitals[0]?.name} via MCP protocol</span>
      </div>
    </div>
  )
}
