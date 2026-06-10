import { useEffect } from 'react'
import { useStore } from '../store/useStore'

export function useOffline() {
  const { isOnline, setOnline } = useStore()

  useEffect(() => {
    const onOnline  = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [setOnline])

  return isOnline
}
