import { NavLink } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useOffline } from '../hooks/useOffline'

const NAV_LINKS = [
  { to: '/', label: 'Home', exact: true },
  { to: '/app', label: '📱 Mobile PWA' },
  { to: '/pwa', label: '📥 PWA Sandbox' },
  { to: '/demo', label: '⚡ Pitch Demo' },
  { to: '/dashboard', label: '📊 Mission Control' },
  { to: '/hazard', label: '⚠️ Hazard Report' },
  { to: '/demo-graph', label: '🕸️ Knowledge Graph' },
  { to: '/accessibility', label: '♿ Accessibility' },
]

export default function Nav() {
  const isOnline = useOffline()
  const { sosActive, incidentState, wsConnected } = useStore()

  return (
    <nav className="nav" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <NavLink to="/" className="nav-logo" id="nav-logo">
        <span style={{ fontSize: '1.4rem' }}>🛡️</span>
        <span>Road<span style={{ color: 'var(--red-500)' }}>Guardian</span> AI</span>
        {sosActive && (
          <span className="badge badge-red" style={{ marginLeft: 8, animation: 'pulse-glow 1s infinite' }}>
            ● ACTIVE
          </span>
        )}
      </NavLink>

      {/* Links */}
      <div className="nav-links" role="list">
        {NAV_LINKS.map(({ to, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            role="listitem"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Status indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 16 }}>
        {/* Backend connection */}
        <span
          className="badge"
          title={wsConnected ? 'Backend connected' : 'Backend offline — mock mode active'}
          style={{
            background: wsConnected ? 'rgba(48,209,88,0.12)' : 'rgba(255,159,10,0.12)',
            color: wsConnected ? 'var(--green-400)' : 'var(--amber-400)',
            border: `1px solid ${wsConnected ? 'rgba(48,209,88,0.3)' : 'rgba(255,159,10,0.3)'}`,
            fontSize: '0.68rem',
          }}
        >
          {wsConnected ? '● LIVE' : '◎ MOCK'}
        </span>

        {/* Network */}
        <span
          className={`badge ${isOnline ? 'badge-green' : 'badge-amber'}`}
          style={{ fontSize: '0.68rem' }}
        >
          {isOnline ? '● Online' : '◎ Offline'}
        </span>

        {/* Incident state */}
        {incidentState !== 'IDLE' && (
          <span className="badge badge-red" style={{ fontSize: '0.68rem' }}>
            {incidentState}
          </span>
        )}
      </div>
    </nav>
  )
}
