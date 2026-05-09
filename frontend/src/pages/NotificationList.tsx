import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Clock,
  Shield,
  Sparkles,
} from 'lucide-react';
import api from '../api/axios';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityType: string;
  relatedEntityId: number;
}

const styles = {
  page: {
    minHeight: '100vh',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background:
      'radial-gradient(circle at 10% 8%, rgba(99,102,241,0.10), transparent 26%), radial-gradient(circle at 88% 12%, rgba(14,165,233,0.10), transparent 24%), #f8fafc',
    color: '#0f172a',
    padding: '32px',
    boxSizing: 'border-box' as const,
  },
  container: {
    maxWidth: '960px',
    margin: '0 auto',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap' as const,
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '9px',
    border: '1px solid #e2e8f0',
    background: 'rgba(255,255,255,0.86)',
    color: '#334155',
    padding: '12px 16px',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: 850,
    boxShadow: '0 10px 24px rgba(15,23,42,0.05)',
  },
  markAllButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '9px',
    border: '1px solid #bfdbfe',
    borderRadius: '16px',
    padding: '12px 16px',
    cursor: 'pointer',
    color: '#1d4ed8',
    fontWeight: 950,
    background: 'linear-gradient(135deg, #eff6ff, #ffffff)',
    boxShadow: '0 16px 34px rgba(37,99,235,0.10)',
  },
  heroCard: {
    overflow: 'hidden',
    borderRadius: '30px',
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    boxShadow: '0 24px 70px rgba(15,23,42,0.075)',
    marginBottom: '24px',
  },
  heroTop: {
    padding: '30px',
    background:
      'linear-gradient(135deg, rgba(238,242,255,0.95), rgba(240,249,255,0.9))',
    borderBottom: '1px solid #e2e8f0',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 13px',
    borderRadius: '999px',
    background: '#ffffff',
    border: '1px solid #c7d2fe',
    color: '#4f46e5',
    fontSize: '14px',
    fontWeight: 850,
    marginBottom: '16px',
  },
  heroRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    flexWrap: 'wrap' as const,
  },
  title: {
    margin: 0,
    fontSize: '44px',
    lineHeight: 1.05,
    letterSpacing: '-0.04em',
    fontWeight: 950,
    color: '#0f172a',
  },
  subtitle: {
    margin: '14px 0 0',
    maxWidth: '680px',
    color: '#64748b',
    fontSize: '16px',
    lineHeight: 1.7,
  },
  topBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '10px 13px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 950,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#475569',
  },
  list: {
    display: 'grid',
    gap: '14px',
  },
  notificationCard: {
    position: 'relative' as const,
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '20px',
    boxShadow: '0 20px 50px rgba(15,23,42,0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)',
  },
  unreadCard: {
    borderColor: '#bfdbfe',
    background:
      'linear-gradient(135deg, rgba(239,246,255,0.95), rgba(255,255,255,0.95))',
    boxShadow: '0 20px 40px rgba(37,99,235,0.08)',
  },
  cardAccent: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: 'linear-gradient(90deg, rgba(99,102,241,0.65), rgba(14,165,233,0.45))',
  },
  unreadDot: {
    width: '10px',
    height: '10px',
    borderRadius: '999px',
    background: '#3b82f6',
    boxShadow: '0 0 0 5px rgba(59,130,246,0.12)',
    flexShrink: 0,
  },
  notifHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '10px',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
  },
  notifTitle: {
    margin: 0,
    fontSize: '17px',
    fontWeight: 950,
    color: '#0f172a',
  },
  notifTime: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 800,
    whiteSpace: 'nowrap' as const,
  },
  notifMessage: {
    margin: '0 0 14px',
    color: '#475569',
    fontSize: '14px',
    lineHeight: 1.7,
    fontWeight: 650,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    paddingTop: '14px',
    borderTop: '1px solid #f1f5f9',
    flexWrap: 'wrap' as const,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '7px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 950,
  },
  unreadBadge: {
    background: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
  },
  readBadge: {
    background: '#f8fafc',
    color: '#64748b',
    border: '1px solid #e2e8f0',
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 11px',
    borderRadius: '999px',
    background: '#f5f3ff',
    color: '#6d28d9',
    border: '1px solid #ddd6fe',
    fontSize: '12px',
    fontWeight: 900,
  },
  empty: {
    padding: '60px 24px',
    textAlign: 'center' as const,
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    borderRadius: '28px',
    boxShadow: '0 20px 50px rgba(15,23,42,0.05)',
  },
  emptyIcon: {
    width: '78px',
    height: '78px',
    borderRadius: '26px',
    background: '#eef2ff',
    color: '#4f46e5',
    display: 'grid',
    placeItems: 'center',
    margin: '0 auto 18px',
  },
};

