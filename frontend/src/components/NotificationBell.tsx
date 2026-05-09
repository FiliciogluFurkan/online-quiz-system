import { Bell, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const styles = {
  wrapper: {
    position: 'relative' as const,
  },

  bell: {
    position: 'relative' as const,
    cursor: 'pointer',
    width: '46px',
    height: '46px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 24px rgba(15,23,42,0.05)',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)',
  },

  bellHover: {
    background:
      'linear-gradient(135deg, rgba(238,242,255,0.95), rgba(240,249,255,0.95))',
    border: '1px solid #c7d2fe',
    transform: 'translateY(-1px)',
    boxShadow: '0 16px 32px rgba(99,102,241,0.12)',
  },

  badge: {
    position: 'absolute' as const,
    top: '-4px',
    right: '-4px',
    minWidth: '22px',
    height: '22px',
    padding: '0 7px',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: 950,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid white',
    boxShadow: '0 10px 20px rgba(239,68,68,0.35)',
  },

  glow: {
    position: 'absolute' as const,
    inset: '-2px',
    borderRadius: '18px',
    background:
      'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(14,165,233,0.15))',
    filter: 'blur(12px)',
    zIndex: -1,
    opacity: 0.7,
  },

  pulse: {
    position: 'absolute' as const,
    top: '-2px',
    right: '-2px',
    width: '12px',
    height: '12px',
    borderRadius: '999px',
    background: '#ef4444',
    border: '2px solid white',
  },
};

export default function NotificationBell() {
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    loadUnreadCount();

    const interval = setInterval(loadUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleClick = () => {
    navigate('/student/notifications');
  };

  return (
    <div style={styles.wrapper}>
      {unreadCount > 0 && <div style={styles.glow} />}

      <div
        style={{
          ...styles.bell,
          ...(hovered ? styles.bellHover : {}),
        }}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Bell
          size={20}
          color={hovered ? '#4f46e5' : '#64748b'}
          strokeWidth={2.2}
        />

        {unreadCount > 0 && (
          <>
            <div style={styles.badge}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>

            <div style={styles.pulse} />
          </>
        )}
      </div>
    </div>
  );
}