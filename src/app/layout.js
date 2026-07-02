import './globals.css';

export const metadata = {
  title: 'Weather Dashboard',
  description: 'Production-grade weather application with forecasts, historical data, and location insights',
  keywords: ['weather', 'forecast', 'dashboard', 'Open-Meteo', 'Nominatim'],
  authors: [{ name: 'Weather App' }],
  openGraph: {
    title: 'Weather Dashboard',
    description: 'Beautiful weather forecasts and historical data',
    type: 'website',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1a1a2e',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://tile.openstreetmap.org" />
        <link rel="preconnect" href="https://upload.wikimedia.org" />
        <link rel="preconnect" href="https://maps.google.com" />
      </head>
      <body>
        <nav className="navbar" role="navigation" aria-label="Main navigation">
          <div className="nav-brand" href="/">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="M4.93 4.93l1.41 1.41" />
              <path d="M17.66 17.66l1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="M6.34 17.66l-1.41 1.41" />
              <path d="M19.07 4.93l-1.41 1.41" />
              <circle cx="12" cy="12" r="4" />
            </svg>
            <span>Weather</span>
          </div>
          <div className="nav-links">
            <a href="/" className="nav-link" data-page="weather">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="M4.93 4.93l1.41 1.41" />
                <path d="M17.66 17.66l1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="M6.34 17.66l-1.41 1.41" />
                <path d="M19.07 4.93l-1.41 1.41" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              <span>Weather</span>
            </a>
            <a href="/records" className="nav-link" data-page="records">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>Records</span>
            </a>
          </div>
        </nav>
        <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
          {children}
        </main>
        <div id="toast-container" className="toast-container" aria-live="polite" aria-atomic="true" />
      </body>
    </html>
  );
}