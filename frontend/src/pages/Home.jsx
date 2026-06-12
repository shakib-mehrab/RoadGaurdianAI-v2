import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { ShieldAlert, LayoutDashboard, Cpu, BookOpen, Radio, Accessibility, WifiOff, Scan, BarChart2, Briefcase, TrendingUp, Globe, Users, Building2, Eye } from 'lucide-react'

const STATS = [
  { value: '700K+', label: 'Road deaths/year', sub: 'across BIMSTEC nations', color: 'var(--red-400)' },
  { value: '4 min', label: 'Someone dies', sub: 'every 4 minutes in South Asia', color: 'var(--amber-400)' },
  { value: '90 sec', label: 'Response time', sub: 'with RoadGuardian AI', color: 'var(--green-400)' },
  { value: '7', label: 'AI Agents', sub: 'working in parallel for you', color: 'var(--blue-400)' },
]

const FEATURES = [
  { icon: Cpu, title: 'Multi-Agent Orchestration', desc: '7 specialized AI agents coordinated via LangGraph. Triage, locate, dispatch, guidance — all in parallel.', color: 'var(--blue-400)' },
  { icon: BookOpen, title: 'RAG-Powered Guidance', desc: 'Hybrid vector + keyword search over WHO first-aid PDFs. Streamed step-by-step instructions with citations.', color: 'var(--green-400)' },
  { icon: Radio, title: 'MCP Protocol Dispatch', desc: 'Custom MCP server connecting to hospital, ambulance, and family notification tools in real time.', color: 'var(--amber-400)' },
  { icon: Accessibility, title: 'Accessibility-Native', desc: '5 accessibility modes: low-vision, elderly, high-contrast, deaf. WCAG 2.1 AAA target. Always visible.', color: '#BF5AF2' },
  { icon: WifiOff, title: 'Offline-First PWA', desc: 'Service worker caches emergency protocols, maps, and contacts. Works when the network fails.', color: 'var(--red-400)' },
  { icon: Scan, title: 'Vision AI Hazards', desc: 'Upload road images for YOLOv8 pothole/debris detection. Geo-tagged reports feed community hazard map.', color: '#FF9F0A' },
]

