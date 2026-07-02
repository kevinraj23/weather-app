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
    url.searchParams.set('current', [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','));
    url.searchParams.set('daily', 'sunrise,sunset,uv_index_max');
    url.searchParams.set('forecast_days', '1');
    url.searchParams.set('timezone', 'auto');
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      // Cache for 10 minutes
      next: { revalidate: 600 },
    });
    
    if (!response.ok) {
      throw new Error(`Open-Meteo error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform to our expected format
    const current = data.current || {};
    const daily = data.daily || {};
    
    const result = {
      temperature: current.temperature_2m ?? null,
      feels_like: current.apparent_temperature ?? null,
      humidity: current.relative_humidity_2m ?? null,
      is_day: current.is_day ?? 1,
      precipitation: current.precipitation ?? 0,
      weather_code: current.weather_code ?? 0,
      cloud_cover: current.cloud_cover ?? null,
      pressure: current.pressure_msl ?? null,
      surface_pressure: current.surface_pressure ?? null,
      wind_speed: current.wind_speed_10m ?? null,
      wind_direction: current.wind_direction_10m ?? null,
      wind_gusts: current.wind_gusts_10m ?? null,
      sunrise: daily.sunrise?.[0] ?? null,
      sunset: daily.sunset?.[0] ?? null,
      uv_index: daily.uv_index_max?.[0] ?? null,
      timezone: data.timezone,
      timezone_abbreviation: data.timezone_abbreviation,
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Current weather API error:', error);
    return NextResponse.json(
      { error: 'Weather service temporarily unavailable' },
      { status: 502 }
    );
  }
}