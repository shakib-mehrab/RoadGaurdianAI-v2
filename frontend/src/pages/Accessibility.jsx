import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { Accessibility as AccessibilityIcon, Eye, ZoomIn, Heart, Contrast, VolumeX, Smartphone, ShieldAlert, Award, QrCode, Download, Check } from 'lucide-react'
 
const A11Y_MODES = [
  {
    id: 'standard',
    icon: Eye,
    label: 'Standard Profile',
    desc: 'Default interface layout. Standard contrast, typography, and response streams designed for normal screen readability.',
    color: 'var(--blue-400)',
    tags: ['Default', 'All Users']
  },
  {
    id: 'low-vision',
    icon: ZoomIn,
    label: 'Low Vision Profile',
    desc: 'Increases base font size by 35% and boosts contrast ratios to conform with WCAG 2.1 AAA guidelines. Boldens key indicators.',
    color: 'var(--amber-400)',
    tags: ['Big Text', 'AAA Contrast']
  },
  {
    id: 'elderly',
    icon: Heart,
    label: 'Elderly Assistant',
    desc: 'Enlarges tap targets to at least 60px, simplifies dashboard panels, and uses large icons for stress-free emergency input.',
    color: 'var(--green-400)',
    tags: ['Simple UI', 'Big Buttons']
  },
  {
    id: 'high-contrast',
    icon: Contrast,
    label: 'High Contrast Profile',
    desc: 'Overrides variables to pure blacks, whites, and high-intensity yellows. Eliminates non-critical gradients and shadows.',
    color: 'var(--text-primary)',
    tags: ['Monochrome', 'Tactical']
  },
  {
    id: 'deaf',
    icon: VolumeX,
    label: 'Deaf & Hard of Hearing',
    desc: 'Mutes audio assists. Introduces prominent flash alerts, live captions for dispatcher notes, and custom vibration warning patterns.',
    color: '#BF5AF2',
    tags: ['Flash Alerts', 'Captions']
  },
]

