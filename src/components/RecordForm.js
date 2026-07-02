'use client';

import { useState, useEffect } from 'react';
import { validateDateRange, detectInputType } from '@/lib/utils';

export default function RecordForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}) {
  const [formData, setFormData] = useState({
    location: '',
    date_from: '',
    date_to: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);

  // Initialize form with initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        location: initialData.location_name || '',
        date_from: initialData.date_from || '',
        date_to: initialData.date_to || '',
      });
      setErrors({});
      setTouched({});
    }
  }, [initialData]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'location':
        if (!value.trim()) {
          newErrors.location = 'Location is required';
        }
        break;
      case 'date_from':
        if (!value) {
          newErrors.date_from = 'Start date is required';
        }
        break;
      case 'date_to':
        if (!value) {
          newErrors.date_to = 'End date is required';
        }
        break;
    }
    
    setErrors(newErrors);
    return !newErrors[name];
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.date_from) newErrors.date_from = 'Start date is required';
    if (!formData.date_to) newErrors.date_to = 'End date is required';
    
    if (formData.date_from && formData.date_to) {
      const dateValidation = validateDateRange(formData.date_from, formData.date_to);
      if (!dateValidation.valid) {
        dateValidation.errors.forEach(err => {
          if (err.includes('Start date')) newErrors.date_from = err;
          else if (err.includes('End date') || err.includes('range')) newErrors.date_to = err;
        });
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate on change if field was touched
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
    
    // Validate location via geocoding on blur
    if (name === 'location' && value.trim() && value.length >= 2) {
      await validateLocation(value);
    }
  };

  const validateLocation = async (query) => {
    setIsValidatingLocation(true);
    setShowSuggestions(false);
    
    try {
      const response = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setLocationSuggestions(data.results);
        setShowSuggestions(true);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.location;
          return newErrors;
        });
      } else {
        setErrors(prev => ({ ...prev, location: `Location "${query}" not found. Try a city name, ZIP code, or GPS coordinates.` }));
      }
    } catch (err) {
      console.error('Location validation error:', err);
    } finally {
      setIsValidatingLocation(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData(prev => ({ ...prev, location: suggestion.display_name }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
    setTouched(prev => ({ ...prev, location: true }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.location;
      return newErrors;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ location: true, date_from: true, date_to: true });
    
    if (!validateForm()) return;
    
    onSubmit(formData);
  };

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="record-form" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <div className="form-group">
        <label htmlFor="record-location" className="input-label">
          Location <span style={{ color: 'var(--accent-red)' }}>*</span>
        </label>
        <div className="input-wrapper" style={{ position: 'relative' }}>
          <input
            id="record-location"
            type="text"
            name="location"
            className={`input ${errors.location ? 'input-error' : ''}`}
            value={formData.location}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={() => { if (locationSuggestions.length > 0) setShowSuggestions(true); }}
            placeholder="City, ZIP, coordinates, or landmark"
            autoComplete="off"
            disabled={isSubmitting}
            aria-describedby={errors.location ? 'location-error' : undefined}
            aria-autocomplete="list"
            aria-controls="location-suggestions"
            aria-expanded={showSuggestions && locationSuggestions.length > 0}
          />
          {isValidatingLocation && (
            <span className="input-loading" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
            </span>
          )}
          {errors.location && (
            <div id="location-error" className="input-error-message" style={{ marginTop: 'var(--spacing-xs)' }}>
              {errors.location}
            </div>
          )}
          
          {/* Location suggestions dropdown */}
          {showSuggestions && locationSuggestions.length > 0 && (
            <ul 
              id="location-suggestions"
              className="suggestions-dropdown glass"
              style={{ 
                position: 'absolute', 
                top: 'calc(100% + 4px)', 
                left: 0, 
                right: 0, 
                maxHeight: '250px', 
                overflowY: 'auto',
                zIndex: 10,
                listStyle: 'none',
                padding: 'var(--spacing-sm)',
                margin: 0
              }}
              role="listbox"
            >
              {locationSuggestions.map((suggestion, index) => (
                <li 
                  key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                  role="option"
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{ 
                    padding: 'var(--spacing-sm) var(--spacing-md)', 
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-border)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {suggestion.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {suggestion.display_name}
                  </span>
                  <span className="badge badge-gray" style={{ alignSelf: 'flex-start', fontSize: '0.65rem' }}>
                    {suggestion.type} • {suggestion.country}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="record-date-from" className="input-label">
            Start Date <span style={{ color: 'var(--accent-red)' }}>*</span>
          </label>
          <input
            id="record-date-from"
            type="date"
            name="date_from"
            className={`input ${errors.date_from ? 'input-error' : ''}`}
            value={formData.date_from}
            onChange={handleChange}
            onBlur={handleBlur}
            min={minDate}
            max={maxDate}
            disabled={isSubmitting}
            aria-describedby={errors.date_from ? 'date-from-error' : undefined}
          />
          {errors.date_from && (
            <div id="date-from-error" className="input-error-message">{errors.date_from}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="record-date-to" className="input-label">
            End Date <span style={{ color: 'var(--accent-red)' }}>*</span>
          </label>
          <input
            id="record-date-to"
            type="date"
            name="date_to"
            className={`input ${errors.date_to ? 'input-error' : ''}`}
            value={formData.date_to}
            onChange={handleChange}
            onBlur={handleBlur}
            min={formData.date_from || minDate}
            max={maxDate}
            disabled={isSubmitting}
            aria-describedby={errors.date_to ? 'date-to-error' : undefined}
          />
          {errors.date_to && (
            <div id="date-to-error" className="input-error-message">{errors.date_to}</div>
          )}
        </div>
      </div>

      {/* Date range info */}
      {(formData.date_from && formData.date_to) && (
        <div className="date-range-info glass-sm" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '4px' }} aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>
            {new Date(formData.date_to).getTime() >= new Date(formData.date_from).getTime() 
              ? `${Math.ceil((new Date(formData.date_to) - new Date(formData.date_from)) / (1000 * 60 * 60 * 24)) + 1} day(s) selected`
              : 'End date must be after start date'
            }
          </span>
        </div>
      )}

      <div className="form-actions" style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 'var(--spacing-md)', 
        marginTop: 'var(--spacing-md)',
        paddingTop: 'var(--spacing-md)',
        borderTop: '1px solid var(--glass-border)'
      }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              Saving...
            </>
          ) : initialData ? (
            'Update Record'
          ) : (
            'Create Record'
          )}
        </button>
      </div>
    </form>
  );
}