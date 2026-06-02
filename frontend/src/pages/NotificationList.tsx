import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCheck, Clock } from 'lucide-react';
import api from '../api/axios';
import {
  tokens, PageShell, Crumbs, Kicker, HeroTitle, SectionHeader, Btn, CodeTag,
} from '../components/academic-ui';

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

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'az önce';
  if (diffMins < 60) return `${diffMins} dk önce`;
  if (diffHours < 24) return `${diffHours} sa önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NotificationList() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data))
      .catch(err => console.error('Error loading notifications:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      try {
        await api.put(`/notifications/${n.id}/read`);
        setNotifications(prev =>
          prev.map(x => x.id === n.id ? { ...x, isRead: true } : x)
        );
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const unread = notifications.filter(n => !n.isRead);
  const read = notifications.filter(n => n.isRead);

  return (
    <PageShell maxWidth={960}>
      <Crumbs items={['Bildirimler']} />

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: 24, marginBottom: 32, flexWrap: 'wrap' as const,
      }}>
        <div>
          <Kicker>Bildirim merkezi</Kicker>
          <div style={{ marginTop: 8 }}>
            <HeroTitle>Bildirimler</HeroTitle>
          </div>
          <p style={{
            margin: '14px 0 0', maxWidth: 580, color: tokens.muted,
            fontSize: 15.5, lineHeight: 1.6,
          }}>
            Sınavlar ve sistem aktiviteleri hakkındaki güncel bildirimleri buradan takip et.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Btn icon={<ArrowLeft size={14} />} onClick={() => navigate(-1)}>Geri</Btn>
          {unread.length > 0 && (
            <Btn variant="primary" onClick={handleMarkAllRead} icon={<CheckCheck size={14} />}>
              Tümünü Okundu İşaretle
            </Btn>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex', gap: 16, marginBottom: 32,
      }}>
        <CodeTag tone={unread.length > 0 ? 'indigo' : 'slate'}>
          {unread.length > 0 ? `${unread.length} OKUNMAMIŞ` : 'TÜMÜ OKUNDU'}
        </CodeTag>
        <CodeTag tone="slate">{notifications.length} TOPLAM</CodeTag>
      </div>

      {loading ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center' as const,
          background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
          color: tokens.subtle,
        }}>Bildirimler yükleniyor…</div>
      ) : notifications.length === 0 ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center' as const,
          background: '#fff', border: `1px solid ${tokens.hairline}`, borderRadius: 14,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: tokens.indigoSoft, color: tokens.indigo,
            display: 'grid', placeItems: 'center',
            margin: '0 auto 16px',
          }}>
            <Bell size={22} />
          </div>
          <div style={{ fontFamily: tokens.serif, fontSize: 22, color: tokens.muted, marginBottom: 8 }}>
            Henüz bildirim yok
          </div>
          <div style={{ fontSize: 13.5, color: tokens.subtle }}>
            Yeni bildirimler geldiğinde burada görünecek.
          </div>
        </div>
      ) : (
        <>
          {unread.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <SectionHeader kicker="Yeni" title="Okunmamış" count={unread.length} />
              <div style={{ display: 'grid', gap: 10 }}>
                {unread.map(n => (
                  <NotificationCard key={n.id} n={n} onClick={() => handleClick(n)} />
                ))}
              </div>
            </section>
          )}

          {read.length > 0 && (
            <section>
              <SectionHeader kicker="Geçmiş" title="Okunmuş" count={read.length} />
              <div style={{ display: 'grid', gap: 10 }}>
                {read.map(n => (
                  <NotificationCard key={n.id} n={n} onClick={() => handleClick(n)} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </PageShell>
  );
}

function NotificationCard({ n, onClick }: { n: Notification; onClick: () => void }) {
  return (
    <article
      onClick={onClick}
      style={{
        padding: 20, cursor: 'pointer',
        background: n.isRead ? tokens.ivory : '#fff',
        border: `1px solid ${n.isRead ? tokens.hairline : tokens.indigoBorder}`,
        borderRadius: 12, position: 'relative' as const,
        transition: 'transform .12s, box-shadow .12s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 10px 24px rgba(15,23,42,0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {!n.isRead && (
        <div style={{
          position: 'absolute', top: -1, left: 22, right: 22, height: 2,
          background: 'linear-gradient(90deg, #4f46e5, #818cf8 60%, transparent)',
          borderRadius: 2,
        }} />
      )}

      <header style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: 12, marginBottom: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {!n.isRead && (
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: tokens.indigo, flexShrink: 0,
            }} />
          )}
          <h3 style={{
            margin: 0, fontFamily: tokens.serif,
            fontSize: 17, fontWeight: 400, color: tokens.ink,
            letterSpacing: '-0.01em',
          }}>{n.title}</h3>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 11.5, color: tokens.subtle, flexShrink: 0,
          fontFamily: tokens.mono,
        }}>
          <Clock size={11} />
          {formatTimeAgo(n.createdAt)}
        </span>
      </header>

      <p style={{
        margin: 0, fontSize: 13.5, color: tokens.muted, lineHeight: 1.6,
      }}>{n.message}</p>

      <div style={{
        marginTop: 12, paddingTop: 10,
        borderTop: `1px solid ${tokens.hairlineSoft}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <CodeTag tone={n.isRead ? 'slate' : 'indigo'}>
          {n.isRead ? 'OKUNDU' : 'YENİ'}
        </CodeTag>
        {n.type && (
          <span style={{
            fontFamily: tokens.mono, fontSize: 10.5, color: tokens.subtle,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
          }}>{n.type.replace(/_/g, ' ')}</span>
        )}
      </div>
    </article>
  );
}
