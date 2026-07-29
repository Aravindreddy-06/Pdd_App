import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, User, Mail, Phone, AlignLeft, ShieldCheck } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './EditProfile.css';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser, requestLocation } = useUser();
  const [formData, setFormData] = useState({ ...user });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({ ...prev, phone: value }));
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatar: imageUrl }));
    }
  };

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validate = () => {
    let newErrors = {};
    
    if (!formData.name?.trim()) newErrors.name = "Name is required";
    
    const email = formData.email?.trim() || '';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Invalid Email";
    }

    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      newErrors.phone = "Invalid Mobile Number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      setIsSaving(true);
      try {
        await updateUser(formData);
        navigate(-1);
      } catch (err) {
        console.error("Save error:", err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="edit-profile-container">
      {/* ── Header ─────────────────────────────────── */}
      <div className="header-nav px-4 py-4" style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 100 }}>
        <button className="back-btn" onClick={() => navigate(-1)} style={{ width: '32px', height: '32px' }}>
          <ArrowLeft size={20} />
        </button>
        <h3 className="nav-title" style={{ fontSize: '16px' }}>Edit Profile</h3>
        <button 
          className="btn btn-primary btn-sm" 
          onClick={handleSave} 
          disabled={isSaving}
          style={{ height: '36px', padding: '0 16px', fontSize: '13px' }}
        >
          {isSaving ? '...' : 'Save'}
        </button>
      </div>

      <div className="px-4 pb-10">
        {/* ── Avatar Section ────────────────────────────────── */}
        <div className="edit-avatar-section">
          <div className="edit-avatar-wrapper">
            <img src={formData.avatar} alt="Avatar" className="edit-avatar" />
            <button className="change-photo-btn" onClick={handlePhotoClick}>
              <Camera size={16} color="#000" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleImageChange} 
            />
          </div>
        </div>

        {/* ── Full Name Box ────────────────────────────────── */}
        <div className="edit-form-section">
          <label className="input-label">Full Name</label>
          <div className="input-with-icon">
            <User size={18} className="field-icon" />
            <input 
              type="text" 
              name="name" 
              className={`input-field ${errors.name ? 'input-error' : ''}`} 
              placeholder="Enter your name"
              value={formData.name || ''} 
              onChange={handleChange} 
            />
          </div>
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        {/* ── Bio Box ─────────────────────────────────────── */}
        <div className="edit-form-section">
          <label className="input-label">Bio</label>
          <div className="input-with-icon" style={{ alignItems: 'flex-start' }}>
            <AlignLeft size={18} className="field-icon" style={{ marginTop: '14px' }} />
            <textarea 
              className="input-field" 
              name="bio"
              placeholder="Tell neighbors a bit about yourself..."
              style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit', paddingTop: '14px' }}
              value={formData.bio || ''}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        {/* ── Email Box ────────────────────────────────────── */}
        <div className="edit-form-section">
          <label className="input-label">Email Address</label>
          <div className="input-with-icon">
            <Mail size={18} className="field-icon" />
            <input 
              type="email" 
              name="email" 
              className={`input-field ${errors.email ? 'input-error' : ''}`} 
              placeholder="your@email.com"
              value={formData.email || ''} 
              onChange={handleChange} 
            />
          </div>
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        {/* ── Phone Box ────────────────────────────────────── */}
        <div className="edit-form-section">
          <label className="input-label">Phone Number</label>
          <div className="input-with-icon">
            <Phone size={18} className="field-icon" />
            <PhoneInput
              className={`PhoneInput ${errors.phone ? 'input-error' : ''}`}
              international
              defaultCountry="IN"
              value={formData.phone || ''}
              onChange={handlePhoneChange}
            />
          </div>
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>

        {/* ── Address Box ──────────────────────────────────── */}
        <div className="edit-form-section">
          <label className="input-label">Address / Neighborhood</label>
          <div className="input-with-icon">
            <MapPin size={18} className="field-icon" />
            <input 
              type="text" 
              name="location" 
              className="input-field" 
              placeholder="Select neighborhood"
              value={formData.location || ''} 
              onChange={handleChange} 
              style={{ paddingRight: '44px' }}
              onClick={() => navigate('/location-access')}
              readOnly
            />
            <button 
              className="icon-btn-light" 
              style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', width: '30px', height: '30px', border: '1px solid var(--border-color)', background: 'transparent' }}
              onClick={(e) => { e.preventDefault(); navigate('/location-access'); }}
            >
              <ArrowLeft size={14} style={{ transform: 'rotate(180deg)', opacity: 0.5 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
