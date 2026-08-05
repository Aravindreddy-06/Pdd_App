import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Check } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import MapPicker from '../components/MapPicker';
import './LocationAccess.css';

export default function LocationAccess() {
  const navigate = useNavigate();
  const { user, updateUser, requestLocation } = useUser();
  const [selectedLocation, setSelectedLocation] = useState(() => {
    if (user?.location && user?.coordinates?.lat && user?.coordinates?.lng) {
      return { 
        address: user.location, 
        lat: user.coordinates.lat, 
        lng: user.coordinates.lng 
      };
    }
    return null;
  });
  const [isLocating, setIsLocating] = useState(false);

  const handleUseGPS = async () => {
    setIsLocating(true);
    try {
      const newLocData = await requestLocation('gps');
      if (newLocData && (newLocData.coordinates || (newLocData.lat && newLocData.lng))) {
        const lat = newLocData.coordinates?.lat || newLocData.lat;
        const lng = newLocData.coordinates?.lng || newLocData.lng;
        const address = newLocData.location || newLocData.address || 'Current Location';

        const newLoc = { address, lat, lng };
        setSelectedLocation(newLoc);
        
        await updateUser({
          location: address,
          address: address,
          lat,
          lng,
          coordinates: { lat, lng },
          locationSource: 'gps'
        });
        
        navigate('/home');
        return;
      }

      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        setIsLocating(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          let address = '';

          try {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            if (apiKey) {
              const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&result_type=sublocality|locality|neighborhood`);
              const data = await res.json();
              if (data.results && data.results[0]) {
                const result = data.results[0];
                const sub = result.address_components.find(c => c.types.includes('sublocality'))?.long_name;
                const loc = result.address_components.find(c => c.types.includes('locality'))?.long_name;
                address = sub ? (loc ? `${sub}, ${loc}` : sub) : result.formatted_address.split(',').slice(0, 2).join(', ');
              }
            }
          } catch (e) {
            console.error("Google Geocoding error:", e);
          }

          if (!address) {
            try {
              const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
              if (nomRes.ok) {
                const nomData = await nomRes.json();
                if (nomData && nomData.address) {
                  const a = nomData.address;
                  const sub = a.suburb || a.neighbourhood || a.quarter || a.city_district || a.hamlet || a.village || a.town || a.city;
                  const city = a.city || a.town || a.municipality || a.county;
                  address = (sub && city && sub !== city) ? `${sub}, ${city}` : (sub || city || nomData.display_name.split(',').slice(0, 2).join(', '));
                }
              }
            } catch (e) {
              console.error("Nominatim Geocoding error:", e);
            }
          }

          if (!address) {
            address = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          }

          const newLoc = { address, lat, lng };
          setSelectedLocation(newLoc);

          await updateUser({
            location: address,
            address: address,
            lat,
            lng,
            coordinates: { lat, lng },
            locationSource: 'gps'
          });

          navigate('/home');
        },
        (error) => {
          console.error("GPS Error:", error);
          alert("Unable to detect your current location. Please check browser GPS permissions.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } catch (err) {
      console.error("GPS Error:", err);
      setIsLocating(false);
    }
  };

  const handleLocationSelect = (loc) => {
    console.log("Selected Location:", loc);
    setSelectedLocation(loc);
  };

  const handleConfirmLocation = async () => {
    if (selectedLocation && selectedLocation.address) {
      await updateUser({
        location: selectedLocation.address,
        address: selectedLocation.address,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        coordinates: { lat: selectedLocation.lat, lng: selectedLocation.lng },
        locationSource: 'pinned'
      });
      navigate('/home');
    }
  };

  return (
    <div className="container flex-col" style={{ paddingBottom: '32px', height: '100vh', overflow: 'hidden' }}>
      <div className="header-nav px-4 py-6">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h3 className="nav-title">Select Location</h3>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="flex-1 px-4 flex-col">
        <div className="map-picker-wrapper mt-2" style={{ flex: 1, position: 'relative', minHeight: '300px', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <MapPicker 
            onLocationSelect={handleLocationSelect} 
            initialLocation={selectedLocation} 
          />
        </div>

        <div className="location-info-card mt-6 p-6" style={{ background: 'var(--bg-white)', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '1px solid var(--border-color)' }}>
          <div className="flex-row items-center gap-3 mb-4">
            <div style={{ width: 40, height: 40, background: 'var(--primary-lightest)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={22} color="var(--primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', color: 'var(--text-gray)', fontWeight: 600 }}>Currently Selected</p>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedLocation?.address || "Select on map..."}
              </h4>
            </div>
          </div>

          <div className="flex-col gap-3">
            <button 
              className={`btn btn-primary ${!selectedLocation ? 'btn-disabled' : ''}`} 
              onClick={handleConfirmLocation}
              disabled={!selectedLocation}
              style={{ width: '100%', height: '52px', fontSize: '16px', borderRadius: '14px', gap: '8px', cursor: !selectedLocation ? 'not-allowed' : 'pointer', opacity: !selectedLocation ? 0.6 : 1 }}
            >
              <Check size={20} /> Pin This Location
            </button>
            
            <button 
              className="btn btn-outline" 
              onClick={handleUseGPS}
              disabled={isLocating}
              style={{ width: '100%', height: '52px', fontSize: '16px', borderRadius: '14px', gap: '8px', border: '2px solid var(--border-color)', color: 'var(--text-main)' }}
            >
              {isLocating ? (
                <>
                  <div className="spinning" style={{ width: '18px', height: '18px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  Locating...
                </>
              ) : (
                <>
                  <MapPin size={18} /> Use Current GPS Location
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
