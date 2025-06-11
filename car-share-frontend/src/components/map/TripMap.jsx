import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const TripMap = ({ waypoints }) => {
  // Calculate center point between waypoints
  const center = [
    (waypoints[0].lat + waypoints[1].lat) / 2,
    (waypoints[0].lng + waypoints[1].lng) / 2
  ];

  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}
    >
      {/* OpenStreetMap tile layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Draw the route */}
      <Polyline
        positions={waypoints.map((wp) => [wp.lat, wp.lng])}
        color="#4F46E5"
        weight={3}
      />

      {/* Add markers for start and end points */}
      <Marker position={[waypoints[0].lat, waypoints[0].lng]}>
        <Popup>
          <div className="font-medium">Start Location</div>
        </Popup>
      </Marker>
      <Marker position={[waypoints[1].lat, waypoints[1].lng]}>
        <Popup>
          <div className="font-medium">End Location</div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default TripMap;
