import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';


const defaultCenter = {
  lat: 40.7128, // Default to New York
  lng: -74.0060
};

// Modern SVG Marker for a clean look (Green for items)
const customMarkerIcon = {
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  fillColor: "#10b981", // matches var(--primary)
  fillOpacity: 1,
  strokeWeight: 2,
  strokeColor: "#ffffff",
  scale: 1.6,
  anchor: typeof window !== 'undefined' && window.google ? new window.google.maps.Point(12, 22) : { x: 12, y: 22 },
};

// Blue dot for the user's current location
const userLocationIcon = {
  path: typeof window !== 'undefined' && window.google ? window.google.maps.SymbolPath.CIRCLE : 0,
  fillColor: "#3b82f6", // Blue
  fillOpacity: 1,
  strokeWeight: 3,
  strokeColor: "#ffffff",
  scale: 8,
};

const defaultOptions = {
  disableDefaultUI: true, // cleaner look without all the buttons
  zoomControl: true,
  mapTypeControl: true, // Enable Satellite / Map toggle
  streetViewControl: false,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

export default function MapComponent({ items = [], center = defaultCenter, userLocation = null, height = '400px' }) {
  const containerStyle = {
    width: '100%',
    height: height,
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    border: '1px solid var(--border-color)'
  };
  // IMPORTANT: For production, you must use a real API key provided by the user.
  // In development, the map will load with a "development purposes only" watermark 
  // if no key or an invalid key is provided.
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAdKQ9nxHNWW1O50p3Sk-2iDAm4ZzgZUmg' 
  });

  const [, setMap] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const onLoad = useCallback(function callback(m) {
    // Optionally fit bounds here if you have items
    setMap(m);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  if (!isLoaded) return <div style={{ height: height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', borderRadius: '12px' }}>Loading Map...</div>;

  return (
    <div className="map-wrapper" style={{ position: 'relative', width: '100%', height: height, marginTop: '16px', marginBottom: '16px' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={defaultOptions}
      >
        {/* Render "You Are Here" marker */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <Marker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            icon={userLocationIcon}
            zIndex={999}
            onClick={() => setSelectedItem({ isUser: true, title: "You Are Here", category: "Your current location" })}
          />
        )}

        {/* Render markers for each item */}
        {items.map((item, index) => (
          item.location && item.location.lat && item.location.lng ? (
            <Marker
              key={item.id || index}
              position={{ lat: item.location.lat, lng: item.location.lng }}
              icon={customMarkerIcon}
              onClick={() => setSelectedItem(item)}
            />
          ) : null
        ))}

        {/* Render InfoWindow when a marker is clicked */}
        {selectedItem && selectedItem.location && (
          <InfoWindow
            position={{ lat: selectedItem.location.lat, lng: selectedItem.location.lng }}
            onCloseClick={() => setSelectedItem(null)}
          >
            <div style={{ padding: '8px', maxWidth: '200px', fontFamily: 'inherit' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#111827' }}>{selectedItem.title}</h3>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>{selectedItem.category}</p>
              {selectedItem.image && (
                <div style={{ width: '100%', height: '120px', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px' }}>
                  <img src={selectedItem.image} alt={selectedItem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#10b981', fontSize: '14px' }}>{selectedItem.price}</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{selectedItem.distance}</span>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
