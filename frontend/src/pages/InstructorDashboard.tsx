import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  Layers,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import api from '../api/axios';
import type { Exam } from '../types';

const styles = {
  page: {
    minHeight: '100vh',
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background:
      'radial-gradient(circle at 12% 8%, rgba(99,102,241,0.10), transparent 26%), radial-gradient(circle at 90% 12%, rgba(14,165,233,0.10), transparent 24%), #f8fafc',
    color: '#0f172a',
    padding: '32px',
    boxSizing: 'border-box',
  },
  container: {
    maxWidth: '1180px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '28px',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 13px',
    borderRadius: '999px',
    background: '#eef2ff',
    border: '1px solid #c7d2fe',
    color: '#4f46e5',
    fontSize: '14px',
    fontWeight: 800,
    marginBottom: '12px',
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
    margin: '12px 0 0',
    color: '#64748b',
    fontSize: '16px',
    lineHeight: 1.65,
    maxWidth: '620px',
  },
  createButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    border: '1px solid #bfdbfe',
    borderRadius: '16px',
    padding: '14px 20px',
    cursor: 'pointer',
    color: '#1d4ed8',
    fontWeight: 900,
    fontSize: '15px',
    background: 'linear-gradient(135deg, #eff6ff, #ffffff)',
    boxShadow: '0 16px 34px rgba(37,99,235,0.10)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '18px',
    marginBottom: '26px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.88)',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '22px',
    boxShadow: '0 18px 45px rgba(15,23,42,0.055)',
  },
  statIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '15px',
    display: 'grid',
    placeItems: 'center',
    marginBottom: '16px',
  },
  statValue: {
    margin: 0,
    fontSize: '34px',
    fontWeight: 950,
    letterSpacing: '-0.03em',
  },
  statLabel: {
    margin: '5px 0 0',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 700,
  },
  panel: {
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid #e2e8f0',
    borderRadius: '28px',
    boxShadow: '0 24px 70px rgba(15,23,42,0.07)',
    overflow: 'hidden',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '18px',
    padding: '24px 26px',
    borderBottom: '1px solid #eef2f7',
    background: 'linear-gradient(135deg, rgba(248,250,252,0.92), rgba(239,246,255,0.78))',
  },
  panelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: 0,
    fontSize: '22px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '250px',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#94a3b8',
    borderRadius: '14px',
    padding: '11px 13px',
    fontSize: '14px',
  },
  examsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '18px',
    padding: '24px',
  },
  examCard: {
    position: 'relative' as const,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '22px',
    padding: '22px',
    boxShadow: '0 14px 32px rgba(15,23,42,0.045)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  examTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '14px',
    marginBottom: '14px',
  },
  examIcon: {
    width: '46px',
    height: '46px',
    borderRadius: '16px',
    display: 'grid',
    placeItems: 'center',
    background: '#f0f9ff',
    color: '#0284c7',
    flexShrink: 0,
  },
  status: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
  examTitle: {
    margin: '0 0 8px',
    color: '#0f172a',
    fontSize: '20px',
    lineHeight: 1.25,
    fontWeight: 900,
  },
  examDesc: {
    margin: 0,
    color: '#64748b',
    fontSize: '14px',
    lineHeight: 1.6,
    minHeight: '44px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '18px',
    paddingTop: '16px',
    borderTop: '1px solid #eef2f7',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: 700,
  },
  emptyState: {
    padding: '52px 24px',
    textAlign: 'center',
  },
  emptyIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '24px',
    background: '#eef2ff',
    color: '#4f46e5',
    display: 'grid',
    placeItems: 'center',
    margin: '0 auto 18px',
  },
};

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    api.get('/exams').then((res) => setExams(res.data));
  }, []);

  const stats = useMemo(() => {
    const published = exams.filter((exam) => exam.published).length;
    const drafts = exams.length - published;

    return [
      {
        label: 'Toplam Sınav',
        value: exams.length,
        icon: Layers,
        bg: '#eef2ff',
        color: '#4f46e5',
      },
      {
        label: 'Yayındaki Sınav',
        value: published,
        icon: CheckCircle2,
        bg: '#ecfdf5',
        color: '#16a34a',
      },
      {
        label: 'Taslak Sınav',
        value: drafts,
        icon: FileText,
        bg: '#f0f9ff',
        color: '#0284c7',
      },
    ];
  }, [exams]);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              <Sparkles size={16} />
              Eğitmen çalışma alanı
            </div>
            <h1 style={styles.title}>Eğitmen Paneli</h1>
            <p style={styles.subtitle}>
              Sınavlarını yönet, yeni değerlendirmeler oluştur ve yayın durumlarını tek ekrandan takip et.
            </p>
          </div>

          <button onClick={() => navigate('/instructor/create-exam')} style={styles.createButton}>
            <Plus size={18} />
            Yeni Sınav Oluştur
          </button>
          <button 
            onClick={() => navigate('/instructor/questions')} 
            style={{ 
              ...styles.createButton, 
              background: 'linear-gradient(135deg, #f0f9ff, #ffffff)',
              color: '#0284c7',
              borderColor: '#bae6fd'
            }}
          >
            <FileText size={18} />
            Soru Bankası
          </button>
          <button 
            onClick={() => navigate('/instructor/categories')} 
            style={{ 
              ...styles.createButton, 
              background: 'linear-gradient(135deg, #fef3c7, #ffffff)',
              color: '#d97706',
              borderColor: '#fde68a'
            }}
          >
            <FolderOpen size={18} />
            Kategoriler
          </button>
        </header>

        <section style={styles.statsGrid}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label} style={styles.statCard}>
                <div style={{ ...styles.statIcon, background: stat.bg, color: stat.color }}>
                  <Icon size={23} />
                </div>
                <h2 style={styles.statValue}>{stat.value}</h2>
                <p style={styles.statLabel}>{stat.label}</p>
              </article>
            );
          })}
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>
              <BookOpen size={24} color="#2563eb" />
              Sınavlarım
            </h2>
            <div style={styles.searchBox}>
              <Search size={16} />
              Sınav listesi
            </div>
          </div>

          {exams.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <BookOpen size={34} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '22px' }}>Henüz sınav oluşturmadın</h3>
              <p style={{ margin: '0 auto 22px', maxWidth: '420px', color: '#64748b', lineHeight: 1.6 }}>
                İlk sınavını oluşturarak öğrencilerin için değerlendirme sürecini başlatabilirsin.
              </p>
              <button onClick={() => navigate('/instructor/create-exam')} style={styles.createButton}>
                <Plus size={18} />
                İlk Sınavı Oluştur
              </button>
            </div>
          ) : (
            <div style={styles.examsGrid}>
              {exams.map((exam) => (
                <article 
                  key={exam.id} 
                  style={styles.examCard}
                  onClick={() => {
                    console.log('Navigating to exam:', exam.id);
                    navigate(`/instructor/exam/${exam.id}`);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(15,23,42,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 14px 32px rgba(15,23,42,0.045)';
                  }}
                >
                  <div style={styles.examTop}>
                    <div style={styles.examIcon}>
                      <BookOpen size={22} />
                    </div>
                    <span
                      style={{
                        ...styles.status,
                        background: exam.published ? '#ecfdf5' : '#f8fafc',
                        color: exam.published ? '#15803d' : '#64748b',
                        border: exam.published ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      }}
                    >
                      {exam.published ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                      {exam.published ? 'Yayında' : 'Taslak'}
                    </span>
                  </div>

                  <h3 style={styles.examTitle}>{exam.title}</h3>
                  <p style={styles.examDesc}>{exam.description || 'Bu sınav için henüz açıklama eklenmemiş.'}</p>

                  <div style={styles.metaRow}>
                    <CalendarDays size={16} />
                    Yönetilebilir sınav kaydı
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
