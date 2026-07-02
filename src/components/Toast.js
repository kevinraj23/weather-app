'use client';

import { useState, useEffect, useCallback } from 'react';

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 3000;

let toastId = 0;
const listeners = [];
const memoryState = { toasts: [] };

function dispatch(action) {
  memoryState.toasts = reducer(memoryState.toasts, action);
  listeners.forEach(listener => listener(memoryState.toasts));
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TOAST':
      return [action.toast, ...state].slice(0, TOAST_LIMIT);
    case 'UPDATE_TOAST':
      return state.map(t => t.id === action.toast.id ? { ...t, ...action.toast } : t);
    case 'DISMISS_TOAST':
      return state.filter(t => t.id !== action.toastId);
    case 'REMOVE_TOAST':
      return state.filter(t => t.id !== action.toastId);
    default:
      return state;
  }
}

export function useToast() {
  const [state, setState] = useState(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return { ...state };
}

export function toast({ title, description, variant = 'default', duration = TOAST_REMOVE_DELAY }) {
  const id = ++toastId;
  
  const toastObj = {
    id,
    title,
    description,
    variant,
    open: true,
    onOpenChange: (open) => {
      if (!open) dismiss(id);
    },
  };

  dispatch({ type: 'ADD_TOAST', toast: toastObj });

  if (duration !== Infinity) {
    setTimeout(() => {
      dismiss(id);
    }, duration);
  }

  return { id, dismiss: () => dismiss(id), update: (props) => update(id, props) };
}

function dismiss(toastId) {
  dispatch({ type: 'DISMISS_TOAST', toastId });
  
  setTimeout(() => {
    dispatch({ type: 'REMOVE_TOAST', toastId });
  }, 1000);
}

function update(toastId, props) {
  dispatch({ type: 'UPDATE_TOAST', toast: { id: toastId, ...props } });
}

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast }) {
  const variantStyles = {
    default: 'border-left: 4px solid var(--accent-blue);',
    success: 'border-left: 4px solid var(--accent-green);',
    error: 'border-left: 4px solid var(--accent-red);',
    warning: 'border-left: 4px solid var(--accent-orange);',
  };

  const variantIcons = {
    default: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    ),
    success: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    ),
    warning: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    ),
  };

  return (
    <div
      className="toast glass"
      style={{ 
        ...toast,
        minWidth: '280px',
        maxWidth: '400px',
        animation: 'slideUp var(--transition-normal) ease forwards',
        ...variantStyles[toast.variant] || variantStyles.default,
      }}
      role="alert"
      aria-live="assertive"
    >
      <div className="toast-icon" style={{ 
        width: '24px', 
        height: '24px', 
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: toast.variant === 'success' ? 'var(--accent-green)' :
               toast.variant === 'error' ? 'var(--accent-red)' :
               toast.variant === 'warning' ? 'var(--accent-orange)' :
               'var(--accent-blue)'
      }}>
        {variantIcons[toast.variant] || variantIcons.default}
      </div>
      
      <div className="toast-content" style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div className="toast-title" style={{ 
            fontWeight: 600, 
            fontSize: '0.9rem', 
            color: 'var(--text-primary)',
            marginBottom: toast.description ? '2px' : 0
          }}>
            {toast.title}
          </div>
        )}
        {toast.description && (
          <div className="toast-description" style={{ 
            fontSize: '0.85rem', 
            color: 'var(--text-secondary)',
            lineHeight: 1.4
          }}>
            {toast.description}
          </div>
        )}
      </div>
      
      <button
        className="toast-close"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss"
        style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          borderRadius: 'var(--radius-sm)',
          flexShrink: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Convenience functions
export const toastSuccess = (title, description) => toast({ title, description, variant: 'success' });
export const toastError = (title, description) => toast({ title, description, variant: 'error' });
export const toastWarning = (title, description) => toast({ title, description, variant: 'warning' });
export const toastInfo = (title, description) => toast({ title, description, variant: 'default' });