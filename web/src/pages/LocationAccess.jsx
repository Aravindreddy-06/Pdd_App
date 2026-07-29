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
      const newLocData = await requestLocation();
      if (newLocData && newLocData.coordinates) {
        const newLoc = {
          address: newLocData.location || 'Current Location',
          lat: newLocData.coordinates.lat,
          lng: newLocData.coordinates.lng
        };
        setSelectedLocation(newLoc);
      }
    } catch (err) {
      console.error("GPS Error:", err);
    } finally {
      setIsLocating(false);
    }
  };

  const handleLocationSelect = (loc) => {
    console.log("Selected Location:", loc);
    setSelectedLocation(loc);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      updateUser({
        location: selectedLocation.address,
        address: selectedLocation.address,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        coordinates: { lat: selectedLocation.lat, lng: selectedLocation.lng },
        locationSource: 'manual'
      });
      // Small delay for visual feedback if needed, but navigate is fine
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
