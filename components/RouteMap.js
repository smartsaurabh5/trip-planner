'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon path in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], 12);
    }
  }, [center, map]);
  return null;
}

export default function RouteMap({ mapData, destination }) {
  if (!mapData || !mapData.center) return null;

  const centerPosition = [mapData.center.lat || 20.5937, mapData.center.lng || 78.9629];
  const spots = mapData.spots || [];

  return (
    <div className="w-full h-[380px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={centerPosition}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter center={mapData.center} />

        {/* Center destination marker */}
        <Marker position={centerPosition} icon={customIcon}>
          <Popup>
            <div className="font-sans">
              <p className="font-bold text-slate-900">{destination}</p>
              <p className="text-xs text-slate-500">Destination Center</p>
            </div>
          </Popup>
        </Marker>

        {/* Highlighted spots */}
        {spots.map((spot, idx) => (
          <Marker 
            key={idx} 
            position={[spot.lat, spot.lng]} 
            icon={customIcon}
          >
            <Popup>
              <div className="font-sans">
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                  Day {spot.day || 1}
                </span>
                <p className="font-bold text-sm text-slate-900 mt-1">{spot.name}</p>
                {spot.description && (
                  <p className="text-xs text-slate-600 mt-0.5">{spot.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}