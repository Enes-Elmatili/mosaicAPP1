// src/components/MapView.tsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Icon, LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix icônes manquantes Leaflet (bug connu Vite/Webpack)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapViewProps {
  center?: LatLngExpression;
  markers?: { lat: number; lng: number; label?: string }[];
  pulseFirstMarker?: boolean;
}

export default function MapView({
  center = [33.5731, -7.5898], // Casablanca par défaut
  markers = [],
  pulseFirstMarker = false,
}: MapViewProps) {
  // Create a pulsing div icon once
  const pulseIcon: Icon = L.divIcon({
    className: "",
    html: `<span class="leaflet-pulse-marker"><span class="ping"></span><span class="dot"></span></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="h-72 w-full rounded-2xl"
      scrollWheelZoom={true}
    >
      {/* Pulse marker styles */}
      <style>
        {`
        .leaflet-pulse-marker { position: relative; display: inline-block; width:16px; height:16px; }
        .leaflet-pulse-marker .dot { position:absolute; inset:0; background:#22c55e; border-radius:9999px; box-shadow:0 0 0 2px rgba(34,197,94,0.3); }
        .leaflet-pulse-marker .ping { position:absolute; inset:-8px; border:3px solid rgba(34,197,94,0.5); border-radius:9999px; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite; }
        @keyframes ping { 0% { transform: scale(0.5); opacity:0.8 } 80% { transform: scale(1.8); opacity:0 } 100% { opacity:0 } }
        `}
      </style>
      <TileLayer
        // ⚡ TS fix: caster les props explicitement
        attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m, i) => (
        <Marker key={i} position={[m.lat, m.lng] as LatLngExpression} icon={pulseFirstMarker && i === 0 ? pulseIcon : undefined}>
          <Popup>{m.label || `Mission ${i + 1}`}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
