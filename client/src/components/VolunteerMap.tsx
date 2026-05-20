'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

interface RouteInfo {
  distanceKm: number;
  durationMin: number;
  polyline: [number, number][];
}

interface VolunteerMapProps {
  volunteerMoving: boolean;
}

export default function VolunteerMap({ volunteerMoving }: VolunteerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const volunteerMarkerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const stepRef = useRef(0);
  const intervalRef = useRef<any>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Donor and NGO fixed coordinates (Bangalore demo)
  const DONOR: [number, number] = [12.9716, 77.5946];
  const NGO: [number, number]   = [13.0358, 77.5970];

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import leaflet (browser-only)
    let isMounted = true;
    import('leaflet').then((L) => {
      if (!isMounted || !mapRef.current || mapInstanceRef.current) return;
      
      // Also double-check if the container already has a map attached (Leaflet internal check)
      if ((mapRef.current as any)._leaflet_id) {
         (mapRef.current as any)._leaflet_id = null;
      }

      // Fix default marker icon path issue in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Init map
      const map = L.map(mapRef.current, {
        center: [13.0037, 77.5969],
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Donor marker (pink)
      const donorIcon = L.divIcon({
        className: '',
        html: `<div style="background:linear-gradient(135deg,#ec4899,#8b5cf6);width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 0 12px rgba(236,72,153,0.6)"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      // NGO marker (green)
      const ngoIcon = L.divIcon({
        className: '',
        html: `<div style="background:linear-gradient(135deg,#10b981,#06b6d4);width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 0 12px rgba(16,185,129,0.6)"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      // Volunteer marker (cyan pulse)
      const volunteerIcon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:20px;height:20px">
          <div style="position:absolute;inset:0;background:#06b6d4;border-radius:50%;animation:pulse 1.5s ease infinite;opacity:0.4;transform:scale(1.8)"></div>
          <div style="position:absolute;inset:0;background:#06b6d4;border-radius:50%;border:2px solid #fff;box-shadow:0 0 10px #06b6d4"></div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker(DONOR, { icon: donorIcon }).addTo(map)
        .bindPopup('<b>🍕 Donor Location</b><br>Golden Grain Bakery<br>42 Main St, Downtown');

      L.marker(NGO, { icon: ngoIcon }).addTo(map)
        .bindPopup('<b>🏢 NGO Drop-off</b><br>Hope Shelter<br>Receiving food donations');

      const volMarker = L.marker(DONOR, { icon: volunteerIcon }).addTo(map)
        .bindPopup('<b>🚛 Volunteer Vehicle</b><br>Live GPS Tracking Active');
      volunteerMarkerRef.current = volMarker;

      mapInstanceRef.current = map;
      setMapReady(true);

      // Fetch OSRM route
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${DONOR[1]},${DONOR[0]};${NGO[1]},${NGO[0]}?overview=full&geometries=geojson`;
      fetch(osrmUrl)
        .then((r) => r.json())
        .then((data) => {
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coords: [number, number][] = route.geometry.coordinates.map(
              ([lng, lat]: [number, number]) => [lat, lng]
            );

            // Draw route polyline
            if (routeLayerRef.current) map.removeLayer(routeLayerRef.current);
            routeLayerRef.current = L.polyline(coords, {
              color: '#8b5cf6',
              weight: 4,
              opacity: 0.8,
              dashArray: '8 4',
            }).addTo(map);

            map.fitBounds(routeLayerRef.current.getBounds(), { padding: [40, 40] });

            setRouteInfo({
              distanceKm: Math.round((route.distance / 1000) * 10) / 10,
              durationMin: Math.round(route.duration / 60),
              polyline: coords,
            });
          }
        })
        .catch(() => {
          // Fallback straight line if OSRM fails
          const fallback: [number, number][] = [DONOR, NGO];
          routeLayerRef.current = L.polyline(fallback, {
            color: '#8b5cf6',
            weight: 4,
            opacity: 0.6,
            dashArray: '8 4',
          }).addTo(map);
          map.fitBounds(routeLayerRef.current.getBounds(), { padding: [40, 40] });
          setRouteInfo({ distanceKm: 7.1, durationMin: 18, polyline: fallback });
        });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Animate volunteer along route polyline
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!volunteerMoving || !routeInfo || !volunteerMarkerRef.current) return;

    const pts = routeInfo.polyline;
    intervalRef.current = setInterval(() => {
      stepRef.current = (stepRef.current + 1) % pts.length;
      volunteerMarkerRef.current?.setLatLng(pts[stepRef.current]);
    }, 300);

    return () => clearInterval(intervalRef.current);
  }, [volunteerMoving, routeInfo]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Leaflet CSS */}
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1.8);opacity:0.4} 50%{transform:scale(2.4);opacity:0.15} }
        .leaflet-container { background: #0d0d14; border-radius: 12px; }
        .leaflet-popup-content-wrapper { background: rgba(20,20,35,0.95); color: #e2e8f0; border: 1px solid rgba(139,92,246,0.3); border-radius: 10px; }
        .leaflet-popup-tip { background: rgba(20,20,35,0.95); }
      `}</style>

      {/* Map container */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '260px',
          borderRadius: '12px',
          border: '1px solid rgba(139,92,246,0.25)',
          overflow: 'hidden',
          position: 'relative',
        }}
      />

      {/* Route stats */}
      {routeInfo && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Distance', value: `${routeInfo.distanceKm} km` },
            { label: 'Est. Time', value: `${routeInfo.durationMin} min` },
            { label: 'Route Engine', value: 'OSRM Free' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '0.72rem',
                textAlign: 'center',
              }}
            >
              <div style={{ color: 'var(--text-muted)', marginBottom: '3px' }}>{item.label}</div>
              <div style={{ color: '#fff', fontWeight: 700 }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#ec4899' }} />
          Donor Pickup
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
          NGO Drop-off
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#06b6d4' }} />
          Volunteer (live)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#8b5cf6' }}>
          — OSRM Route
        </span>
      </div>
    </div>
  );
}