export default function NotificationList() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Sadece okundu olarak işaretle, sayfaya gitme
    if (!notification.isRead) {
      try {
        await api.put(`/notifications/${notification.id}/read`);

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;

    return date.toLocaleDateString('tr-TR');
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topbar}>
          <button onClick={() => navigate('/student')} style={styles.backButton}>
            <ArrowLeft size={18} />
            Geri Dön
          </button>

          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} style={styles.markAllButton}>
              <CheckCheck size={18} />
              Tümünü Okundu İşaretle
            </button>
          )}
        </div>

        <section style={styles.heroCard}>
          <div style={styles.heroTop}>
            <div style={styles.eyebrow}>
              <Sparkles size={16} />
              Bildirim merkezi
            </div>

            <div style={styles.heroRow}>
              <div>
                <h1 style={styles.title}>Bildirimler</h1>

                <p style={styles.subtitle}>
                  Sınavlar ve sistem aktiviteleri hakkında güncel bildirimlerini buradan takip edebilirsin.
                </p>
              </div>

              <span style={styles.topBadge}>
                <Shield size={15} />
                {unreadCount > 0
                  ? `${unreadCount} okunmamış`
                  : 'Tümü okundu'}
              </span>
            </div>
          </div>
        </section>

        {loading ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              <Bell size={38} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 950 }}>
              Bildirimler yükleniyor
            </h3>
            <p style={{ margin: 0, color: '#64748b' }}>
              Güncel bildirimlerin hazırlanıyor.
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              <Bell size={38} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 950 }}>
              Henüz bildirim yok
            </h3>
            <p style={{ margin: 0, color: '#64748b' }}>
              Yeni sınavlar veya sistem bildirimleri geldiğinde burada görünecek.
            </p>
          </div>
        ) : (
          <div style={styles.list}>
            {notifications.map((notification) => {
              const isHovered = hoveredId === notification.id;

              return (
                <article
                  key={notification.id}
                  style={{
                    ...styles.notificationCard,
                    ...(!notification.isRead ? styles.unreadCard : {}),
                    ...(isHovered
                      ? {
                          transform: 'translateY(-2px)',
                          boxShadow: notification.isRead
                            ? '0 24px 60px rgba(15,23,42,0.08)'
                            : '0 24px 60px rgba(37,99,235,0.14)',
                        }
                      : {}),
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  onMouseEnter={() => setHoveredId(notification.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div style={styles.cardAccent} />

                  <div style={styles.notifHeader}>
                    <div style={styles.titleGroup}>
                      {!notification.isRead && <span style={styles.unreadDot} />}

                      <h3 style={styles.notifTitle}>{notification.title}</h3>
                    </div>

                    <div style={styles.notifTime}>
                      <Clock size={14} />
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>

                  <p style={styles.notifMessage}>{notification.message}</p>

                  <div style={styles.footer}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(notification.isRead
                          ? styles.readBadge
                          : styles.unreadBadge),
                      }}
                    >
                      {notification.isRead ? 'Okundu' : 'Yeni'}
                    </span>

                    <span style={styles.typeBadge}>
                      <Bell size={13} />
                      {notification.type || 'Bildirim'}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}