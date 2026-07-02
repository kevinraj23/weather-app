'use client';

import { useState, useMemo } from 'react';
import { formatDate, formatNumber } from '@/lib/utils';
import { getWeatherInfo } from '@/lib/weatherCodes';

export default function RecordsTable({ 
  records, 
  onView, 
  onEdit, 
  onDelete,
  selectedIds = [],
  onSelectionChange,
  searchTerm = '',
  onSearchChange,
}) {
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [expandedId, setExpandedId] = useState(null);

  const sortedRecords = useMemo(() => {
    if (!records.length) return [];
    
    return [...records].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [records, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleRowClick = (record) => {
    if (expandedId === record.id) {
      setExpandedId(null);
    } else {
      setExpandedId(record.id);
    }
  };

  const isSelected = (id) => selectedIds.includes(id);
  const handleSelect = (id, checked) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(s => s !== id));
    }
  };
  
  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(sortedRecords.map(r => r.id));
    } else {
      onSelectionChange([]);
    }
  };

  const getWeatherIcon = (code, desc) => {
    if (!code) return null;
    const info = getWeatherInfo(code, true);
    return info.icon;
  };

  const renderWeatherBadge = (code, desc) => {
    if (!code) return <span className="badge badge-gray">—</span>;
    const info = getWeatherInfo(code, true);
    const groups = {
      clear: 'badge-orange',
      cloudy: 'badge-gray',
      rain: 'badge-blue',
      drizzle: 'badge-blue',
      snow: 'badge-blue',
      thunderstorm: 'badge-purple',
      fog: 'badge-gray',
    };
    return (
      <span className={`badge ${groups[info.group] || 'badge-gray'}`}>
        {desc || info.description}
      </span>
    );
  };

  if (!records.length) {
    return (
      <div className="card glass" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto var(--spacing-md)', opacity: 0.5 }} aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
          No records found
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          {searchTerm ? 'Try adjusting your search' : 'Create your first weather record'}
        </p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table" role="grid">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>
              <input
                type="checkbox"
                checked={selectedIds.length === sortedRecords.length && sortedRecords.length > 0}
                indeterminate={selectedIds.length > 0 && selectedIds.length < sortedRecords.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                aria-label="Select all records"
              />
            </th>
            <th onClick={() => handleSort('location_name')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
              Location
              <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.6 }}>
                {sortConfig.key === 'location_name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </span>
            </th>
            <th onClick={() => handleSort('date_from')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
              Date Range
              <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.6 }}>
                {sortConfig.key === 'date_from' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </span>
            </th>
            <th onClick={() => handleSort('temp_avg')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', textAlign: 'center' }}>
              Avg Temp
              <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.6 }}>
                {sortConfig.key === 'temp_avg' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </span>
            </th>
            <th onClick={() => handleSort('weather_desc')} style={{ cursor: 'pointer', userSelect: 'none' }}>
              Weather
            </th>
            <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
              Created
              <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.6 }}>
                {sortConfig.key === 'created_at' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </span>
            </th>
            <th style={{ width: '140px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.map((record, index) => (
            <React.Fragment key={record.id}>
              <tr 
                onClick={() => handleRowClick(record)}
                style={{ cursor: 'pointer' }}
                aria-expanded={expandedId === record.id}
              >
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isSelected(record.id)}
                    onChange={(e) => { e.stopPropagation(); handleSelect(record.id, e.target.checked); }}
                    aria-label={`Select record ${record.location_name}`}
                  />
                </td>
                <td style={{ fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <span>{record.location_name}</span>
                    {record.latitude && record.longitude && (
                      <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>
                        {record.latitude.toFixed(2)}, {record.longitude.toFixed(2)}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 500 }}>
                      {formatDate(record.date_from)} → {formatDate(record.date_to)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {(new Date(record.date_to) - new Date(record.date_from)) / (1000 * 60 * 60 * 24) + 1} days
                    </span>
                  </div>
                </td>
                <td style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                  {record.temp_avg !== null ? `${formatNumber(record.temp_avg)}°C` : '—'}
                </td>
                <td>
                  {renderWeatherBadge(record.weather_code, record.weather_desc)}
                </td>
                <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                  {formatDate(record.created_at)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 'var(--spacing-xs)', justifyContent: 'center' }}>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={(e) => { e.stopPropagation(); onView?.(record); }}
                      aria-label={`View ${record.location_name}`}
                      title="View details"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={(e) => { e.stopPropagation(); onEdit?.(record); }}
                      aria-label={`Edit ${record.location_name}`}
                      title="Edit record"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={(e) => { e.stopPropagation(); onDelete?.(record); }}
                      aria-label={`Delete ${record.location_name}`}
                      title="Delete record"
                      style={{ color: 'var(--accent-red)' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              {expandedId === record.id && (
                <tr>
                  <td colSpan={7} style={{ padding: 0 }}>
                    <div className="expanded-row glass-sm" style={{ margin: 'var(--spacing-sm)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>ID</label>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{record.id}</span>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Coordinates</label>
                          <span>{record.latitude?.toFixed(4)}, {record.longitude?.toFixed(4)}</span>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Temperature Range</label>
                          <span>{record.temp_min !== null ? `${formatNumber(record.temp_min)}°C` : '—'} / {record.temp_max !== null ? `${formatNumber(record.temp_max)}°C` : '—'}</span>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Humidity</label>
                          <span>{record.humidity !== null ? `${record.humidity}%` : '—'}</span>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Wind Speed</label>
                          <span>{record.wind_speed !== null ? `${Math.round(record.wind_speed)} km/h` : '—'}</span>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Precipitation</label>
                          <span>{record.precipitation !== null ? `${formatNumber(record.precipitation)} mm` : '—'}</span>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Weather Code</label>
                          <span>{record.weather_code !== null ? record.weather_code : '—'}</span>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Raw Data (JSON)</label>
                          <pre style={{ 
                            background: 'rgba(0,0,0,0.3)', 
                            padding: 'var(--spacing-md)', 
                            borderRadius: 'var(--radius-sm)', 
                            overflow: 'auto', 
                            fontSize: '0.7rem',
                            maxHeight: '200px',
                            color: 'var(--text-secondary)'
                          }}>
                            {JSON.stringify(record.raw_data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Need to import React for React.Fragment
import React from 'react';