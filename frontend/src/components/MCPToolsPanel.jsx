import { useStore } from '../store/useStore'

export default function MCPToolsPanel() {
  const { mcpTools } = useStore()

  if (!mcpTools || mcpTools.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>📡</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          MCP tool calls will appear after dispatch is activated
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card animate-float-up" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: '1.2rem' }}>📡</span>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>
            MCP Tool Calls
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Model Context Protocol — Dispatch Agent
          </div>
        </div>
        <span className="badge badge-green" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>
          {mcpTools.filter(t => t.status === 'success').length}/{mcpTools.length} OK
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mcpTools.map((tool, i) => (
          <div
            key={i}
            style={{
              padding: '12px 14px',
              background: 'var(--bg-elevated)',
              border: `1px solid ${tool.status === 'success' ? 'rgba(48,209,88,0.2)' : 'rgba(255,59,48,0.2)'}`,
              borderRadius: 'var(--radius-md)',
              animation: `slide-in-left 0.4s var(--ease-out) ${i * 0.15}s both`,
            }}
          >
            {/* Tool name + status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <code style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--blue-400)',
                background: 'rgba(10,132,255,0.08)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(10,132,255,0.2)',
              }}>
                {tool.tool}()
              </code>
              <span className={`badge ${tool.status === 'success' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.62rem' }}>
                {tool.status === 'success' ? '✓ SUCCESS' : '✗ FAILED'}
              </span>
            </div>

            {/* Payload */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 3 }}>
                PAYLOAD
              </div>
              <div style={{
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                fontFamily: 'monospace',
                background: 'var(--bg-card)',
                padding: '5px 8px',
                borderRadius: 'var(--radius-sm)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>
                {JSON.stringify(tool.payload, null, 1)}
              </div>
            </div>

            {/* Response */}
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 3 }}>
                RESPONSE
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--green-400)',
                fontWeight: 500,
                display: 'flex', gap: 6, alignItems: 'center',
              }}>
                <span>✓</span>
                <span>{tool.response}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
