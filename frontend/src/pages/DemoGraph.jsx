import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

// ─── Knowledge Graph Data ────────────────────────────────────────────────────
const NODES = [
  // Core Orchestrator
  { id: 'orchestrator', label: 'Orchestrator', type: 'orchestrator', emoji: '🧠', desc: 'LangGraph + Groq LLaMA3' },

  // Specialist Agents
  { id: 'triage',    label: 'Triage Agent',    type: 'agent', emoji: '🩺', desc: 'Severity Classification' },
  { id: 'guidance',  label: 'Guidance Agent',  type: 'agent', emoji: '📋', desc: 'RAG First-Aid Delivery' },
  { id: 'locate',    label: 'Locate Agent',    type: 'agent', emoji: '📍', desc: 'Hospital Finder' },
  { id: 'dispatch',  label: 'Dispatch Agent',  type: 'agent', emoji: '🚑', desc: 'Ambulance Dispatcher' },
  { id: 'hazard',    label: 'Hazard Agent',    type: 'agent', emoji: '⚠️', desc: 'Road Hazard Reporter' },

  // AI Infrastructure
  { id: 'groq',      label: 'Groq LLM',       type: 'llm',   emoji: '⚡', desc: 'LLaMA3-8b-8192 Inference' },
  { id: 'chromadb',  label: 'ChromaDB',        type: 'rag',   emoji: '🗂️', desc: '61 Semantic Chunks' },
  { id: 'embeddings',label: 'Embeddings',      type: 'rag',   emoji: '🔢', desc: 'MiniLM-L6-v2 Model' },
  { id: 'langgraph', label: 'LangGraph',       type: 'infra', emoji: '🔗', desc: 'Parallel Fan-Out Graph' },

  // MCP Tools
  { id: 'mcp_hospital', label: 'find_hospital()',    type: 'tool', emoji: '🏥', desc: 'MCP Tool' },
  { id: 'mcp_dispatch', label: 'dispatch_emergency()',type: 'tool', emoji: '📡', desc: 'MCP Tool' },
  { id: 'mcp_family',   label: 'notify_family()',    type: 'tool', emoji: '📲', desc: 'MCP Tool' },
  { id: 'mcp_hazard',   label: 'create_hazard_report()', type: 'tool', emoji: '🗺️', desc: 'MCP Tool' },

  // External Data
  { id: 'user',      label: 'Emergency User',  type: 'user',  emoji: '🆘', desc: 'SOS Trigger Source' },
  { id: 'websocket', label: 'WebSocket',       type: 'infra', emoji: '🔌', desc: 'Real-time Streaming' },
]

const LINKS = [
  // User → Orchestrator
  { source: 'user', target: 'orchestrator', label: 'SOS trigger' },

  // LangGraph controls Orchestrator
  { source: 'langgraph', target: 'orchestrator', label: 'graph engine' },

  // Orchestrator → Agents (fan-out)
  { source: 'orchestrator', target: 'triage',   label: 'parallel dispatch' },
  { source: 'orchestrator', target: 'guidance', label: 'parallel dispatch' },
  { source: 'orchestrator', target: 'locate',   label: 'parallel dispatch' },
  { source: 'orchestrator', target: 'dispatch', label: 'parallel dispatch' },
  { source: 'orchestrator', target: 'hazard',   label: 'parallel dispatch' },

  // Agents → LLM
  { source: 'triage',    target: 'groq', label: 'LLM call' },
  { source: 'guidance',  target: 'groq', label: 'LLM call' },
  { source: 'orchestrator', target: 'groq', label: 'LLM call' },

  // Guidance → RAG
  { source: 'guidance',   target: 'chromadb',   label: 'vector search' },
  { source: 'chromadb',   target: 'embeddings', label: 'embedding index' },

  // Agents → MCP Tools
  { source: 'locate',   target: 'mcp_hospital', label: 'tool call' },
  { source: 'dispatch', target: 'mcp_dispatch', label: 'tool call' },
  { source: 'dispatch', target: 'mcp_family',   label: 'tool call' },
  { source: 'hazard',   target: 'mcp_hazard',   label: 'tool call' },

  // WebSocket broadcasting
  { source: 'orchestrator', target: 'websocket', label: 'stream events' },
]

// ─── Color Map ───────────────────────────────────────────────────────────────
const COLOR = {
  orchestrator: '#f43f5e',
  agent:        '#6366f1',
  llm:          '#f59e0b',
  rag:          '#10b981',
  tool:         '#06b6d4',
  infra:        '#8b5cf6',
  user:         '#ef4444',
}

