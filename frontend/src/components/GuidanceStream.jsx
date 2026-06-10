import { useStore } from '../store/useStore'
import ReactMarkdown from 'react-markdown'
import { MessageSquare } from 'lucide-react'

export default function GuidanceStream() {
  const { guidanceStream, ragStreaming, ragResponse, ragSources, sosActive, incidentState } = useStore()

  // Use SOS guidance stream if in emergency, else standalone RAG response
  const content = guidanceStream || ragResponse
  const streaming = ragStreaming || (sosActive && incidentState === 'GUIDED' && guidanceStream !== '')
  const sources = ragSources.length > 0 ? ragSources : []

  if (!content && !streaming) {
    return (
      <div className="glass-card" style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <MessageSquare size={32} style={{ color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          First-aid guidance will appear here once emergency is activated
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Source citations */}
      {sources.length > 0 && (
        <div className="glass-card-sm" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 10 }}>
            RAG SOURCES — {sources.length} RETRIEVED
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sources.map((src, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '8px 12px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                animation: 'slide-in-right 0.4s var(--ease-out) both',
                animationDelay: `${i * 0.1}s`,
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--blue-400)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                  [{i + 1}]
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {src.title || src.section}
                  </div>
                  {src.section && src.title && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{src.section}</div>
                  )}
                  {src.chunk && (
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-secondary)',
                      marginTop: 4,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {src.chunk}
                    </div>
                  )}
                </div>
                {/* Confidence bar */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--green-400)', fontWeight: 700 }}>
                    {Math.round((src.score || 0.9) * 100)}%
                  </span>
                  <div className="confidence-bar" style={{ width: 48 }}>
                    <div className="confidence-bar-fill" style={{
                      width: `${(src.score || 0.9) * 100}%`,
                      background: 'linear-gradient(90deg, var(--green-500), var(--green-400))',
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streaming response */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <MessageSquare size={18} style={{ color: 'var(--blue-400)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>
            AI First-Aid Guidance
          </span>
          {streaming && (
            <span className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
              ● STREAMING
            </span>
          )}
        </div>

        <div
          className={streaming ? 'stream-cursor' : ''}
          style={{
            fontSize: '0.9rem',
            lineHeight: 1.7,
            color: 'var(--text-primary)',
          }}
        >
          <div style={{
            '--text-color': 'var(--text-primary)',
            '--heading-color': 'var(--text-primary)',
            '--link-color': 'var(--blue-400)',
            '--code-bg': 'var(--bg-elevated)',
          }}>
            <ReactMarkdown
              components={{
                h1: ({children}) => <h1 style={{ fontSize: '1.2rem', marginBottom: 12, color: 'var(--text-primary)' }}>{children}</h1>,
                h2: ({children}) => <h2 style={{ fontSize: '1.05rem', marginBottom: 10, marginTop: 16, color: 'var(--text-primary)' }}>{children}</h2>,
                h3: ({children}) => <h3 style={{ fontSize: '0.95rem', marginBottom: 8, marginTop: 12, color: 'var(--blue-400)' }}>{children}</h3>,
                p: ({children}) => <p style={{ marginBottom: 10, color: 'var(--text-secondary)' }}>{children}</p>,
                strong: ({children}) => <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{children}</strong>,
                em: ({children}) => <em style={{ color: 'var(--text-muted)' }}>{children}</em>,
                ul: ({children}) => <ul style={{ paddingLeft: 20, marginBottom: 10 }}>{children}</ul>,
                ol: ({children}) => <ol style={{ paddingLeft: 20, marginBottom: 10 }}>{children}</ol>,
                li: ({children}) => <li style={{ marginBottom: 4, color: 'var(--text-secondary)' }}>{children}</li>,
                hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '14px 0' }} />,
                code: ({children}) => (
                  <code style={{
                    background: 'var(--bg-elevated)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: '0.85em',
                    color: 'var(--blue-400)',
                  }}>{children}</code>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