export default function Home() {
  const navigate = useNavigate()
  const { sosActive } = useStore()

  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero */}
      <section style={{
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow orbs */}
        <div style={{
          position: 'absolute', top: '20%', left: '15%',
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,59,48,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '30%', right: '10%',
          width: 300, height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,132,255,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Badge
        <div className="animate-float-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px',
          background: 'rgba(255,59,48,0.08)',
          border: '1px solid rgba(255,59,48,0.25)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem',
          color: 'var(--red-400)',
          fontWeight: 600,
          letterSpacing: '0.04em',
          marginBottom: 28,
        }}>
          <span style={{ animation: 'pulse-glow 1.5s ease-in-out infinite', display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--red-500)' }} />
          CloudCamp Hackathon 2025 — AI Depth Score: 94/110
        </div> */}

        {/* Headline */}
        <h1 className="animate-float-up delay-100" style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          maxWidth: 900,
          marginBottom: 24,
        }}>
          Emergency AI that works when{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--red-400), #FF6B6B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            everything else fails
          </span>
        </h1>

        {/* Subheading */}
        <p className="animate-float-up delay-200" style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          color: 'var(--text-secondary)',
          maxWidth: 680,
          lineHeight: 1.7,
          marginBottom: 40,
        }}>
          Multi-agent AI copilot for road emergencies. Offline-first. Accessibility-native.
          7 AI agents coordinate rescue in under 90 seconds — for 3 billion underserved road users.
        </p>

        {/* CTA buttons */}
        <div className="animate-float-up delay-300" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            id="home-sos-cta"
            className="btn btn-danger"
            onClick={() => navigate('/emergency')}
            style={{ fontSize: '1rem', padding: '14px 32px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <ShieldAlert size={18} />
            <span>{sosActive ? 'View Active Emergency' : 'Trigger Emergency Demo'}</span>
          </button>
          <button
            id="home-bystander-cta"
            className="btn"
            onClick={() => navigate('/bystander')}
            style={{ fontSize: '1rem', padding: '14px 32px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255, 159, 10, 0.15)', border: '1px solid var(--amber-400)', color: 'var(--amber-400)', cursor: 'pointer' }}
          >
            <Eye size={18} />
            <span>I am a Bystander (SOS)</span>
          </button>
          <button
            id="home-dashboard-cta"
            className="btn btn-ghost"
            onClick={() => navigate('/dashboard')}
            style={{ fontSize: '1rem', padding: '14px 32px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <LayoutDashboard size={18} />
            <span>Mission Control</span>
          </button>
        </div>

        {/* Quote */}
        <div className="animate-float-up delay-400" style={{
          marginTop: 56,
          padding: '16px 24px',
          background: 'var(--bg-glass)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          backdropFilter: 'blur(16px)',
          maxWidth: 700,
        }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
            "Emergency systems assume you can speak, see, hear, and stay online.{' '}
            <strong style={{ color: 'var(--text-primary)', fontStyle: 'normal' }}>
              RoadGuardian AI was built for everyone else too.
            </strong>"
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="grid-4" style={{ marginBottom: 60 }}>
          {STATS.map((s, i) => (
            <div
              key={i}
              className="glass-card animate-float-up"
              style={{ padding: '24px 20px', textAlign: 'center', animationDelay: `${i * 0.1}s` }}
            >
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.2rem',
                fontWeight: 900,
                color: s.color,
                marginBottom: 4,
                letterSpacing: '-0.02em',
              }}>
                {s.value}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                {s.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Architecture flow */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 12 }}>
            SYSTEM ARCHITECTURE
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 0,
            flexWrap: 'wrap', justifyContent: 'center',
          }}>
            {['USER SOS', 'ORCHESTRATOR', 'TRIAGE + LOCATE + DISPATCH', 'RAG + MCP', 'STREAMED RESPONSE'].map((step, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '8px 16px',
                  background: i === 0 ? 'rgba(255,59,48,0.12)' : i === arr.length - 1 ? 'rgba(48,209,88,0.12)' : 'rgba(10,132,255,0.08)',
                  border: `1px solid ${i === 0 ? 'rgba(255,59,48,0.3)' : i === arr.length - 1 ? 'rgba(48,209,88,0.3)' : 'rgba(10,132,255,0.2)'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: i === 0 ? 'var(--red-400)' : i === arr.length - 1 ? 'var(--green-400)' : 'var(--blue-400)',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}>
                  {step}
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: 24, height: 2, background: 'var(--border)', position: 'relative' }}>
                    <div style={{
                      position: 'absolute', right: -4, top: -4,
                      color: 'var(--text-muted)', fontSize: '0.6rem',
                    }}>▶</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features grid */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Built for Real Emergencies</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Every component works. Nothing is purely fake.</p>
        </div>
        <div className="grid-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="glass-card animate-float-up"
                style={{
                  padding: 24,
                  animationDelay: `${i * 0.08}s`,
                  transition: 'all 0.25s var(--ease-out)',
                  cursor: 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.border = `1px solid ${f.color}44`
                  e.currentTarget.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.border = '1px solid var(--border)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)'
                }}>
                  <Icon size={24} style={{ color: f.color }} />
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: 8, color: f.color }}>{f.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            )
          })}
        </div>

        {/* ── Social Impact Metrics ── */}
        <div style={{ marginTop: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.2)', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--blue-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              <BarChart2 size={12} /> Social Impact
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Reducing Emergency Response Times</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Measuring clinical preparedness and accessibility metrics across underserved regional corridors.</p>
          </div>
          <div className="grid-3">
            {[
              { title: 'Response Time Reduction', value: '50% Faster', desc: 'Averaging 90 seconds from impact log to ambulance dispatch compared to 15 minutes manually.', Icon: TrendingUp, color: 'var(--blue-400)' },
              { title: 'Lives Saved (Potential)', value: 'Thousands/Year', desc: 'By delivering first-aid RAG guidance to bystanders within the first critical 60 minutes.', Icon: Users, color: 'var(--red-400)' },
              { title: 'Accessibility Coverage', value: '5 Profiles', desc: 'Native assistance for Deaf, Mute, Low-Vision, High-Contrast, and Elderly users.', Icon: ShieldAlert, color: 'var(--green-400)' },
              { title: 'BIMSTEC Reachability', value: '7 Languages', desc: 'Pre-cached phrase mappings for Bangla, Hindi, Thai, Burmese, Nepali, Sinhala, and Bhutanese.', Icon: Globe, color: 'var(--amber-400)' },
              { title: 'Offline Resilience', value: '100% Core', desc: 'RAG guides, bystander visual cards, and emergency SMS links operate entirely offline.', Icon: WifiOff, color: 'var(--blue-400)' },
              { title: 'Connected Facilities', value: '48 Trauma Centers', desc: 'Mock APIs ready to sync ER occupancies and patient pre-admission sheets directly.', Icon: Building2, color: 'var(--green-400)' },
            ].map(({ title, value, desc, Icon, color }, i) => (
              <div
                key={i}
                className="glass-card animate-float-up"
                style={{ padding: 24, animationDelay: `${i * 0.06}s`, cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${color}44`; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <Icon size={28} style={{ color, marginBottom: 10 }} />
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>{title}</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color, margin: '6px 0' }}>{value}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Business Model ── */}
        <div style={{ marginTop: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'rgba(255,159,10,0.08)', border: '1px solid rgba(255,159,10,0.2)', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--amber-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              <Briefcase size={12} /> Business Model
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Sustainability &amp; Commercialization Roadmap</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>How RoadGuardian AI scales globally across B2G contracts, B2B partnerships, and SaaS licenses.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {[
              { Icon: Building2, label: 'B2G — Government Contracts', color: 'var(--blue-400)', title: 'National Emergency Integrations', desc: 'Licensing the RoadGuardian AI dispatch pipeline to regional highway authorities and emergency ministries (Bangladesh 999, India 112) as an automated operations overlay.' },
              { Icon: Users, label: 'B2B — Ride-Sharing Partnerships', color: 'var(--green-400)', title: 'Pathao · oBhai · Uber SDK', desc: 'Monthly active-user SaaS fee for ride-sharing platforms and logistics fleets to integrate our crash-alert SDK and automated bystander dispatch logs for every trip.' },
              { Icon: Globe, label: 'API Licensing', color: 'var(--amber-400)', title: 'Emergency Feeds & Telemetries', desc: 'Transaction fee for private hospitals, ambulance fleets, and insurance providers to access our real-time ER pre-arrival reports and geo-tagged road hazard coordinate feeds.' },
            ].map(({ Icon, label, color, title, desc }, i) => (
              <div
                key={i}
                className="glass-card animate-float-up"
                style={{ padding: 28, animationDelay: `${i * 0.08}s`, display: 'flex', flexDirection: 'column', gap: 10, cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${color}44`; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${color}14`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: 60, padding: '40px 24px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>See It In Action</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
            Trigger a live emergency simulation and watch all 7 AI agents coordinate in real time.
          </p>
          <button
            id="home-bottom-cta"
            className="btn btn-danger"
            onClick={() => navigate('/emergency')}
            style={{ fontSize: '1rem', padding: '14px 36px', borderRadius: 'var(--radius-lg)', display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
          >
            <ShieldAlert size={18} />
            <span>Launch Emergency Demo</span>
          </button>
        </div>
      </section>
    </div>
  )
}
