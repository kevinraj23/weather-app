'use client';

import { useState, useEffect, useCallback } from 'react';
import RecordsTable from '@/components/RecordsTable';
import RecordForm from '@/components/RecordForm';
import ExportPanel from '@/components/ExportPanel';
import ConfirmModal from '@/components/ConfirmModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toastSuccess, toastError, toastInfo } from '@/components/Toast';

export default function RecordsPage() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewRecord, setViewRecord] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecordId, setDeleteRecordId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });
      if (searchTerm) params.set('search', searchTerm);
      
      const response = await fetch(`/api/records?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch records');
      
      const data = await response.json();
      setRecords(data.records || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalRecords(data.pagination?.total || 0);
    } catch (error) {
      console.error('Fetch records error:', error);
      toastError('Error', 'Failed to load records');
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  const handleCreate = () => {
    setEditRecord({}); // Empty object signals create mode
  };

  const handleEdit = (record) => {
    setEditRecord(record);
  };

  const handleView = (record) => {
    setViewRecord(record);
  };

  const handleDelete = (record) => {
    setDeleteRecordId(record.id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteRecordId) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/records/${deleteRecordId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete record');
      }
      
      toastSuccess('Deleted', 'Weather record removed successfully');
      fetchRecords(); // Refresh
    } catch (error) {
      console.error('Delete error:', error);
      toastError('Error', error.message);
    } finally {
      setIsSubmitting(false);
      setDeleteRecordId(null);
    }
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const url = editRecord?.id ? `/api/records/${editRecord.id}` : '/api/records';
      const method = editRecord?.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || (data.details ? data.details.join(', ') : 'Failed to save record'));
      }
      
      toastSuccess(editRecord?.id ? 'Updated' : 'Created', `Weather record ${editRecord?.id ? 'updated' : 'created'} successfully`);
      setEditRecord(null);
      fetchRecords(); // Refresh
    } catch (error) {
      console.error('Form submit error:', error);
      toastError('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectionChange = (ids) => {
    setSelectedIds(ids);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="records-page" style={{ padding: 'var(--spacing-xl)', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 'var(--spacing-xl)',
        flexWrap: 'wrap',
        gap: 'var(--spacing-md)'
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>
            Weather Records
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage your saved weather data — {totalRecords} record{totalRecords !== 1 ? 's' : ''} total
          </p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleCreate}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Record
        </button>
      </div>

      {/* Search & Export Row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--spacing-lg)',
        flexWrap: 'wrap',
        gap: 'var(--spacing-md)'
      }}>
        <div className="input-wrapper" style={{ flex: 1, maxWidth: '400px' }}>
          <label htmlFor="records-search" className="visually-hidden">Search records</label>
          <input
            id="records-search"
            type="search"
            className="input"
            placeholder="Search by location..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <ExportPanel 
          totalRecords={totalRecords} 
          selectedIds={selectedIds}
        />
      </div>

      {/* Records Table */}
      <section aria-labelledby="records-heading">
        <h2 id="records-heading" className="visually-hidden">Weather Records</h2>
        {isLoading ? (
          <div className="card glass" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
            <LoadingSpinner size="lg" text="Loading records..." />
          </div>
        ) : (
          <RecordsTable
            records={records}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav 
          className="pagination" 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 'var(--spacing-sm)',
            marginTop: 'var(--spacing-xl)',
            flexWrap: 'wrap'
          }}
          aria-label="Records pagination"
        >
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </nav>
      )}

      {/* View Modal */}
      {viewRecord && (
        <ViewModal 
          record={viewRecord} 
          onClose={() => setViewRecord(null)} 
        />
      )}

      {/* Edit/Create Modal */}
      {editRecord !== null && (
        <EditModal
          record={editRecord.id ? editRecord : null}
          onClose={() => setEditRecord(null)}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteRecordId && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setDeleteRecordId(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Record"
          message={`Are you sure you want to delete the weather record for "${records.find(r => r.id === deleteRecordId)?.location_name || 'this location'}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}

// View Modal Component
function ViewModal({ record, onClose }) {
  const { formatDate, formatNumber, getWeatherInfo } = require('@/lib/utils');
  const weatherInfo = record.weather_code ? getWeatherInfo(record.weather_code, true) : { description: 'Unknown', group: 'clear' };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-modal-title"
    >
      <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="view-modal-title" className="modal-title">
            {record.location_name}
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body" style={{ maxHeight: '70vh', overflow: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
            <ViewField label="Location" value={record.location_name} />
            <ViewField label="Coordinates" value={`${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}`} />
            <ViewField label="Date Range" value={`${formatDate(record.date_from)} to ${formatDate(record.date_to)}`} />
            <ViewField label="Days" value={`${Math.ceil((new Date(record.date_to) - new Date(record.date_from)) / (1000 * 60 * 60 * 24)) + 1}`} />
            <ViewField label="Avg Temperature" value={record.temp_avg !== null ? `${formatNumber(record.temp_avg)}°C` : '—'} />
            <ViewField label="Min / Max Temp" value={record.temp_min !== null && record.temp_max !== null ? `${formatNumber(record.temp_min)}°C / ${formatNumber(record.temp_max)}°C` : '—'} />
            <ViewField label="Weather" value={record.weather_desc || weatherInfo.description} />
            <ViewField label="Weather Code" value={record.weather_code !== null ? record.weather_code : '—'} />
            <ViewField label="Humidity" value={record.humidity !== null ? `${record.humidity}%` : '—'} />
            <ViewField label="Wind Speed" value={record.wind_speed !== null ? `${Math.round(record.wind_speed)} km/h` : '—'} />
            <ViewField label="Precipitation" value={record.precipitation !== null ? `${formatNumber(record.precipitation)} mm` : '—'} />
            <ViewField label="Created" value={formatDate(record.created_at)} />
            <ViewField label="Updated" value={formatDate(record.updated_at)} />
          </div>
          
          {record.raw_data && (
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
                Raw Weather Data
              </h4>
              <pre style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: 'var(--spacing-md)', 
                borderRadius: 'var(--radius-sm)', 
                overflow: 'auto', 
                fontSize: '0.7rem',
                maxHeight: '300px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5
              }}>
                {JSON.stringify(record.raw_data, null, 2)}
              </pre>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function ViewField({ label, value }) {
  return (
    <div className="glass-sm" style={{ padding: 'var(--spacing-md)' }}>
      <div style={{ 
        fontSize: '0.7rem', 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em', 
        color: 'var(--text-muted)',
        marginBottom: '4px',
        fontWeight: 500
      }}>
        {label}
      </div>
      <div style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>
        {value}
      </div>
    </div>
  );
}

// Edit/Create Modal Component
function EditModal({ record, onClose, onSubmit, isSubmitting }) {
  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className="modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="edit-modal-title" className="modal-title">
            {record ? 'Edit Weather Record' : 'Create Weather Record'}
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Close" disabled={isSubmitting}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body" style={{ padding: 0 }}>
          <RecordForm
            initialData={record}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}