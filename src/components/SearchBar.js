'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { detectInputType } from '@/lib/utils';

export default function SearchBar({ onSearch, onLocationDetected, disabled = false }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputType, setInputType] = useState(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Detect input type as user types
  useEffect(() => {
    if (query.trim()) {
      setInputType(detectInputType(query));
    } else {
      setInputType(null);
    }
  }, [query]);

  // Fetch suggestions from geocoding API
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/geocode?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setSuggestions(data.results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Suggestion fetch error:', err);
      setSuggestions([]);
    }
  }, []);

  // Debounced suggestion fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
    
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    handleSearch(suggestion);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Location not found');
      }
      
      if (data.results && data.results.length > 0) {
        const location = data.results[0];
        onSearch?.(location);
        onLocationDetected?.(location);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle geolocation
  const handleGeolocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coordsQuery = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setQuery(coordsQuery);
        
        try {
          const response = await fetch(`/api/geocode?query=${encodeURIComponent(coordsQuery)}`);
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            onSearch?.(data.results[0]);
            onLocationDetected?.(data.results[0]);
          }
        } catch (err) {
          setError('Failed to get location details');
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        let message = 'Unable to retrieve your location';
        if (err.code === err.PERMISSION_DENIED) {
          message = 'Location access was denied. Please enable location permissions or search manually.';
        } else if (err.code === err.TIMEOUT) {
          message = 'Location request timed out. Please try again.';
        }
        setError(message);
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target) &&
          suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = (location) => {
    onSearch?.(location);
    onLocationDetected?.(location);
  };

  return (
    <div className="search-bar-container" style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
      <div className="input-wrapper" style={{ position: 'relative' }} ref={inputRef}>
        <form onSubmit={handleSubmit} className="search-form" style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <label htmlFor="location-search" className="visually-hidden">Search location</label>
          <input
            id="location-search"
            type="text"
            className="input search-input"
            style={{ 
              flex: 1, 
              fontSize: '1.1rem',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              paddingRight: '140px'
            }}
            placeholder="City, ZIP, coordinates, or landmark (e.g., New York, 10001, 40.71,-74.00, Eiffel Tower)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError(null);
            }}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            disabled={disabled || isLoading}
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={showSuggestions && suggestions.length > 0}
          />
          
          {/* Input type indicator */}
          {inputType && (
            <span className="input-type-badge badge badge-blue" style={{ 
              position: 'absolute', 
              right: '96px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              fontSize: '0.65rem',
              padding: '2px 8px',
              pointerEvents: 'none'
            }}>
              {inputType.type === 'gps' ? 'GPS' : inputType.type === 'zip' ? 'ZIP' : inputType.type}
            </span>
          )}
          
          <button
            type="submit"
            className="btn btn-primary btn-icon"
            disabled={!query.trim() || disabled || isLoading}
            aria-label="Search"
            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </form>
        
        {/* Geolocation button or loading spinner */}
        {isLoading ? (
          <span className="input-loading" style={{ 
            position: 'absolute', 
            right: '52px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            zIndex: 2
          }}>
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-blue)' }}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          </span>
        ) : (
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={handleGeolocation}
            disabled={disabled}
            aria-label="Use my current location"
            style={{ position: 'absolute', right: '52px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2m0 16v2M2 12h2m16 0h2" />
            </svg>
          </button>
        )}
        
        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul 
            id="search-suggestions"
            className="suggestions-dropdown glass"
            ref={suggestionsRef}
            role="listbox"
            style={{ 
              position: 'absolute', 
              top: 'calc(100% + 8px)', 
              left: 0, 
              right: 0, 
              maxHeight: '300px', 
              overflowY: 'auto',
              zIndex: 10,
              listStyle: 'none',
              padding: 'var(--spacing-sm)',
              margin: 0
            }}
          >
            {suggestions.map((suggestion, index) => (
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
                  transition: 'background var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-border)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                  {suggestion.name}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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
      
      {/* Error message */}
      {error && (
        <div className="input-error-message" style={{ marginTop: 'var(--spacing-sm)', color: 'var(--accent-red)', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}
      
      {/* Helper text */}
      <p className="search-hint" style={{ 
        marginTop: 'var(--spacing-sm)', 
        fontSize: '0.8rem', 
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        Try: "London", "10001", "40.71, -74.00", or "Eiffel Tower"
      </p>
    </div>
  );
}