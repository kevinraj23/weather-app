'use client';

import { useState, useEffect, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';

const TABS = [
  { id: 'google-maps', label: '📍 Google Maps', icon: 'map' },
  { id: 'interactive-map', label: '🗺️ Interactive', icon: 'globe' },
  { id: 'about', label: '📖 About', icon: 'info' },
  { id: 'videos', label: '🎬 Videos', icon: 'play' },
  { id: 'country', label: '🌍 Country', icon: 'flag' },
];

export default function LocationInfo({ location, weather }) {
  const [activeTab, setActiveTab] = useState('google-maps');
  const [info, setInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const leafletMapRef = useRef(null);
  const leafletInitialized = useRef(false);

  useEffect(() => {
    if (!location?.lat || !location?.lon || !location?.name) {
      setInfo(null);
      setIsLoading(false);
      return;
    }

    const fetchInfo = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `/api/location-info?name=${encodeURIComponent(location.name)}&lat=${location.lat}&lon=${location.lon}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch location info');
        }
        
        const data = await response.json();
        setInfo(data);
      } catch (err) {
        console.error('Location info fetch error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfo();
  }, [location]);

  // Initialize Leaflet map when interactive tab is active
  useEffect(() => {
    if (activeTab !== 'interactive-map' || !location?.lat || !location?.lon) return;
    
    const initLeaflet = async () => {
      if (leafletInitialized.current || !leafletMapRef.current) return;
      
      try {
        // Dynamic import for SSR safety
        const L = await import('leaflet');
        const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet');
        
        // Fix default marker icon
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
        
        leafletInitialized.current = true;
      } catch (err) {
        console.error('Leaflet init error:', err);
      }
    };
    
    initLeaflet();
  }, [activeTab, location]);

  if (isLoading) {
    return (
      <div className="card glass" style={{ padding: 'var(--spacing-lg)' }}>
        <LoadingSpinner size="md" text="Loading location info..." />
      </div>
    );
  }

  if (error && !info) {
    return (
      <div className="card glass" style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto var(--spacing-md)', opacity: 0.5 }} aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <p>Unable to load location information</p>
      </div>
    );
  }

  if (!info) {
    return null;
  }

  return (
    <div className="card location-info" style={{ overflow: 'hidden' }}>
      {/* Tab Navigation */}
      <div className="tabs" role="tablist" aria-label="Location information tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-xs)',
              fontSize: '0.85rem'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {/* Google Maps Tab */}
      <div 
        role="tabpanel" 
        id="panel-google-maps" 
        aria-labelledby="tab-google-maps"
        hidden={activeTab !== 'google-maps'}
        className="tab-panel"
        style={{ padding: 'var(--spacing-lg)', minHeight: '300px' }}
      >
        {info.map && (
          <div style={{ 
            borderRadius: 'var(--radius-md)', 
            overflow: 'hidden',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)'
          }}>
            <iframe
              title={`Google Maps - ${location.name}`}
              src={`https://maps.google.com/maps?q=${info.map.lat},${info.map.lon}&z=${info.map.zoom}&output=embed`}
              width="100%"
              height="400"
              style={{ border: 'none', display: 'block' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        )}
        {!info.map && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--spacing-xl)' }}>
            Map not available
          </div>
        )}
      </div>

      {/* Interactive Map Tab (Leaflet) */}
      <div 
        role="tabpanel" 
        id="panel-interactive-map" 
        aria-labelledby="tab-interactive-map"
        hidden={activeTab !== 'interactive-map'}
        className="tab-panel"
        style={{ padding: 'var(--spacing-lg)' }}
      >
        <InteractiveMap 
          lat={location.lat} 
          lon={location.lon} 
          name={location.name}
          ref={leafletMapRef}
        />
      </div>

      {/* About Tab (Wikipedia) */}
      <div 
        role="tabpanel" 
        id="panel-about" 
        aria-labelledby="tab-about"
        hidden={activeTab !== 'about'}
        className="tab-panel"
        style={{ padding: 'var(--spacing-lg)' }}
      >
        {info.wikipedia ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {info.wikipedia.thumbnail && (
              <div style={{ 
                width: '100%', 
                maxWidth: '300px', 
                margin: '0 auto',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--glass-border)'
              }}>
                <img 
                  src={info.wikipedia.thumbnail} 
                  alt={`${info.wikipedia.title} thumbnail`}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  loading="lazy"
                />
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
                {info.wikipedia.title}
              </h4>
            </div>
            <div style={{ 
              color: 'var(--text-secondary)', 
              lineHeight: 1.7,
              fontSize: '0.95rem'
            }}>
              {info.wikipedia.extract}
            </div>
            {info.wikipedia.page_url && (
              <a 
                href={info.wikipedia.page_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ 
                  marginTop: 'var(--spacing-md)', 
                  alignSelf: 'center',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Read more on Wikipedia
              </a>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--spacing-xl)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto var(--spacing-md)', opacity: 0.5 }} aria-hidden="true">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <p>No Wikipedia article found for this location</p>
          </div>
        )}
      </div>

      {/* Videos Tab (YouTube) */}
      <div 
        role="tabpanel" 
        id="panel-videos" 
        aria-labelledby="tab-videos"
        hidden={activeTab !== 'videos'}
        className="tab-panel"
        style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}
      >
        {info.youtube && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#FF0000' }} aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136C4.495 20.455 12 20.455 12 20.455s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                Travel & Weather Videos
              </h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                Search YouTube for "{info.youtube.embed_query}"
              </p>
              <a
                href={info.youtube.search_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136C4.495 20.455 12 20.455 12 20.455s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Watch on YouTube
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Country Tab (REST Countries) */}
      <div 
        role="tabpanel" 
        id="panel-country" 
        aria-labelledby="tab-country"
        hidden={activeTab !== 'country'}
        className="tab-panel"
        style={{ padding: 'var(--spacing-lg)' }}
      >
        {info.country ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {/* Flag and Name */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-md)',
              background: 'var(--glass-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)'
            }}>
              {info.country.flag && (
                <img 
                  src={info.country.flag} 
                  alt={`${info.country.name} flag`}
                  style={{ 
                    width: '64px', 
                    height: '40px', 
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                />
              )}
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.25rem' }}>
                  {info.country.flagEmoji} {info.country.name}
                </h4>
                {info.country.officialName && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {info.country.officialName}
                  </p>
                )}
              </div>
            </div>

            {/* Country Details Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 'var(--spacing-md)' 
            }}>
              <CountryDetail label="Capital" value={info.country.capital} icon="capital" />
              <CountryDetail label="Population" value={info.country.population ? info.country.population.toLocaleString() : '—'} icon="users" />
              <CountryDetail label="Region" value={info.country.region} icon="globe" />
              <CountryDetail label="Subregion" value={info.country.subregion} icon="map-pin" />
              <CountryDetail label="Languages" value={info.country.languages} icon="languages" />
              <CountryDetail label="Currencies" value={info.country.currencies} icon="currency" />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--spacing-xl)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto var(--spacing-md)', opacity: 0.5 }} aria-hidden="true">
              <path d="M21 12a9 9 0 0 1-9 9M21 12a9 9 0 0 0-9-9M21 12a9 9 0 0 0-6.24-3.5M21 12a9 9 0 0 1-6.24 3.5" />
            </svg>
            <p>No country information available for this location</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Interactive Map Component (Leaflet)
function InteractiveMap({ lat, lon, name }) {
  const [MapComponent, setMapComponent] = useState(null);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    import('react-leaflet').then(module => {
      setMapComponent(() => ({
        MapContainer: module.MapContainer,
        TileLayer: module.TileLayer,
        Marker: module.Marker,
        Popup: module.Popup,
      }));
    }).catch(err => {
      console.error('Leaflet import error:', err);
      setMapError(err.message);
    });
  }, []);

  // Fix Leaflet default marker icon
  useEffect(() => {
    if (MapComponent) {
      import('leaflet').then(L => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
      });
    }
  }, [MapComponent]);

  if (mapError) {
    return (
      <div style={{ 
        height: '350px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--text-muted)',
        background: 'var(--glass-bg)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--glass-border)'
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 'var(--spacing-md)', opacity: 0.5 }} aria-hidden="true">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
        <p>Interactive map unavailable</p>
        <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Leaflet failed to load</p>
      </div>
    );
  }

  if (!MapComponent) {
    return (
      <div style={{ 
        height: '350px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--text-muted)',
        background: 'var(--glass-bg)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--glass-border)'
      }}>
        <LoadingSpinner size="md" text="Loading interactive map..." />
      </div>
    );
  }

  const position = [lat, lon];
  const { MapContainer, TileLayer, Marker, Popup } = MapComponent;

  return (
    <MapContainer 
      center={position} 
      zoom={10} 
      style={{ height: '350px', borderRadius: 'var(--radius-md)' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          <strong>{name}</strong><br />
          {lat.toFixed(4)}, {lon.toFixed(4)}
        </Popup>
      </Marker>
    </MapContainer>
  );
}

function CountryDetail({ label, value, icon }) {
  return (
    <div className="glass-sm" style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-xs)',
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontWeight: 500
      }}>
        {label}
      </div>
      <div style={{ 
        color: 'var(--text-primary)', 
        fontSize: '0.95rem',
        wordBreak: 'break-word'
      }}>
        {value || '—'}
      </div>
    </div>
  );
}