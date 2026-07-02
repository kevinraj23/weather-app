'use client';

import WeatherIcon from './WeatherIcon';
import { getWeatherInfo } from '@/lib/weatherCodes';
import { formatDayName, celsiusToFahrenheit, formatNumber, getWindDirection } from '@/lib/utils';

export default function ForecastCard({ day, unit = 'celsius' }) {
  const weatherInfo = getWeatherInfo(day.weather_code, true);
  const isNight = day.weather_code && weatherInfo.icon.includes('-night');
  
  const tempMax = unit === 'fahrenheit' && day.temp_max !== null 
    ? celsiusToFahrenheit(day.temp_max) 
    : day.temp_max;
  const tempMin = unit === 'fahrenheit' && day.temp_min !== null 
    ? celsiusToFahrenheit(day.temp_min) 
    : day.temp_min;
  const windSpeed = unit === 'fahrenheit' && day.wind_speed_max !== null
    ? Math.round(day.wind_speed_max * 0.621371)
    : day.wind_speed_max;
  const windUnit = unit === 'fahrenheit' ? 'mph' : 'km/h';

  return (
    <article 
      className="card forecast-card"
      style={{ 
        minWidth: '160px', 
        maxWidth: '180px',
        padding: 'var(--spacing-md)',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        textAlign: 'center',
        gap: 'var(--spacing-sm)',
        flexShrink: 0,
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)'
      }}
      role="region"
      aria-label={`${day.day_name}, ${day.date}: ${weatherInfo.description}, High ${tempMax}°${unit === 'celsius' ? 'C' : 'F'}, Low ${tempMin}°${unit === 'celsius' ? 'C' : 'F'}`}
    >
      <div className="forecast-day" style={{ 
        fontWeight: 600, 
        fontSize: '0.9rem', 
        color: 'var(--text-primary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {day.day_name}
      </div>
      <div className="forecast-date" style={{ 
        fontSize: '0.75rem', 
        color: 'var(--text-muted)'
      }}>
        {day.date}
      </div>
      
      <WeatherIcon icon={weatherInfo.icon} size={72} />
      
      <div className="forecast-temps" style={{ 
        display: 'flex', 
        alignItems: 'baseline', 
        gap: 'var(--spacing-sm)',
        marginTop: 'var(--spacing-xs)'
      }}>
        <span className="temp-max" style={{ 
          fontFamily: 'var(--font-display)', 
          fontWeight: 700, 
          fontSize: '1.5rem', 
          color: 'var(--text-primary)'
        }}>
          {tempMax !== null ? tempMax : '—'}°
        </span>
        <span className="temp-min" style={{ 
          fontFamily: 'var(--font-display)', 
          fontWeight: 400, 
          fontSize: '1.1rem', 
          color: 'var(--text-secondary)'
        }}>
          {tempMin !== null ? tempMin : '—'}°
        </span>
      </div>
      
      <div className="forecast-details" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '4px',
        width: '100%',
        fontSize: '0.75rem'
      }}>
        <div className="forecast-precip" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '4px',
          color: 'var(--accent-blue)'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M8 19a4 4 0 0 0-4-4H4" />
            <path d="M16 19a4 4 0 0 1 4-4h4" />
          </svg>
          <span>{day.precipitation_probability}%</span>
        </div>
        <div className="forecast-wind" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '4px',
          color: 'var(--text-secondary)'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 14 19H2" />
          </svg>
          <span>{windSpeed !== null ? windSpeed : '—'} {windUnit}</span>
        </div>
      </div>
    </article>
  );
}