import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const country = searchParams.get('country');
  
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
      // REST Countries (get country code from name or country parameter)
      fetchCountryInfo(name, country),
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

async function fetchCountryInfo(locationName, countryParam) {
  try {
    // Prioritize the countryParam passed from search results, fallback to splitting
    const countryName = countryParam || locationName.split(',').pop()?.trim();
    if (!countryName) return null;
    
    const url = `https://countries.dev/name/${encodeURIComponent(countryName)}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 86400 },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data || !data.length) return null;
    
    const country = data[0];
    
    return {
      name: country.name,
      officialName: country.nativeName || country.name,
      capital: country.capital,
      population: country.population,
      region: country.region,
      subregion: country.subregion,
      languages: country.languages ? country.languages.map(l => l.name).join(', ') : null,
      currencies: country.currencies ? country.currencies.map(c => `${c.code}: ${c.name} (${c.symbol})`).join(', ') : null,
      flag: country.flags?.png || country.flags?.svg,
      flagEmoji: country.flag,
      code: country.alpha2Code?.toLowerCase(),
    };
  } catch (error) {
    console.error('Country info fetch error:', error);
    return null;
  }
}