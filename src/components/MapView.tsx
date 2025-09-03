// src/components/MapView.tsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
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
}

export default function MapView({
  center = [33.5731, -7.5898], // Casablanca par défaut
  markers = [],
}: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={12}
      className="h-72 w-full rounded-2xl"
      scrollWheelZoom={true}
    >
      <TileLayer
        // ⚡ TS fix: caster les props explicitement
        attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m, i) => (
        <Marker key={i} position={[m.lat, m.lng] as LatLngExpression}>
          <Popup>{m.label || `Mission ${i + 1}`}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
