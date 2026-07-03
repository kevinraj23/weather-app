'use client';

import { useState } from 'react';
import WeatherIcon from './WeatherIcon';
import { getWeatherInfo, getWeatherGradient } from '@/lib/weatherCodes';
import { formatTime, getWindDirection, getUVSeverity, celsiusToFahrenheit, formatNumber } from '@/lib/utils';

const detailItems = [
  { key: 'humidity', label: 'Humidity', icon: 'humidity', unit: '%' },
  { key: 'wind_speed', label: 'Wind Speed', icon: 'wind', unit: 'km/h' },
  { key: 'wind_gusts', label: 'Wind Gusts', icon: 'gust', unit: 'km/h' },
  { key: 'wind_direction', label: 'Wind Direction', icon: 'direction', unit: '' },
  { key: 'pressure', label: 'Pressure', icon: 'pressure', unit: 'hPa' },
  { key: 'cloud_cover', label: 'Cloud Cover', icon: 'cloud', unit: '%' },
  { key: 'precipitation', label: 'Precipitation', icon: 'rain', unit: 'mm' },
  { key: 'uv_index', label: 'UV Index', icon: 'uv', unit: '' },
  { key: 'sunrise', label: 'Sunrise', icon: 'sunrise', unit: '' },
  { key: 'sunset', label: 'Sunset', icon: 'sunset', unit: '' },
];

const detailIcons = {
  humidity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  wind: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 14 19H2" />
    </svg>
  ),
  gust: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  direction: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  pressure: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 2v20M17 7H7a5 5 0 0 0 0 10h10" />
      <path d="M12 7v10" />
    </svg>
  ),
  cloud: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  ),
  rain: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      <path d="M8 19a4 4 0 0 0-4-4H4" />
      <path d="M16 19a4 4 0 0 1 4-4h4" />
    </svg>
  ),
  uv: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.41 1.41M18.36 18.36l1.41 1.41M1 12h2M21 12h2M4.22 19.78l1.41-1.41M18.36 5.64l1.41-1.41" />
    </svg>
  ),
  sunrise: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      <path d="M12 16V8l-4 4h8l-4-4" />
    </svg>
  ),
  sunset: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      <path d="M12 8v8l4-4h-8l4 4" />
    </svg>
  ),
};

