import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ImagePlus, ChevronDown, X, MapPin, Package, Star, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { useItems } from '../context/ItemContext';
import { useNotifications } from '../context/NotificationContext';
import MapPicker from '../components/MapPicker';
import './AddItem.css';

// Compress & resize image via canvas before encoding — keeps file size small enough for localStorage
const compressImage = (file, maxWidth = 900, quality = 0.75) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target.result); // fallback: use original
    };
    reader.onerror = () => resolve(null);
  });
};

export default function AddItem() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { addItem } = useItems();
  const { addNotification } = useNotifications();
  const fileInputRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState(null);
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [location, setLocation] = useState(() => {
    if (user?.location && user?.coordinates) {
      return { 
        address: user.location, 
        lat: user.coordinates.lat, 
        lng: user.coordinates.lng 
      };
    }
    return { address: '', lat: null, lng: null };
  });
  const [showMap, setShowMap] = useState(false);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState([
    { id: 1, text: 'Clean after use', checked: false },
    { id: 2, text: 'Return charged/fueled', checked: false },
    { id: 3, text: 'Indoor use only', checked: false },
    { id: 4, text: 'No food or drinks', checked: false },
    { id: 5, text: 'Handle with care', checked: false },
  ]);
  const [customRule, setCustomRule] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [title, setTitle] = useState('');
  const [condition, setCondition] = useState('Good');
  const [isFree, setIsFree] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Photo reordering functions
  const movePhoto = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= photos.length || fromIndex === toIndex) return;
    setPhotos(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const setAsMainPhoto = (index) => {
    if (index === 0) return;
    movePhoto(index, 0);
  };

  // Calculate form completion progress
  const progress = [
    photos.length > 0,
    title.trim().length > 0,
    category !== '',
    location.address !== '',
    isFree || price !== '',
    description.trim().length > 0
  ].filter(Boolean).length / 6 * 100;

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handlePublish = async () => {
    try {
      // Compress all uploaded photos before encoding — prevents localStorage quota errors
      const base64Images = await Promise.all(
        photos.map(async (p) => {
          if (p.file) {
            try {
              return await compressImage(p.file);
            } catch (err) {
              console.error("Error compressing image", err);
              return p.preview;
            }
          }
          return p.preview;
        })
      );
      const validImages = base64Images.filter(Boolean);

      const newItem = {
        id: Date.now(),
        title,
        price: isFree ? 'Free' : `₹${price}/day`,
        img: validImages[0] || 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=400&q=80',
        images: validImages.length > 0 ? validImages : ['https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=400&q=80'],
        category,
        rating: 0,
        distance: '0.1 km',
        owner: user?.name || 'Local Neighbor',
        description,
        features: rules.filter(r => r.checked).map(r => r.text)
      };

      addItem(newItem);
      addNotification({
        type: 'accepted',
        icon: '🎉',
        title: 'Item Published!',
        text: `"${title}" is now live and visible to your neighbors.`,
        link: '/home'
      });
      setTimeout(() => { navigate('/home'); }, 500);
    } catch (error) {
      alert("Failed to publish item.");
    }
  };

  const onLocationSelect = (loc) => {
    setLocation(loc);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check for duplicates within the current upload and against existing photos
    const uniqueFiles = files.filter(file => {
      const isDuplicate = photos.some(p => p.file.name === file.name && p.file.size === file.size);
      return !isDuplicate;
    });

    if (uniqueFiles.length < files.length) {
      alert(`${files.length - uniqueFiles.length} duplicate photo(s) were ignored.`);
    }

    if (photos.length + uniqueFiles.length > 5) {
      alert("You can only upload up to 5 photos.");
      return;
    }

    const newPhotos = uniqueFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
    e.target.value = null;
  };

  const removePhoto = (index) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
    // Reset preview index if it's now out of bounds
    setPreviewIndex(prev => Math.max(0, Math.min(prev, photos.length - 2)));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const toggleRule = (id) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, checked: !rule.checked } : rule
    ));
  };

  const addCustomRule = () => {
    if (customRule.trim()) {
      const newRule = {
        id: Date.now(),
        text: customRule,
        checked: true,
        isCustom: true
      };
      setRules(prev => [...prev, newRule]);
      setCustomRule('');
      setShowCustomInput(false);
    }
  };

  const removeCustomRule = (id) => {
    setRules(prev => prev.filter(rule => rule.id !== id));
  };

  return (
    <div className="add-item-container">
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="header-nav px-4 pt-4 pb-2" style={{ backgroundColor: 'transparent', position: 'sticky', top: 0, zIndex: 10 }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h3 className="nav-title">Post New Item</h3>
          <span style={{ fontSize: '11px', color: 'var(--text-gray)', fontWeight: 600 }}>Fill in the details for your neighbors</span>
        </div>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="add-item-layout">
        <div className="form-sections-wrapper p-4 pb-24">
          
          {/* Section 1: Media */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Item Media</h2>
              <p className="section-subtitle">
                Add up to 5 photos. {photos.length > 1 ? 'Drag photos or click ◄ ► arrows to rearrange order. The 1st photo is your cover photo.' : 'High-quality photos help items get borrowed 3x faster.'}
              </p>
            </div>
            
            <div className={`photo-grid ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {photos.map((photo, index) => (
                <div 
                  key={photo.preview} 
                  className={`photo-preview-card animate-in ${draggedPhotoIndex === index ? 'dragging-card' : ''}`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', index.toString());
                    setDraggedPhotoIndex(index);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                    if (!isNaN(fromIdx)) {
                      movePhoto(fromIdx, index);
                    }
                    setDraggedPhotoIndex(null);
                  }}
                  onDragEnd={() => setDraggedPhotoIndex(null)}
                >
                  <img src={photo.preview} alt={`Upload ${index}`} className="photo-preview-img" />
                  
                  {/* Remove Button */}
                  <button type="button" className="remove-photo-btn" onClick={() => removePhoto(index)} title="Remove photo">
                    <X size={14} color="white" />
                  </button>

                  {/* Main Photo Badge or Set as Main */}
                  {index === 0 ? (
                    <div className="main-photo-badge">Main Photo</div>
                  ) : (
                    <button type="button" className="set-main-photo-btn" onClick={() => setAsMainPhoto(index)} title="Set as Main Cover Photo">
                      Set Main
                    </button>
                  )}

                  {/* Move Left / Right Buttons */}
                  <div className="photo-reorder-overlay">
                    {index > 0 && (
                      <button type="button" className="photo-move-btn move-left" onClick={() => movePhoto(index, index - 1)} title="Move left">
                        <ChevronLeft size={16} />
                      </button>
                    )}
                    {index < photos.length - 1 && (
                      <button type="button" className="photo-move-btn move-right" onClick={() => movePhoto(index, index + 1)} title="Move right">
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {photos.length < 5 && (
                <div className="photo-upload-box clickable" onClick={triggerFileInput}>
                  <ImagePlus size={28} color="var(--primary)" strokeWidth={2} />
                  <span className="upload-text">{isDragging ? 'Drop here!' : 'Add Photo'}</span>
                  <span className="upload-hint">{isDragging ? 'Release to upload' : 'Drag & drop or click'}</span>
                  <span className="upload-count">{photos.length}/5 photos</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              multiple 
              onChange={handleFileChange}
            />
          </div>

          {/* Section 2: Basic Info */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Basic Information</h2>
            </div>
            
            <div className="form-group">
              <label className="input-label">Item Title</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. DeWalt 20V Max Power Drill" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={60}
                />
              </div>
              <p className="field-hint text-right" style={{ fontSize: '11px', marginTop: '4px', color: title.length > 50 ? '#f59e0b' : 'var(--text-gray)' }}>
                {title.length}/60 characters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-group">
                <label className="input-label">Category</label>
                <div className="input-wrapper">
                  <Package size={18} className="input-icon-left" />
                  <select 
                    className="input-field select-field" 
                    style={{ paddingLeft: '44px' }}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="" disabled>Select category</option>
                    <option value="tools">Tools & DIY</option>
                    <option value="electronics">Electronics</option>
                    <option value="sports">Sports & Outdoors</option>
                    <option value="home">Home & Kitchen</option>
                    <option value="books">Books & Media</option>
                    <option value="party">Party & Events</option>
                    <option value="baby">Baby & Kids</option>
                    <option value="clothing">Clothing & Accessories</option>
                    <option value="automotive">Automotive</option>
                    <option value="musical">Musical Instruments</option>
                    <option value="pet">Pet Supplies</option>
                    <option value="others">Others</option>
                  </select>
                  <ChevronDown size={20} className="select-icon" />
                </div>
              </div>

              {category === 'others' && (
                <div className="form-group animate-in">
                  <label className="input-label">Custom Category</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Garden Equipment"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="input-label">Description</label>
              <textarea 
                className="input-field textarea-field" 
                style={{ minHeight: '120px', padding: '16px' }}
                placeholder="Describe the condition, what's included, any specific usage tips, etc. Be as detailed as possible to avoid questions later."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* Section 3: Location & Availability */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Location & Availability</h2>
            </div>

            <div className="form-group">
              <label className="input-label">Item Location</label>
              <div className="location-options-grid mt-2">
                <button 
                  className={`location-opt-btn ${!showMap ? 'active' : ''}`}
                  onClick={() => setShowMap(false)}
                >
                  Manual Entry
                </button>
                <button 
                  className={`location-opt-btn ${showMap ? 'active' : ''}`}
                  onClick={() => setShowMap(true)}
                >
                  Select on Map
                </button>
              </div>

              {!showMap ? (
                <div className="input-wrapper mt-3 animate-in">
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Enter exact address or area" 
                    value={location.address}
                    onChange={(e) => setLocation({ ...location, address: e.target.value })}
                    style={{ paddingLeft: '44px' }}
                  />
                  <MapPin size={18} className="input-icon-left" />
                </div>
              ) : (
                <div className="animate-in mt-3" style={{ height: '300px', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'relative' }}>
                  <MapPicker 
                    onLocationSelect={onLocationSelect} 
                    initialLocation={location.lat ? { lat: location.lat, lng: location.lng } : null} 
                  />
                </div>
              )}
              {location.address && (
                <div className="selected-address-box mt-3">
                  <MapPin size={16} color="var(--primary)" />
                  <span>{location.address}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="input-label">Item Condition</label>
              <div className="condition-chips">
                {['New', 'Like New', 'Good', 'Fair'].map(c => (
                  <button 
                    key={c}
                    className={`condition-chip ${condition === c ? 'active' : ''}`}
                    onClick={() => setCondition(c)}
                  >{c}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Pricing & Rules */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Pricing & Rules</h2>
              <p className="section-subtitle">Set your terms and help neighbors understand how to care for your item.</p>
            </div>

            <div className="form-group">
              <div className="flex-row items-center justify-between mb-2">
                <label className="input-label mb-0">Price per day</label>
                <label className="toggle-label">
                  <input 
                    type="checkbox" 
                    checked={isFree} 
                    onChange={(e) => { setIsFree(e.target.checked); setPrice(e.target.checked ? '0' : ''); }} 
                    className="toggle-checkbox" 
                  />
                  <span style={{ 
                    fontSize: '13px', 
                    fontWeight: 700, 
                    color: isFree ? 'var(--primary)' : 'var(--text-dark)',
                    whiteSpace: 'nowrap'
                  }}>
                    {isFree ? 'Free Listing' : 'Set a Price'}
                  </span>
                  <div className="toggle-switch"></div>
                </label>
              </div>
              
              {!isFree && (
                <div className="animate-in">
                  <div className="input-wrapper">
                    <span className="currency-symbol">₹</span>
                    <input 
                      type="number" 
                      className="input-field" 
                      style={{ paddingLeft: '32px' }} 
                      placeholder="0.00" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="flex-row items-center justify-between mt-2">
                    <button 
                      type="button"
                      className="ai-suggest-link"
                      onClick={() => {
                        if (!category) { alert("Select a category first for a better suggestion!"); return; }
                        const suggestions = {
                          tools: 250, electronics: 300, sports: 150, home: 100,
                          books: 50, party: 500, baby: 200, musical: 600, automotive: 800
                        };
                        const suggested = suggestions[category] || 200;
                        setPrice(suggested.toString());
                      }}
                    >
                      <Sparkles size={14} />
                      <span>Suggest a price based on category</span>
                    </button>
                    {price && category && (
                      <span className="ai-suggestion-note" style={{ marginTop: 0 }}>
                        <Sparkles size={12} /> Smart Optimized
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="input-label">Item Rules</label>
              <div className="rules-container mt-2">
                {rules.map(rule => (
                  <div key={rule.id} className="rule-item-wrapper mb-3 p-3" style={{ border: '1px solid var(--border-color)', borderRadius: '12px', background: rule.checked ? 'var(--primary-lightest)' : 'transparent' }}>
                    <label className="rule-checkbox w-full">
                      <input 
                        type="checkbox" 
                        checked={rule.checked}
                        onChange={() => toggleRule(rule.id)}
                      />
                      <span className={rule.checked ? 'text-primary font-bold' : ''} style={{ fontSize: '14px' }}>{rule.text}</span>
                    </label>
                    {rule.isCustom && (
                      <button className="remove-custom-btn" onClick={() => removeCustomRule(rule.id)}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                
                {!showCustomInput ? (
                  <button 
                    className="add-others-btn w-full mt-2" 
                    onClick={() => setShowCustomInput(true)}
                  >
                    + Add a custom rule
                  </button>
                ) : (
                  <div className="custom-rule-input-group mt-2 animate-in p-4" style={{ background: 'var(--glass-bg)', borderRadius: '16px', border: '1px dashed var(--glass-border)' }}>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. Return by 6 PM..." 
                      value={customRule}
                      onChange={(e) => setCustomRule(e.target.value)}
                      autoFocus
                    />
                    <div className="flex-row gap-2 mt-3">
                      <button className="btn btn-primary flex-1" onClick={addCustomRule}>Add Rule</button>
                      <button className="btn btn-light flex-1" onClick={() => setShowCustomInput(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      
        {/* Live Preview Section */}
        <div className="preview-section hidden-mobile">
          <div className="preview-sticky">
            <div className="preview-header mb-6">
              <div className="flex-row items-center gap-2 mb-1">
                <Sparkles size={18} color="var(--primary)" />
                <h3 className="preview-title">Marketplace Preview</h3>
              </div>
              <p className="preview-subtitle">How your item appears to neighbors.</p>
            </div>
            
            <div className="rec-card preview-card">
              <div className="rec-img-wrap">
                {photos.length > 0 ? (
                  <>
                    <img 
                      src={photos[previewIndex]?.preview || photos[0]?.preview} 
                      alt="Preview" 
                      className="rec-img fade-in" 
                      key={previewIndex}
                    />
                    {photos.length > 1 && (
                      <div className="preview-nav-overlay">
                        <button 
                          className="preview-nav-btn prev"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
                          }}
                        >
                          &lt;&lt;
                        </button>
                        <button 
                          className="preview-nav-btn next"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
                          }}
                        >
                          &gt;&gt;
                        </button>
                        <div className="preview-dots">
                          {photos.map((_, i) => (
                            <div key={i} className={`preview-dot ${i === previewIndex ? 'active' : ''}`} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-preview-img">
                    <div className="empty-preview-icon">
                      <ImagePlus size={40} color="var(--text-light)" strokeWidth={1} />
                    </div>
                    <span className="empty-preview-text">No image uploaded</span>
                    <span style={{ fontSize: '10px', opacity: 0.5, marginTop: '4px' }}>Photo will appear here</span>
                  </div>
                )}
                <div className="rec-category-badge">{category ? (category === 'others' ? customCategory || 'Other' : category.toUpperCase()) : 'CATEGORY'}</div>
              </div>
              
              <div className="rec-info">
                <div className="flex-row justify-between items-start mb-1">
                  <h4 className="rec-title truncate">{title || 'Untitled Item'}</h4>
                  <div className="flex-row items-center gap-1">
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{condition}</span>
                  </div>
                </div>
                
                <div className="flex-row items-center gap-1 mb-3">
                  <MapPin size={12} color="var(--text-light)" />
                  <span className="text-light" style={{ fontSize: '13px' }}>
                    0.1 km • By {user?.name || 'Local Neighbor'}
                  </span>
                </div>

                <div className="mt-auto flex-row items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <p className="text-primary font-bold rec-price" style={{ fontSize: '16px' }}>
                    {isFree || price === '0' ? 'Free' : (price ? `₹${price}/day` : '₹--/day')}
                  </p>
                  <span className="borrow-link text-primary font-bold" style={{ fontSize: '13px' }}>Borrow</span>
                </div>
              </div>
            </div>
            
            <div className="completion-stats mt-8 p-4" style={{ background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <div className="flex-row justify-between mb-2">
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-gray)' }}>Listing Quality</span>
                <span style={{ fontSize: '12px', fontWeight: '800', color: progress === 100 ? '#22c55e' : 'var(--primary)' }}>{Math.round(progress)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#f3f4f6', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: progress === 100 ? '#22c55e' : 'var(--primary)', borderRadius: '100px', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
              </div>
              <p className="mt-3" style={{ fontSize: '11px', color: 'var(--text-gray)', lineHeight: 1.4 }}>
                {progress < 100 ? 'Add more details to reach 100% and get more visibility!' : 'Excellent! Your listing is ready for the community.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-action-bar fixed-bottom">
        <button 
          className="btn btn-primary w-full py-4 shadow-lg" 
          onClick={() => {
            if (!title || !location.address) {
              alert("Please enter a title and location before publishing.");
              return;
            }
            setShowConfirm(true);
          }}
          disabled={!title || !location.address}
          style={{ 
            opacity: (!title || !location.address) ? 0.6 : 1,
            borderRadius: '16px',
            fontSize: '16px',
            fontWeight: 700
          }}
        >
          Publish Listing
        </button>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content animate-in">
            <div className="modal-icon-wrapper">
              <Package size={32} color="var(--primary)" />
            </div>
            <h3 className="modal-title">Ready to Publish?</h3>
            <p className="modal-desc">
              Your item "{title}" will be visible to your neighbors in {location.address.split(',')[0]}.
            </p>
            <div className="modal-actions">
              <button 
                className="btn btn-primary w-full" 
                style={{ borderRadius: '12px', padding: '14px' }}
                onClick={handlePublish}
              >
                Yes, Publish Listing
              </button>
              <button 
                className="btn btn-light w-full mt-2" 
                style={{ borderRadius: '12px', padding: '14px' }}
                onClick={() => setShowConfirm(false)}
              >
                Go Back & Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
