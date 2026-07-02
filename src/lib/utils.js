/**
 * Detect the type of location input
 * @param {string} input - User input string
 * @returns {Object} Detection result with type and parsed values
 */
export function detectInputType(input) {
  const trimmed = input.trim();
  
  // GPS Coordinates: lat, lon (e.g., "40.7128, -74.0060" or "40.7128,-74.0060")
  const gpsRegex = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
  if (gpsRegex.test(trimmed)) {
    const [lat, lon] = trimmed.split(',').map(s => parseFloat(s.trim()));
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return { type: 'gps', lat, lon, original: trimmed };
    }
  }
  
  // US Zip Code: 5 digits or 5+4 (e.g., "10001", "90210-1234")
  const usZipRegex = /^\d{5}(-\d{4})?$/;
  if (usZipRegex.test(trimmed)) {
    return { type: 'zip', postalcode: trimmed, country: 'US', original: trimmed };
  }
  
  // International Postal Code: alphanumeric with spaces (e.g., "SW1A 1AA", "M5V 3L9")
  const intlZipRegex = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$|^[A-Za-z]{1,2}\d{1,2}\s?\d[A-Za-z]{2}$|^\d{4,5}$/;
  if (intlZipRegex.test(trimmed.replace(/\s+/g, ' ').trim())) {
    return { type: 'zip', postalcode: trimmed, original: trimmed };
  }
  
  // City, Country format (e.g., "Paris, France")
  if (trimmed.includes(',') && trimmed.split(',').length === 2) {
    const [city, country] = trimmed.split(',').map(s => s.trim());
    if (city && country) {
      return { type: 'city-country', city, country, original: trimmed };
    }
  }
  
  // Default: treat as free-text search (city name, landmark, etc.)
  return { type: 'search', query: trimmed, original: trimmed };
}

/**
 * Validate date range
 * @param {string} dateFrom - Start date (YYYY-MM-DD)
 * @param {string} dateTo - End date (YYYY-MM-DD)
 * @returns {Object} Validation result with success and error message
 */
export function validateDateRange(dateFrom, dateTo) {
  const errors = [];
  
  // Check if dates are provided
  if (!dateFrom) errors.push('Start date is required');
  if (!dateTo) errors.push('End date is required');
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  // Validate ISO format
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);
  
  if (isNaN(fromDate.getTime())) errors.push('Invalid start date format (use YYYY-MM-DD)');
  if (isNaN(toDate.getTime())) errors.push('Invalid end date format (use YYYY-MM-DD)');
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  // Check from <= to
  if (fromDate > toDate) {
    errors.push('Start date must be before or equal to end date');
  }
  
  // Check range <= 365 days
  const diffTime = toDate - fromDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 365) {
    errors.push('Date range cannot exceed 365 days');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    fromDate,
    toDate,
    days: diffDays
  };
}

/**
 * Format date as YYYY-MM-DD
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

/**
 * Format time as HH:MM (24-hour)
 * @param {string} isoString - ISO datetime string
 * @returns {string} Formatted time
 */
export function formatTime(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  } catch {
    return '';
  }
}

/**
 * Format date as day name (Mon, Tue, etc.)
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {string} Day name
 */
