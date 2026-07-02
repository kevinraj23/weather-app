import { NextResponse } from 'next/server';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  
  // Validate required parameters
  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }
  
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  
  if (isNaN(latitude) || isNaN(longitude) || 
      latitude < -90 || latitude > 90 || 
      longitude < -180 || longitude > 180) {
    return NextResponse.json(
      { error: 'Invalid latitude or longitude values' },
      { status: 400 }
    );
  }
  
  try {
    const url = new URL(OPEN_METEO_BASE);
    url.searchParams.set('latitude', latitude.toString());
    url.searchParams.set('longitude', longitude.toString());
    url.searchParams.set('daily', [
      'temperature_2m_max',
      'temperature_2m_min',
      'weather_code',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'sunrise',
      'sunset',
      'uv_index_max',
    ].join(','));
    url.searchParams.set('forecast_days', '5');
    url.searchParams.set('timezone', 'auto');
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      // Cache for 30 minutes
      next: { revalidate: 1800 },
    });
    
    if (!response.ok) {
      throw new Error(`Open-Meteo error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform to our expected format
    const daily = data.daily || {};
    const times = daily.time || [];
    
    const forecast = times.map((date, index) => ({
      date,
      day_name: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
      temp_max: daily.temperature_2m_max?.[index] ?? null,
      temp_min: daily.temperature_2m_min?.[index] ?? null,
      weather_code: daily.weather_code?.[index] ?? 0,
      precipitation_sum: daily.precipitation_sum?.[index] ?? 0,
      precipitation_probability: daily.precipitation_probability_max?.[index] ?? 0,
      wind_speed_max: daily.wind_speed_10m_max?.[index] ?? null,
      sunrise: daily.sunrise?.[index] ?? null,
      sunset: daily.sunset?.[index] ?? null,
      uv_index_max: daily.uv_index_max?.[index] ?? null,
    }));
    
    return NextResponse.json(forecast);
  } catch (error) {
    console.error('Forecast API error:', error);
    return NextResponse.json(
      { error: 'Weather service temporarily unavailable' },
      { status: 502 }
    );
  }
}