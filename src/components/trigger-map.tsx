"use client";

import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet's default marker icons break under bundlers; point them at the CDN.
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface TriggerMapProps {
  latitude: number;
  longitude: number;
  name?: string | null;
  radiusMeters?: number;
  className?: string;
}

export default function TriggerMap({
  latitude,
  longitude,
  name,
  radiusMeters = 100,
  className,
}: TriggerMapProps) {
  const center: [number, number] = [latitude, longitude];

  return (
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom={false}
      className={className}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={center}
        radius={radiusMeters}
        pathOptions={{
          color: "#0d9488",
          fillColor: "#0d9488",
          fillOpacity: 0.15,
        }}
      />
      <Marker position={center}>
        {name && <Popup>{name}</Popup>}
      </Marker>
    </MapContainer>
  );
}
