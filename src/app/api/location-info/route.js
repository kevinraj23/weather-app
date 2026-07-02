import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  
  if (!name || !lat || !lon) {
    return NextResponse.json(
      { error: 'name, lat, and lon parameters are required' },
      { status: 400 }
    );
  }
  
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { error: 'Invalid latitude or longitude' },
      { status: 400 }
    );
  }
  
  try {
    const results = await Promise.allSettled([
      // Wikipedia summary
      fetchWikipedia(name),
      // REST Countries (get country code from name)
      fetchCountryInfo(name),
    ]);
    
    const [wikiResult, countryResult] = results;
    
    const response = {
      map: {
        lat: latitude,
        lon: longitude,
        zoom: 10,
      },
      youtube: {
        search_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' travel weather')}`,
        embed_query: name + ' travel weather',
      },
      wikipedia: wikiResult.status === 'fulfilled' ? wikiResult.value : null,
      country: countryResult.status === 'fulfilled' ? countryResult.value : null,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Location info API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location info' },
      { status: 500 }
    );
  }
}

async function fetchWikipedia(locationName) {
  try {
    // Try to get the page summary
    const cleanName = locationName.split(',')[0].trim().replace(/\s+/g, '_');
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanName)}`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });
    
    if (!response.ok) {
      // Try search if direct page not found
      return await searchWikipedia(locationName);
    }
    
    const data = await response.json();
    
    return {
      title: data.title,
      extract: data.extract,
      thumbnail: data.thumbnail?.source || null,
      page_url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanName)}`,
    };
  } catch (error) {
    console.error('Wikipedia fetch error:', error);
    return null;
  }
}

async function searchWikipedia(query) {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=1`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.query?.search?.length > 0) {
      const pageTitle = data.query.search[0].title.replace(/\s+/g, '_');
      return await fetchWikipedia(pageTitle);
    }
    
    return null;
  } catch {
    return null;
  }
}

async function fetchCountryInfo(locationName) {
  try {
    // Extract country name from location
    const countryName = locationName.split(',').pop()?.trim();
    if (!countryName) return null;
    
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=name,capital,population,region,languages,currencies,flags,cca2`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 86400 },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.length) return null;
    
    const country = data[0];
    
    return {
      name: country.name?.common,
      officialName: country.name?.official,
      capital: country.capital?.[0],
      population: country.population,
      region: country.region,
      subregion: country.subregion,
      languages: country.languages ? Object.values(country.languages).join(', ') : null,
      currencies: country.currencies ? Object.entries(country.currencies).map(([code, info]) => `${code}: ${info.name} (${info.symbol})`).join(', ') : null,
      flag: country.flags?.png || country.flags?.svg,
      flagEmoji: country.flag,
      code: country.cca2?.toLowerCase(),
    };
  } catch (error) {
    console.error('Country info fetch error:', error);
    return null;
  }
}