export default function CurrentWeather({ data, unit = 'celsius', onUnitChange }) {
  const [isDay, setIsDay] = useState(true);
  
  // Update isDay based on data - use useEffect to avoid render-loop
  useEffect(() => {
    if (data?.is_day !== undefined) {
      setIsDay(data.is_day === 1);
    }
  }, [data?.is_day]);
  
  const weatherInfo = data ? getWeatherInfo(data.weather_code, isDay) : { description: '—', icon: 'clear', group: 'clear' };
  const gradientClass = data ? getWeatherGradient(weatherInfo.group, isDay) : 'gradient-night';
  
  const temperature = unit === 'fahrenheit' && data?.temperature !== null 
    ? celsiusToFahrenheit(data.temperature) 
    : data?.temperature;
  const feelsLike = unit === 'fahrenheit' && data?.feels_like !== null
    ? celsiusToFahrenheit(data.feels_like)
    : data?.feels_like;
  const windSpeed = unit === 'fahrenheit' && data?.wind_speed !== null
    ? Math.round(data.wind_speed * 0.621371)
    : data?.wind_speed;
  const windGusts = unit === 'fahrenheit' && data?.wind_gusts !== null
    ? Math.round(data.wind_gusts * 0.621371)
    : data?.wind_gusts;
  const windUnit = unit === 'fahrenheit' ? 'mph' : 'km/h';
  
  const windDir = data?.wind_direction !== null && data?.wind_direction !== undefined
    ? getWindDirection(data.wind_direction)
    : { label: '—', rotation: 0 };

  const getDetailValue = (key) => {
    switch (key) {
      case 'humidity': return data?.humidity !== null ? `${data.humidity}%` : '—';
      case 'wind_speed': return windSpeed !== null ? `${windSpeed} ${windUnit}` : '—';
      case 'wind_gusts': return windGusts !== null ? `${windGusts} ${windUnit}` : '—';
      case 'wind_direction': return `${windDir.label} ${windDir.rotation > 0 ? `(${Math.round(windDir.rotation)}°)` : ''}`;
      case 'pressure': return data?.pressure !== null ? `${Math.round(data.pressure)} hPa` : '—';
      case 'cloud_cover': return data?.cloud_cover !== null ? `${data.cloud_cover}%` : '—';
      case 'precipitation': return data?.precipitation !== null ? `${formatNumber(data.precipitation)} mm` : '—';
      case 'uv_index': {
        const uv = data?.uv_index;
        if (uv === null || uv === undefined) return '—';
        return `${uv} (${getUVSeverity(uv)})`;
      }
      case 'sunrise': return data?.sunrise ? formatTime(data.sunrise) : '—';
      case 'sunset': return data?.sunset ? formatTime(data.sunset) : '—';
      default: return '—';
    }
  };

  if (!data) {
    return (
      <div className="card current-weather-skeleton" style={{ padding: 'var(--spacing-xl)' }}>
        <div className="skeleton skeleton-icon" style={{ margin: '0 auto var(--spacing-lg)' }} />
        <div className="skeleton skeleton-title" style={{ width: '120px', margin: '0 auto var(--spacing-md)' }} />
        <div className="skeleton skeleton-text" style={{ width: '200px', margin: '0 auto var(--spacing-xl)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-sm" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
              <div className="skeleton skeleton-text" style={{ width: '80%', margin: '0 auto var(--spacing-sm)' }} />
              <div className="skeleton skeleton-text" style={{ width: '60%', margin: '0 auto', height: '24px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`card current-weather ${gradientClass}`}
      style={{ 
        padding: 'var(--spacing-xl)',
        position: 'relative',
        overflow: 'hidden',
        background: `var(--${gradientClass})`,
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }}
      role="region"
      aria-label="Current weather conditions"
    >
      {/* Background pattern */}
      <div 
        className="weather-bg-pattern" 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          opacity: 0.05,
          backgroundImage: 'radial-gradient(circle at 20% 80%, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Weather icon and temperature */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          marginBottom: 'var(--spacing-xl)',
          gap: 'var(--spacing-md)'
        }}>
          <WeatherIcon icon={weatherInfo.icon} size={140} />
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span 
              className="temperature-value"
              style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 700, 
                fontSize: 'clamp(4rem, 12vw, 7rem)',
                lineHeight: 1,
                color: 'var(--text-primary)',
                textShadow: '0 4px 24px rgba(0,0,0,0.3)'
              }}
            >
              {temperature !== null ? temperature : '—'}
            </span>
            <span style={{ 
              fontFamily: 'var(--font-display)', 
              fontWeight: 600, 
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              color: 'var(--text-primary)',
              marginTop: '0.5em'
            }}>
              {unit === 'fahrenheit' ? '°F' : '°C'}
            </span>
          </div>
          
          <button
            className="btn btn-ghost unit-toggle"
            onClick={onUnitChange}
            aria-label={`Switch to ${unit === 'celsius' ? 'Fahrenheit' : 'Celsius'}`}
            style={{ 
              marginTop: 'var(--spacing-sm)',
              padding: 'var(--spacing-xs) var(--spacing-md)',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {unit === 'celsius' ? '°F' : '°C'}
          </button>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--spacing-md)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: 'var(--spacing-sm)'
          }}>
            <span style={{ 
              fontSize: '1.1rem', 
              fontWeight: 500, 
              color: 'var(--text-primary)',
              textTransform: 'capitalize'
            }}>
              {weatherInfo.description}
            </span>
            <span style={{ 
              fontSize: '0.9rem', 
              color: 'var(--text-secondary)',
              background: 'rgba(0,0,0,0.2)',
              padding: '2px 12px',
              borderRadius: 'var(--radius-sm)'
            }}>
              Feels like {feelsLike !== null ? feelsLike : '—'}°{unit === 'celsius' ? 'C' : 'F'}
            </span>
            <span className={`badge ${isDay ? 'badge-orange' : 'badge-blue'}`}>
              {isDay ? '☀️ Day' : '🌙 Night'}
            </span>
          </div>
        </div>
        
        {/* Details grid */}
        <div 
          className="details-grid"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
            gap: 'var(--spacing-md)',
            marginTop: 'var(--spacing-lg)'
          }}
        >
          {detailItems.map((item) => (
            <div 
              key={item.key} 
              className="detail-card glass-sm"
              style={{ 
                padding: 'var(--spacing-md)', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                textAlign: 'center',
                transition: 'transform var(--transition-fast), background var(--transition-fast)'
              }}
            >
              <div 
                className="detail-icon"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'var(--accent-blue)'
                }}
                aria-hidden="true"
              >
                {detailIcons[item.key]}
              </div>
              <div className="detail-value" style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 600, 
                fontSize: '1.25rem', 
                color: 'var(--text-primary)',
                wordBreak: 'break-word'
              }}>
                {getDetailValue(item.key)}
              </div>
              <div className="detail-label" style={{ 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                color: 'var(--text-muted)',
                fontWeight: 500
              }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}