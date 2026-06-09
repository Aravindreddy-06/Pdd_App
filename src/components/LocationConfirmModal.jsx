import { useState } from 'react';
import { MapPin, X, Check } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import './LocationConfirmModal.css';

export default function LocationConfirmModal() {
  const { isLocModalOpen, tempLocation, confirmLocation, closeLocModal, searchLocation } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedLocation, setEditedLocation] = useState(tempLocation?.location || '');
  const [isSearching, setIsSearching] = useState(false);

  if (!isLocModalOpen) return null;

  const handleSearch = async () => {
    if (!editedLocation.trim()) return;
    setIsSearching(true);
    const success = await searchLocation(editedLocation);
    setIsSearching(false);
    if (success) {
      setIsEditing(false); // Go back to confirm mode with the new result
    } else {
      alert("Location not found. Please try a different name.");
    }
  };

  const handleConfirm = () => {
    confirmLocation(isEditing ? editedLocation : null);
    setIsEditing(false);
  };

  return (
    <div className="loc-modal-overlay">
      <div className="loc-modal-card">
        <div className="loc-modal-header">
          <div className="loc-icon-bg">
            <MapPin size={24} color="white" />
          </div>
          <button className="loc-modal-close" onClick={closeLocModal}>
            <X size={20} />
          </button>
        </div>
        
        <div className="loc-modal-body">
          <h2 className="loc-modal-title">{isEditing ? 'Edit your location' : 'Is this your location?'}</h2>
          <p className="loc-modal-sub">
            {isEditing 
              ? 'Enter your neighborhood name correctly.' 
              : 'We detected your neighborhood to help you find nearby items.'}
          </p>
          
          <div className="loc-display-box">
            <MapPin size={18} className="text-primary" />
            {isEditing ? (
              <input 
                type="text"
                className="loc-edit-input"
                value={editedLocation}
                onChange={(e) => setEditedLocation(e.target.value)}
                autoFocus
              />
            ) : (
              <span className="loc-address-text">{tempLocation?.location || "Detecting..."}</span>
            )}
          </div>
        </div>

        <div className="loc-modal-footer">
          {!isEditing ? (
            <button className="btn-outline w-full" onClick={() => setIsEditing(true)}>
              Edit Location
            </button>
          ) : (
            <button className="btn-primary w-full flex-row items-center justify-center gap-2" onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search Location'}
            </button>
          )}
          <button className="btn-primary w-full flex-row items-center justify-center gap-2" onClick={handleConfirm} style={isEditing ? {background: '#f3f4f6', color: '#6b7280', boxShadow: 'none'} : {}}>
            <Check size={18} />
            {isEditing ? 'Confirm Manual Entry' : 'Confirm Location'}
          </button>
        </div>
      </div>
    </div>
  );
}
