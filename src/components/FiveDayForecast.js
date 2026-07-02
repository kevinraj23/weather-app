'use client';

import ForecastCard from './ForecastCard';
import LoadingSpinner from './LoadingSpinner';

export default function FiveDayForecast({ forecast, unit = 'celsius', isLoading = false }) {
  if (isLoading) {
    return (
      <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-md)', 
          overflowX: 'auto', 
          padding: 'var(--spacing-sm)',
          scrollSnapType: 'x mandatory',
          '-webkit-overflow-scrolling': 'touch'
        }} role="status" aria-label="Loading forecast">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ 
              width: '160px', 
              height: '200px', 
              borderRadius: 'var(--radius-lg)',
              flexShrink: 0,
              scrollSnapAlign: 'start'
            }} />
          ))}
        </div>
      </div>
    );
  }

  if (!forecast || forecast.length === 0) {
    return (
      <div className="card glass-sm" style={{ 
        padding: 'var(--spacing-xl)', 
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto var(--spacing-md)', opacity: 0.5 }} aria-hidden="true">
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          <path d="M12 16V8l-4 4h8l-4-4" />
        </svg>
        <p>No forecast data available</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
      <h3 style={{ 
        fontFamily: 'var(--font-display)', 
        fontWeight: 600, 
        fontSize: '1.1rem', 
        color: 'var(--text-primary)',
        marginBottom: 'var(--spacing-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        5-Day Forecast
      </h3>
      
      <div 
        className="forecast-scroll"
        style={{ 
          display: 'flex', 
          gap: 'var(--spacing-md)', 
          overflowX: 'auto', 
          padding: 'var(--spacing-sm) var(--spacing-md) var(--spacing-md)',
          scrollSnapType: 'x mandatory',
          '-webkit-overflow-scrolling': 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--glass-border) transparent',
          margin: 'calc(-1 * var(--spacing-sm)) calc(-1 * var(--spacing-lg)) var(--spacing-sm)'
        }}
        role="list"
        aria-label="Five day weather forecast"
      >
        {forecast.map((day, index) => (
          <ForecastCard 
            key={`${day.date}-${index}`}
            day={day} 
            unit={unit}
          />
        ))}
      </div>
      
      {/* Scroll hint for mobile */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: 'var(--spacing-sm)',
        pointerEvents: 'none'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          animation: 'pulse 2s ease-in-out infinite'
        }} aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ animationDelay: '0.2s' }}>
            <path d="M9 18l6-6-6-6" />
          </svg>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ animationDelay: '0.4s' }}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
}