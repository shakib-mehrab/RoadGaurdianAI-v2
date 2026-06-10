import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useStore } from '../store/useStore'

// Fix default icon path issue in Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const createCustomIcon = (color, emoji) => L.divIcon({
  className: '',
  html: `<div style="
    width:36px;height:36px;border-radius:50%;
    background:${color};border:3px solid white;
    display:flex;align-items:center;justify-content:center;
    font-size:16px;
    box-shadow:0 2px 12px rgba(0,0,0,0.4);
  ">${emoji}</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

const sosIcon      = createCustomIcon('#FF3B30', '🚨')
const hospitalIcon = createCustomIcon('#30D158', '🏥')
const hazardIcon   = createCustomIcon('#FF9F0A', '⚠️')
const responderIcon = createCustomIcon('#0A84FF', '✚')
const motorcycleIcon = createCustomIcon('#BF5AF2', '🏍️')

// Default Dhaka coords
const DEFAULT_CENTER = [23.8103, 90.4125]

function MapInvalidator() {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 250)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

function FlyToLocation({ location }) {
  const map = useMap()
  useEffect(() => {
    if (location) map.flyTo([location.lat, location.lng], 14, { duration: 1.5 })
  }, [location, map])
  return null
}
export default function LiveMap({ height = 360 }) {
  const { location, hospitals, hazards, sosActive, rescueFeeds, partnerRiders } = useStore()

  const center = location
    ? [location.lat || DEFAULT_CENTER[0], location.lng || DEFAULT_CENTER[1]]
    : DEFAULT_CENTER

  // Use actual hospital coordinates if available, otherwise offset relative to center
  const hospitalPositions = hospitals.map((h, i) => ({
    ...h,
    lat: h.lat || (center[0] + (i * 0.02 - 0.02)),
    lng: h.lng || (center[1] + (i * 0.025 - 0.015)),
  }))

  return (
    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={false}
      >
        <MapInvalidator />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />

        {location && <FlyToLocation location={location} />}

        {/* SOS Incident marker */}
        {sosActive && (
          <>
            <Marker position={center} icon={sosIcon}>
              <Popup>
                <div style={{ fontFamily: 'sans-serif', fontSize: 13 }}>
                  <strong>🚨 Emergency Incident</strong><br />
                  {center[0].toFixed(4)}°N, {center[1].toFixed(4)}°E
                </div>
              </Popup>
            </Marker>
            <Circle
              center={center}
              radius={300}
              pathOptions={{ color: '#FF3B30', fillColor: '#FF3B30', fillOpacity: 0.08, weight: 2 }}
            />
          </>
        )}

        {/* Hospital markers */}
        {hospitalPositions.map((h, i) => (
          <Marker key={i} position={[h.lat, h.lng]} icon={hospitalIcon}>
            <Popup>
              <div style={{ fontFamily: 'sans-serif', fontSize: 13 }}>
                <strong>🏥 {h.name}</strong><br />
                {h.type}<br />
                ETA: <strong>{h.eta}</strong> — {h.dist}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Community Responder markers */}
        {sosActive && rescueFeeds?.responders && rescueFeeds.responders.map((resp, i) => (
          <Marker key={i} position={[resp.lat, resp.lng]} icon={responderIcon}>
            <Popup>
              <div style={{ fontFamily: 'sans-serif', fontSize: 13 }}>
                <strong>👤 Community Responder</strong><br />
                Name: {resp.name} ({resp.role})<br />
                Distance: {resp.dist} — Status: <strong>{resp.status}</strong>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Partner riders on map */}
        {partnerRiders && partnerRiders.map((rider, i) => (
          <Marker key={`rider-${i}`} position={[rider.lat, rider.lng]} icon={motorcycleIcon}>
            <Popup>
              <div style={{ fontFamily: 'sans-serif', fontSize: 13 }}>
                <strong>🏍️ Partner Rider</strong><br />
                {rider.name}<br />
                Type: {rider.type}<br />
                Rating: ⭐{rider.rating}<br />
                Status: <strong>{rider.status}</strong>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Hazard markers */}
        {hazards && hazards.map((hz, i) => (
          <Marker
            key={i}
            position={[
              hz.location?.lat || center[0] + 0.005,
              hz.location?.lng || center[1] + 0.008,
            ]}
            icon={hazardIcon}
          >
            <Popup>
              <div style={{ fontFamily: 'sans-serif', fontSize: 13 }}>
                <strong>⚠️ {hz.hazard_type}</strong><br />
                Severity: {hz.severity}<br />
                AI Confidence: {hz.ai_confidence ? `${Math.round(hz.ai_confidence * 100)}%` : 'N/A'}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
