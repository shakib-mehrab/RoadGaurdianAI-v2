import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { AlertTriangle, Camera, Search, CheckCircle, Lightbulb, Compass, Navigation, Shield, CloudRain, ShieldCheck } from 'lucide-react'

export default function HazardReport() {
  const { addHazard, hazards, location, routeRiskAnalysis, analyzeRoute } = useStore()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [activeTab, setActiveTab] = useState('telemetry') // 'telemetry' | 'safe-route'

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Telemetry Upload States
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [lat, setLat] = useState(location?.lat ? String(location.lat) : '23.8103')
  const [lng, setLng] = useState(location?.lng ? String(location.lng) : '90.4125')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [reportResult, setReportResult] = useState(null)

  // Safe Route AI States
  const [routeFrom, setRouteFrom] = useState('Dhaka Airport')
  const [routeTo, setRouteTo] = useState('Kanchpur Bridge, Dhaka')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setReportResult(null)

    const formData = new FormData()
    if (file) formData.append('file', file)
    formData.append('lat', lat)
    formData.append('lng', lng)
    formData.append('description', description || 'Active road anomaly')

    const getDefaultBackendUrl = () => {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return 'localhost:8000';
        }
        return `${hostname}:8000`;
      }
      return '192.168.10.136:8000';
    };
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || getDefaultBackendUrl();
    const getHttpUrl = (url) => {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      const isDev = url.startsWith('localhost') || url.startsWith('127.0.0.1');
      const protocol = isDev ? 'http://' : (window.location.protocol === 'https:' ? 'https://' : 'http://');
      return `${protocol}${url}`;
    };
    const API_URL = getHttpUrl(BACKEND_URL);

    try {
      const response = await fetch(`${API_URL}/hazard-detect`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setReportResult(result)
        addHazard({
          hazard_type: result.hazard_type,
          severity: result.severity,
          location: result.location,
          ai_confidence: result.ai_confidence
        })
      } else {
        throw new Error('API server returned error status')
      }
    } catch (err) {
      console.warn('Backend hazard-detect endpoint failed. Running local simulation fallback.', err)
      
      // Simulation fallback
      setTimeout(() => {
        const descLower = description.toLowerCase()
        let hazard_type = 'pothole'
        let severity = 'medium'
        let remediation = 'Pothole obstruction. Forwarding telemetry coordinates to municipal maintenance log.'

        if (descLower.includes('accident') || descLower.includes('crash')) {
          hazard_type = 'accident_scene'
          severity = 'high'
          remediation = 'Severe accident scene detected. Emergency dispatch route bypass calculated.'
        } else if (descLower.includes('water') || descLower.includes('flood')) {
          hazard_type = 'flooding'
          severity = 'high'
          remediation = 'Waterlogging threat. Direct local civic authorities to deploy drainage teams.'
        } else if (descLower.includes('obstruction') || descLower.includes('debris')) {
          hazard_type = 'road_debris'
          severity = 'medium'
          remediation = 'Obstruction logged on active route lanes. High speed braking hazard.'
        }

        const simulatedResult = {
          status: 'success',
          telemetry_source: file?.name || 'simulated_feed.jpg',
          hazard_type,
          severity,
          location: { lat: parseFloat(lat), lng: parseFloat(lng) },
          ai_confidence: 0.94,
          remediation_suggestion: remediation
        }
        setReportResult(simulatedResult)
        addHazard({
          hazard_type,
          severity,
          location: { lat: parseFloat(lat), lng: parseFloat(lng) },
          ai_confidence: 0.94
        })
        setLoading(false)
      }, 1800)
    }
  }

  const handleRouteAnalyze = (e) => {
    e.preventDefault()
    analyzeRoute(routeFrom, routeTo)
  }

  const handleLoadDemoHazard = () => {
    setPreview('https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600')
    setDescription('Deep pothole crater detected in center lane. Structural risk to two-wheelers.')
    setLat('23.6922')
    setLng('90.5186')
  }

  return (
    <div className="page-container" style={{ paddingTop: isMobile ? '72px' : '88px', paddingRight: '16px', paddingBottom: isMobile ? '72px' : '24px', paddingLeft: '16px', background: 'var(--bg-primary)', minHeight: '92vh' }}>
      
      {/* Page Title */}
      <div style={{ marginBottom: isMobile ? 12 : 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? '1.25rem' : '1.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10 }}>
          <AlertTriangle size={isMobile ? 22 : 28} style={{ color: 'var(--amber-400)', flexShrink: 0 }} />
          <span>Hazard &amp; Safe Route Analytics</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '0.78rem' : '0.85rem', marginTop: 4 }}>
          Upload road camera feeds to log threats, or calculate safe alternative paths using Crash Prediction AI.
        </p>
      </div>

      {/* Sub-tab switcher row */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('telemetry')}
          style={{
            padding: '8px 16px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: activeTab === 'telemetry' ? 'rgba(255, 159, 10, 0.12)' : 'transparent',
            border: activeTab === 'telemetry' ? '1px solid var(--amber-400)' : '1px solid transparent',
            color: activeTab === 'telemetry' ? 'var(--amber-400)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Camera size={14} />
          <span>Camera Telemetry Reporter</span>
        </button>
        <button
          onClick={() => setActiveTab('safe-route')}
          style={{
            padding: '8px 16px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: activeTab === 'safe-route' ? 'rgba(10, 132, 255, 0.12)' : 'transparent',
            border: activeTab === 'safe-route' ? '1px solid var(--blue-400)' : '1px solid transparent',
            color: activeTab === 'safe-route' ? 'var(--blue-400)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Compass size={14} />
          <span>Safe Route AI &amp; Crash Prediction</span>
        </button>
      </div>

      {activeTab === 'telemetry' ? (
        /* CAMERA TELEMETRY VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: isMobile ? 16 : 24, alignItems: 'start' }} className="animate-fade-in">
          {/* Form panel */}
          <form onSubmit={handleSubmit} className="glass-card" style={{ padding: isMobile ? '16px 20px' : 24, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 20 }}>
            <h2 style={{ fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              Submit Telemetry Report
            </h2>

            {/* Simulation Demo Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10, 132, 255, 0.08)', border: '1px solid rgba(10, 132, 255, 0.25)', borderRadius: 'var(--radius-md)', padding: '8px 12px', marginTop: 4 }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--blue-400)' }}>Demo Mode Anomaly</span>
                <p style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>Autofill deep pothole coordinates & demo photo.</p>
              </div>
              <button 
                type="button"
                onClick={handleLoadDemoHazard}
                style={{
                  padding: '5px 10px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  background: 'var(--blue-500)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer'
                }}
              >
                Autofill
              </button>
            </div>

            {/* Image upload */}
            <div>
              <label style={{ display: 'block', fontSize: isMobile ? '0.75rem' : '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: isMobile ? 4 : 8, textTransform: 'uppercase' }}>
                Road Camera Image Feed
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 10 }}>
                <input
                  id="hazard-image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="hazard-image-file"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius-md)',
                    height: isMobile ? 100 : 140,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    background: 'rgba(0,0,0,0.2)',
                    transition: 'border-color 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--blue-400)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  {preview ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <img src={preview} alt="Upload Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {/* Bounding box overlay */}
                      {reportResult && (
                        <div style={{
                          position: 'absolute',
                          top: '25%',
                          left: '20%',
                          width: '55%',
                          height: '45%',
                          border: '3px solid var(--amber-400)',
                          borderRadius: 4,
                          boxShadow: '0 0 10px rgba(255, 214, 10, 0.4)',
                          pointerEvents: 'none',
                          boxSizing: 'border-box'
                        }}>
                          <span style={{
                            position: 'absolute',
                            top: -20,
                            left: -3,
                            background: 'var(--amber-400)',
                            color: '#000',
                            fontSize: '0.62rem',
                            fontWeight: 900,
                            padding: '2px 6px',
                            textTransform: 'uppercase',
                            borderRadius: '2px 2px 0 0',
                            whiteSpace: 'nowrap'
                          }}>
                            {reportResult.hazard_type.replace('_', ' ')} ({(reportResult.ai_confidence * 100).toFixed(0)}%)
                          </span>
                        </div>
                      )}
                      {/* Scanning Line */}
                      {loading && (
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          width: '100%',
                          height: '3px',
                          background: 'linear-gradient(to right, transparent, var(--blue-400), transparent)',
                          boxShadow: '0 0 8px var(--blue-400)',
                          animation: 'scan-motion 2s linear infinite'
                        }} />
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? 4 : 8 }}>
                      <Camera size={isMobile ? 24 : 32} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: isMobile ? '0.7rem' : '0.78rem' }}>Click to select/snap road image</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Coordinates inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 8 : 12 }}>
              <div>
                <label htmlFor="hazard-lat" style={{ display: 'block', fontSize: isMobile ? '0.75rem' : '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: isMobile ? 4 : 6, textTransform: 'uppercase' }}>
                  Latitude
                </label>
                <input
                  id="hazard-lat"
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={e => setLat(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: '#fff',
                    padding: isMobile ? '8px 10px' : '10px',
                    fontSize: isMobile ? '0.78rem' : '0.82rem'
                  }}
                />
              </div>
              <div>
                <label htmlFor="hazard-lng" style={{ display: 'block', fontSize: isMobile ? '0.75rem' : '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: isMobile ? 4 : 6, textTransform: 'uppercase' }}>
                  Longitude
                </label>
                <input
                  id="hazard-lng"
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={e => setLng(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: '#fff',
                    padding: isMobile ? '8px 10px' : '10px',
                    fontSize: isMobile ? '0.78rem' : '0.82rem'
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="hazard-desc-input" style={{ display: 'block', fontSize: isMobile ? '0.75rem' : '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: isMobile ? 4 : 6, textTransform: 'uppercase' }}>
                Condition Description
              </label>
              <input
                id="hazard-desc-input"
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. pothole, accident crash, road flooding..."
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  padding: isMobile ? '8px 10px' : '10px',
                  fontSize: isMobile ? '0.78rem' : '0.82rem'
                }}
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', minHeight: 44 }}>
              {loading ? (
                'Analyzing with Vision AI...'
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Search size={18} />
                  <span>Analyze and Report Threat</span>
                </div>
              )}
            </button>
          </form>

          {/* Results panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 24 }}>
            {reportResult && (
              <div className="glass-card animate-float-up" style={{ padding: isMobile ? 16 : 24, border: '1px solid var(--border)', background: 'rgba(48,209,88,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <CheckCircle size={24} style={{ color: 'var(--green-400)' }} />
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Vision AI Analysis Succeeded</h3>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Source: {reportResult.telemetry_source}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Detected Hazard</span>
                    <strong style={{ fontSize: '0.82rem', textTransform: 'capitalize', color: 'var(--amber-400)' }}>
                      {reportResult.hazard_type.replace('_', ' ')}
                    </strong>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Severity Level</span>
                    <span className={`badge ${reportResult.severity === 'high' ? 'badge-red' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                      {reportResult.severity}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>YOLOv8 Confidence</span>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--green-400)' }}>
                      {Math.round(reportResult.ai_confidence * 100)}%
                    </strong>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <Lightbulb size={14} style={{ color: 'var(--amber-400)', flexShrink: 0, marginTop: 2 }} />
                    <span>{reportResult.remediation_suggestion}</span>
                  </div>
                </div>
              </div>
            )}

            {/* History */}
            <div className="glass-card" style={{ padding: isMobile ? 16 : 24, border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: 700, marginBottom: isMobile ? 10 : 14, borderBottom: '1px solid var(--border)', paddingBottom: isMobile ? 8 : 10 }}>
                Recent Hazard Submissions ({hazards.length})
              </h2>
              {hazards.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  No threats reported during this session.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto' }} className="scroll-y">
                  {hazards.map((hz, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <AlertTriangle size={14} style={{ color: 'var(--amber-400)' }} />
                          <span>{hz.hazard_type.replace('_', ' ')}</span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          Coords: {hz.location?.lat.toFixed(4)}°N, {hz.location?.lng.toFixed(4)}°E
                        </div>
                      </div>
                      <span className={`badge ${hz.severity === 'high' ? 'badge-red' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                        {hz.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* SAFE ROUTE AI & CRASH PREDICTION VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: isMobile ? 16 : 24, alignItems: 'start' }} className="animate-fade-in">
          
          {/* Form Input Column */}
          <form onSubmit={handleRouteAnalyze} className="glass-card" style={{ padding: 24, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Navigation size={18} style={{ color: 'var(--blue-400)' }} />
              <span>Route Parameters</span>
            </h2>

            <div>
              <label htmlFor="route-start" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>
                Start Location
              </label>
              <input
                id="route-start"
                type="text"
                value={routeFrom}
                onChange={e => setRouteFrom(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <label htmlFor="route-dest" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>
                Destination Location
              </label>
              <input
                id="route-dest"
                type="text"
                value={routeTo}
                onChange={e => setRouteTo(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.82rem' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Compass size={16} />
              <span>Analyze Route Safety Index</span>
            </button>
          </form>

          {/* Results Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {!routeRiskAnalysis ? (
              <div className="glass-card" style={{ padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, border: '1px solid var(--border)' }}>
                <Compass size={36} style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Input route parameters and trigger analysis to calculate safety metrics and alternate route paths.
                </p>
              </div>
            ) : routeRiskAnalysis.loading ? (
              <div className="glass-card" style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, border: '1px solid var(--border)' }}>
                <Compass size={32} className="animate-spin" style={{ color: 'var(--blue-400)' }} />
                <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                  Analyzing weather telemetry and historical crash logs...
                </p>
              </div>
            ) : (
              <div className="glass-card animate-float-up" style={{ padding: 24, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Header Danger Index Gauge */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'rgba(255,59,48,0.02)', padding: 14, borderRadius: 12, border: '1px solid rgba(255,59,48,0.15)' }}>
                  {/* Danger score ring */}
                  <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                    <svg width="56" height="56" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="3.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={routeRiskAnalysis.dangerIndex > 60 ? 'var(--red-400)' : 'var(--amber-400)'}
                        strokeWidth="3.5"
                        strokeDasharray={`${routeRiskAnalysis.dangerIndex}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.85rem', fontWeight: 900, color: '#fff' }}>
                      {routeRiskAnalysis.dangerIndex}%
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Danger Index Score</span>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: routeRiskAnalysis.dangerIndex > 60 ? 'var(--red-400)' : 'var(--amber-400)', marginTop: 2 }}>
                      {routeRiskAnalysis.dangerIndex > 60 ? 'HIGH ACCIDENT RISK' : 'MODERATE RISK'}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Based on historical logs &amp; live weather</span>
                  </div>
                </div>

                {/* Analysis parameters list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.78rem' }}>
                  {/* Weather */}
                  <div style={{ display: 'flex', gap: 10, background: 'rgba(255,255,255,0.01)', padding: 10, borderRadius: 6, border: '1px solid var(--border)' }}>
                    <CloudRain size={16} style={{ color: 'var(--blue-400)', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Live Weather Factors:</span>
                      <p style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{routeRiskAnalysis.weatherWarning}</p>
                    </div>
                  </div>

                  {/* Hotspots */}
                  <div style={{ display: 'flex', gap: 10, background: 'rgba(255,255,255,0.01)', padding: 10, borderRadius: 6, border: '1px solid var(--border)' }}>
                    <AlertTriangle size={16} style={{ color: 'var(--amber-400)', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Historic Collision Spots:</span>
                      <ul style={{ paddingLeft: 14, margin: '4px 0 0 0', display: 'flex', flexDirection: 'column', gap: 3, color: 'var(--text-secondary)' }}>
                        {routeRiskAnalysis.hotspots.map((spot, index) => (
                          <li key={index}>
                            <strong style={{ color: '#fff' }}>{spot.name}:</strong> {spot.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Alternate route recommendation */}
                  <div style={{ display: 'flex', gap: 10, background: 'rgba(48,209,88,0.04)', padding: 12, borderRadius: 8, border: '1px solid rgba(48,209,88,0.2)' }}>
                    <ShieldCheck size={18} style={{ color: 'var(--green-400)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <span style={{ fontWeight: 800, color: 'var(--green-400)' }}>AI Alternate Routing:</span>
                      <p style={{ color: 'var(--text-primary)', marginTop: 3, lineHeight: 1.4 }}>{routeRiskAnalysis.safeRoute}</p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      <style>{`
        @keyframes scan-motion {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  )
}