export function formatDayName(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Convert Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
export function celsiusToFahrenheit(celsius) {
  if (celsius === null || celsius === undefined) return null;
  return Math.round((celsius * 9/5) + 32);
}

/**
 * Convert Fahrenheit to Celsius
 * @param {number} fahrenheit - Temperature in Fahrenheit
 * @returns {number} Temperature in Celsius
 */
export function fahrenheitToCelsius(fahrenheit) {
  if (fahrenheit === null || fahrenheit === undefined) return null;
  return Math.round((fahrenheit - 32) * 5/9);
}

/**
 * Get wind direction from degrees
 * @param {number} degrees - Wind direction in degrees (0-360)
 * @returns {Object} Direction label and arrow rotation
 */
export function getWindDirection(degrees) {
  if (degrees === null || degrees === undefined) return { label: '—', rotation: 0 };
  
  const directions = [
    { label: 'N', min: 348.75, max: 360 },
    { label: 'N', min: 0, max: 11.25 },
    { label: 'NNE', min: 11.25, max: 33.75 },
    { label: 'NE', min: 33.75, max: 56.25 },
    { label: 'ENE', min: 56.25, max: 78.75 },
    { label: 'E', min: 78.75, max: 101.25 },
    { label: 'ESE', min: 101.25, max: 123.75 },
    { label: 'SE', min: 123.75, max: 146.25 },
    { label: 'SSE', min: 146.25, max: 168.75 },
    { label: 'S', min: 168.75, max: 191.25 },
    { label: 'SSW', min: 191.25, max: 213.75 },
    { label: 'SW', min: 213.75, max: 236.25 },
    { label: 'WSW', min: 236.25, max: 258.75 },
    { label: 'W', min: 258.75, max: 281.25 },
    { label: 'WNW', min: 281.25, max: 303.75 },
    { label: 'NW', min: 303.75, max: 326.25 },
    { label: 'NNW', min: 326.25, max: 348.75 },
  ];
  
  const dir = directions.find(d => degrees >= d.min && degrees < d.max) || directions[0];
  return {
    label: dir.label,
    rotation: degrees
  };
}

/**
 * Get UV index severity label
 * @param {number} uvIndex - UV index value
 * @returns {string} Severity label
 */
export function getUVSeverity(uvIndex) {
  if (uvIndex === null || uvIndex === undefined) return 'Unknown';
  if (uvIndex <= 2) return 'Low';
  if (uvIndex <= 5) return 'Moderate';
  if (uvIndex <= 7) return 'High';
  if (uvIndex <= 10) return 'Very High';
  return 'Extreme';
}

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Format number with locale
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted number
 */
export function formatNumber(num, decimals = 1) {
  if (num === null || num === undefined) return '—';
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
}

/**
 * Generate export filename with timestamp
 * @param {string} format - Export format
 * @returns {string} Filename
 */
export function generateExportFilename(format) {
  const date = new Date().toISOString().split('T')[0];
  return `weather_records_export_${date}.${format}`;
}

/**
 * Check if date is in the past
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {boolean}
 */
export function isPastDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Check if date is in the future (within 16 days for forecast)
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {Object} { isFuture, withinForecast }
 */
export function checkDateRange(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
  
  return {
    isFuture: diffDays > 0,
    withinForecast: diffDays > 0 && diffDays <= 16,
    daysFromNow: diffDays
  };
}

/**
 * Sanitize string for safe use in URLs/queries
 * @param {string} str - Input string
 * @returns {string} Sanitized string
 */
export function sanitizeString(str) {
  if (!str) return '';
  return str.trim().replace(/[<>\"'&]/g, '');
}

/**
 * Fetch weather data for a record (historical + forecast)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} dateFrom - Start date (YYYY-MM-DD)
 * @param {string} dateTo - End date (YYYY-MM-DD)
 * @returns {Object} Combined weather data
 */
async function fetchWeatherForRecord(lat, lon, dateFrom, dateTo) {
  const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/';
  const isHistorical = isPastDate(dateTo);
  const isFuture = !isPastDate(dateFrom);
  
  let archiveData = null;
  let forecastData = null;
  
  try {
    // Fetch historical data if range includes past dates
    if (isHistorical) {
      const archiveUrl = new URL(`${OPEN_METEO_BASE}archive`);
      archiveUrl.searchParams.set('latitude', lat.toString());
      archiveUrl.searchParams.set('longitude', lon.toString());
      archiveUrl.searchParams.set('start_date', dateFrom);
      archiveUrl.searchParams.set('end_date', dateTo);
      archiveUrl.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,relative_humidity_2m_max,wind_speed_10m_max');
      archiveUrl.searchParams.set('timezone', 'auto');
      
      const res = await fetch(archiveUrl.toString());
      if (res.ok) {
        archiveData = await res.json();
      }
    }
    
    // Fetch forecast data if range includes future dates (within 16 days)
    if (isFuture) {
      const forecastUrl = new URL(`${OPEN_METEO_BASE}forecast`);
      forecastUrl.searchParams.set('latitude', lat.toString());
      forecastUrl.searchParams.set('longitude', lon.toString());
      forecastUrl.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,relative_humidity_2m_max,wind_speed_10m_max');
      forecastUrl.searchParams.set('start_date', dateFrom);
      forecastUrl.searchParams.set('end_date', dateTo);
      forecastUrl.searchParams.set('forecast_days', '16');
      forecastUrl.searchParams.set('timezone', 'auto');
      
      const res = await fetch(forecastUrl.toString());
      if (res.ok) {
        forecastData = await res.json();
      }
    }
    
    // Combine data
    const combined = { daily: { time: [], temperature_2m_max: [], temperature_2m_min: [], weather_code: [], precipitation_sum: [], relative_humidity_2m_max: [], wind_speed_10m_max: [] } };
    
    if (archiveData?.daily) {
      Object.keys(combined.daily).forEach(key => {
        combined.daily[key] = [...combined.daily[key], ...(archiveData.daily[key] || [])];
      });
    }
    
    if (forecastData?.daily) {
      // Avoid duplicates for overlapping dates
      const existingDates = new Set(combined.daily.time);
      forecastData.daily.time.forEach((date, i) => {
        if (!existingDates.has(date)) {
          Object.keys(combined.daily).forEach(key => {
            combined.daily[key].push(forecastData.daily[key][i]);
          });
        }
      });
    }
    
    // Sort by date
    const sortedIndices = combined.daily.time
      .map((date, i) => ({ date, index: i }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => item.index);
    
    Object.keys(combined.daily).forEach(key => {
      combined.daily[key] = sortedIndices.map(i => combined.daily[key][i]);
    });
    
    return combined;
  } catch (error) {
    console.error('Weather fetch error:', error);
    throw new Error('Failed to fetch weather data');
  }
}
export { fetchWeatherForRecord };

/**
 * Parse raw weather data to compute aggregates
 * @param {Object} rawData - Raw Open-Meteo response
 * @param {string} dateFrom - Start date
 * @param {string} dateTo - End date
 * @returns {Object} Computed aggregates
 */
export function computeWeatherAggregates(rawData, dateFrom, dateTo) {
  if (!rawData?.daily) return {};
  
  const { daily } = rawData;
  const fromIdx = daily.time.indexOf(dateFrom);
  const toIdx = daily.time.indexOf(dateTo);
  
  if (fromIdx === -1 || toIdx === -1) return {};
  
  const temps = [];
  let totalPrecip = 0;
  let totalHumidity = 0;
  let totalWind = 0;
  let weatherCodes = [];
  
  for (let i = fromIdx; i <= toIdx; i++) {
    if (daily.temperature_2m_max[i] !== null && daily.temperature_2m_min[i] !== null) {
      temps.push((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2);
    }
    if (daily.precipitation_sum[i] !== null) totalPrecip += daily.precipitation_sum[i];
    if (daily.weather_code[i] !== null) weatherCodes.push(daily.weather_code[i]);
  }
  
  // Get most frequent weather code
  const codeCounts = {};
  weatherCodes.forEach(code => {
    codeCounts[code] = (codeCounts[code] || 0) + 1;
  });
  const mostCommonCode = Object.entries(codeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  
  return {
    temp_min: daily.temperature_2m_min.slice(fromIdx, toIdx + 1).reduce((a, b) => Math.min(a, b), Infinity),
    temp_max: daily.temperature_2m_max.slice(fromIdx, toIdx + 1).reduce((a, b) => Math.max(a, b), -Infinity),
    temp_avg: temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : null,
    precipitation: totalPrecip,
    weather_code: mostCommonCode ? parseInt(mostCommonCode) : null,
  };
}