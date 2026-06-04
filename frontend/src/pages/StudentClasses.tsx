import { useEffect, useState } from 'react';
import { Users, LogIn, GraduationCap } from 'lucide-react';
import api from '../api/axios';
import type { EnrolledClass } from '../types';
import { tokens, Btn, formatTrDateShort } from '../components/academic-ui';

export default function StudentClasses() {
  const [classes, setClasses] = useState<EnrolledClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/classrooms/my');
      setClasses(res.data);
    } catch (err) {
      console.error('Sınıflar yüklenemedi', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || joining) return;
    setJoining(true);
    setMsg(null);
    try {
      const res = await api.post('/classrooms/join', { joinCode: trimmed });
      setMsg({ type: 'ok', text: `"${res.data.name}" sınıfına katıldın!` });
      setCode('');
      await load();
    } catch (err) {
      const text = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Sınıfa katılırken hata oluştu.';
      setMsg({ type: 'err', text });
    } finally {
      setJoining(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, fontFamily: tokens.sans, color: tokens.ink }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 40px 64px' }}>
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>Sınıflarım</h1>
          <p style={{ margin: '8px 0 0', color: tokens.muted, fontSize: 16 }}>
            Eğitmeninin verdiği katılım koduyla sınıfa katıl; atanan sınavlar panelinde görünür.
          </p>
        </header>

        {/* Join card */}
        <div style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, padding: 24, marginBottom: 32, boxShadow: '0 4px 12px rgba(30,58,138,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <span style={{ width: 40, height: 40, borderRadius: 10, background: '#e5eeff', color: tokens.navy, display: 'grid', placeItems: 'center' }}><LogIn size={20} /></span>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Sınıfa Katıl</h3>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: tokens.text, marginBottom: 8 }}>Katılım Kodu</label>
              <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="ÖR. K7M2QX" maxLength={16}
                style={{ width: '100%', height: 48, padding: '0 16px', border: `1px solid ${tokens.hairline}`, borderRadius: 10, fontFamily: tokens.mono, fontSize: 18, fontWeight: 700, letterSpacing: '0.16em', color: tokens.ink, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <Btn variant="primary" onClick={handleJoin} disabled={!code.trim() || joining} style={{ height: 48, padding: '0 24px' }}>
              {joining ? 'Katılınıyor…' : 'Katıl'}
            </Btn>
          </div>
          {msg && (
            <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, fontSize: 13.5, fontWeight: 600,
              background: msg.type === 'ok' ? '#dcfce7' : '#fee2e2', color: msg.type === 'ok' ? '#166534' : '#991b1b' }}>
              {msg.text}
            </div>
          )}
        </div>

        {/* Enrolled classes */}
        <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={20} style={{ color: tokens.navy }} />Kayıtlı Olduğum Sınıflar <span style={{ color: tokens.subtle, fontWeight: 600 }}>({classes.length})</span>
        </h2>
        {loading ? (
          <div style={{ color: tokens.muted, padding: 24 }}>Yükleniyor…</div>
        ) : classes.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', background: tokens.card, border: `1px dashed #cdd5e5`, borderRadius: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: tokens.ivory, color: tokens.navy, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
              <GraduationCap size={22} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>Henüz bir sınıfa kayıtlı değilsin</div>
            <div style={{ fontSize: 13.5, color: tokens.subtle }}>Eğitmeninin verdiği kodu yukarıya gir.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {classes.map(c => (
              <article key={c.classroomId} style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: tokens.ink }}>{c.name}</h3>
                {c.description && <p style={{ margin: 0, fontSize: 13, color: tokens.muted, lineHeight: 1.5 }}>{c.description}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTop: `1px solid ${tokens.hairlineSoft}`, fontSize: 12.5, color: tokens.subtle }}>
                  <span>{c.instructorName ? `Eğitmen: ${c.instructorName}` : '—'}</span>
                  <span>{formatTrDateShort(c.enrolledAt)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
