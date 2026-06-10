import { useEffect, useRef, useCallback } from 'react'
import { useStore } from '../store/useStore'

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

const getWsUrl = (url) => {
  if (url.startsWith('http://')) {
    return url.replace('http://', 'ws://') + '/stream';
  }
  if (url.startsWith('https://')) {
    return url.replace('https://', 'wss://') + '/stream';
  }
  if (url.startsWith('ws://') || url.startsWith('wss://')) {
    return url.endsWith('/stream') ? url : url + '/stream';
  }
  const isDev = url.startsWith('localhost') || url.startsWith('127.0.0.1');
  const protocol = isDev ? 'ws://' : (window.location.protocol === 'https:' ? 'wss://' : 'ws://');
  return `${protocol}${url}/stream`;
};

const WS_URL = getWsUrl(BACKEND_URL);

export function useWebSocket() {
  const wsRef = useRef(null)
  const { addWsEvent, setWsConnected, setAgentFromWs } = useStore()

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return

    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('[WS] Connected to RoadGuardian backend')
        setWsConnected(true)
      }

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data)
          addWsEvent(data)
          setAgentFromWs(data)
        } catch (e) {
          console.warn('[WS] Non-JSON message:', evt.data)
        }
      }

      ws.onclose = () => {
        console.log('[WS] Disconnected')
        setWsConnected(false)
        wsRef.current = null
      }

      ws.onerror = (err) => {
        console.warn('[WS] Connection error — backend may be offline. Using mock mode.')
        setWsConnected(false)
      }
    } catch (e) {
      console.warn('[WS] Could not connect:', e)
      setWsConnected(false)
    }
  }, [addWsEvent, setWsConnected, setAgentFromWs])

  const sendSOS = useCallback((payload) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
      return true
    }
    return false
  }, [])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return { sendSOS, connect, disconnect }
}
