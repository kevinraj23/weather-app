# Weather Dashboard

A production-grade, full-stack weather web application built with Next.js 16, featuring location search, current weather, 5-day forecast, SQLite CRUD persistence, multi-source location info (Wikipedia, Google Maps, Leaflet, YouTube), multi-format data export, and a premium glassmorphism design system — all with **zero API keys required**.

![Weather Dashboard](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-blue?logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

### 🔍 Smart Location Search
- **Universal input**: Accepts city names, ZIP codes, GPS coordinates, landmarks
- **Auto-detection**: Automatically detects input type (city, ZIP, GPS, landmark)
- **Geolocation button**: "Use My Location" with browser Geolocation API
- **Real-time suggestions**: Debounced autocomplete from Nominatim
- **Error handling**: Friendly messages for "not found" and "service unavailable"

### 🌡️ Current Weather Display
- Animated SVG weather icons (not emoji) for all WMO weather codes
- Temperature with °C/°F toggle (persisted in localStorage)
- 10 detail cards: humidity, wind speed/gusts/direction, pressure, cloud cover, precipitation, UV index, sunrise/sunset
- Dynamic background gradients based on weather condition and time of day
- Day/night variants for all weather icons

### 📅 5-Day Forecast
- Horizontal scrollable card strip with snap points on mobile
- Each card: day name, date, animated icon, high/low temps, precipitation probability, wind speed
- Hover lift effect on desktop, touch-friendly on mobile

### 🗄️ Database CRUD Persistence (SQLite)
- **Create**: Location + date range → validates → fetches weather (historical/forecast) → stores
- **Read**: List all records with search filter, sorted by newest first
- **Update**: Edit location/dates → re-validates → re-fetches weather → updates
- **Delete**: Confirmation modal → removes from database
- Prepared statements for SQL injection safety
- Date range validation (max 365 days, from ≤ to)

### 🌐 Location Info Panel (5 Tabs)
1. **Google Maps** - Keyless iframe embed (`maps.google.com/maps?q={lat},{lon}&output=embed`)
2. **Interactive Map** - Leaflet.js + OpenStreetMap with pan/zoom/marker
3. **About** - Wikipedia summary + thumbnail + "Read more" link
4. **Videos** - YouTube search link for "{location} travel weather"
5. **Country** - REST Countries data (flag, population, region, capital, languages, currency)

### 📤 Multi-Format Data Export
- **JSON** - Pretty-printed with metadata
- **CSV** - Spreadsheet compatible with headers
- **XML** - Structured with `<weather_records><record>` elements
- **PDF** - Formatted table with title, timestamp, and data (pdfkit)
- **Markdown** - GitHub-flavored markdown table
- Export all records or selected records
- Proper `Content-Disposition` headers for downloads

### 🎨 Premium Design System
- **Glassmorphism** aesthetic with custom CSS properties
- **7 weather-responsive gradients** (clear, cloudy, rain, snow, thunderstorm, fog, drizzle) + night variants
- **Typography**: Outfit (headings) + Inter (body) via Google Fonts
- **Animated SVG icons** for all weather groups with CSS animations
- **Micro-interactions**: hover lift, focus glow, button ripple, smooth transitions
- **Responsive**: Mobile-first (375px, 768px, 1024px, 1440px breakpoints)
- **Loading skeletons** instead of spinners
- **Toast notifications** for success/error/info

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | JavaScript (ESM) |
| Styling | Vanilla CSS (Custom Design System) |
| Database | SQLite via `better-sqlite3` |
| Weather API | Open-Meteo (free, no key) |
| Geocoding | Nominatim/OpenStreetMap (free, no key) |
| Maps | Google Maps iframe + Leaflet.js |
| Location Info | Wikipedia REST API, REST Countries, YouTube |
| Export | json2csv, js2xmlparser, pdfkit |
| Maps (Interactive) | react-leaflet |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/weather-app.git
cd weather-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
weather-app/
├── src/
│   ├── app/
│   │   ├── layout.js              # Root layout with fonts, nav, toast container
│   │   ├── page.js                # Main dashboard (search, current, forecast, location info)
│   │   ├── globals.css            # Complete design system
│   │   ├── records/
│   │   │   └── page.js            # Records management page
│   │   └── api/
│   │       ├── geocode/route.js   # Smart geocoding (city, ZIP, GPS, landmark)
│   │       ├── weather/
│   │       │   ├── current/route.js  # Current weather from Open-Meteo
│   │       │   └── forecast/route.js # 5-day forecast from Open-Meteo
│   │       ├── records/route.js   # GET (list), POST (create)
│   │       ├── records/[id]/route.js # GET, PUT, DELETE single record
│   │       ├── export/route.js    # Multi-format export (JSON, CSV, XML, PDF, MD)
│   │       └── location-info/route.js # Aggregates Wikipedia, Maps, YouTube, Countries
│   ├── components/
│   │   ├── SearchBar.js           # Universal location input with suggestions
│   │   ├── CurrentWeather.js      # Current conditions display
│   │   ├── FiveDayForecast.js     # Horizontal forecast strip
│   │   ├── ForecastCard.js        # Single day forecast card
│   │   ├── WeatherIcon.js         # Animated SVG weather icons
│   │   ├── LocationInfo.js        # 5-tab location panel
│   │   ├── RecordsTable.js        # Searchable/sortable CRUD table
│   │   ├── RecordForm.js          # Create/edit form with validation
│   │   ├── ExportPanel.js         # Format selector + download
│   │   ├── ErrorMessage.js        # Graceful error display with retry
│   │   ├── LoadingSpinner.js      # Skeleton loaders
│   │   ├── Toast.js               # Toast notification system
│   │   └── ConfirmModal.js        # Delete confirmation modal
│   └── lib/
│       ├── db.js                  # SQLite init, schema, CRUD helpers
│       ├── weatherCodes.js        # WMO code → description/icon/gradient mapping
│       └── utils.js               # Date formatting, validation, temp conversion, fetch helpers
├── database.sqlite                # Auto-created on first run
├── package.json
├── next.config.mjs
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/geocode?query=<input>` | Smart geocoding |
| GET | `/api/weather/current?lat=<lat>&lon=<lon>` | Current weather |
| GET | `/api/weather/forecast?lat=<lat>&lon=<lon>` | 5-day forecast |
| GET | `/api/records` | List all records (supports `?search=&page=&limit=`) |
| POST | `/api/records` | Create record (location, date_from, date_to) |
| GET | `/api/records/:id` | Get single record |
| PUT | `/api/records/:id` | Update record (re-fetches weather if location/dates change) |
| DELETE | `/api/records/:id` | Delete record |
| GET | `/api/export?format=<json|csv|xml|pdf|md>&ids=<optional>` | Export records |
| GET | `/api/location-info?name=<name>&lat=<lat>&lon=<lon>` | Aggregated location info |

## Environment Variables

No required environment variables! All APIs are free and keyless.

Optional:
- `NEXT_PUBLIC_APP_URL` - For internal API calls (defaults to current origin)

## Acceptance Criteria

All of the following work out of the box:

- ✅ `npm install && npm run dev` starts with zero configuration
- ✅ Search "New York" → current weather + 5-day forecast displayed
- ✅ Search "10001" (ZIP) → resolves to New York
- ✅ Search "40.7128, -74.0060" (GPS) → resolves to New York
- ✅ Search "Eiffel Tower" (landmark) → resolves to Paris
- ✅ "Use My Location" button → detects and shows local weather
- ✅ Search "asdfjkl123" → friendly "Location not found" error
- ✅ Disconnect network → "Weather service unavailable" with retry countdown
- ✅ 5-day forecast shows 5 distinct days in horizontal cards
- ✅ Temperature °C/°F toggle works and persists
- ✅ CREATE record → validates → fetches weather → stores in DB → appears in table
- ✅ Invalid date range (end < start) → validation error
- ✅ Non-existent location → "Location not found" error
- ✅ Records page shows all created records in searchable table
- ✅ UPDATE record location → re-validates → re-fetches weather
- ✅ DELETE record → confirmation modal → removed from DB and table
- ✅ Map shows correct location (Google Maps iframe + Leaflet)
- ✅ YouTube link opens correct search in new tab
- ✅ Wikipedia summary loads for searched location
- ✅ Export JSON/CSV/XML/PDF/Markdown → valid files download
- ✅ `npm run build` completes without errors
- ✅ Responsive at 1440px, 1024px, 768px, 375px

## License

MIT License - feel free to use for learning or production.

## Acknowledgments

- [Open-Meteo](https://open-meteo.com/) - Free weather API
- [Nominatim](https://nominatim.org/) - Free geocoding
- [Wikipedia REST API](https://www.mediawiki.org/wiki/Wikipedia_REST_API) - Free encyclopedia data
- [REST Countries](https://restcountries.com/) - Free country data
- [OpenStreetMap](https://www.openstreetmap.org/) - Free map tiles
- [Leaflet](https://leafletjs.com/) - Interactive maps