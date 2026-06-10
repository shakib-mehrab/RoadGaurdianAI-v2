import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'

export default function InstallPrompt() {
  const { pwaInstallPrompt, pwaInstalled, setPwaInstalled } = useStore()
  const [dismissed, setDismissed] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Detect if device is running iOS
    const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(checkIOS)
  }, [])

  // If already installed, dismissed, or standalone mode, don't show the banner
  if (pwaInstalled || dismissed) return null

  const handleInstallClick = async () => {
    if (!pwaInstallPrompt) return

    pwaInstallPrompt.prompt()
    try {
      const { outcome } = await pwaInstallPrompt.userChoice
      console.log(`[PWA] Install prompt outcome: ${outcome}`)
      if (outcome === 'accepted') {
        setPwaInstalled(true)
      }
    } catch (err) {
      console.warn('[PWA] Installation prompt failed:', err)
    }
  }

  return (
    <div
      className="glass-card animate-float-up"
      style={{
        position: 'fixed',
        bottom: '80px', // Floating just above BottomNav (68px)
        left: '16px',
        right: '16px',
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(22,40,68,0.95) 0%, rgba(13,30,53,0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {/* Header / Dismiss */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '1.5rem' }}>📥</span>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Install RoadGuardian AI</h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Enable 100% offline first-aid RAG & background crash protection.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '1rem',
            cursor: 'pointer',
            padding: '4px',
            fontWeight: 700
          }}
          aria-label="Dismiss Install Banner"
        >
          ✕
        </button>
      </div>

      {/* Action Area */}
      <div>
        {pwaInstallPrompt ? (
          <button
            onClick={handleInstallClick}
            style={{
              width: '100%',
              padding: '10px',
              background: 'var(--red-500)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(255, 59, 48, 0.3)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--red-400)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--red-500)'}
          >
            Install Web App
          </button>
        ) : isIOS ? (
          <div 
            style={{ 
              fontSize: '0.7rem', 
              color: 'var(--amber-400)', 
              background: 'rgba(255,159,10,0.06)', 
              padding: '8px 12px', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid rgba(255,159,10,0.15)',
              lineHeight: 1.4
            }}
          >
            ℹ️ <strong>Safari iOS Installation:</strong> Tap the share button <span style={{ fontSize: '0.9rem' }}>📤</span> at the bottom of Safari, then select <strong>'Add to Home Screen'</strong>.
          </div>
        ) : (
          <div 
            style={{ 
              fontSize: '0.7rem', 
              color: 'var(--text-secondary)', 
              background: 'rgba(255,255,255,0.03)', 
              padding: '8px 12px', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--border)',
              lineHeight: 1.4
            }}
          >
            ℹ️ To install this app, open your browser options and click <strong>'Install App'</strong> or <strong>'Add to Home Screen'</strong>.
          </div>
        )}
      </div>
    </div>
  )
}
