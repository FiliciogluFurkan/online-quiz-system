import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCreateExam } from '../hooks/useCreateExam';
import {
  tokens, PageShell, Crumbs, Kicker, HeroTitle, SectionHeader, Btn,
} from '../components/academic-ui';

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  background: '#fff',
  border: `1px solid ${tokens.hairline}`,
  borderRadius: 10,
  fontFamily: 'inherit',
  fontSize: 14,
  color: tokens.ink,
  outline: 'none',
  boxSizing: 'border-box' as const,
};

const labelStyle = {
  display: 'block',
  fontFamily: tokens.mono,
  fontSize: 10.5,
  color: tokens.subtle,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  fontWeight: 600,
  marginBottom: 8,
};

export default function CreateExam() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    formData, setFormData, computedEndTime, examSummary, handleSubmit, saving, loading, isEditMode,
  } = useCreateExam(navigate, id);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: tokens.bg, fontFamily: tokens.sans, color: tokens.muted,
      }}>Yükleniyor…</div>
    );
  }

  const backTo = isEditMode ? `/instructor/exam/${id}` : '/instructor';
  const backLabel = isEditMode ? 'Sınav Detayına Dön' : 'Eğitmen Paneli';

  return (
    <PageShell>
      <Crumbs items={
        isEditMode
          ? ['Eğitmen', 'Sınavlar', formData.title || 'Sınav', 'Düzenle']
          : ['Eğitmen', 'Sınavlar', 'Yeni sınav']
      } />

      <Btn icon={<ArrowLeft size={14} />} onClick={() => navigate(backTo)}>
        {backLabel}
      </Btn>

      <section style={{ marginTop: 24, marginBottom: 36 }}>
        <Kicker>{isEditMode ? 'Sınav düzenle' : 'Yeni sınav'}</Kicker>
        <div style={{ marginTop: 8 }}>
          <HeroTitle>{isEditMode ? 'Sınavı Düzenle' : 'Sınav Oluştur'}</HeroTitle>
        </div>
        <p style={{
          margin: '14px 0 0', maxWidth: 620, color: tokens.muted,
          fontSize: 15.5, lineHeight: 1.65,
        }}>
          {isEditMode
            ? 'Sınavın temel bilgilerini güncelle. Öğrenciler katılmaya başladıktan sonra süre ve takvim değiştirilemez.'
            : 'Sınavın temel bilgilerini gir, süre ve zaman aralığını belirle. Soru ekleme adımı kaydetmeden sonra gelir.'}
        </p>
        {isEditMode && formData.published && (
          <div style={{
            marginTop: 18, padding: '12px 16px',
            background: '#fff7ed', border: '1px solid #fed7aa',
            borderRadius: 10, fontSize: 13.5, color: '#9a3412', lineHeight: 1.55,
          }}>
            Bu sınav <strong>yayında</strong>. Öğrenciler katılmaya başladıysa süre ve takvim
            değişiklikleri sistem tarafından göz ardı edilir; sadece başlık ve açıklama güncellenir.
          </div>
        )}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
        <form onSubmit={handleSubmit}>
          <section style={{ marginBottom: 32 }}>
            <SectionHeader kicker="01" title="Temel bilgi" />

            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={labelStyle} htmlFor="title">Başlık *</label>
                <input
                  id="title"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Örn. Veri Yapıları — Ara Sınav"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="desc">Açıklama</label>
                <textarea
                  id="desc"
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Sınavın konularını ve öğrencilerin bilmesi gerekenleri yaz…"
                  style={{ ...inputStyle, resize: 'vertical' as const }}
                />
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 32 }}>
            <SectionHeader kicker="02" title="Süre ve takvim" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle} htmlFor="duration">Süre (dakika) *</label>
                <input
                  id="duration" type="number" required min={1}
                  value={formData.duration === 0 ? '' : formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="start">Başlangıç zamanı</label>
                <input
                  id="start" type="datetime-local"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Bitiş (otomatik hesaplanır)</label>
                <input
                  type="text" readOnly
                  value={computedEndTime
                    ? new Date(computedEndTime).toLocaleString('tr-TR')
                    : 'Başlangıç ve süre girildiğinde hesaplanır'}
                  style={{
                    ...inputStyle,
                    background: tokens.ivory,
                    color: tokens.muted,
                    fontFamily: tokens.mono,
                    fontSize: 13,
                  }}
                />
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 32 }}>
            <SectionHeader kicker="03" title="Soru havuzu" sub="İsteğe bağlı — her öğrenciye havuzdan rastgele sorular dağıtılır." />

            <div style={{
              padding: 16, background: '#fff',
              border: `1px solid ${tokens.hairline}`, borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
            }}>
              <input
                id="pool-enabled" type="checkbox"
                checked={formData.questionPoolEnabled}
                onChange={e => setFormData({ ...formData, questionPoolEnabled: e.target.checked })}
                style={{ width: 16, height: 16, accentColor: tokens.indigo }}
              />
              <label htmlFor="pool-enabled" style={{
                fontSize: 14, color: tokens.ink, fontWeight: 500, cursor: 'pointer',
              }}>
                Soru havuzunu etkinleştir
              </label>
            </div>

            {formData.questionPoolEnabled && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle} htmlFor="pool-size">Havuz boyutu</label>
                  <input
                    id="pool-size" type="number" min={1}
                    value={formData.poolSize === 0 ? '' : formData.poolSize}
                    onChange={e => setFormData({ ...formData, poolSize: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="qps">Öğrenci başına soru</label>
                  <input
                    id="qps" type="number" min={1} max={formData.poolSize || undefined}
                    value={formData.questionsPerStudent === 0 ? '' : formData.questionsPerStudent}
                    onChange={e => setFormData({ ...formData, questionsPerStudent: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                    style={inputStyle}
                  />
                  {formData.questionsPerStudent > formData.poolSize && formData.poolSize > 0 && (
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: tokens.bad }}>
                      Öğrenci başına soru sayısı havuz boyutundan büyük olamaz.
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            paddingTop: 20, borderTop: `1px solid ${tokens.hairline}`,
          }}>
            <Btn type="button" onClick={() => navigate(backTo)}>İptal</Btn>
            <Btn type="submit" variant="primary" disabled={saving} icon={<Save size={14} />}>
              {saving
                ? 'Kaydediliyor…'
                : isEditMode ? 'Değişiklikleri Kaydet' : 'Taslak olarak kaydet'}
            </Btn>
          </div>
        </form>

        {/* Preview sidebar */}
        <aside style={{ position: 'sticky', top: 24 }}>
          <div style={{
            padding: 24, background: '#fff',
            border: `1px solid ${tokens.hairline}`, borderRadius: 14,
          }}>
            <Kicker>Önizleme</Kicker>
            <h3 style={{
              margin: '12px 0 8px', fontFamily: tokens.serif,
              fontSize: 22, fontWeight: 400, color: tokens.ink, letterSpacing: '-0.01em',
              lineHeight: 1.25,
            }}>{examSummary.title}</h3>
            <p style={{
              margin: 0, fontSize: 13.5, color: tokens.muted, lineHeight: 1.55,
            }}>{examSummary.description}</p>

            <hr style={{ border: 'none', borderTop: `1px solid ${tokens.hairline}`, margin: '18px 0' }} />

            <div style={{ display: 'grid', gap: 10 }}>
              {[
                ['Süre', examSummary.duration],
                ['Zaman', examSummary.dateRange],
                ['Havuz', formData.questionPoolEnabled
                  ? `${formData.poolSize} soru havuzu, ${formData.questionsPerStudent}/öğrenci`
                  : 'Devre dışı'],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: 'flex', justifyContent: 'space-between', gap: 12,
                  fontSize: 12.5, paddingBottom: 8,
                  borderBottom: `1px solid ${tokens.hairlineSoft}`,
                }}>
                  <span style={{ color: tokens.subtle }}>{k}</span>
                  <span style={{
                    color: tokens.ink, fontWeight: 500, textAlign: 'right' as const,
                  }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 18, padding: 12,
              background: tokens.indigoSoft,
              border: `1px solid ${tokens.indigoBorder}`,
              borderRadius: 10, fontSize: 12.5, color: '#3730a3', lineHeight: 1.55,
            }}>
              Kaydedildikten sonra <strong>Soru Ekle</strong> ile sınavın
              içeriğini hazırlayabilirsin.
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