export default function Accessibility() {
  const { a11yMode, setA11yMode, userProfile, updateProfile } = useStore()
  const [ttsVolume, setTtsVolume] = useState(80)
  const [vibrationFeedback, setVibrationFeedback] = useState(true)
  const [screenReaderBorder, setScreenReaderBorder] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState('a11y') // 'a11y' | 'medical-id'

  // Form states for Medical ID
  const [formValues, setFormValues] = useState({
    name: userProfile.name || '',
    age: userProfile.age || '',
    bloodGroup: userProfile.bloodGroup || '',
    allergies: userProfile.allergies || '',
    chronicDiseases: userProfile.chronicDiseases || '',
    medications: userProfile.medications || '',
    emergencyContactName: userProfile.emergencyContactName || '',
    emergencyContactRole: userProfile.emergencyContactRole || '',
    emergencyContactPhone: userProfile.emergencyContactPhone || '',
    insuranceProvider: userProfile.insuranceProvider || '',
    policyNumber: userProfile.policyNumber || ''
  })
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [qrDownloading, setQrDownloading] = useState(false)

  // Update HTML data-a11y attribute on change
  useEffect(() => {
    document.documentElement.setAttribute('data-a11y', a11yMode)
  }, [a11yMode])

  const testVibration = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
      alert('Vibration feedback active! (100ms pulse, 50ms pause, 100ms pulse)')
    } else {
      alert('Mock Haptic Feedback: Short-pulse vibration triggered on device.')
    }
  }

  const handleProfileSave = (e) => {
    e.preventDefault()
    updateProfile(formValues)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleQrDownload = () => {
    setQrDownloading(true)

    try {
      const W = 390
      const H = 844  // iPhone proportions
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, '#1e1330')
      grad.addColorStop(1, '#0d0a14')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // Notch
      ctx.fillStyle = '#222222'
      ctx.beginPath()
      ctx.roundRect(W / 2 - 55, 0, 110, 28, [0, 0, 10, 10])
      ctx.fill()

      // Time
      ctx.fillStyle = 'rgba(255,255,255,0.92)'
      ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('04:35', W / 2, 140)

      // Date
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.font = '500 18px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.fillText('Wednesday, June 10', W / 2, 170)

      // --- Medical ID Card ---
      const cardX = 28, cardY = 220, cardW = W - 56, cardH = 370
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(cardX, cardY, cardW, cardH, 18)
      ctx.fillStyle = 'rgba(255,59,48,0.10)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,59,48,0.40)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.restore()

      // Card header
      ctx.fillStyle = '#ff453a'
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('⛨  EMERGENCY MEDICAL ID', W / 2, cardY + 28)

      // QR pattern (simplified block art)
      const qrX = W / 2 - 60, qrY = cardY + 42, qrSize = 120
      ctx.fillStyle = '#ffffff'
      ctx.roundRect ? ctx.beginPath() : null
      ctx.fillRect(qrX, qrY, qrSize, qrSize)
      ctx.fillStyle = '#111111'
      // TL finder
      ctx.fillRect(qrX + 5, qrY + 5, 25, 25)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(qrX + 9, qrY + 9, 17, 17)
      ctx.fillStyle = '#111111'
      ctx.fillRect(qrX + 12, qrY + 12, 11, 11)
      // TR finder
      ctx.fillStyle = '#111111'
      ctx.fillRect(qrX + 90, qrY + 5, 25, 25)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(qrX + 94, qrY + 9, 17, 17)
      ctx.fillStyle = '#111111'
      ctx.fillRect(qrX + 97, qrY + 12, 11, 11)
      // BL finder
      ctx.fillStyle = '#111111'
      ctx.fillRect(qrX + 5, qrY + 90, 25, 25)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(qrX + 9, qrY + 94, 17, 17)
      ctx.fillStyle = '#111111'
      ctx.fillRect(qrX + 12, qrY + 97, 11, 11)
      // Data modules
      const modules = [[35,8,30,4],[8,35,4,30],[35,15,8,8],[47,18,12,6],[35,27,18,8],[60,30,8,12],[40,45,20,8],[15,45,12,12],[20,60,8,6],[75,45,10,15],[85,65,8,8],[45,65,15,20],[68,75,12,12],[5,60,6,6]]
      modules.forEach(([x, y, w, h]) => ctx.fillRect(qrX + x, qrY + y, w, h))

      // Vitals
      const lineY = cardY + 180
      const lineH = 36
      const vitals = [
        ['Patient', formValues.name || 'Riya Akter'],
        ['Age / Blood', `${formValues.age || '24'} yrs  •  ${formValues.bloodGroup || 'O+'}`],
        ['Allergies', formValues.allergies || 'Penicillin'],
        ['ICE Contact', formValues.emergencyContactPhone || '+880-171-XXX-XXXX'],
        ['Chronic', formValues.chronicDiseases || 'None'],
        ['Medications', formValues.medications || 'None'],
        ['Insurer', formValues.insuranceProvider || 'Pragati Insurance'],
      ]
      vitals.forEach(([label, value], i) => {
        const y = lineY + i * lineH
        // separator
        if (i > 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.06)'
          ctx.fillRect(cardX + 12, y - 2, cardW - 24, 1)
        }
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '500 12px -apple-system, BlinkMacSystemFont, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(label, cardX + 16, y + 14)
        ctx.fillStyle = label === 'Allergies' ? '#ff453a' : 'rgba(255,255,255,0.9)'
        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(value, cardX + cardW - 16, y + 14)
      })

      // RoadGuardian watermark
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.font = '600 11px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('🛡 RoadGuardian AI  •  Scan to view live vitals', W / 2, cardY + cardH - 12)

      // Swipe indicator
      ctx.fillStyle = 'rgba(255,255,255,0.30)'
      ctx.font = '500 12px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Swipe up to unlock', W / 2, H - 30)

      // Download
      const link = document.createElement('a')
      link.download = `RoadGuardian-MedicalID-${(formValues.name || 'lockscreen').replace(/\s+/g, '_')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Canvas download error:', err)
      alert('Could not generate lockscreen image. Try a different browser.')
    } finally {
      setQrDownloading(false)
    }
  }

  // QR Code SVG Drawing
  const QRCodeSVG = () => (
    <svg width="120" height="120" viewBox="0 0 100 100" style={{ background: '#fff', padding: 8, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      {/* Finder patterns */}
      <rect x="5" y="5" width="25" height="25" fill="#111" />
      <rect x="10" y="10" width="15" height="15" fill="#fff" />
      <rect x="13" y="13" width="9" height="9" fill="#111" />

      <rect x="70" y="5" width="25" height="25" fill="#111" />
      <rect x="75" y="10" width="15" height="15" fill="#fff" />
      <rect x="78" y="13" width="9" height="9" fill="#111" />

      <rect x="5" y="70" width="25" height="25" fill="#111" />
      <rect x="10" y="75" width="15" height="15" fill="#fff" />
      <rect x="13" y="78" width="9" height="9" fill="#111" />

      {/* timing blocks */}
      <rect x="35" y="8" width="30" height="4" fill="#111" />
      <rect x="8" y="35" width="4" height="30" fill="#111" />
      
      <rect x="35" y="15" width="8" height="8" fill="#111" />
      <rect x="47" y="18" width="12" height="6" fill="#111" />
      <rect x="35" y="27" width="18" height="8" fill="#111" />
      
      <rect x="60" y="30" width="8" height="12" fill="#111" />
      <rect x="40" y="45" width="20" height="8" fill="#111" />
      
      <rect x="15" y="45" width="12" height="12" fill="#111" />
      <rect x="20" y="60" width="8" height="6" fill="#111" />
      
      <rect x="75" y="45" width="10" height="15" fill="#111" />
      <rect x="85" y="65" width="8" height="8" fill="#111" />
      <rect x="45" y="65" width="15" height="20" fill="#111" />
      <rect x="68" y="75" width="12" height="12" fill="#111" />
      <rect x="82" y="82" width="10" height="10" fill="#111" />
      <rect x="5" y="60" width="6" height="6" fill="#111" />
      <rect x="60" y="5" width="6" height="6" fill="#111" />
    </svg>
  )

  return (
    <div className="page-container" style={{ paddingTop: '88px', paddingRight: '16px', paddingBottom: '24px', paddingLeft: '16px', background: 'var(--bg-primary)', minHeight: '92vh' }}>
      
      {/* Page Title */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AccessibilityIcon size={28} style={{ color: 'var(--blue-400)' }} /> 
          <span>Accessibility &amp; Vitals Center</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Configure emergency profiles, store Medical ID records, and download lockscreen quick-response vital cards.
        </p>
      </div>

      {/* Sub-tab selection row */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveSubTab('a11y')}
          style={{
            padding: '8px 16px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: activeSubTab === 'a11y' ? 'rgba(10, 132, 255, 0.12)' : 'transparent',
            border: activeSubTab === 'a11y' ? '1px solid var(--blue-400)' : '1px solid transparent',
            color: activeSubTab === 'a11y' ? 'var(--blue-400)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <AccessibilityIcon size={14} />
          <span>Accessibility Profiles</span>
        </button>
        <button
          onClick={() => setActiveSubTab('medical-id')}
          style={{
            padding: '8px 16px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: activeSubTab === 'medical-id' ? 'rgba(48, 209, 88, 0.12)' : 'transparent',
            border: activeSubTab === 'medical-id' ? '1px solid var(--green-400)' : '1px solid transparent',
            color: activeSubTab === 'medical-id' ? 'var(--green-400)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <QrCode size={14} />
          <span>Emergency Medical ID Vault &amp; QR Card</span>
        </button>
      </div>

      {activeSubTab === 'a11y' ? (
        /* ACCESSIBILITY PROFILES VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }} className="animate-fade-in">
          {/* Main mode selectors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {A11Y_MODES.map((mode) => {
              const active = a11yMode === mode.id
              const IconComponent = mode.icon
              return (
                <div
                  key={mode.id}
                  onClick={() => setA11yMode(mode.id)}
                  style={{
                    padding: 20,
                    background: active ? `rgba(${mode.id === 'high-contrast' ? '255,255,255' : '10,132,255'},0.05)` : 'var(--bg-elevated)',
                    border: `2px solid ${active ? mode.color : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    transition: 'all 0.25s var(--ease-out)',
                    boxShadow: active ? `0 0 20px ${mode.color}22` : 'none',
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{
                    flexShrink: 0,
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${active ? mode.color : 'var(--border)'}`
                  }}>
                    <IconComponent size={24} style={{ color: active ? mode.color : 'var(--text-secondary)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: active ? mode.color : 'var(--text-primary)' }}>
                        {mode.label}
                      </h2>
                      {active && <span style={{ color: mode.color, fontWeight: 'bold', fontSize: '0.9rem' }}>✓ Active</span>}
                    </div>
                    
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                      {mode.desc}
                    </p>

                    <div style={{ display: 'flex', gap: 6 }}>
                      {mode.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.62rem',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Fine Tuning Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="glass-card" style={{ padding: 24, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                Fine-Tune Settings
              </h2>

              {/* TTS volume */}
              <div>
                <label htmlFor="tts-range" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
                  <span>Voice Guidance Volume</span>
                  <span>{ttsVolume}%</span>
                </label>
                <input
                  id="tts-range"
                  type="range"
                  min="0"
                  max="100"
                  value={ttsVolume}
                  onChange={e => setTtsVolume(Number(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'var(--blue-500)',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={vibrationFeedback}
                    onChange={e => setVibrationFeedback(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--red-500)' }}
                  />
                  <div>
                    <strong>Haptic Pulse Feedback</strong>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Vibrate device during important timer updates</span>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={screenReaderBorder}
                    onChange={e => setScreenReaderBorder(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--blue-500)' }}
                  />
                  <div>
                    <strong>High-Focus Borders</strong>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Render thick high-visibility outlines on active elements</span>
                  </div>
                </label>
              </div>

              {/* Test buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={testVibration}
                  className="btn btn-ghost"
                  style={{ minHeight: 40, width: '100%', fontSize: '0.82rem', justifyContent: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Smartphone size={16} />
                    <span>Test Vibration Feedback</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Visual Demo Card */}
            <div className="glass-card" style={{ padding: 24, border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                Live Visual Preview
              </h2>
              <div
                style={{
                  padding: 16,
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-md)',
                  border: screenReaderBorder ? '3px solid var(--blue-400)' : '1px solid var(--border)'
                }}
              >
                <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Preview Card</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  This is a live representation of text components inside the Mission Control stream. It scales automatically based on your active profile parameters.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MEDICAL ID VAULT & QR LOCKSCREEN CARD VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }} className="animate-fade-in">
          
          {/* Left Side: Medical ID Vault Form */}
          <form onSubmit={handleProfileSave} className="glass-card" style={{ padding: 24, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={20} style={{ color: 'var(--green-400)' }} />
              <span>Medical ID Records</span>
            </h2>

            {/* Patient Info Group */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>Full Name</label>
                <input
                  type="text"
                  value={formValues.name}
                  onChange={e => setFormValues({ ...formValues, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.8rem' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>Age</label>
                <input
                  type="number"
                  value={formValues.age}
                  onChange={e => setFormValues({ ...formValues, age: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.8rem' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>Blood</label>
                <input
                  type="text"
                  value={formValues.bloodGroup}
                  onChange={e => setFormValues({ ...formValues, bloodGroup: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.8rem' }}
                  required
                />
              </div>
            </div>

            {/* Clinical Conditions */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>Allergies</label>
              <input
                type="text"
                value={formValues.allergies}
                onChange={e => setFormValues({ ...formValues, allergies: e.target.value })}
                placeholder="e.g. Penicillin, Peanuts (or None)"
                style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.8rem' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>Chronic Illnesses</label>
                <input
                  type="text"
                  value={formValues.chronicDiseases}
                  onChange={e => setFormValues({ ...formValues, chronicDiseases: e.target.value })}
                  placeholder="e.g. Asthma, Diabetes"
                  style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>Medications</label>
                <input
                  type="text"
                  value={formValues.medications}
                  onChange={e => setFormValues({ ...formValues, medications: e.target.value })}
                  placeholder="e.g. Inhaler, Insulin"
                  style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            {/* Emergency Contacts */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Emergency Contact</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10, marginBottom: 8 }}>
                <div>
                  <input
                    type="text"
                    value={formValues.emergencyContactName}
                    onChange={e => setFormValues({ ...formValues, emergencyContactName: e.target.value })}
                    placeholder="Contact Name"
                    style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.8rem' }}
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formValues.emergencyContactRole}
                    onChange={e => setFormValues({ ...formValues, emergencyContactRole: e.target.value })}
                    placeholder="Relationship (e.g. Mother)"
                    style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.8rem' }}
                    required
                  />
                </div>
              </div>
              <input
                type="text"
                value={formValues.emergencyContactPhone}
                onChange={e => setFormValues({ ...formValues, emergencyContactPhone: e.target.value })}
                placeholder="Phone Number"
                style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.8rem' }}
                required
              />
            </div>

            {/* Insurance Policy info */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Health Insurance Details</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
                <div>
                  <input
                    type="text"
                    value={formValues.insuranceProvider}
                    onChange={e => setFormValues({ ...formValues, insuranceProvider: e.target.value })}
                    placeholder="Insurer (e.g. Pragati Insurance)"
                    style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formValues.policyNumber}
                    onChange={e => setFormValues({ ...formValues, policyNumber: e.target.value })}
                    placeholder="Policy Number"
                    style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.8rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', minHeight: 44, background: 'var(--green-500)', borderColor: 'var(--green-600)', marginTop: 10 }}
            >
              {saveSuccess ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Check size={18} />
                  <span>Records Saved to Vault ✓</span>
                </div>
              ) : (
                <span>Lock &amp; Save Vitals Vault</span>
              )}
            </button>
          </form>

          {/* Right Side: Emergency QR Card Phone Wallpaper Mockup */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Phone Lockscreen Mockup Container */}
            <div style={{
              background: '#0a0a0c',
              border: '12px solid #222',
              borderRadius: '32px',
              padding: '16px 20px',
              aspectRatio: '9/19',
              maxWidth: 320,
              margin: '0 auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 480,
              backgroundImage: 'linear-gradient(to bottom, #1e1330 0%, #0d0a14 100%)'
            }}>
              {/* Speaker Notch */}
              <div style={{ width: 80, height: 18, background: '#222', borderRadius: '0 0 10px 10px', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }} />

              {/* Status bar */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                <span>16:35</span>
                <span>📶 🔋 98%</span>
              </div>

              {/* Date/Time widget */}
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 300, color: '#fff', letterSpacing: '0.05em' }}>04:35 PM</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>Wednesday, June 10</div>
              </div>

              {/* Glass Medical ID QR Widget */}
              <div style={{
                width: '100%',
                background: 'rgba(255, 59, 48, 0.08)',
                border: '1.5px solid rgba(255, 59, 48, 0.3)',
                borderRadius: '16px',
                padding: '12px 14px',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 8px 32px 0 rgba(255, 59, 48, 0.15)',
              }}>
                <div style={{ fontSize: '0.65rem', color: '#ff453a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, letterSpacing: '0.08em' }}>
                  <ShieldAlert size={10} fill="currentColor" />
                  <span>EMERGENCY MEDICAL ID</span>
                </div>
                
                {/* QR Vector */}
                <QRCodeSVG />

                {/* Patient Summary details */}
                <div style={{ width: '100%', fontSize: '0.65rem', color: '#eee', lineHeight: 1.4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 3 }}>
                    <span>Patient</span>
                    <strong>{formValues.name || 'Riya Akter'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 3 }}>
                    <span>Vitals</span>
                    <strong>Age {formValues.age || '24'} • Blood {formValues.bloodGroup || 'O+'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 3 }}>
                    <span>Allergies</span>
                    <strong style={{ color: '#ff453a' }}>{formValues.allergies || 'Penicillin'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 1 }}>
                    <span>ICE contact</span>
                    <strong>{formValues.emergencyContactPhone || '+880-171-XXX-XXXX'}</strong>
                  </div>
                </div>
              </div>

              {/* Swipe to unlock indicator */}
              <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>
                Swipe up to unlock
              </div>
            </div>

            {/* QR Card Action Card */}
            <div className="glass-card" style={{ padding: 16, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={handleQrDownload}
                className="btn btn-primary"
                style={{ width: '100%', minHeight: 40, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                disabled={qrDownloading}
              >
                <Download size={14} />
                <span>{qrDownloading ? 'Compiling wallpaper package...' : 'Download QR Lockscreen Card'}</span>
              </button>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4, background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 'var(--radius-sm)' }}>
                <strong>How to use:</strong> Set this image as your phone lockscreen background. If you are unresponsive, paramedics or bystanders can scan this QR code without unlocking your phone to pull your vitals and contacts.
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}
