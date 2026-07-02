'use client';

import { useState } from 'react';
import { toastSuccess, toastError } from '@/components/Toast';

const EXPORT_FORMATS = [
  { id: 'json', label: 'JSON', icon: 'json', description: 'Structured data with full details' },
  { id: 'csv', label: 'CSV', icon: 'csv', description: 'Spreadsheet compatible' },
  { id: 'xml', label: 'XML', icon: 'xml', description: 'Structured markup format' },
  { id: 'pdf', label: 'PDF', icon: 'pdf', description: 'Formatted document' },
  { id: 'md', label: 'Markdown', icon: 'md', description: 'Documentation ready' },
];

const formatIcons = {
  json: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9" />
      <polyline points="6 16 10 12 14 16" />
      <path d="M16 8h4v4" />
    </svg>
  ),
  csv: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="9" x2="15" y2="9" />
    </svg>
  ),
  xml: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10 12v8" />
      <path d="M14 12v8" />
      <path d="M18 12v8" />
    </svg>
  ),
  pdf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  ),
  md: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10 12H8" />
      <path d="M16 12H14" />
      <path d="M10 16H8" />
      <path d="M16 16H14" />
    </svg>
  ),
};

export default function ExportPanel({ 
  totalRecords, 
  selectedIds = [],
  onExport 
}) {
  const [exporting, setExporting] = useState(null);
  const [exportMode, setExportMode] = useState('all'); // 'all' | 'selected'

  const handleExport = async (format) => {
    if (exporting) return;
    
    setExporting(format);
    
    try {
      const idsParam = exportMode === 'selected' && selectedIds.length > 0 
        ? selectedIds.join(',') 
        : '';
      
      const url = `/api/export?format=${format}${idsParam ? `&ids=${idsParam}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }
      
      // Get filename from response headers or generate
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `weather_records_export.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      
      // Download the file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      
      const count = exportMode === 'selected' ? selectedIds.length : totalRecords;
      toastSuccess('Export Complete', `${count} record${count !== 1 ? 's' : ''} exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toastError('Export Failed', error.message);
    } finally {
      setExporting(null);
    }
  };

  const canExport = totalRecords > 0 || (exportMode === 'selected' && selectedIds.length > 0);
  const exportCount = exportMode === 'selected' ? selectedIds.length : totalRecords;

  return (
    <div className="card export-panel" style={{ padding: 'var(--spacing-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem' }}>
          Export Data
        </h3>
        <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
          {exportCount} record{exportCount !== 1 ? 's' : ''}
        </span>
      </div>
      
      {/* Export mode selector */}
      <div className="export-mode-selector" style={{ 
        display: 'flex', 
        gap: 'var(--spacing-sm)', 
        marginBottom: 'var(--spacing-lg)',
        padding: 'var(--spacing-sm)',
        background: 'var(--glass-bg)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--glass-border)'
      }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--spacing-xs)',
          padding: 'var(--spacing-xs) var(--spacing-md)',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          background: exportMode === 'all' ? 'var(--accent-blue)' : 'transparent',
          color: exportMode === 'all' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
          fontSize: '0.85rem',
          fontWeight: 500,
          transition: 'all var(--transition-fast)'
        }}>
          <input
            type="radio"
            name="export-mode"
            value="all"
            checked={exportMode === 'all'}
            onChange={(e) => setExportMode(e.target.value)}
            disabled={totalRecords === 0}
            style={{ accentColor: 'var(--accent-blue)' }}
          />
          All Records
        </label>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--spacing-xs)',
          padding: 'var(--spacing-xs) var(--spacing-md)',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          background: exportMode === 'selected' ? 'var(--accent-blue)' : 'transparent',
          color: exportMode === 'selected' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
          fontSize: '0.85rem',
          fontWeight: 500,
          opacity: selectedIds.length > 0 ? 1 : 0.5,
          pointerEvents: selectedIds.length > 0 ? 'auto' : 'none',
          transition: 'all var(--transition-fast)'
        }}>
          <input
            type="radio"
            name="export-mode"
            value="selected"
            checked={exportMode === 'selected'}
            onChange={(e) => setExportMode(e.target.value)}
            disabled={selectedIds.length === 0}
            style={{ accentColor: 'var(--accent-blue)' }}
          />
          Selected ({selectedIds.length})
        </label>
      </div>
      
      {/* Format buttons */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 'var(--spacing-sm)' 
      }}>
        {EXPORT_FORMATS.map(({ id, label, description }) => (
          <button
            key={id}
            className="btn btn-secondary"
            onClick={() => handleExport(id)}
            disabled={!canExport || exporting === id}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start', 
              gap: '4px',
              padding: 'var(--spacing-md)',
              minWidth: '120px',
              textAlign: 'left',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-sm)',
              width: '100%'
            }}>
              <span style={{ 
                width: '24px', 
                height: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: exporting === id ? 'var(--text-on-accent)' : 'var(--accent-blue)'
              }}>
                {formatIcons[id]}
              </span>
              <span style={{ 
                fontWeight: 600, 
                fontSize: '0.9rem',
                flex: 1
              }}>
                {label}
              </span>
              {exporting === id && (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <span style={{ 
              fontSize: '0.7rem', 
              color: 'var(--text-muted)',
              marginLeft: '28px'
            }}>
              {description}
            </span>
          </button>
        ))}
      </div>
      
      {!canExport && (
        <p style={{ 
          marginTop: 'var(--spacing-md)', 
          color: 'var(--text-muted)', 
          fontSize: '0.85rem',
          textAlign: 'center'
        }}>
          No records to export. Create some weather records first.
        </p>
      )}
    </div>
  );
}