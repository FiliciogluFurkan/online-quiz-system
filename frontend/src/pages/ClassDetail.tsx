import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Copy, Check, Trash2, ClipboardList, UserMinus } from 'lucide-react';
import api from '../api/axios';
import type { Classroom, ClassMember } from '../types';
import { tokens, Btn, formatTrDate } from '../components/academic-ui';

interface AssignedExam {
  examId: number;
  title: string;
  published: boolean;
  assignedAt: string;
}

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [exams, setExams] = useState<AssignedExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/classrooms/${id}`);
      setClassroom(res.data.classroom);
      setMembers(res.data.members ?? []);
      setExams(res.data.exams ?? []);
    } catch (err) {
      console.error('Sınıf yüklenemedi', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const copyCode = () => {
    if (!classroom) return;
    navigator.clipboard?.writeText(classroom.joinCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };

  const removeStudent = async (enrollmentId: number, label: string) => {
    if (!window.confirm(`${label} sınıftan çıkarılsın mı?`)) return;
    try {
      await api.delete(`/classrooms/${id}/enrollments/${enrollmentId}`);
      setMembers(members.filter(m => m.enrollmentId !== enrollmentId));
    } catch (err) {
      alert('Öğrenci çıkarılırken hata oluştu.');
      console.error(err);
    }
  };

  const deleteClass = async () => {
    if (!window.confirm('Bu sınıfı silmek istediğine emin misin? Bu işlem geri alınamaz.')) return;
    try {
      await api.delete(`/classrooms/${id}`);
      navigate('/instructor/classes');
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Sınıf silinirken hata oluştu.';
      alert(msg);
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: tokens.bg, color: tokens.muted }}>Yükleniyor…</div>;
  }
  if (!classroom) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: tokens.bg, color: tokens.muted }}>Sınıf bulunamadı.</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, fontFamily: tokens.sans, color: tokens.ink }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px 64px' }}>
        <button onClick={() => navigate('/instructor/classes')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: tokens.indigo, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 18, fontFamily: 'inherit' }}>
          <ArrowLeft size={16} />Sınıflarım
        </button>

        {/* Header card */}
        <div style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 16, padding: 28, marginBottom: 28, boxShadow: '0 4px 12px rgba(30,58,138,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>{classroom.name}</h1>
              {classroom.description && <p style={{ margin: '8px 0 0', color: tokens.muted, fontSize: 15, lineHeight: 1.6 }}>{classroom.description}</p>}
            </div>
            <Btn variant="danger" icon={<Trash2 size={15} />} onClick={deleteClass}>Sınıfı Sil</Btn>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 22, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: tokens.ivory, border: `1px solid ${tokens.hairline}`, borderRadius: 12 }}>
              <div>
                <div style={{ fontSize: 10.5, color: tokens.subtle, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Katılım Kodu</div>
                <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '0.14em', color: tokens.navy, fontFamily: tokens.mono }}>{classroom.joinCode}</div>
              </div>
              <button onClick={copyCode} title="Kodu kopyala" style={{ width: 40, height: 40, borderRadius: 9, border: `1px solid ${tokens.hairline}`, background: tokens.card, color: copied ? tokens.good : tokens.muted, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <div style={{ fontSize: 13.5, color: tokens.muted, lineHeight: 1.5 }}>
              Öğrenciler <strong style={{ color: tokens.ink }}>Sınıflarım</strong> sayfasından bu kodu girerek katılır.
            </div>
          </div>
        </div>

        {/* Assigned exams */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <ClipboardList size={20} style={{ color: tokens.navy }} />Atanmış Sınavlar <span style={{ color: tokens.subtle, fontWeight: 600 }}>({exams.length})</span>
          </h2>
          {exams.length === 0 ? (
            <div style={{ padding: '20px 22px', background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 12, fontSize: 13.5, color: tokens.subtle }}>
              Bu sınıfa henüz sınav atanmadı. Bir sınavın detay sayfasından <strong>Görünürlük & Sınıflar</strong> bölümüyle atayabilirsin.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {exams.map(ex => (
                <div key={ex.examId} onClick={() => navigate(`/instructor/exam/${ex.examId}`)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '16px 20px', background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 12 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: tokens.ink }}>{ex.title}</span>
                  <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', background: ex.published ? tokens.navy : '#e2e8f0', color: ex.published ? '#fff' : tokens.muted }}>
                    {ex.published ? 'YAYINDA' : 'TASLAK'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Members */}
        <section>
          <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={20} style={{ color: tokens.navy }} />Kayıtlı Öğrenciler <span style={{ color: tokens.subtle, fontWeight: 600 }}>({members.length})</span>
          </h2>
          {members.length === 0 ? (
            <div style={{ padding: '20px 22px', background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 12, fontSize: 13.5, color: tokens.subtle }}>
              Henüz kayıtlı öğrenci yok. Katılım kodunu paylaş.
            </div>
          ) : (
            <div style={{ background: tokens.card, border: `1px solid ${tokens.hairline}`, borderRadius: 12, overflow: 'hidden' }}>
              {members.map((m, i) => {
                const label = m.fullName || m.email || m.keycloakUserId;
                return (
                  <div key={m.enrollmentId} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderTop: i === 0 ? 'none' : `1px solid ${tokens.hairlineSoft}` }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: tokens.indigoSoft, color: tokens.indigo, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                      {(label || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: tokens.ink }}>{m.fullName || '—'}</div>
                      <div style={{ fontSize: 12.5, color: tokens.subtle }}>{m.email || m.keycloakUserId}</div>
                    </div>
                    <span style={{ fontSize: 12, color: tokens.subtle }}>{formatTrDate(m.enrolledAt)}</span>
                    <button onClick={() => removeStudent(m.enrollmentId, label)} title="Sınıftan çıkar" style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid #fecaca`, background: tokens.card, color: tokens.bad, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                      <UserMinus size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
