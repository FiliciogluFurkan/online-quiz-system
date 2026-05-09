import { useEffect } from 'react';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'warning' | 'critical';
  onClose: () => void;
  duration?: number;
}

const styles = {
  toast: {
    position: 'fixed' as const,
    top: '100px',
    right: '20px',
    zIndex: 10000,
    minWidth: '320px',
    maxWidth: '400px',
    padding: '16px 20px',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    animation: 'slideIn 0.3s ease-out',
    backdropFilter: 'blur(10px)',
  },
  warning: {
    background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
    border: '2px solid #fb923c',
    color: '#9a3412',
  },
  critical: {
    background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
    border: '2px solid #ef4444',
    color: '#991b1b',
  },
  icon: {
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  message: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 800,
    lineHeight: 1.5,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'background 0.2s',
  },
};

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const isWarning = type === 'warning';

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div
        style={{
          ...styles.toast,
          ...(isWarning ? styles.warning : styles.critical),
        }}
      >
        <div style={styles.icon}>
          {isWarning ? (
            <AlertTriangle size={24} color="#ea580c" />
          ) : (
            <AlertCircle size={24} color="#dc2626" />
          )}
        </div>
        <div style={styles.content}>
          <p style={styles.message}>{message}</p>
        </div>
        <button
          onClick={onClose}
          style={styles.closeBtn}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <X size={18} />
        </button>
      </div>
    </>
  );
}
