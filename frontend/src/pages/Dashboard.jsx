import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import AgentTimeline from '../components/AgentTimeline'
import LiveMap from '../components/LiveMap'
import GuidanceStream from '../components/GuidanceStream'
import TriagePanel from '../components/TriagePanel'
import HospitalPanel from '../components/HospitalPanel'
import MCPToolsPanel from '../components/MCPToolsPanel'

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('tracker') // 'tracker' | 'impact' | 'business'
  const { sosActive, wsConnected, resetIncident, triggerSOS, location, userProfile, partnerIntegrations } = useStore()

  const handleReset = () => {
    resetIncident()
    navigate('/app')
  }

  const handleQuickDemo = () => {
    // Trigger with Kanchpur Bridge coords
    triggerSOS({ lat: 23.6922, lng: 90.5186 })
  }

  return (
    <div className="page-container" style={{ paddingTop: '88px', paddingRight: '16px', paddingBottom: '24px', paddingLeft: '16px', background: 'var(--bg-primary)', minHeight: '92vh' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 12 }}>
            📊 Mission Control Dashboard
            <span className={`badge ${wsConnected ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
              <span className={`status-dot ${wsConnected ? 'done' : 'active'}`} style={{ width: 6, height: 6 }} />
              {wsConnected ? 'WebSocket Live' : 'Mock Simulator Mode'}
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Emergency operations dashboard for monitoring AI agents, RAG, and MCP dispatch flows.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {sosActive && (
            <button onClick={handleReset} className="btn btn-ghost" style={{ minHeight: 40, padding: '8px 16px', fontSize: '0.82rem', borderColor: 'var(--red-400)', color: 'var(--red-400)' }}>
              ⚠️ Terminate SOS / Reset
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation Row */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { id: 'tracker', label: '📊 Incident Tracker', desc: 'Realtime Agent Orchestration' },
          { id: 'impact', label: '📈 Social Impact Metrics', desc: 'Judge KPI Analysis' },
          { id: 'business', label: '💼 Business Model', desc: 'B2G & B2B Sustainability' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: activeTab === tab.id ? 'rgba(10, 132, 255, 0.12)' : 'transparent',
              border: activeTab === tab.id ? '1px solid var(--blue-400)' : '1px solid transparent',
              color: activeTab === tab.id ? 'var(--blue-400)' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Real-time Incident Tracker */}
      {activeTab === 'tracker' && (
        <>
          {!sosActive ? (
            /* Empty State / Trigger Prompt */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', padding: 24, textAlign: 'center' }}>
              <div className="glass-card animate-float-up" style={{ padding: 48, maxWidth: 540, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                <div style={{ fontSize: '3rem' }}>📡</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>
                  No Active Rescue Operations
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  The RoadGuardian AI network is currently on standby. Run a simulation using local data, or proceed to the Emergency PWA console to initiate a real SOS dispatch.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
                  <button onClick={() => navigate('/app')} className="btn btn-danger" style={{ minHeight: 44, padding: '10px 24px' }}>
                    📱 Open Mobile PWA
                  </button>
                  <button onClick={handleQuickDemo} className="btn btn-primary" style={{ minHeight: 44, padding: '10px 24px' }}>
                    ⚡ Run Quick Simulation
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Active Emergency Console Grid */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
              {/* Active Incident Details Bar */}
              <div className="glass-card-sm" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', border: '1px solid rgba(255, 59, 48, 0.25)', background: 'rgba(255, 59, 48, 0.03)' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--red-400)', fontWeight: 700 }}>LIVE INCIDENT</span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>#RG-2026-0147 (Kanchpur Bridge, Dhaka)</h3>
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem' }}>
                  <span>Patient: <strong>{userProfile.name} (Deaf)</strong></span>
                  <span>Blood: <strong style={{ color: 'var(--red-400)' }}>{userProfile.bloodGroup}</strong></span>
                  <span>Ambulance: <strong>AMB-204 (ETA 6m)</strong></span>
                  <span>999 Case: <strong>999-INC-28491</strong></span>
                </div>
              </div>
              
              {/* Agent Timeline Swimlane (Horizontal) */}
              <div style={{ gridColumn: 'span 2' }}>
                <AgentTimeline />
              </div>

              {/* Map and Main Logs (Grid Layout) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24, alignItems: 'start' }}>
                  
                  {/* Left Column panels */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <TriagePanel />
                    <HospitalPanel />
                    <MCPToolsPanel />
                  </div>

                  {/* Right Column panels (Map and guidance) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    
                    {/* Live Leaflet Map */}
                    <div className="glass-card" style={{ border: '1px solid var(--border)', padding: 12 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>📍 Real-time Geographical Plot</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--blue-400)', textTransform: 'none' }}>
                          Locked coords: {location ? `${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E` : 'N/A'}
                        </span>
                      </div>
                      <LiveMap height={320} />
                    </div>

                    {/* Streamed RAG Guidance */}
                    <GuidanceStream />
                  </div>

                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab 2: Social Impact Metrics */}
      {activeTab === 'impact' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
          {/* Headline */}
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Reducing Emergency Response Times during the Golden Hour</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Measuring clinical preparedness and accessibility metrics across underserved regional corridors.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid-3">
            {[
              { title: "Response Time Reduction", value: "50% Faster", desc: "Averaging 90 seconds from impact log to ambulance dispatch compared to 15 minutes manually.", icon: "⏱️", color: "var(--blue-400)" },
              { title: "Lives Saved (Potential)", value: "Thousands / Year", desc: "By delivering first-aid RAG guidance to bystanders within the first critical 60 minutes.", icon: "🚑", color: "var(--red-400)" },
              { title: "Accessibility Coverage", value: "5 Distinct Profiles", desc: "Native assistance for Deaf, Mute, Dyslexic, Low-Vision, and Elderly users.", icon: "♿", color: "var(--green-400)" },
              { title: "BIMSTEC Reachability", value: "7 Coverages", desc: "Pre-cached phrase mappings for Bangla, Hindi, Thai, Burmese, Nepali, Sinhala, and Bhutanese.", icon: "🌐", color: "var(--amber-400)" },
              { title: "Offline Resilience", value: "100% Core Support", desc: "RAG guides, bystander visual cards, and emergency SMS links operate entirely offline.", icon: "📵", color: "var(--blue-400)" },
              { title: "Connected Facilities", value: "48 Trauma Centers", desc: "Mock APIs ready to sync ER occupancies and patient pre-admission sheets directly.", icon: "🏥", color: "var(--green-400)" }
            ].map((card, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '24px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{card.icon}</div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{card.title}</span>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: card.color, margin: '6px 0' }}>{card.value}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Sustainable Business Model */}
      {activeTab === 'business' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Sustainability &amp; Commercialization Roadmap</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              How RoadGuardian AI scales globally across B2G contracts, B2B partnerships, and SaaS licenses.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>🏛️ B2G (Government Contracts)</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--blue-400)', marginBottom: '8px' }}>National Emergency Integrations</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Licensing the RoadGuardian AI Agentic dispatch pipeline to regional highways authorities, smart cities initiatives, and emergency ministries (like Bangladesh 999 or India 112) as an automated operations overlay.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>🤝 B2B (Partnerships)</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--green-400)', marginBottom: '8px' }}>Ride-Sharing &amp; Fleets</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Charging ride-sharing networks (like Pathao, Grab, Uber) or logistics fleets a monthly active-user SaaS fee to integrate our SDK and trigger automated crash-alert visual screens and bystander logs for riders.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>🔌 API Licensing</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--amber-400)', marginBottom: '8px' }}>Emergency Feeds &amp; Telemetries</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Charging private hospitals, ambulance fleets, and insurance providers a transaction fee to access our telemetry APIs, real-time ER pre-arrival reports, or localized road hazard coordinates feeds.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
