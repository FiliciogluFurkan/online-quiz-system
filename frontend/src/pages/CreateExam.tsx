import { type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Info,
  Layers,
  PlusCircle,
  Sparkles,
  X,
} from 'lucide-react';
import { useCreateExam } from '../hooks/useCreateExam';

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background:
      'radial-gradient(circle at 8% 8%, rgba(99,102,241,0.12), transparent 28%), radial-gradient(circle at 90% 10%, rgba(14,165,233,0.12), transparent 26%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
    color: '#0f172a',
    padding: '32px',
    boxSizing: 'border-box',
  },
  container: {
    maxWidth: '1180px',
    margin: '0 auto',
  },
  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '18px',
    marginBottom: '28px',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '9px',
    border: '1px solid #e2e8f0',
    background: 'rgba(255,255,255,0.82)',
    color: '#334155',
    padding: '12px 16px',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: 800,
    boxShadow: '0 10px 24px rgba(15,23,42,0.05)',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#eef2ff',
    color: '#4f46e5',
    border: '1px solid #c7d2fe',
    padding: '10px 14px',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: 800,
  },
  header: {
    marginBottom: '28px',
  },
  title: {
    margin: '12px 0 12px',
    fontSize: '46px',
    letterSpacing: '-0.045em',
    lineHeight: 1.05,
    fontWeight: 950,
    color: '#0f172a',
  },
  subtitle: {
    maxWidth: '680px',
    margin: 0,
    color: '#64748b',
    fontSize: '17px',
    lineHeight: 1.7,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 360px',
    gap: '26px',
    alignItems: 'start',
  },
  card: {
    background: 'rgba(255,255,255,0.86)',
    border: '1px solid rgba(226,232,240,0.95)',
    borderRadius: '28px',
    boxShadow: '0 26px 70px rgba(15,23,42,0.08)',
    backdropFilter: 'blur(18px)',
  },
  formCard: {
    padding: '30px',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '0 0 20px',
    fontSize: '20px',
    color: '#0f172a',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '18px',
  },
  field: {
    marginBottom: '20px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '9px',
    color: '#334155',
    fontSize: '14px',
    fontWeight: 850,
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #dbe3ef',
    background: '#ffffff',
    color: '#0f172a',
    borderRadius: '16px',
    padding: '15px 16px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 1px 0 rgba(15,23,42,0.02)',
  },
  inputReadonly: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#475569',
    borderRadius: '16px',
    padding: '15px 16px',
    fontSize: '15px',
    outline: 'none',
    cursor: 'default',
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #dbe3ef',
    background: '#ffffff',
    color: '#0f172a',
    borderRadius: '16px',
    padding: '15px 16px',
    fontSize: '15px',
    minHeight: '130px',
    resize: 'vertical',
    outline: 'none',
    lineHeight: 1.6,
  },
  hint: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    marginTop: '8px',
    color: '#94a3b8',
    fontSize: '13px',
  },
  hintSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    marginTop: '8px',
    color: '#16a34a',
    fontSize: '13px',
    fontWeight: 600,
  },
  divider: {
    height: '1px',
    background: '#e2e8f0',
    margin: '10px 0 24px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '26px',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    border: 'none',
    borderRadius: '16px',
    padding: '14px 22px',
    cursor: 'pointer',
    color: '#ffffff',
    fontWeight: 900,
    fontSize: '15px',
    background: 'linear-gradient(135deg, #4f46e5, #2563eb)',
    boxShadow: '0 18px 34px rgba(79,70,229,0.24)',
  },
  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '14px 20px',
    cursor: 'pointer',
    color: '#475569',
    fontWeight: 900,
    fontSize: '15px',
    background: '#ffffff',
  },
  summaryCard: {
    position: 'sticky',
    top: '24px',
    overflow: 'hidden',
  },
  summaryTop: {
    padding: '24px',
    background: 'linear-gradient(135deg, #eef2ff, #f0f9ff)',
    borderBottom: '1px solid #e2e8f0',
  },
  summaryBody: {
    padding: '22px 24px 24px',
  },
  summaryRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 0',
    borderBottom: '1px solid #eef2f7',
  },
  summaryIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '13px',
    background: '#eff6ff',
    color: '#2563eb',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  smallMuted: {
    margin: '3px 0 0',
    color: '#64748b',
    fontSize: '14px',
    lineHeight: 1.5,
  },
};

