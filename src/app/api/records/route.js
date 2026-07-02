import { NextResponse } from 'next/server';
import { initDB, createRecord, getRecords, getRecordCount } from '@/lib/db';
import { validateDateRange, detectInputType, computeWeatherAggregates, checkDateRange, isPastDate } from '@/lib/utils';

// Initialize DB on module load
initDB();

async function fetchWeatherForRecord(lat, lon, dateFrom, dateTo) {
  const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/';
  const today = new Date().toISOString().split('T')[0];
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 50;
  const offset = (page - 1) * limit;
  
  try {
    const records = getRecords({ search, limit, offset });
    const total = getRecordCount(search);
    
    return NextResponse.json({
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/records error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { location, date_from, date_to } = body;
    
    // Validate required fields
    if (!location || !location.trim()) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }
    
    if (!date_from || !date_to) {
      return NextResponse.json(
        { error: 'Both date_from and date_to are required' },
        { status: 400 }
      );
    }
    
    // Validate date range
    const dateValidation = validateDateRange(date_from, date_to);
    if (!dateValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid date range', details: dateValidation.errors },
        { status: 400 }
      );
    }
    
    // Geocode location
    const inputType = detectInputType(location);
    let geocodeQuery = location;
    
    if (inputType.type === 'gps') {
      geocodeQuery = `${inputType.lat},${inputType.lon}`;
    } else if (inputType.type === 'zip') {
      geocodeQuery = inputType.postalcode;
    }
    
    const geocodeRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/geocode?query=${encodeURIComponent(geocodeQuery)}`);
    const geocodeData = await geocodeRes.json();
    
    if (!geocodeRes.ok || !geocodeData.results?.length) {
      return NextResponse.json(
        { 
          error: `Location "${location}" could not be found`,
          suggestion: 'Try a different format: city name, zip code, or GPS coordinates (e.g., 40.71, -74.00)'
        },
        { status: 404 }
      );
    }
    
    const matchedLocation = geocodeData.results[0];
    const { lat, lon, display_name, name, country, state } = matchedLocation;
    
    // Fetch weather data for the date range
    let weatherData = null;
    try {
      weatherData = await fetchWeatherForRecord(lat, lon, date_from, date_to);
    } catch (weatherError) {
      console.warn('Weather fetch failed, storing record without weather:', weatherError);
    }
    
    // Compute aggregates
    const aggregates = weatherData ? computeWeatherAggregates(weatherData, date_from, date_to) : {};
    
    // Get weather description
    let weatherDesc = null;
    let weatherCode = null;
    if (aggregates.weather_code !== null && aggregates.weather_code !== undefined) {
      weatherCode = aggregates.weather_code;
      const { getWeatherInfo } = await import('@/lib/weatherCodes');
      const info = getWeatherInfo(weatherCode, true);
      weatherDesc = info.description;
    }
    
    // Create record
    const record = createRecord({
      location_name: display_name,
      latitude: lat,
      longitude: lon,
      date_from,
      date_to,
      temp_min: aggregates.temp_min !== Infinity ? aggregates.temp_min : null,
      temp_max: aggregates.temp_max !== -Infinity ? aggregates.temp_max : null,
      temp_avg: aggregates.temp_avg,
      weather_code: weatherCode,
      weather_desc: weatherDesc,
      humidity: aggregates.humidity ? aggregates.humidity / Math.max(1, (dateValidation.days || 1)) : null,
      wind_speed: aggregates.wind_speed ? aggregates.wind_speed / Math.max(1, (dateValidation.days || 1)) : null,
      precipitation: aggregates.precipitation,
      raw_data: weatherData,
    });
    
    // Include matched location info in response
    return NextResponse.json({
      ...record,
      matched_location: {
        name,
        display_name,
        country,
        state,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/records error:', error);
    
    if (error.message?.includes('validation') || error.message?.includes('required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    );
  }
}