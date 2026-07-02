import { NextResponse } from 'next/server';
import { initDB, getRecord, updateRecord, deleteRecord } from '@/lib/db';
import { validateDateRange, detectInputType, computeWeatherAggregates, fetchWeatherForRecord } from '@/lib/utils';

// Initialize DB on module load
initDB();

export async function GET(request, { params }) {
  const { id } = await params;
  const recordId = parseInt(id);
  
  if (isNaN(recordId)) {
    return NextResponse.json(
      { error: 'Invalid record ID' },
      { status: 400 }
    );
  }
  
  try {
    const record = getRecord(recordId);
    
    if (!record) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(record);
  } catch (error) {
    console.error('GET /api/records/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch record' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const recordId = parseInt(id);
  
  if (isNaN(recordId)) {
    return NextResponse.json(
      { error: 'Invalid record ID' },
      { status: 400 }
    );
  }
  
  try {
    const body = await request.json();
    const { location, date_from, date_to } = body;
    
    // Get existing record
    const existing = getRecord(recordId);
    if (!existing) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }
    
    // Prepare updates
    const updates = {};
    let needsWeatherRefetch = false;
    let newLat = existing.latitude;
    let newLon = existing.longitude;
    let newDateFrom = existing.date_from;
    let newDateTo = existing.date_to;
    
    // Update location if provided
    if (location && location.trim() && location !== existing.location_name) {
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
      updates.location_name = matchedLocation.display_name;
      newLat = matchedLocation.lat;
      newLon = matchedLocation.lon;
      updates.latitude = newLat;
      updates.longitude = newLon;
      needsWeatherRefetch = true;
    }
    
    // Update date_from if provided
    if (date_from && date_from !== existing.date_from) {
      updates.date_from = date_from;
      newDateFrom = date_from;
      needsWeatherRefetch = true;
    }
    
    // Update date_to if provided
    if (date_to && date_to !== existing.date_to) {
      updates.date_to = date_to;
      newDateTo = date_to;
      needsWeatherRefetch = true;
    }
    
    // Validate date range if dates are being updated
    if (needsWeatherRefetch && (date_from || date_to)) {
      const dateValidation = validateDateRange(newDateFrom, newDateTo);
      if (!dateValidation.valid) {
        return NextResponse.json(
          { error: 'Invalid date range', details: dateValidation.errors },
          { status: 400 }
        );
      }
    }
    
    // Re-fetch weather data if needed
    if (needsWeatherRefetch) {
      try {
        const weatherData = await fetchWeatherForRecord(newLat, newLon, newDateFrom, newDateTo);
        const aggregates = computeWeatherAggregates(weatherData, newDateFrom, newDateTo);
        
        let weatherDesc = null;
        let weatherCode = null;
        if (aggregates.weather_code !== null && aggregates.weather_code !== undefined) {
          weatherCode = aggregates.weather_code;
          const { getWeatherInfo } = await import('@/lib/weatherCodes');
          const info = getWeatherInfo(weatherCode, true);
          weatherDesc = info.description;
        }
        
        updates.temp_min = aggregates.temp_min !== Infinity ? aggregates.temp_min : null;
        updates.temp_max = aggregates.temp_max !== -Infinity ? aggregates.temp_max : null;
        updates.temp_avg = aggregates.temp_avg;
        updates.weather_code = weatherCode;
        updates.weather_desc = weatherDesc;
        updates.humidity = aggregates.humidity ? aggregates.humidity / Math.max(1, (new Date(newDateTo) - new Date(newDateFrom)) / (1000 * 60 * 60 * 24) + 1) : null;
        updates.wind_speed = aggregates.wind_speed ? aggregates.wind_speed / Math.max(1, (new Date(newDateTo) - new Date(newDateFrom)) / (1000 * 60 * 60 * 24) + 1) : null;
        updates.precipitation = aggregates.precipitation;
        updates.raw_data = weatherData;
      } catch (weatherError) {
        console.warn('Weather fetch failed during update:', weatherError);
        // Continue without weather update
      }
    }
    
    // Update record
    const updated = updateRecord(recordId, updates);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/records/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update record' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const recordId = parseInt(id);
  
  if (isNaN(recordId)) {
    return NextResponse.json(
      { error: 'Invalid record ID' },
      { status: 400 }
    );
  }
  
  try {
    const existing = getRecord(recordId);
    if (!existing) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }
    
    const result = deleteRecord(recordId);
    
    return NextResponse.json({
      success: true,
      deleted_id: recordId,
      deleted_record: {
        location: existing.location_name,
        date_range: `${existing.date_from} to ${existing.date_to}`,
      },
    });
  } catch (error) {
    console.error('DELETE /api/records/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 }
    );
  }
}