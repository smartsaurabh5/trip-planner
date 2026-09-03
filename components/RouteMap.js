'use client';

import React, { useEffect, useRef, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Safely patch Leaflet's L.DomUtil.getPosition to prevent _leaflet_pos TypeError on React re-renders or scroll zooms
if (typeof window !== 'undefined' && L && L.DomUtil && !L.DomUtil.__patched_pos) {
  const originalGetPosition = L.DomUtil.getPosition;
  L.DomUtil.getPosition = function (el) {
    if (!el || typeof el !== 'object' || !('_leaflet_pos' in el) || !el._leaflet_pos) {
      return new L.Point(0, 0);
    }
    try {
      return originalGetPosition.call(this, el);
    } catch (e) {
      return new L.Point(0, 0);
    }
  };
  L.DomUtil.__patched_pos = true;
}

// Fix Leaflet default marker icons for Next.js SSR / dynamic imports
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map view positioning and touchpad zoom isolation
function MapController({ lat, lng }) {
  const map = useMap();
  const lastCenteredRef = useRef(null);

  useEffect(() => {
    if (!map || !map._container) return;

    const container = map._container;

    // Prevent touchpad pinch-zoom (ctrlKey + wheel) from zooming the entire browser window
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    const key = `${lat}-${lng}`;
    if (lat && lng && lastCenteredRef.current !== key) {
      lastCenteredRef.current = key;
      try {
        map.setView([lat, lng], 12, { animate: false });
        const timer = setTimeout(() => {
          if (map && map._container) {
            map.invalidateSize();
          }
        }, 200);
        return () => clearTimeout(timer);
      } catch (err) {
        console.warn('Leaflet map controller warning:', err);
      }
    }

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [lat, lng, map]);

  return null;
}

function RouteMapComponent({ mapData, mapCoordinates, coordinates, destination }) {
  const data = mapData || mapCoordinates || coordinates;

  const centerLat = data?.center?.lat || 20.5937;
  const centerLng = data?.center?.lng || 78.9629;
  const centerPosition = [centerLat, centerLng];
  const spots = Array.isArray(data?.spots) ? data.spots : [];

  return (
    <div className="w-full h-[280px] xs:h-[340px] sm:h-[380px] md:h-[420px] rounded-2xl overflow-hidden border border-slate-700/60 shadow-lg relative z-0 bg-slate-900">
      <MapContainer
        center={centerPosition}
        zoom={12}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        zoomAnimation={false}
        fadeAnimation={false}
        markerZoomAnimation={false}
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController lat={centerLat} lng={centerLng} />

        {/* Center Destination Marker */}
        <Marker position={centerPosition} icon={customIcon}>
          <Popup>
            <div className="font-sans text-slate-900">
              <p className="font-bold text-sm">{destination || 'Destination'}</p>
              <p className="text-xs text-slate-600">Main Destination Hub</p>
            </div>
          </Popup>
        </Marker>

        {/* Day-by-Day Spots & Landmarks */}
        {spots.map((spot, idx) => {
          if (!spot || !spot.lat || !spot.lng) return null;
          return (
            <Marker 
              key={`spot-${idx}-${spot.lat}-${spot.lng}`} 
              position={[spot.lat, spot.lng]} 
              icon={customIcon}
            >
              <Popup>
                <div className="font-sans text-slate-900">
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                    Day {spot.day || 1}
                  </span>
                  <p className="font-bold text-sm mt-1">{spot.name || 'Landmark'}</p>
                  {spot.description && (
                    <p className="text-xs text-slate-600 mt-0.5">{spot.description}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// Wrap with React.memo so parent state updates never cause unexpected map re-mounts
export default memo(RouteMapComponent);