const RADIUS = {
  orchestrator: 30,
  agent: 22,
  llm: 24,
  rag: 20,
  tool: 16,
  infra: 18,
  user: 26,
}

export default function DemoGraph() {
  const svgRef = useRef(null)
  const [activeNode, setActiveNode] = useState(null)
  const [pulseActive, setPulseActive] = useState(false)

  useEffect(() => {
    const container = svgRef.current.parentElement
    const W = container.clientWidth || 900
    const H = Math.max(560, window.innerHeight * 0.62)

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', H)

    // ── Arrow marker ──────────────────────────────────────────────────────────
    const defs = svg.append('defs')
    Object.entries(COLOR).forEach(([type, color]) => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 28)
        .attr('refY', 0)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color)
        .attr('opacity', 0.7)
    })

    // ── Glow filter ──────────────────────────────────────────────────────────
    const filter = defs.append('filter').attr('id', 'glow')
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur')
    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // ── Simulation ────────────────────────────────────────────────────────────
    const nodes = NODES.map(n => ({ ...n }))
    const links = LINKS.map(l => ({ ...l }))

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => {
        if (d.source.type === 'orchestrator' || d.target.type === 'orchestrator') return 130
        if (d.target.type === 'tool') return 90
        return 110
      }).strength(0.6))
      .force('charge', d3.forceManyBody().strength(-420))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide().radius(d => (RADIUS[d.type] || 20) + 18))

    // ── Links ─────────────────────────────────────────────────────────────────
    const linkG = svg.append('g').attr('class', 'links')
    const linkSel = linkG.selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => {
        const src = nodes.find(n => n.id === (d.source.id || d.source))
        return COLOR[src?.type] || '#6b7280'
      })
      .attr('stroke-opacity', 0.45)
      .attr('stroke-width', 1.5)
      .attr('marker-end', d => {
        const src = nodes.find(n => n.id === (d.source.id || d.source))
        return `url(#arrow-${src?.type || 'agent'})`
      })

    // ── Link labels ───────────────────────────────────────────────────────────
    const linkLabelG = svg.append('g')
    linkLabelG.selectAll('text')
      .data(links)
      .join('text')
      .attr('font-size', 8)
      .attr('fill', '#9ca3af')
      .attr('text-anchor', 'middle')
      .text(d => d.label)

    // ── Node groups ───────────────────────────────────────────────────────────
    const nodeG = svg.append('g').attr('class', 'nodes')
    const nodeSel = nodeG.selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag',  (event, d) => { d.fx = event.x; d.fy = event.y })
        .on('end',   (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
      )
      .on('click', (_, d) => setActiveNode(d))

    // Outer pulse ring
    nodeSel.append('circle')
      .attr('r', d => (RADIUS[d.type] || 20) + 8)
      .attr('fill', 'none')
      .attr('stroke', d => COLOR[d.type] || '#6b7280')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.3)
      .attr('class', 'pulse-ring')

    // Main circle
    nodeSel.append('circle')
      .attr('r', d => RADIUS[d.type] || 20)
      .attr('fill', d => COLOR[d.type] || '#6b7280')
      .attr('fill-opacity', 0.18)
      .attr('stroke', d => COLOR[d.type] || '#6b7280')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)')

    // Emoji label
    nodeSel.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', d => d.type === 'orchestrator' ? 18 : 14)
      .text(d => d.emoji)

    // Name label below
    nodeSel.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', d => (RADIUS[d.type] || 20) + 14)
      .attr('font-size', 9)
      .attr('font-weight', 600)
      .attr('fill', '#e2e8f0')
      .attr('font-family', 'Inter, sans-serif')
      .text(d => d.label)

    // ── Tick ──────────────────────────────────────────────────────────────────
    sim.on('tick', () => {
      linkSel
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y)

      linkLabelG.selectAll('text')
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2)

      nodeSel.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => sim.stop()
  }, [])

  // Pulse animation trigger
  const runPulse = () => {
    setPulseActive(true)
    setTimeout(() => setPulseActive(false), 3000)
  }

  const stats = [
    { label: 'Agents', value: '5', color: '#6366f1' },
    { label: 'MCP Tools', value: '4', color: '#06b6d4' },
    { label: 'RAG Chunks', value: '61', color: '#10b981' },
    { label: 'Graph Edges', value: LINKS.length, color: '#f59e0b' },
    { label: 'LLM', value: 'Groq', color: '#f43f5e' },
  ]

  return (
    <div className="page-container" style={{ paddingTop: '88px', paddingRight: '16px', paddingBottom: '24px', paddingLeft: '16px', background: 'var(--bg-primary)', minHeight: '92vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 900, marginBottom: 6 }}>
            🕸️ Knowledge Graph
            <span className="badge badge-green" style={{ fontSize: '0.62rem', marginLeft: 12, textTransform: 'uppercase' }}>
              Live D3 Visualization
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            RoadGuardian AI architecture — multi-agent orchestration, RAG pipeline &amp; MCP tool graph.
            Click any node to inspect. Drag to rearrange.
          </p>
        </div>
        <button
          id="pulse-demo-btn"
          onClick={runPulse}
          className="btn btn-primary"
          style={{ minHeight: 42, padding: '10px 22px', fontSize: '0.85rem' }}
        >
          ⚡ Simulate SOS Pulse
        </button>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        {stats.map(s => (
          <div key={s.label} className="glass-card" style={{
            padding: '10px 18px', border: `1px solid ${s.color}44`,
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 20, alignItems: 'start' }}>

        {/* Graph Canvas */}
        <div className="glass-card animate-float-up" style={{
          border: '1px solid var(--border)', padding: 4, borderRadius: 16, overflow: 'hidden',
          boxShadow: pulseActive ? '0 0 40px #f43f5e66' : '0 0 0 transparent',
          transition: 'box-shadow 0.5s ease'
        }}>
          <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
        </div>

        {/* Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Node Inspector */}
          <div className="glass-card" style={{ border: '1px solid var(--border)', padding: 16 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12 }}>
              Node Inspector
            </div>
            {activeNode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: '2rem', textAlign: 'center' }}>{activeNode.emoji}</div>
                <div style={{
                  textAlign: 'center', fontWeight: 800, fontSize: '0.9rem',
                  color: COLOR[activeNode.type] || '#e2e8f0'
                }}>{activeNode.label}</div>
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {activeNode.desc}
                </div>
                <div style={{
                  marginTop: 6, padding: '4px 10px', borderRadius: 20, fontSize: '0.65rem',
                  background: (COLOR[activeNode.type] || '#6b7280') + '22',
                  color: COLOR[activeNode.type] || '#9ca3af',
                  textAlign: 'center', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  {activeNode.type}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  <strong style={{ color: '#9ca3af' }}>ID:</strong> {activeNode.id}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: '#9ca3af' }}>Connections:</strong>{' '}
                  {LINKS.filter(l => l.source === activeNode.id || l.target === activeNode.id).length}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '12px 0' }}>
                👆 Click any node to inspect
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="glass-card" style={{ border: '1px solid var(--border)', padding: 16 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12 }}>
              Legend
            </div>
            {Object.entries(COLOR).map(([type, color]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {type === 'llm' ? 'LLM Engine' : type === 'rag' ? 'RAG Pipeline' : type}
                </span>
              </div>
            ))}
          </div>

          {/* Live Edges Count */}
          <div className="glass-card" style={{ border: '1px solid #6366f144', padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#6366f1', fontFamily: 'var(--font-display)' }}>
              {LINKS.length}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Knowledge Edges
            </div>
          </div>

        </div>
      </div>

      {/* Bottom description */}
      <div className="glass-card animate-float-up" style={{
        border: '1px solid var(--border)', padding: '16px 24px',
        marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 24
      }}>
        {[
          { icon: '🧠', title: 'LangGraph Orchestration', desc: 'Parallel fan-out across 5 specialist agents with compiled state machine' },
          { icon: '📚', title: 'Hybrid RAG Pipeline', desc: 'ChromaDB + MiniLM embeddings over 61 WHO/Red Cross semantic chunks' },
          { icon: '🔧', title: 'MCP Tool Calling', desc: '4 production-grade tools: hospital finder, ambulance dispatch, family alerts, hazard logging' },
          { icon: '⚡', title: 'Real-time WebSocket', desc: 'Streamed JSON events broadcast to frontend dashboard in real time' },
        ].map(item => (
          <div key={item.title} style={{ flex: '1 1 180px' }}>
            <div style={{ fontSize: '1.1rem', marginBottom: 4 }}>{item.icon} <strong style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>{item.title}</strong></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
      </div>

    </div>
  )
}
