'use client';

import { useState, useEffect, useCallback } from 'react';
import SearchBar from '@/components/SearchBar';
import CurrentWeather from '@/components/CurrentWeather';
import FiveDayForecast from '@/components/FiveDayForecast';
import LocationInfo from '@/components/LocationInfo';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toastSuccess, toastError } from '@/components/Toast';

export default function Home() {
  const [location, setLocation] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState('default');
  const [unit, setUnit] = useState('celsius');
  const [isOffline, setIsOffline] = useState(false);

  // Load saved unit preference
  useEffect(() => {
    const saved = localStorage.getItem('weather-unit');
    if (saved) setUnit(saved);
  }, []);

  // Save unit preference
  useEffect(() => {
    localStorage.setItem('weather-unit', unit);
  }, [unit]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchWeather = useCallback(async (locationData) => {
    if (!locationData?.lat || !locationData?.lon) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`/api/weather/current?lat=${locationData.lat}&lon=${locationData.lon}`),
        fetch(`/api/weather/forecast?lat=${locationData.lat}&lon=${locationData.lon}`),
      ]);
      
      if (!currentRes.ok) {
        const err = await currentRes.json();
        throw new Error(err.error || 'Failed to fetch current weather');
      }
      
      if (!forecastRes.ok) {
        const err = await forecastRes.json();
        throw new Error(err.error || 'Failed to fetch forecast');
      }
      
      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();
      
      setCurrentWeather(currentData);
      setForecast(forecastData);
      setLocation(locationData);
      toastSuccess('Weather loaded', `${locationData.name}: ${currentData.temperature}°${unit === 'celsius' ? 'C' : 'F'}`);
    } catch (err) {
      console.error('Weather fetch error:', err);
      const msg = err.message || 'Failed to load weather data';
      
      if (msg.includes('service temporarily unavailable') || msg.includes('network')) {
        setError('Weather service temporarily unavailable');
        setErrorType('service-unavailable');
      } else if (msg.includes('not found') || msg.includes('Location not found')) {
        setError('Location not found');
        setErrorType('not-found');
      } else {
        setError(msg);
        setErrorType('default');
      }
      setCurrentWeather(null);
      setForecast(null);
      toastError('Error', msg);
    } finally {
      setIsLoading(false);
    }
  }, [unit]);

  const handleSearch = useCallback((locationData) => {
    fetchWeather(locationData);
  }, [fetchWeather]);

  const handleRetry = useCallback(() => {
    if (location) {
      fetchWeather(location);
    }
    setError(null);
  }, [location, fetchWeather]);

  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  const handleUnitChange = useCallback(() => {
    setUnit(prev => prev === 'celsius' ? 'fahrenheit' : 'celsius');
  }, []);

  return (
    <div className="page-container" style={{ minHeight: '100vh' }}>
      {/* Offline banner */}
      {isOffline && (
        <div 
          className="offline-banner glass" 
          style={{ 
            position: 'fixed', 
            top: '80px', 
            left: 'var(--spacing-lg)', 
            right: 'var(--spacing-lg)', 
            zIndex: 99,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 'var(--spacing-sm)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--accent-orange)',
            background: 'rgba(255, 183, 77, 0.15)',
            color: 'var(--accent-orange)',
            fontSize: '0.85rem',
            fontWeight: 500,
            animation: 'slideDown var(--transition-normal) ease forwards'
          }}
          role="alert"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 0 22.58 9M1.42 1.42l21.16 21.16" />
          </svg>
          You're offline. Weather data may be outdated.
        </div>
      )}
      
      <div className="container" style={{ paddingTop: isOffline ? '120px' : 'var(--spacing-xl)' }}>
        {/* Search Section */}
        <section aria-labelledby="search-heading" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h1 id="search-heading" className="visually-hidden">Weather Search</h1>
          <SearchBar 
            onSearch={handleSearch}
            onLocationDetected={setLocation}
            disabled={isLoading}
          />
        </section>
        
        {/* Error Display */}
        {error && (
          <section aria-labelledby="error-heading" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h2 id="error-heading" className="visually-hidden">Error</h2>
            <ErrorMessage
              error={error}
              type={errorType}
              onRetry={handleRetry}
              onDismiss={handleDismissError}
            />
          </section>
        )}
        
        {/* Weather Content */}
        {(currentWeather || forecast) && (
          <>
            {/* Current Weather */}
            <section aria-labelledby="current-heading" style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h2 id="current-heading" className="visually-hidden">Current Weather</h2>
              <CurrentWeather 
                data={currentWeather} 
                unit={unit} 
                onUnitChange={handleUnitChange}
              />
            </section>
            
            {/* Five Day Forecast */}
            <section aria-labelledby="forecast-heading" style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h2 id="forecast-heading" className="visually-hidden">Five Day Forecast</h2>
              <FiveDayForecast 
                forecast={forecast} 
                unit={unit}
                isLoading={isLoading && !forecast}
              />
            </section>
            
            {/* Location Info Panel */}
            {location && (
              <section aria-labelledby="location-info-heading">
                <h2 id="location-info-heading" className="visually-hidden">Location Information</h2>
                <LocationInfo 
                  location={location}
                  weather={currentWeather}
                />
              </section>
            )}
          </>
        )}
        
        {/* Empty State */}
        {!location && !isLoading && !error && (
          <section className="card glass" style={{ 
            padding: 'var(--spacing-2xl)', 
            textAlign: 'center',
            maxWidth: '600px',
            margin: 'var(--spacing-xl) auto'
          }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto var(--spacing-lg)', opacity: 0.5, color: 'var(--accent-blue)' }} aria-hidden="true">
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              <circle cx="12" cy="12" r="4" />
            </svg>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.5rem', marginBottom: 'var(--spacing-sm)' }}>
              Search for a location
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
              Enter a city name, ZIP code, GPS coordinates, or landmark to see current weather and 5-day forecast.
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['New York', 'London', 'Tokyo', 'Sydney', 'Paris'].map(city => (
                <button
                  key={city}
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleSearch({ name: city, lat: 0, lon: 0, display_name: city })}
                  style={{ opacity: 0.7 }}
                >
                  {city}
                </button>
              ))}
            </div>
          </section>
        )}
        
        {/* Loading state when searching but no data yet */}
        {isLoading && !currentWeather && !forecast && !error && (
          <section className="card glass" style={{ 
            padding: 'var(--spacing-2xl)', 
            textAlign: 'center',
            maxWidth: '600px',
            margin: 'var(--spacing-xl) auto'
          }}>
            <LoadingSpinner size="lg" text="Loading weather data..." />
          </section>
        )}
      </div>
    </div>
  );
}