/**
 * WMO Weather Interpretation Codes mapping
 * Maps Open-Meteo weather_code to human-readable descriptions and icon identifiers
 */

export const weatherCodes = {
  0: { description: 'Clear sky', icon: 'clear', group: 'clear' },
  1: { description: 'Mainly clear', icon: 'mostly-clear', group: 'clear' },
  2: { description: 'Partly cloudy', icon: 'partly-cloudy', group: 'cloudy' },
  3: { description: 'Overcast', icon: 'overcast', group: 'cloudy' },
  45: { description: 'Fog', icon: 'fog', group: 'fog' },
  48: { description: 'Depositing rime fog', icon: 'fog', group: 'fog' },
  51: { description: 'Light drizzle', icon: 'drizzle-light', group: 'drizzle' },
  53: { description: 'Moderate drizzle', icon: 'drizzle', group: 'drizzle' },
  55: { description: 'Dense drizzle', icon: 'drizzle-heavy', group: 'drizzle' },
  56: { description: 'Light freezing drizzle', icon: 'freezing-drizzle', group: 'drizzle' },
  57: { description: 'Dense freezing drizzle', icon: 'freezing-drizzle', group: 'drizzle' },
  61: { description: 'Slight rain', icon: 'rain-light', group: 'rain' },
  63: { description: 'Moderate rain', icon: 'rain', group: 'rain' },
  65: { description: 'Heavy rain', icon: 'rain-heavy', group: 'rain' },
  66: { description: 'Light freezing rain', icon: 'freezing-rain', group: 'rain' },
  67: { description: 'Heavy freezing rain', icon: 'freezing-rain', group: 'rain' },
  71: { description: 'Slight snowfall', icon: 'snow-light', group: 'snow' },
  73: { description: 'Moderate snowfall', icon: 'snow', group: 'snow' },
  75: { description: 'Heavy snowfall', icon: 'snow-heavy', group: 'snow' },
  77: { description: 'Snow grains', icon: 'snow-grains', group: 'snow' },
  80: { description: 'Slight rain showers', icon: 'showers-light', group: 'rain' },
  81: { description: 'Moderate rain showers', icon: 'showers', group: 'rain' },
  82: { description: 'Violent rain showers', icon: 'showers-heavy', group: 'rain' },
  85: { description: 'Slight snow showers', icon: 'snow-showers-light', group: 'snow' },
  86: { description: 'Heavy snow showers', icon: 'snow-showers', group: 'snow' },
  95: { description: 'Thunderstorm', icon: 'thunderstorm', group: 'thunderstorm' },
  96: { description: 'Thunderstorm with slight hail', icon: 'thunderstorm-hail', group: 'thunderstorm' },
  99: { description: 'Thunderstorm with heavy hail', icon: 'thunderstorm-hail', group: 'thunderstorm' },
};

/**
 * Get weather info for a given WMO code
 * @param {number} code - WMO weather code
 * @param {boolean} isDay - Whether it's daytime
 * @returns {{ description: string, icon: string, group: string }}
 */
export function getWeatherInfo(code, isDay = true) {
  const info = weatherCodes[code] || { description: 'Unknown', icon: 'clear', group: 'clear' };
  return {
    ...info,
    icon: isDay ? info.icon : `${info.icon}-night`,
  };
}

/**
 * Get background gradient class based on weather group
 * @param {string} group - Weather group (clear, cloudy, rain, snow, etc.)
 * @param {boolean} isDay - Whether it's daytime
 * @returns {string} CSS class name
 */
export function getWeatherGradient(group, isDay = true) {
  if (!isDay) return 'gradient-night';
  
  const gradients = {
    clear: 'gradient-clear',
    cloudy: 'gradient-cloudy',
    fog: 'gradient-fog',
    drizzle: 'gradient-drizzle',
    rain: 'gradient-rain',
    snow: 'gradient-snow',
    thunderstorm: 'gradient-thunderstorm',
  };
  
  return gradients[group] || 'gradient-clear';
}
