'use client';

import { useState, useEffect } from 'react';

export default function ErrorMessage({ 
  error, 
  onRetry, 
  onDismiss,
  type = 'default', // 'default' | 'not-found' | 'service-unavailable'
  retryCountdown = 5
}) {
  const [countdown, setCountdown] = useState(retryCountdown);
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    if (type === 'service-unavailable' && onRetry) {
      setShowCountdown(true);
      setCountdown(retryCountdown);
      
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowCountdown(false);
            onRetry();
            return retryCountdown;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [type, onRetry, retryCountdown]);

  const getErrorConfig = () => {
    switch (type) {
      case 'not-found':
        return {
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <path d="M8 8l6 6" />
              <path d="M14 8l-6 6" />
            </svg>
          ),
          title: 'Location not found',
          message: `We couldn't find "${error}". Try searching with a city name, zip code, or GPS coordinates (e.g., 40.71, -74.00).`,
          buttonText: 'Try Again',
          buttonVariant: 'primary',
        };
      case 'service-unavailable':
        return {
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              <path d="M11 2v6" />
            </svg>
          ),
          title: 'Weather service unavailable',
          message: 'We\'re having trouble connecting to the weather service. Please try again in a moment.',
          buttonText: showCountdown ? `Retry in ${countdown}s...` : 'Retry Now',
          buttonVariant: 'secondary',
          showSpinner: !showCountdown,
        };
      default:
        return {
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          ),
          title: 'Something went wrong',
          message: error || 'An unexpected error occurred. Please try again.',
          buttonText: 'Try Again',
          buttonVariant: 'primary',
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div 
      className="error-message glass" 
      role="alert"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        padding: 'var(--spacing-xl)',
        gap: 'var(--spacing-md)',
        animation: 'slideUp var(--transition-normal) ease forwards'
      }}
    >
      <div 
        className="error-icon" 
        style={{ 
          width: '64px', 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderRadius: '50%',
          background: 'rgba(239, 83, 80, 0.15)',
          color: 'var(--accent-red)',
          flexShrink: 0
        }}
        aria-hidden="true"
      >
        {config.icon}
      </div>
      
      <div className="error-content">
        <h3 style={{ 
          fontFamily: 'var(--font-display)', 
          fontWeight: 600, 
          fontSize: '1.25rem', 
          color: 'var(--text-primary)',
          marginBottom: 'var(--spacing-xs)'
        }}>
          {config.title}
        </h3>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '0.95rem',
          maxWidth: '400px',
          lineHeight: 1.6
        }}>
          {config.message}
        </p>
      </div>
      
      {onRetry && (
        <button
          className={`btn ${config.buttonVariant === 'primary' ? 'btn-primary' : 'btn-secondary'} btn-lg`}
          onClick={onRetry}
          disabled={config.showSpinner}
          style={{ 
            minWidth: '160px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-sm)'
          }}
        >
          {config.showSpinner && (
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          )}
          <span>{config.buttonText}</span>
        </button>
      )}
      
      {onDismiss && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={onDismiss}
          style={{ marginTop: 'var(--spacing-sm)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          Dismiss
        </button>
      )}
    </div>
  );
}