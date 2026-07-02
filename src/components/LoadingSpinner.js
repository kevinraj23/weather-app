'use client';

export default function LoadingSpinner({ 
  size = 'md', // 'sm' | 'md' | 'lg'
  variant = 'spinner', // 'spinner' | 'skeleton' | 'dots'
  text = 'Loading...'
}) {
  const sizes = {
    sm: { spinner: 20, dots: 6 },
    md: { spinner: 40, dots: 8 },
    lg: { spinner: 64, dots: 12 },
  };
  
  const { spinner, dots } = sizes[size];

  if (variant === 'skeleton') {
    return (
      <div className="skeleton skeleton-card animate-pulse" style={{ width: '100%' }} aria-hidden="true" />
    );
  }

  if (variant === 'dots') {
    return (
      <div 
        className="loading-dots" 
        role="status" 
        aria-label={text}
        style={{ 
          display: 'flex', 
          gap: '4px', 
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="loading-dot"
            style={{
              width: dots,
              height: dots,
              borderRadius: '50%',
              background: 'var(--accent-blue)',
              animation: `pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
        <span className="visually-hidden">{text}</span>
      </div>
    );
  }

  return (
    <div 
      className="loading-spinner" 
      role="status" 
      aria-label={text}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 'var(--spacing-md)',
        justifyContent: 'center'
      }}
    >
      <svg
        className="animate-spin"
        width={spinner}
        height={spinner}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ color: 'var(--accent-blue)' }}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" strokeOpacity="0.15" />
        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" strokeWidth="3" />
      </svg>
      {text && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{text}</span>}
    </div>
  );
}