'use client';

const weatherIcons = {
  clear: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </radialGradient>
      </defs>
      {/* Sun rays - rotating */}
      <g className="sun-rays">
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1="32"
            y1="4"
            x2="32"
            y2="12"
            stroke="url(#sunGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${i * 30} 32 32)`}
            style={{ animation: 'rotateRays 20s linear infinite', transformOrigin: '32px 32px' }}
          />
        ))}
      </g>
      {/* Sun core */}
      <circle cx="32" cy="32" r="16" fill="url(#sunGradient)" className="sun-core" style={{ animation: 'sunPulse 3s ease-in-out infinite' }} />
      {/* Inner glow */}
      <circle cx="32" cy="32" r="10" fill="#FFD700" opacity="0.6" />
    </svg>
  ),
  'clear-night': (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <radialGradient id="moonGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0E0E0" />
        </radialGradient>
      </defs>
      {/* Moon */}
      <circle cx="32" cy="32" r="20" fill="url(#moonGradient)" className="moon-core" />
      {/* Moon craters */}
      <circle cx="24" cy="26" r="3" fill="#CCCCCC" opacity="0.5" />
      <circle cx="40" cy="38" r="2" fill="#CCCCCC" opacity="0.5" />
      <circle cx="36" cy="22" r="1.5" fill="#CCCCCC" opacity="0.5" />
      {/* Stars */}
      <g className="stars">
        {[...Array(8)].map((_, i) => (
          <polygon
            key={i}
            points={`${32 + Math.cos(i * 0.78) * 35},${32 + Math.sin(i * 0.78) * 35 - 3} ${32 + Math.cos(i * 0.78) * 35 - 2},${32 + Math.sin(i * 0.78) * 35 + 3} ${32 + Math.cos(i * 0.78) * 35 + 2},${32 + Math.sin(i * 0.78) * 35 + 3}`}
            fill="#FFFFFF"
            opacity="0.8"
            style={{ animation: `pulse ${2 + i * 0.3}s ease-in-out infinite ${i * 0.2}s` }}
          />
        ))}
      </g>
    </svg>
  ),
  'mostly-clear': (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <radialGradient id="sunGradient2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </radialGradient>
        <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0E0E0" />
        </linearGradient>
      </defs>
      {/* Sun */}
      <circle cx="44" cy="20" r="12" fill="url(#sunGradient2)" className="sun-core-small" style={{ animation: 'sunPulse 3s ease-in-out infinite' }} />
      <g className="sun-rays-small">
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1="44"
            y1="8"
            x2="44"
            y2="14"
            stroke="url(#sunGradient2)"
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${i * 45} 44 20)`}
            style={{ animation: 'rotateRays 20s linear infinite', transformOrigin: '44px 20px' }}
          />
        ))}
      </g>
      {/* Cloud */}
      <g className="cloud-group" style={{ animation: 'drift 6s ease-in-out infinite' }}>
        <ellipse cx="24" cy="40" rx="18" ry="10" fill="url(#cloudGradient)" />
        <ellipse cx="12" cy="42" rx="10" ry="7" fill="url(#cloudGradient)" />
        <ellipse cx="32" cy="42" rx="10" ry="7" fill="url(#cloudGradient)" />
      </g>
    </svg>
  ),
  'mostly-clear-night': (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <radialGradient id="moonGradient2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0E0E0" />
        </radialGradient>
        <linearGradient id="cloudGradientNight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A4A4A" />
          <stop offset="100%" stopColor="#2A2A2A" />
        </linearGradient>
      </defs>
      {/* Moon */}
      <circle cx="44" cy="20" r="12" fill="url(#moonGradient2)" className="moon-core-small" />
      <circle cx="40" cy="16" r="2" fill="#CCCCCC" opacity="0.5" />
      {/* Cloud */}
      <g className="cloud-group" style={{ animation: 'drift 6s ease-in-out infinite' }}>
        <ellipse cx="24" cy="40" rx="18" ry="10" fill="url(#cloudGradientNight)" />
        <ellipse cx="12" cy="42" rx="10" ry="7" fill="url(#cloudGradientNight)" />
        <ellipse cx="32" cy="42" rx="10" ry="7" fill="url(#cloudGradientNight)" />
      </g>
    </svg>
  ),
  'partly-cloudy': (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <radialGradient id="sunGradient3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </radialGradient>
        <linearGradient id="cloudGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0E0E0" />
        </linearGradient>
      </defs>
      {/* Sun peeking */}
      <circle cx="50" cy="14" r="10" fill="url(#sunGradient3)" className="sun-core-small" style={{ animation: 'sunPulse 3s ease-in-out infinite' }} />
      <g className="sun-rays-small">
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1="50"
            y1="4"
            x2="50"
            y2="10"
            stroke="url(#sunGradient3)"
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${i * 45} 50 14)`}
            style={{ animation: 'rotateRays 20s linear infinite', transformOrigin: '50px 14px' }}
          />
        ))}
      </g>
      {/* Clouds */}
      <g className="cloud-group" style={{ animation: 'drift 6s ease-in-out infinite' }}>
        <ellipse cx="28" cy="38" rx="22" ry="12" fill="url(#cloudGradient2)" />
        <ellipse cx="14" cy="40" rx="12" ry="8" fill="url(#cloudGradient2)" />
        <ellipse cx="38" cy="40" rx="12" ry="8" fill="url(#cloudGradient2)" />
      </g>
    </svg>
  ),
  'partly-cloudy-night': (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <radialGradient id="moonGradient3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0E0E0" />
        </radialGradient>
        <linearGradient id="cloudGradientNight2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A4A4A" />
          <stop offset="100%" stopColor="#2A2A2A" />
        </linearGradient>
      </defs>
      {/* Moon peeking */}
      <circle cx="50" cy="14" r="10" fill="url(#moonGradient3)" className="moon-core-small" />
      <circle cx="46" cy="10" r="1.5" fill="#CCCCCC" opacity="0.5" />
      {/* Clouds */}
      <g className="cloud-group" style={{ animation: 'drift 6s ease-in-out infinite' }}>
        <ellipse cx="28" cy="38" rx="22" ry="12" fill="url(#cloudGradientNight2)" />
        <ellipse cx="14" cy="40" rx="12" ry="8" fill="url(#cloudGradientNight2)" />
        <ellipse cx="38" cy="40" rx="12" ry="8" fill="url(#cloudGradientNight2)" />
      </g>
    </svg>
  ),
  overcast: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="cloudGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#B0BEC5" />
          <stop offset="100%" stopColor="#78909C" />
        </linearGradient>
      </defs>
      <g className="cloud-group" style={{ animation: 'drift 8s ease-in-out infinite' }}>
        <ellipse cx="32" cy="36" rx="28" ry="16" fill="url(#cloudGradient3)" />
        <ellipse cx="16" cy="40" rx="16" ry="10" fill="url(#cloudGradient3)" />
        <ellipse cx="46" cy="40" rx="16" ry="10" fill="url(#cloudGradient3)" />
        <ellipse cx="32" cy="30" rx="12" ry="8" fill="url(#cloudGradient3)" />
      </g>
    </svg>
  ),
  'overcast-night': (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="cloudGradientNight3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A4A4A" />
          <stop offset="100%" stopColor="#2A2A2A" />
        </linearGradient>
      </defs>
      <g className="cloud-group" style={{ animation: 'drift 8s ease-in-out infinite' }}>
        <ellipse cx="32" cy="36" rx="28" ry="16" fill="url(#cloudGradientNight3)" />
        <ellipse cx="16" cy="40" rx="16" ry="10" fill="url(#cloudGradientNight3)" />
        <ellipse cx="46" cy="40" rx="16" ry="10" fill="url(#cloudGradientNight3)" />
        <ellipse cx="32" cy="30" rx="12" ry="8" fill="url(#cloudGradientNight3)" />
      </g>
    </svg>
  ),
  fog: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="fogGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9E9E9E" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#BDBDBD" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#9E9E9E" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <g className="fog-layers">
        {[...Array(5)].map((_, i) => (
          <path
            key={i}
            d="M4 40 Q32 30 60 40 Q60 50 4 50 Z"
            fill="url(#fogGradient)"
            transform={`translate(0, ${i * 5})`}
            style={{ 
              animation: `fogDrift ${8 + i * 2}s ease-in-out infinite ${i * 0.5}s`,
              transformOrigin: 'center center'
            }}
          />
        ))}
      </g>
    </svg>
  ),
  'fog-night': (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="fogGradientNight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4A4A4A" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#5A5A5A" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#4A4A4A" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <g className="fog-layers">
        {[...Array(5)].map((_, i) => (
          <path
            key={i}
            d="M4 40 Q32 30 60 40 Q60 50 4 50 Z"
            fill="url(#fogGradientNight)"
            transform={`translate(0, ${i * 5})`}
            style={{ 
              animation: `fogDrift ${8 + i * 2}s ease-in-out infinite ${i * 0.5}s`,
              transformOrigin: 'center center'
            }}
          />
        ))}
      </g>
    </svg>
  ),
  drizzle: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="cloudGradient4" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#B0BEC5" />
          <stop offset="100%" stopColor="#78909C" />
        </linearGradient>
      </defs>
      {/* Cloud */}
      <g className="cloud-group" style={{ animation: 'drift 6s ease-in-out infinite' }}>
        <ellipse cx="32" cy="28" rx="22" ry="12" fill="url(#cloudGradient4)" />
        <ellipse cx="18" cy="32" rx="12" ry="8" fill="url(#cloudGradient4)" />
        <ellipse cx="44" cy="32" rx="12" ry="8" fill="url(#cloudGradient4)" />
      </g>
      {/* Light rain drops */}
      <g className="rain-drops">
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1={16 + i * 6}
            y1={42}
            x2={16 + i * 6}
            y2={58}
            stroke="#4FC3F7"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ 
              animation: `rainFall ${0.8 + i * 0.1}s linear infinite ${i * 0.1}s`,
              opacity: 0.7
            }}
          />
        ))}
      </g>
    </svg>
  ),
  'drizzle-night': (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="cloudGradientNight4" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A4A4A" />
          <stop offset="100%" stopColor="#2A2A2A" />
        </linearGradient>
      </defs>
      {/* Cloud */}
      <g className="cloud-group" style={{ animation: 'drift 6s ease-in-out infinite' }}>
        <ellipse cx="32" cy="28" rx="22" ry="12" fill="url(#cloudGradientNight4)" />
        <ellipse cx="18" cy="32" rx="12" ry="8" fill="url(#cloudGradientNight4)" />
        <ellipse cx="44" cy="32" rx="12" ry="8" fill="url(#cloudGradientNight4)" />
      </g>
      {/* Light rain drops */}
      <g className="rain-drops">
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1={16 + i * 6}
            y1={42}
            x2={16 + i * 6}
            y2={58}
            stroke="#4FC3F7"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ 
              animation: `rainFall ${0.8 + i * 0.1}s linear infinite ${i * 0.1}s`,
              opacity: 0.7
            }}
          />
        ))}
      </g>
    </svg>
  ),
  rain: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="cloudGradient5" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#546E7A" />
          <stop offset="100%" stopColor="#37474F" />
        </linearGradient>
      </defs>
      {/* Cloud */}
      <g className="cloud-group" style={{ animation: 'drift 6s ease-in-out infinite' }}>
        <ellipse cx="32" cy="26" rx="24" ry="14" fill="url(#cloudGradient5)" />
        <ellipse cx="16" cy="30" rx="14" ry="9" fill="url(#cloudGradient5)" />
        <ellipse cx="46" cy="30" rx="14" ry="9" fill="url(#cloudGradient5)" />
      </g>
      {/* Heavy rain drops */}
      <g className="rain-drops">
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1={12 + (i % 6) * 8}
            y1={42}
            x2={12 + (i % 6) * 8}
            y2={60}
            stroke="#29B6F6"
            strokeWidth={i % 2 === 0 ? 2 : 1.5}
            strokeLinecap="round"
            style={{ 
              animation: `rainFall ${0.6 + (i % 3) * 0.1}s linear infinite ${(i % 6) * 0.08}s`,
              opacity: i % 2 === 0 ? 0.9 : 0.6
            }}
          />
        ))}
      </g>
    </svg>
  ),
  'rain-night': (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="cloudGradientNight5" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2A2A2A" />
          <stop offset="100%" stopColor="#1A1A1A" />
        </linearGradient>
      </defs>
      {/* Cloud */}
      <g className="cloud-group" style={{ animation: 'drift 6s ease-in-out infinite' }}>
        <ellipse cx="32" cy="26" rx="24" ry="14" fill="url(#cloudGradientNight5)" />
        <ellipse cx="16" cy="30" rx="14" ry="9" fill="url(#cloudGradientNight5)" />
        <ellipse cx="46" cy="30" rx="14" ry="9" fill="url(#cloudGradientNight5)" />
      </g>
      {/* Heavy rain drops */}
      <g className="rain-drops">
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1={12 + (i % 6) * 8}
            y1={42}
            x2={12 + (i % 6) * 8}
            y2={60}
            stroke="#29B6F6"
            strokeWidth={i % 2 === 0 ? 2 : 1.5}
            strokeLinecap="round"
            style={{ 
              animation: `rainFall ${0.6 + (i % 3) * 0.1}s linear infinite ${(i % 6) * 0.08}s`,
              opacity: i % 2 === 0 ? 0.9 : 0.6
            }}
          />
        ))}
      </g>
    </svg>
  ),
  snow: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="cloudGradient6" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ECEFF1" />
          <stop offset="100%" stopColor="#CFD8DC" />
        </linearGradient>
      </defs>
      {/* Cloud */}
      <g className="cloud-group" style={{ animation: 'drift 8s ease-in-out infinite' }}>
        <ellipse cx="32" cy="26" rx="24" ry="14" fill="url(#cloudGradient6)" />
        <ellipse cx="16" cy="30" rx="14" ry="9" fill="url(#cloudGradient6)" />
        <ellipse cx="46" cy="30" rx="14" ry="9" fill="url(#cloudGradient6)" />
      </g>
      {/* Snowflakes */}
      <g className="snowflakes">
        {[...Array(10)].map((_, i) => (
          <g
            key={i}
            transform={`translate(${14 + (i % 5) * 10}, 42)`}
            style={{ 
              animation: `snowFall ${2 + (i % 3) * 0.5}s linear infinite ${(i % 5) * 0.2}s`,
              transformOrigin: 'center center'
            }}
          >
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-4" y1="0" x2="4" y2="0" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-3" y1="-3" x2="3" y2="3" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
            <line x1="-3" y1="3" x2="3" y2="-3" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
          </g>
        ))}
      </g>
    </svg>
  ),
  'snow-night': (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="cloudGradientNight6" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3A3A3A" />
          <stop offset="100%" stopColor="#2A2A2A" />
        </linearGradient>
      </defs>
      {/* Cloud */}
      <g className="cloud-group" style={{ animation: 'drift 8s ease-in-out infinite' }}>
        <ellipse cx="32" cy="26" rx="24" ry="14" fill="url(#cloudGradientNight6)" />
        <ellipse cx="16" cy="30" rx="14" ry="9" fill="url(#cloudGradientNight6)" />
        <ellipse cx="46" cy="30" rx="14" ry="9" fill="url(#cloudGradientNight6)" />
      </g>
      {/* Snowflakes */}
      <g className="snowflakes">
        {[...Array(10)].map((_, i) => (
          <g
            key={i}
            transform={`translate(${14 + (i % 5) * 10}, 42)`}
            style={{ 
              animation: `snowFall ${2 + (i % 3) * 0.5}s linear infinite ${(i % 5) * 0.2}s`,
              transformOrigin: 'center center'
            }}
          >
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-4" y1="0" x2="4" y2="0" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-3" y1="-3" x2="3" y2="3" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
            <line x1="-3" y1="3" x2="3" y2="-3" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
          </g>
        ))}
      </g>
    </svg>
  ),
  thunderstorm: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="cloudGradient7" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2D1B69" />
          <stop offset="100%" stopColor="#1A1A2E" />
        </linearGradient>
      </defs>
      {/* Cloud */}
      <g className="cloud-group" style={{ animation: 'drift 6s ease-in-out infinite' }}>
        <ellipse cx="32" cy="24" rx="26" ry="16" fill="url(#cloudGradient7)" />
        <ellipse cx="14" cy="28" rx="16" ry="10" fill="url(#cloudGradient7)" />
        <ellipse cx="48" cy="28" rx="16" ry="10" fill="url(#cloudGradient7)" />
      </g>
      {/* Lightning */}
      <g className="lightning-group">
        <path
          d="M32 42 L28 52 L34 52 L30 62"
          stroke="#FFD700"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{ 
            animation: 'lightningFlash 3s ease-in-out infinite',
            filter: 'drop-shadow(0 0 8px #FFD700)'
          }}
        />
        <path
          d="M38 42 L34 52 L40 52 L36 62"
          stroke="#FFD700"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.7"
          style={{ 
            animation: 'lightningFlash 3s ease-in-out infinite 1.5s',
            filter: 'drop-shadow(0 0 6px #FFD700)'
          }}
        />
      </g>
    </svg>
  ),
  'thunderstorm-night': (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="cloudGradientNight7" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1A0D2E" />
          <stop offset="100%" stopColor="#0D0D1A" />
        </linearGradient>
      </defs>
      {/* Cloud */}
      <g className="cloud-group" style={{ animation: 'drift 6s ease-in-out infinite' }}>
        <ellipse cx="32" cy="24" rx="26" ry="16" fill="url(#cloudGradientNight7)" />
        <ellipse cx="14" cy="28" rx="16" ry="10" fill="url(#cloudGradientNight7)" />
        <ellipse cx="48" cy="28" rx="16" ry="10" fill="url(#cloudGradientNight7)" />
      </g>
      {/* Lightning */}
      <g className="lightning-group">
        <path
          d="M32 42 L28 52 L34 52 L30 62"
          stroke="#FFD700"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{ 
            animation: 'lightningFlash 3s ease-in-out infinite',
            filter: 'drop-shadow(0 0 8px #FFD700)'
          }}
        />
        <path
          d="M38 42 L34 52 L40 52 L36 62"
          stroke="#FFD700"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.7"
          style={{ 
            animation: 'lightningFlash 3s ease-in-out infinite 1.5s',
            filter: 'drop-shadow(0 0 6px #FFD700)'
          }}
        />
      </g>
    </svg>
  ),
  showers: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="cloudGradient8" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#78909C" />
          <stop offset="100%" stopColor="#546E7A" />
        </linearGradient>
      </defs>
      {/* Cloud */}
      <g className="cloud-group" style={{ animation: 'drift 6s ease-in-out infinite' }}>
        <ellipse cx="32" cy="26" rx="24" ry="14" fill="url(#cloudGradient8)" />
        <ellipse cx="16" cy="30" rx="14" ry="9" fill="url(#cloudGradient8)" />
        <ellipse cx="46" cy="30" rx="14" ry="9" fill="url(#cloudGradient8)" />
      </g>
      {/* Rain showers - intermittent */}
      <g className="rain-drops">
        {[...Array(6)].map((_, i) => (
          <g key={i} style={{ animation: `rainFall ${1.2 + i * 0.2}s linear infinite ${i * 0.3}s` }}>
            <line
              x1={18 + i * 8}
              y1={42}
              x2={18 + i * 8}
              y2={58}
              stroke="#4FC3F7"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>
        ))}
      </g>
    </svg>
  ),
  'showers-night': (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="cloudGradientNight8" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3A3A3A" />
          <stop offset="100%" stopColor="#2A2A2A" />
        </linearGradient>
      </defs>
      {/* Cloud */}
      <g className="cloud-group" style={{ animation: 'drift 6s ease-in-out infinite' }}>
        <ellipse cx="32" cy="26" rx="24" ry="14" fill="url(#cloudGradientNight8)" />
        <ellipse cx="16" cy="30" rx="14" ry="9" fill="url(#cloudGradientNight8)" />
        <ellipse cx="46" cy="30" rx="14" ry="9" fill="url(#cloudGradientNight8)" />
      </g>
      {/* Rain showers */}
      <g className="rain-drops">
        {[...Array(6)].map((_, i) => (
          <g key={i} style={{ animation: `rainFall ${1.2 + i * 0.2}s linear infinite ${i * 0.3}s` }}>
            <line
              x1={18 + i * 8}
              y1={42}
              x2={18 + i * 8}
              y2={58}
              stroke="#4FC3F7"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>
        ))}
      </g>
    </svg>
  ),
  'freezing-rain': (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="cloudGradient9" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#546E7A" />
          <stop offset="100%" stopColor="#37474F" />
        </linearGradient>
      </defs>
      {/* Cloud */}
      <g className="cloud-group" style={{ animation: 'drift 6s ease-in-out infinite' }}>
        <ellipse cx="32" cy="26" rx="24" ry="14" fill="url(#cloudGradient9)" />
        <ellipse cx="16" cy="30" rx="14" ry="9" fill="url(#cloudGradient9)" />
        <ellipse cx="46" cy="30" rx="14" ry="9" fill="url(#cloudGradient9)" />
      </g>
      {/* Freezing rain drops with ice crystals */}
      <g className="rain-drops">
        {[...Array(10)].map((_, i) => (
          <g key={i} style={{ animation: `rainFall ${0.7 + (i % 3) * 0.1}s linear infinite ${(i % 5) * 0.1}s` }}>
            <line
              x1={14 + (i % 5) * 9}
              y1={42}
              x2={14 + (i % 5) * 9}
              y2={58}
              stroke="#81D4FA"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* Ice crystal */}
            <g transform={`translate(${14 + (i % 5) * 9}, ${42 + (i % 3) * 5})`}>
              <line x1="-2" y1="0" x2="2" y2="0" stroke="#81D4FA" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="0" y1="-2" x2="0" y2="2" stroke="#81D4FA" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </g>
        ))}
      </g>
    </svg>
  ),
  'freezing-rain-night': (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="cloudGradientNight9" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2A2A2A" />
          <stop offset="100%" stopColor="#1A1A1A" />
        </linearGradient>
      </defs>
      {/* Cloud */}
      <g className="cloud-group" style={{ animation: 'drift 6s ease-in-out infinite' }}>
        <ellipse cx="32" cy="26" rx="24" ry="14" fill="url(#cloudGradientNight9)" />
        <ellipse cx="16" cy="30" rx="14" ry="9" fill="url(#cloudGradientNight9)" />
        <ellipse cx="46" cy="30" rx="14" ry="9" fill="url(#cloudGradientNight9)" />
      </g>
      {/* Freezing rain drops */}
      <g className="rain-drops">
        {[...Array(10)].map((_, i) => (
          <g key={i} style={{ animation: `rainFall ${0.7 + (i % 3) * 0.1}s linear infinite ${(i % 5) * 0.1}s` }}>
            <line
              x1={14 + (i % 5) * 9}
              y1={42}
              x2={14 + (i % 5) * 9}
              y2={58}
              stroke="#81D4FA"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />
            <g transform={`translate(${14 + (i % 5) * 9}, ${42 + (i % 3) * 5})`}>
              <line x1="-2" y1="0" x2="2" y2="0" stroke="#81D4FA" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="0" y1="-2" x2="0" y2="2" stroke="#81D4FA" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </g>
        ))}
      </g>
    </svg>
  ),
  'snow-showers': (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="cloudGradient10" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ECEFF1" />
          <stop offset="100%" stopColor="#CFD8DC" />
        </linearGradient>
      </defs>
      {/* Cloud */}
      <g className="cloud-group" style={{ animation: 'drift 8s ease-in-out infinite' }}>
        <ellipse cx="32" cy="26" rx="24" ry="14" fill="url(#cloudGradient10)" />
        <ellipse cx="16" cy="30" rx="14" ry="9" fill="url(#cloudGradient10)" />
        <ellipse cx="46" cy="30" rx="14" ry="9" fill="url(#cloudGradient10)" />
      </g>
      {/* Snow showers */}
      <g className="snowflakes">
        {[...Array(8)].map((_, i) => (
          <g
            key={i}
            transform={`translate(${16 + (i % 4) * 12}, 42)`}
            style={{ 
              animation: `snowFall ${1.5 + (i % 3) * 0.5}s linear infinite ${(i % 4) * 0.3}s`,
              transformOrigin: 'center center'
            }}
          >
            <line x1="0" y1="-3" x2="0" y2="3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-3" y1="0" x2="3" y2="0" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-2" y1="-2" x2="2" y2="2" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
            <line x1="-2" y1="2" x2="2" y2="-2" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
          </g>
        ))}
      </g>
    </svg>
  ),
  'snow-showers-night': (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="weather-icon-svg">
      <defs>
        <linearGradient id="cloudGradientNight10" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3A3A3A" />
          <stop offset="100%" stopColor="#2A2A2A" />
        </linearGradient>
      </defs>
      {/* Cloud */}
      <g className="cloud-group" style={{ animation: 'drift 8s ease-in-out infinite' }}>
        <ellipse cx="32" cy="26" rx="24" ry="14" fill="url(#cloudGradientNight10)" />
        <ellipse cx="16" cy="30" rx="14" ry="9" fill="url(#cloudGradientNight10)" />
        <ellipse cx="46" cy="30" rx="14" ry="9" fill="url(#cloudGradientNight10)" />
      </g>
      {/* Snow showers */}
      <g className="snowflakes">
        {[...Array(8)].map((_, i) => (
          <g
            key={i}
            transform={`translate(${16 + (i % 4) * 12}, 42)`}
            style={{ 
              animation: `snowFall ${1.5 + (i % 3) * 0.5}s linear infinite ${(i % 4) * 0.3}s`,
              transformOrigin: 'center center'
            }}
          >
            <line x1="0" y1="-3" x2="0" y2="3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-3" y1="0" x2="3" y2="0" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-2" y1="-2" x2="2" y2="2" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
            <line x1="-2" y1="2" x2="2" y2="-2" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
          </g>
        ))}
      </g>
    </svg>
  ),
};

export default function WeatherIcon({ icon, size = 120, className = '' }) {
  const iconComponent = weatherIcons[icon] || weatherIcons.clear;
  
  return (
    <div 
      className={`weather-icon ${className}`}
      style={{ 
        width: size, 
        height: size, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'visible'
      }}
      aria-hidden="true"
    >
      <div style={{ width: '100%', height: '100%' }}>
        {iconComponent}
      </div>
    </div>
  );
}