export default function CreateExam() {
  console.log('CreateExam component rendered');

  const navigate = useNavigate();
  const { formData, setFormData, computedEndTime, examSummary, handleSubmit } = useCreateExam(navigate);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topbar}>
          <button type="button" onClick={() => navigate('/instructor')} style={styles.backButton}>
            <ArrowLeft size={18} />
            Panele Dön
          </button>

          <div style={styles.badge}>
            <Sparkles size={16} />
            Taslak olarak oluşturulur
          </div>
        </div>

        <header style={styles.header}>
          <h1 style={styles.title}>Yeni Sınav Oluştur</h1>
          <p style={styles.subtitle}>
            Sınav bilgilerini gir, süre ve başlangıç zamanını belirle. Bitiş zamanı otomatik olarak hesaplanır. Sınav ilk etapta taslak olarak kaydedilir; hazır olduğunda yayınlayabilirsin.
          </p>
        </header>

        <div style={styles.layout}>
          <form onSubmit={handleSubmit} style={{ ...styles.card, ...styles.formCard }}>
            <h2 style={styles.sectionTitle}>
              <FileText size={22} color="#4f46e5" />
              Temel Bilgiler
            </h2>

            <div style={styles.field}>
              <label style={styles.label}>Başlık</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Örn: 10. Sınıf Matematik Ara Sınavı"
                style={styles.input}
              />
              <div style={styles.hint}>
                <Info size={14} />
                Öğrencilerin göreceği sınav adını yaz.
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Açıklama</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Sınav kapsamı, kurallar veya öğrenciler için kısa not..."
                style={styles.textarea}
              />
            </div>

            <div style={styles.divider} />

            <h2 style={styles.sectionTitle}>
              <CalendarClock size={22} color="#2563eb" />
              Zamanlama
            </h2>

            <div style={styles.gridTwo}>
              <div style={styles.field}>
                <label style={styles.label}>Süre (dakika)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: parseInt(e.target.value || '0') })
                  }
                  required
                  style={styles.input}
                />
                <div style={styles.hint}>
                  <Info size={14} />
                  Öğrencinin sınavı tamamlaması için verilen süre.
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Durum</label>
                <div
                  style={{
                    ...styles.input,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    color: '#475569',
                    background: '#f8fafc',
                  }}
                >
                  <CheckCircle2 size={18} color="#16a34a" />
                  Taslak olarak kaydedilecek
                </div>
              </div>
            </div>

            <div style={styles.gridTwo}>
              <div style={styles.field}>
                <label style={styles.label}>Başlangıç Zamanı</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  style={styles.input}
                />
                <div style={styles.hint}>
                  <Info size={14} />
                  Sınavın açılacağı tarih ve saat.
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  <Clock3 size={14} color="#2563eb" />
                  Bitiş Zamanı
                  <span
                    style={{
                      marginLeft: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#2563eb',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      padding: '2px 7px',
                    }}
                  >
                    Otomatik
                  </span>
                </label>
                <input
                  type="datetime-local"
                  value={computedEndTime}
                  readOnly
                  style={styles.inputReadonly}
                />
                {computedEndTime ? (
                  <div style={styles.hintSuccess}>
                    <CheckCircle2 size={14} />
                    Başlangıç + {formData.duration} dakika olarak hesaplandı.
                  </div>
                ) : (
                  <div style={styles.hint}>
                    <Info size={14} />
                    Başlangıç zamanı ve süre girilince hesaplanır.
                  </div>
                )}
              </div>
            </div>

            <div style={styles.divider} />

            <h2 style={styles.sectionTitle}>
              <Layers size={22} color="#7c3aed" />
              Soru Havuzu (Opsiyonel)
            </h2>

            <div style={styles.field}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.questionPoolEnabled}
                  onChange={(e) => setFormData({ ...formData, questionPoolEnabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#334155' }}>
                  Soru Havuzu Modunu Aktifleştir
                </span>
              </label>
              <div style={styles.hint}>
                <Info size={14} />
                Her öğrenciye havuzdan rastgele farklı sorular gösterilir.
              </div>
            </div>

            {formData.questionPoolEnabled && (
              <div style={styles.gridTwo}>
                <div style={styles.field}>
                  <label style={styles.label}>Havuz Boyutu</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.poolSize}
                    onChange={(e) =>
                      setFormData({ ...formData, poolSize: parseInt(e.target.value || '0') })
                    }
                    placeholder="Örn: 50"
                    style={styles.input}
                  />
                  <div style={styles.hint}>
                    <Info size={14} />
                    Havuza eklenecek toplam soru sayısı
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Öğrenci Başına Soru</label>
                  <input
                    type="number"
                    min="1"
                    max={formData.poolSize}
                    value={formData.questionsPerStudent}
                    onChange={(e) =>
                      setFormData({ ...formData, questionsPerStudent: parseInt(e.target.value || '0') })
                    }
                    placeholder="Örn: 20"
                    style={styles.input}
                  />
                  <div style={styles.hint}>
                    <Info size={14} />
                    Her öğrenciye gösterilecek soru sayısı
                  </div>
                </div>
              </div>
            )}

            <div style={styles.actions}>
              <button type="button" onClick={() => navigate('/instructor')} style={styles.secondaryButton}>
                <X size={18} />
                İptal
              </button>
              <button type="submit" style={styles.primaryButton}>
                <PlusCircle size={19} />
                Sınavı Oluştur
              </button>
            </div>
          </form>

          <aside style={{ ...styles.card, ...styles.summaryCard }}>
            <div style={styles.summaryTop}>
              <div
                style={{
                  ...styles.badge,
                  width: 'fit-content',
                  marginBottom: '16px',
                  background: '#ffffff',
                }}
              >
                <Layers size={16} />
                Canlı Önizleme
              </div>
              <h2 style={{ margin: 0, fontSize: '24px', lineHeight: 1.25 }}>{examSummary.title}</h2>
              <p style={{ ...styles.smallMuted, marginTop: '10px' }}>{examSummary.description}</p>
            </div>

            <div style={styles.summaryBody}>
              <div style={styles.summaryRow}>
                <div style={styles.summaryIcon}>
                  <Clock3 size={19} />
                </div>
                <div>
                  <strong>Sınav Süresi</strong>
                  <p style={styles.smallMuted}>{examSummary.duration}</p>
                </div>
              </div>

              <div style={styles.summaryRow}>
                <div style={styles.summaryIcon}>
                  <CalendarClock size={19} />
                </div>
                <div>
                  <strong>Yayın Aralığı</strong>
                  <p style={styles.smallMuted}>{examSummary.dateRange}</p>
                </div>
              </div>

              <div
                style={{
                  marginTop: '18px',
                  padding: '16px',
                  borderRadius: '18px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <strong style={{ color: '#334155' }}>Not</strong>
                <p style={{ ...styles.smallMuted, marginTop: '6px' }}>
                  Oluşturulan sınav taslak olarak kaydedilir. Soruları ekledikten sonra yayınlayabilirsin.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}