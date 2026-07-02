import { NextResponse } from 'next/server';
import { detectInputType } from '@/lib/utils';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'WeatherApp/1.0 (https://github.com/weather-app)';

async function fetchNominatim(endpoint, params) {
  const url = new URL(`${NOMINATIM_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  
  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Nominatim error: ${response.status}`);
  }
  
  return response.json();
}

function formatResult(item) {
  return {
    name: item.name || item.display_name?.split(',')[0] || 'Unknown',
    display_name: item.display_name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    country: item.address?.country || '',
    state: item.address?.state || item.address?.region || '',
    type: item.type || 'place',
    importance: item.importance || 0,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  
  if (!query || !query.trim()) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }
  
  const trimmedQuery = query.trim();
  const inputType = detectInputType(trimmedQuery);
  
  try {
    let results = [];
    
    if (inputType.type === 'gps') {
      // Reverse geocoding for GPS coordinates
      const data = await fetchNominatim('/reverse', {
        lat: inputType.lat,
        lon: inputType.lon,
        format: 'jsonv2',
        addressdetails: 1,
      });
      
      if (data && data.lat && data.lon) {
        results = [formatResult(data)];
      }
    } else if (inputType.type === 'zip') {
      // Postal code search
      const data = await fetchNominatim('/search', {
        postalcode: inputType.postalcode,
        country: inputType.country || undefined,
        format: 'jsonv2',
        addressdetails: 1,
        limit: 5,
      });
      
      results = Array.isArray(data) ? data.map(formatResult) : [];
    } else {
      // Free-text search (city, landmark, etc.)
      const data = await fetchNominatim('/search', {
        q: inputType.query || trimmedQuery,
        format: 'jsonv2',
        addressdetails: 1,
        limit: 5,
        dedupe: 1,
      });
      
      results = Array.isArray(data) ? data.map(formatResult) : [];
    }
    
    if (results.length === 0) {
      return NextResponse.json(
        {
          error: 'Location not found',
          suggestion: 'Try a different format: city name, zip code, or GPS coordinates (e.g., 40.71, -74.00)',
        },
        { status: 404 }
      );
    }
    
    // Sort by importance (most relevant first)
    results.sort((a, b) => (b.importance || 0) - (a.importance || 0));
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Geocoding service temporarily unavailable' },
      { status: 502 }
    );
  }
}