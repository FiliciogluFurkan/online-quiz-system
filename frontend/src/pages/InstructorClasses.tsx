import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Copy, Check, ArrowRight, ClipboardList, X } from 'lucide-react';
import api from '../api/axios';
import type { ClassroomRow } from '../types';
import { tokens, Btn } from '../components/academic-ui';

export default function InstructorClasses() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ClassroomRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/classrooms');
      setRows(res.data);
    } catch (err) {
      console.error('Sınıflar yüklenemedi', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await api.post('/classrooms', { name: name.trim(), description: description.trim() || null });
      setName(''); setDescription(''); setShowCreate(false);
      await load();
    } catch (err) {
      alert('Sınıf oluşturulurken hata oluştu.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    }).catch(() => {});
  };

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, fontFamily: tokens.sans, color: tokens.ink }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 40px 64px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>Sınıflarım</h1>
            <p style={{ margin: '8px 0 0', color: tokens.muted, fontSize: 16 }}>
              Öğrenci gruplarını yönet, katılım kodunu paylaş, sınavlarını sınıflara ata.
            </p>
          </div>
          <Btn variant="primary" icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>Yeni Sınıf</Btn>
        </header>

        {loading ? (
          <div style={{ color: tokens.muted, padding: 40 }}>Yükleniyor…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center', background: tokens.card, border: `1px dashed #cdd5e5`, borderRadius: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: tokens.ivory, color: tokens.navy, display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
              <Users size={24} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: tokens.text, marginBottom: 6 }}>Henüz sınıf yok</div>
            <div style={{ fontSize: 13.5, color: tokens.subtle, marginBottom: 18 }}>İlk sınıfını oluştur, öğrencilere katılım kodunu ver.</div>
            <Btn variant="primary" icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>Yeni Sınıf</Btn>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {rows.map(({ classroom, enrolledCount, examCount }) => (
              <article key={classroom.id} style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(30,58,138,0.04)' }}>
                <div style={{ height: 4, background: tokens.navy }} />
                <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: tokens.ink }}>{classroom.name}</h3>
                    {classroom.description && (
                      <p style={{ margin: '6px 0 0', fontSize: 13, color: tokens.muted, lineHeight: 1.5 }}>{classroom.description}</p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 12px', background: tokens.ivory, border: `1px solid ${tokens.hairline}`, borderRadius: 10 }}>
                    <div>
                      <div style={{ fontSize: 10.5, color: tokens.subtle, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Katılım Kodu</div>
                      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '0.12em', color: tokens.navy, fontFamily: tokens.mono }}>{classroom.joinCode}</div>
                    </div>
                    <button onClick={() => copyCode(classroom.joinCode)} title="Kodu kopyala" style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${tokens.hairline}`, background: tokens.card, color: copied === classroom.joinCode ? tokens.good : tokens.muted, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                      {copied === classroom.joinCode ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: tokens.text }}>
                      <Users size={15} style={{ color: tokens.muted }} /><strong>{enrolledCount}</strong> öğrenci
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: tokens.text }}>
                      <ClipboardList size={15} style={{ color: tokens.muted }} /><strong>{examCount}</strong> sınav
                    </div>
                  </div>

                  <Btn variant="outline" iconR={<ArrowRight size={15} />} onClick={() => navigate(`/instructor/classes/${classroom.id}`)} style={{ width: '100%', justifyContent: 'center' }}>
                    Sınıfı Yönet
                  </Btn>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div onClick={() => !saving && setShowCreate(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(11,28,48,0.45)', display: 'grid', placeItems: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: tokens.card, borderRadius: 16, padding: 28, boxShadow: '0 20px 60px rgba(11,28,48,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Yeni Sınıf</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tokens.subtle }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: tokens.text, marginBottom: 8 }}>Sınıf Adı</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Matematik 101 - Şube A" autoFocus
                  style={{ width: '100%', height: 46, padding: '0 14px', border: `1px solid ${tokens.hairline}`, borderRadius: 10, fontFamily: 'inherit', fontSize: 14, color: tokens.ink, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: tokens.text, marginBottom: 8 }}>Açıklama <span style={{ color: tokens.subtle, fontWeight: 400 }}>(opsiyonel)</span></label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Dönem, bölüm vb."
                  style={{ width: '100%', padding: '12px 14px', border: `1px solid ${tokens.hairline}`, borderRadius: 10, fontFamily: 'inherit', fontSize: 14, color: tokens.ink, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <Btn variant="quiet" onClick={() => setShowCreate(false)}>İptal</Btn>
              <Btn variant="primary" onClick={handleCreate} disabled={!name.trim() || saving}>{saving ? 'Oluşturuluyor…' : 'Oluştur'}</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
