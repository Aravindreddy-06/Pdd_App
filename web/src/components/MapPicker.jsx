import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin, Search, Navigation, AlertCircle, X } from 'lucide-react';
import { useUser } from '../hooks/useUser';

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946
};

// We don't necessarily need 'places' library if we use our own custom suggestions
const libraries = [];

export default function MapPicker({ onLocationSelect, initialLocation = null }) {
  const { user } = useUser();
  const [loadError, setLoadError] = useState(false);
  
  const [center, setCenter] = useState(() => {
    if (initialLocation?.lat && initialLocation?.lng) {
      return { lat: initialLocation.lat, lng: initialLocation.lng };
    }
    if (user?.coordinates?.lat && user?.coordinates?.lng) {
      return { lat: user.coordinates.lat, lng: user.coordinates.lng };
    }
    return defaultCenter;
  });

  const [marker, setMarker] = useState(() => {
    if (initialLocation?.lat && initialLocation?.lng) {
      return { lat: initialLocation.lat, lng: initialLocation.lng };
    }
    return null;
  });

  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Attempt to get fresh GPS location on mount if no initial location
  useEffect(() => {
    if (!initialLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCenter(newPos);
          // Don't set marker yet, let user tap or we can auto-reverse-geocode
        },
        (err) => console.log("MapPicker GPS error:", err),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [initialLocation]);
  
  const { isLoaded, loadError: apiError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  useEffect(() => {
    if (apiError) setLoadError(true);
  }, [apiError]);

  // Fetch suggestions from Photon (OpenStreetMap) as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Sync with prop changes
  useEffect(() => {
    if (initialLocation && initialLocation.lat && initialLocation.lng) {
      const pos = { lat: initialLocation.lat, lng: initialLocation.lng };
      setCenter(pos);
      setMarker(pos);
      if (initialLocation.address) {
        setSearchQuery(initialLocation.address);
      }
    }
  }, [initialLocation]);

  const [isLocating, setIsLocating] = useState(false);

  // Function to handle getting current GPS
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(newPos);
        setMarker(newPos);
        
        // Reverse geocode this point
        try {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          let address = '';
          
          if (apiKey) {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${newPos.lat},${newPos.lng}&key=${apiKey}&result_type=sublocality|locality|neighborhood`);
            const data = await response.json();
            if (data.results && data.results[0]) {
              // Try to get sublocality
              const result = data.results[0];
              const sub = result.address_components.find(c => c.types.includes('sublocality'))?.long_name;
              const loc = result.address_components.find(c => c.types.includes('locality'))?.long_name;
              address = sub ? (loc ? `${sub}, ${loc}` : sub) : result.formatted_address.split(',').slice(0, 2).join(', ');
            }
          }
          
          if (!address) {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}&zoom=18&addressdetails=1`);
            const data = await response.json();
            const a = data.address;
            const sub = a.suburb || a.neighbourhood || a.road || a.village;
            const city = a.city || a.town || a.municipality;
            address = sub ? (city ? `${sub}, ${city}` : sub) : data.display_name.split(',').slice(0, 2).join(', ');
          }
          
          setSearchQuery(address);
          onLocationSelect({ address, lat: newPos.lat, lng: newPos.lng });
        } catch (err) {
          console.error(err);
          onLocationSelect({ address: "My Current Location", lat: newPos.lat, lng: newPos.lng });
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        alert("Could not detect your location. Please check GPS settings.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onLocationSelect]);

  const onMapClick = useCallback(async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const pos = { lat, lng };
    setMarker(pos);
    setCenter(pos);
    
    // Reverse geocode to get a readable address
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      let address = '';
      
      if (apiKey) {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&result_type=sublocality|locality|neighborhood`);
        const data = await response.json();
        if (data.results && data.results[0]) {
          const result = data.results[0];
          const sub = result.address_components.find(c => c.types.includes('sublocality'))?.long_name;
          const loc = result.address_components.find(c => c.types.includes('locality'))?.long_name;
          address = sub ? (loc ? `${sub}, ${loc}` : sub) : result.formatted_address.split(',').slice(0, 2).join(', ');
        }
      }
      
      if (!address) {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await response.json();
        if (data && data.address) {
          const a = data.address;
          const main = a.suburb || a.neighbourhood || a.road || a.village || a.hamlet;
          const city = a.city || a.town || a.municipality;
          address = main ? (city ? `${main}, ${city}` : main) : data.display_name.split(',').slice(0, 2).join(', ');
        } else {
          address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
      }
      
      onLocationSelect({ address, lat, lng });
      setSearchQuery(address);
    } catch (err) {
      console.error("Geocoding failed:", err);
      onLocationSelect({ address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng });
    }
  }, [onLocationSelect]);

  const handleSelectSuggestion = (suggestion) => {
    const [lng, lat] = suggestion.geometry.coordinates;
    const pos = { lat, lng };
    
    // Format address string
    const props = suggestion.properties;
    const address = [props.name, props.city, props.state].filter(Boolean).join(', ');
    
    setCenter(pos);
    setMarker(pos);
    setSearchQuery(props.name || '');
    setSuggestions([]);
    setShowSuggestions(false);
    
    onLocationSelect({
      address: address,
      lat: pos.lat,
      lng: pos.lng
    });
  };

  // If API fails or no key, show Fallback
  if (!isLoaded || loadError || !import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="map-picker-fallback" style={{ 
        width: '100%', 
        height: '100%', 
        background: '#f8fafc',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        borderRadius: '16px'
      }}>
        <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 1 }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            background: 'var(--primary-lightest)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '2px solid var(--primary)'
          }}>
            <MapPin size={32} color="var(--primary)" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#1f2937', fontWeight: 700, fontSize: '15px' }}>Map Service Limited</p>
            <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>Using manual entry coordinates</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-picker-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        zIndex: 100,
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search location (e.g. Nazarathpettai)..."
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'white',
                  color: '#1f2937'
                }}
              />
              {searchQuery && (
                <button 
                  onClick={() => {setSearchQuery(''); setSuggestions([]);}}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <button 
              onClick={handleLocateMe}
              disabled={isLocating}
              style={{
                width: '44px',
                height: '44px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #d1d5db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                color: isLocating ? 'var(--primary)' : '#4b5563',
                flexShrink: 0
              }}
              title="Locate Me"
            >
              <Navigation size={20} className={isLocating ? 'animate-pulse' : ''} />
            </button>
          </div>

          {/* CUSTOM SUGGESTIONS DROPDOWN */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '6px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease'
            }}>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(item)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid #f3f4f6',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                    {item.properties.name}
                  </span>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>
                    {[item.properties.city, item.properties.state].filter(Boolean).join(', ')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={15}
          onClick={onMapClick}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {marker && <Marker position={marker} animation={window.google?.maps.Animation.DROP} />}
        </GoogleMap>
      </div>

      <div style={{ 
        position: 'absolute', 
        bottom: '12px', 
        left: '12px', 
        background: 'rgba(255,255,255,0.9)', 
        backdropFilter: 'blur(4px)',
        padding: '6px 12px',
        borderRadius: '8px',
        color: '#1f2937',
        fontSize: '11px',
        fontWeight: 600,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        pointerEvents: 'none',
        zIndex: 10
      }}>
        {isLocating ? 'Locating...' : 'Tap map to adjust pin'}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
