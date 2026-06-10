import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import MobileFrame from '../components/MobileFrame'

const STEPS = [
  { id: 1, title: '1. Website Landing Page', desc: 'Desktop/Web layout showing the premium install PWA prompt banner.' },
  { id: 2, title: '2. Mobile Browser View', desc: 'Visual simulation of running inside Safari/Chrome with browser top headers.' },
  { id: 3, title: '3. Install App Prompt', desc: 'Mock or real system trigger presenting the browser-native install banner.' },
  { id: 4, title: '4. Installation Success', desc: 'Interactive checkmark micro-animation indicating successful setup.' },
  { id: 5, title: '5. Home Screen Icon', desc: 'Mock mobile app launcher screen showing the RoadGuardian icon.' },
  { id: 6, title: '6. PWA Launch Experience', desc: 'Framer-like native splash loading screens with stand-alone branding.' },
  { id: 7, title: '7. Offline PWA Experience', desc: 'PWA running entirely offline showing cached vector first-aid instructions.' }
]

export default function PwaDemo() {
  const [currentStep, setCurrentStep] = useState(0)
  const { pwaInstallPrompt, pwaInstalled, setPwaInstalled, userProfile } = useStore()
  
  // Simulation states
  const [simulatedInstallStatus, setSimulatedInstallStatus] = useState('idle') // 'idle' | 'installing' | 'installed'
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [customIp, setCustomIp] = useState('192.168.10.136')

  const triggerRealInstall = async () => {
    if (pwaInstallPrompt) {
      pwaInstallPrompt.prompt()
      const { outcome } = await pwaInstallPrompt.userChoice
      if (outcome === 'accepted') {
        setPwaInstalled(true)
        setSimulatedInstallStatus('installed')
      }
    } else {
      // Run visual simulation if browser-native is not present
      setSimulatedInstallStatus('installing')
      setTimeout(() => {
        setSimulatedInstallStatus('installed')
        setCurrentStep(3) // Advance to success screen
      }, 1500)
    }
  }

  const handleStepClick = (idx) => {
    setCurrentStep(idx)
    // Synchronize simulator settings for step parameters
    if (idx === 6) {
      setIsOfflineMode(true)
    } else {
      setIsOfflineMode(false)
    }
  }

  return (
    <div style={{
      background: '#0B132B',
      minHeight: 'calc(100vh - 64px)',
      display: 'grid',
      gridTemplateColumns: 'minmax(400px, 1fr) auto',
      alignItems: 'stretch',
      paddingTop: '64px'
    }}>
      
      {/* LEFT COLUMN: Presentation & Step Control Deck */}
      <div style={{
        padding: '36px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 64px)'
      }}>
        <div>
          <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(48,209,88,0.12)', border: '1px solid rgba(48,209,88,0.3)', borderRadius: '100px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--green-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            PWA INSTALLATION SANDBOX
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            PWA Core Lifecycle
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px', lineHeight: 1.5 }}>
            Witness how RoadGuardian AI transitions from a standard mobile website to a native app without app store dependencies. Click each stage to play the demo.
          </p>
        </div>

        {/* Stepper buttons list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {STEPS.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => handleStepClick(idx)}
              style={{
                display: 'flex',
                alignItems: 'start',
                gap: '12px',
                padding: '14px 16px',
                background: currentStep === idx ? 'rgba(10, 132, 255, 0.08)' : 'rgba(255,255,255,0.01)',
                border: `1px solid ${currentStep === idx ? 'var(--blue-500)' : 'var(--border)'}`,
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: currentStep === idx ? 'var(--blue-500)' : 'var(--bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 800,
                flexShrink: 0
              }}>
                {st.id}
              </div>
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: currentStep === idx ? 'var(--blue-400)' : '#fff' }}>{st.title}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.3 }}>{st.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Real Browser Install Status */}
        <div className="glass-card-sm" style={{ padding: '16px', border: '1px solid var(--border)', marginTop: 'auto' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>💡 Real Browser PWA Status</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {pwaInstalled ? '✅ App installed on this system.' : pwaInstallPrompt ? '📥 Ready to install (Browser trigger available).' : '◎ Running inside standard web browser.'}
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Phone Simulator showing active screen */}
      <div style={{ background: '#090F1E', padding: '40px 80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* Custom PWA Phone Container */}
        <div style={{
          width: '380px',
          height: '760px',
          borderRadius: '40px',
          border: '12px solid #2d3748',
          background: '#0B132B',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}>
          
          {/* Status bar notch */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '160px', height: '26px', background: '#2d3748',
            borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px',
            zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            <div style={{ width: '50px', height: '4px', background: '#1a202c', borderRadius: '2px' }} />
          </div>

          {/* Browser Address Bar (Fails standalone DISPLAY MODE) */}
          {currentStep === 1 && (
            <div style={{
              background: '#1A233A',
              borderBottom: '1px solid var(--border)',
              padding: '36px 12px 8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 50
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🔒</span>
              <div style={{
                flex: 1,
                background: 'rgba(0,0,0,0.3)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                https://roadguardian.ai/app
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>🔄</span>
            </div>
          )}

          {/* Core Content Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingTop: currentStep === 1 ? 0 : '30px' }} className="scroll-y">
            
            {/* STEP 1: WEBSITE LANDING PAGE */}
            {currentStep === 0 && (
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900 }}>RoadGuardian AI</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>AI Emergency Assistant</p>
                </div>
                
                {/* Floating Install Prompt Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255,59,48,0.1) 0%, rgba(255,59,48,0.02) 100%)',
                  border: '1px solid rgba(255, 59, 48, 0.3)',
                  padding: '16px',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.8rem' }}>🛡️</div>
                    <div>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>Install RoadGuardian AI</h4>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Get 100% offline first-aid & automated dispatch support.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)} // Go to Browser view
                    style={{
                      background: 'var(--red-500)',
                      color: '#fff',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Install App
                  </button>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.5 }}>
                  <span style={{ fontSize: '3rem' }}>🔒</span>
                  <p style={{ fontSize: '0.75rem', marginTop: '10px' }}>Standard Web Layout</p>
                </div>
              </div>
            )}

            {/* STEP 2: MOBILE BROWSER VIEW */}
            {currentStep === 1 && (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                <div className="glass-card-sm" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800 }}>Riya Akter</h4>
                    <p style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>Standard Safari Viewport</p>
                  </div>
                  <span className="badge badge-muted" style={{ fontSize: '0.6rem' }}>Browser Mode</span>
                </div>

                {/* Visible Banner Trigger */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem' }}>📥</span>
                    <div>
                      <h5 style={{ fontSize: '0.72rem', fontWeight: 700 }}>Add to Home Screen</h5>
                      <p style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Enables offline rescue features</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)} // Trigger prompt
                    style={{
                      background: 'var(--blue-500)',
                      border: 'none',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>

                {/* Normal App Preview (HomeScreen) */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="glass-card-sm" style={{ padding: '12px', opacity: 0.7 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--green-400)' }}>🟢 CRASHSENSE ACTIVE</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0.2 }}>
                    <span style={{ fontSize: '2rem' }}>🚨</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: INSTALL APP PROMPT */}
            {currentStep === 2 && (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Installation Trigger</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Clicking "Install" triggers the native browser installation confirmation prompt.
                  </p>
                </div>

                {/* Mock Browser Prompt Overlay */}
                <div style={{
                  background: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  margin: '20px 0'
                }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      🛡️
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>Add to Home screen?</h4>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>https://roadguardian.ai</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button onClick={() => setCurrentStep(1)} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: '6px' }}>Cancel</button>
                    <button
                      onClick={triggerRealInstall}
                      style={{ background: 'var(--blue-500)', border: 'none', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Install
                    </button>
                  </div>
                </div>

                <div style={{ height: '40px' }} />
              </div>
            )}

            {/* STEP 4: INSTALLATION SUCCESS SCREEN */}
            {currentStep === 3 && (
              <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'rgba(48,209,88,0.12)', border: '2px solid var(--green-500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3rem', color: 'var(--green-500)',
                  animation: 'pulse-glow 1.5s infinite'
                }}>
                  ✓
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--green-400)' }}>PWA Installed Successfully!</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
                    RoadGuardian AI has been added to your phone's Home Screen. It can now launch in standalone native display mode.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(4)}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '20px'
                  }}
                >
                  View Home Screen
                </button>
              </div>
            )}

            {/* STEP 5: HOME SCREEN APP ICON */}
            {currentStep === 4 && (
              <div style={{
                flex: 1,
                backgroundImage: 'linear-gradient(to bottom, #1E293B, #0F172A)',
                padding: '24px 16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridAutoRows: '76px',
                gap: '12px',
                alignContent: 'start',
                position: 'relative'
              }}>
                {/* Simulated Grid of mobile app launchers */}
                {[
                  { label: 'Phone', icon: '📞' },
                  { label: 'Messages', icon: '💬' },
                  { label: 'Photos', icon: '🖼️' },
                  { label: 'Maps', icon: '🗺️' },
                  { label: 'Settings', icon: '⚙️' }
                ].map((app, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#334155', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.4rem' }}>
                      {app.icon}
                    </div>
                    <span style={{ fontSize: '0.55rem', color: '#cbd5e1' }}>{app.label}</span>
                  </div>
                ))}

                {/* ROADGUARDIAN ICON */}
                <button
                  onClick={() => setCurrentStep(5)} // Trigger splash launch
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'radial-gradient(circle, #FF5A52 0%, #FF3B30 100%)',
                    display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.5rem',
                    boxShadow: '0 0 12px rgba(255, 59, 48, 0.6)',
                    animation: 'pulse-glow 1.5s infinite'
                  }}>
                    🛡️
                  </div>
                  <span style={{ fontSize: '0.55rem', color: '#fff', fontWeight: 800 }}>RoadGuardian</span>
                </button>
              </div>
            )}

            {/* STEP 6: PWA LAUNCH EXPERIENCE (SPLASH SCREEN) */}
            {currentStep === 5 && (
              <div style={{
                flex: 1,
                background: '#0B132B',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                animation: 'fade-in 1.5s ease'
              }}>
                <div style={{
                  width: '90px', height: '90px', borderRadius: '22px',
                  background: 'radial-gradient(circle, #FF5A52 0%, #FF3B30 100%)',
                  display: 'flex', alignItems: 'center', justify: 'center', fontSize: '2.8rem',
                  boxShadow: '0 8px 24px rgba(255, 59, 48, 0.4)',
                  animation: 'pulse-glow 2s infinite'
                }}>
                  🛡️
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', trackingLetter: '0.05em' }}>ROADGUARDIAN AI</h3>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>Offline-First Emergency Protection</p>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={() => setCurrentStep(6)} // Go to Offline mode
                    style={{
                      background: 'none', border: 'none', color: 'var(--text-muted)',
                      fontSize: '0.65rem', textDecoration: 'underline', cursor: 'pointer'
                    }}
                  >
                    Simulate load complete...
                  </button>
                </div>
              </div>
            )}

            {/* STEP 7: OFFLINE PWA EXPERIENCE */}
            {currentStep === 6 && (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                
                {/* Simulation controls */}
                <div style={{
                  background: 'rgba(255,159,10,0.08)',
                  border: '1px solid rgba(255,159,10,0.3)',
                  padding: '10px',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--amber-400)', fontWeight: 700 }}>📵 SIMULATE OFFLINE</span>
                  <button
                    onClick={() => setIsOfflineMode(!isOfflineMode)}
                    style={{
                      background: isOfflineMode ? 'var(--amber-500)' : 'rgba(255,255,255,0.05)',
                      border: 'none',
                      color: isOfflineMode ? '#000' : '#fff',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {isOfflineMode ? 'OFFLINE' : 'ONLINE'}
                  </button>
                </div>

                {/* Orange Offline Alert Banner */}
                {isOfflineMode && (
                  <div style={{
                    background: '#EA580C', color: '#fff', padding: '6px 10px',
                    borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, textAlign: 'center'
                  }}>
                    NETWORK OFFLINE — Cached first-aid RAG active
                  </div>
                )}

                {/* Offline-resilient emergency PWA screens */}
                <div className="glass-card-sm" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>PRE-CACHED EMERGENCY DETAILS</span>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800 }}>Riya Akter</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Emergency Contact: Amina Akter (Mother)</p>
                </div>

                {/* Pre-cached guidance */}
                <div style={{
                  flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  padding: '12px', borderRadius: '8px', overflowY: 'auto'
                }} className="scroll-y">
                  <h5 style={{ fontSize: '0.75rem', color: 'var(--red-400)', fontWeight: 800, marginBottom: '6px' }}>
                    First Aid for Left Arm Fracture:
                  </h5>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: 1.4 }}>
                    <p>1. Keep Riya Akter still. Do NOT move the victim.</p>
                    <p>2. Control forearm laceration: apply direct pressure with a clean cloth.</p>
                    <p>3. Do not attempt to align the bone. Support arm in the position found.</p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Home Indicator Button / Navigation Bar */}
          <div style={{
            height: '42px',
            background: '#0f172a',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 60
          }}>
            <button
              onClick={() => setCurrentStep(4)} // Back to Home Screen
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.4)',
                border: '1.5px solid rgba(255,255,255,0.7)',
                cursor: 'pointer'
              }}
            />
          </div>

        </div>

      </div>

    </div>
  )
}
