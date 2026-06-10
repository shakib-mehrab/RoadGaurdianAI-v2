import { useOffline } from '../hooks/useOffline'

export default function OfflineBanner() {
  const isOnline = useOffline()
  if (isOnline) return null

  return (
    <div className="offline-banner" role="alert" aria-live="polite">
      <span>◎</span>
      <span>Offline Mode — Emergency data cached locally. Core functions active.</span>
    </div>
  )
}
