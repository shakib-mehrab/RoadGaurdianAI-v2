import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Home, ShieldAlert, Activity, AlertOctagon, Settings } from 'lucide-react'

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { sosActive } = useStore()

  const tabs = [
    { id: 'home', path: '/', label: 'Home', icon: Home },
    { id: 'sos', path: '/emergency', label: 'SOS Dispatch', icon: ShieldAlert, badge: sosActive },
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: Activity },
    { id: 'hazard', path: '/hazard', label: 'Hazards', icon: AlertOctagon },
    { id: 'accessibility', path: '/accessibility', label: 'Settings', icon: Settings }
  ]

  const handleNavigation = (path) => {
    navigate(path)
  }

  return (
    <nav 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '68px',
        background: 'rgba(10, 22, 40, 0.95)',
        backdropFilter: 'blur(20px) saturate(1.5)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
        paddingBottom: 'safe-area-inset-bottom'
      }}
      aria-label="Mobile Bottom Navigation"
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path || (tab.path === '/' && location.pathname === '/emergency') // Map fallback
        const Icon = tab.icon
        
        // Specific coloring for active states
        const activeColor = tab.id === 'sos' ? 'var(--red-400)' : 'var(--blue-400)'
        const normalColor = 'var(--text-secondary)'

        return (
          <button
            key={tab.id}
            onClick={() => handleNavigation(tab.path)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: isActive ? activeColor : normalColor,
              cursor: 'pointer',
              flex: 1,
              height: '100%',
              fontSize: '0.65rem',
              fontWeight: 700,
              position: 'relative',
              outline: 'none',
              transition: 'color 0.2s ease'
            }}
          >
            {/* Icon */}
            <Icon 
              size={20}
              style={{ 
                transform: isActive ? 'scale(1.15)' : 'scale(1)',
                transition: 'transform 0.2s ease',
                color: isActive ? activeColor : normalColor
              }}
            />

            {/* Label */}
            <span>{tab.label}</span>

            {/* Badge Indicator */}
            {tab.badge && (
              <span 
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: 'calc(50% - 16px)',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--red-500)',
                  boxShadow: '0 0 8px var(--red-glow)',
                  animation: 'pulse-glow 1s infinite'
                }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
