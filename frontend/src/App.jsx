import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import Nav from './components/Nav'
import OfflineBanner from './components/OfflineBanner'
import Home from './pages/Home'
import MobileAppContainer from './pages/MobileAppContainer'
import Dashboard from './pages/Dashboard'
import HazardReport from './pages/HazardReport'
import Accessibility from './pages/Accessibility'
import DemoGraph from './pages/DemoGraph'
import DemoFlow from './pages/DemoFlow'
import PwaDemo from './pages/PwaDemo'

function App() {
  const { setPwaInstallPrompt, setPwaInstalled } = useStore()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
      setIsMobile(window.innerWidth < 768 || isStandalone)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setPwaInstallPrompt(e)
      console.log('[PWA] beforeinstallprompt event saved.')
    }

    const handleAppInstalled = () => {
      setPwaInstalled(true)
      console.log('[PWA] App installed successfully.')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setPwaInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [setPwaInstallPrompt, setPwaInstalled])

  return (
    <>
      {/* Global Navigation Bar */}
      <Nav />

      {/* Main Page Layout */}
      <main id="main-content" style={{ flex: 1, position: 'relative' }}>
        <Routes>
          <Route path="/" element={isMobile ? <Navigate to="/app" replace /> : <Home />} />
          <Route path="/app" element={<MobileAppContainer />} />
          <Route path="/emergency" element={<Navigate to="/app" replace />} />
          <Route path="/demo" element={<DemoFlow />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hazard" element={<HazardReport />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/demo-graph" element={<DemoGraph />} />
          <Route path="/pwa" element={<PwaDemo />} />
        </Routes>
      </main>

      {/* Floating Offline Status Banner */}
      <OfflineBanner />
    </>
  )
}

export default App

