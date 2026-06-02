import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import api from '../api/axios';
import {
  tokens, PageShell, Crumbs, Kicker, HeroTitle, SectionHeader, Btn,
} from '../components/academic-ui';

interface ImportResult {
  imported: number;
  errors: string[];
}

export default function BulkImport() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Lütfen bir dosya seçin!');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/questions/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      setFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Dosya yüklenirken hata oluştu!');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Soru Metni,Tip,Seçenekler,Doğru Cevap,Puan,Kategori ID
"Aşağıdakilerden hangisi bir programlama dilidir?",MULTIPLE_CHOICE,"A) HTML\\nB) CSS\\nC) Python\\nD) JSON",C,2,
"HTTP protokolü durumsuz (stateless) bir protokoldür.",TRUE_FALSE,,true,1,
"Java'da bir sınıf tanımlamak için kullanılan anahtar kelime nedir?",SHORT_ANSWER,,class,3,
"2 + 2 * 2 işleminin sonucu nedir?",MULTIPLE_CHOICE,"A) 8\\nB) 6\\nC) 4\\nD) 2",B,1,
"Türkiye'nin başkenti Ankara'dır.",TRUE_FALSE,,true,1,
"HTML'de link oluşturmak için kullanılan etiket nedir?",SHORT_ANSWER,,a,1,
`;
    const BOM = '﻿';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'soru_sablonu.csv';
    link.click();
  };

  const success = result && result.errors.length === 0;
  const partial = result && result.errors.length > 0 && result.imported > 0;
  const failed = result && result.errors.length > 0 && result.imported === 0;

  return (
    <PageShell maxWidth={960}>
      <Crumbs items={['Eğitmen', 'Soru bankası', 'Toplu içe aktarma']} />

      <Btn icon={<ArrowLeft size={14} />} onClick={() => navigate('/instructor/questions')}>
        Soru Bankasına Dön
      </Btn>

      <section style={{ marginTop: 24, marginBottom: 36 }}>
        <Kicker>Toplu içe aktarma</Kicker>
        <div style={{ marginTop: 8 }}>
          <HeroTitle>CSV ile Soru Yükle</HeroTitle>
        </div>
        <p style={{
          margin: '14px 0 0', maxWidth: 620, color: tokens.muted,
          fontSize: 15.5, lineHeight: 1.6,
        }}>
          Birden fazla soruyu tek seferde sisteme yüklemek için CSV dosyası
          kullan. Önce şablonu indirip kendi soru setine göre düzenle.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <SectionHeader kicker="01" title="Şablon" />

        <div style={{
          padding: 24, background: '#fff',
          border: `1px solid ${tokens.hairline}`, borderRadius: 14,
        }}>
          <p style={{
            margin: '0 0 16px', color: tokens.muted,
            fontSize: 14, lineHeight: 1.6,
          }}>
            CSV şablonunu indirip kendi soru setine göre doldur. Her satır bir
            soru olmalı; çoktan seçmeli sorularda doğru cevap olarak harf gir.
          </p>
          <Btn variant="primary" onClick={downloadTemplate} icon={<Download size={14} />}>
            Şablonu İndir (CSV)
          </Btn>

          <div style={{
            marginTop: 20, padding: 16,
            background: tokens.ivory, border: `1px solid ${tokens.hairlineSoft}`,
            borderRadius: 10,
          }}>
            <Kicker>Sütun düzeni</Kicker>
            <ul style={{
              margin: '10px 0 0', padding: '0 0 0 16px',
              fontSize: 13, color: tokens.text, lineHeight: 1.8,
            }}>
              <li><strong style={{ color: tokens.ink }}>Soru Metni:</strong> Sorunun kendisi (zorunlu)</li>
              <li><strong style={{ color: tokens.ink }}>Tip:</strong> <code>MULTIPLE_CHOICE</code>, <code>TRUE_FALSE</code> veya <code>SHORT_ANSWER</code> (zorunlu, büyük harf)</li>
              <li><strong style={{ color: tokens.ink }}>Seçenekler:</strong> Sadece çoktan seçmeli için; her şık arasına <code>{'\\n'}</code> koy ve tüm seçenekleri çift tırnak içine al</li>
              <li><strong style={{ color: tokens.ink }}>Doğru Cevap:</strong> MC için harf (<code>A</code>, <code>B</code>...), TF için <code>true</code>/<code>false</code>, SA için cevabın kendisi</li>
              <li><strong style={{ color: tokens.ink }}>Puan:</strong> Tam sayı (varsayılan 1)</li>
              <li><strong style={{ color: tokens.ink }}>Kategori ID:</strong> Boş bırakılabilir, ID girilirse o kategoriye atanır</li>
            </ul>
          </div>

          <div style={{
            marginTop: 14, padding: 16,
            background: '#fff', border: `1px solid ${tokens.hairline}`,
            borderRadius: 10,
          }}>
            <Kicker>Örnek satırlar</Kicker>
            <pre style={{
              margin: '10px 0 0', padding: 12,
              background: '#fafafb', border: `1px solid ${tokens.hairlineSoft}`,
              borderRadius: 8, fontFamily: tokens.mono, fontSize: 12,
              color: tokens.text, lineHeight: 1.7,
              whiteSpace: 'pre-wrap' as const, overflowX: 'auto' as const,
            }}>{`"Türkiye'nin başkenti neresidir?",MULTIPLE_CHOICE,"A) İstanbul\\nB) Ankara\\nC) İzmir",B,2,
"HTML bir programlama dilidir.",TRUE_FALSE,,false,1,
"HTTP açılımı nedir?",SHORT_ANSWER,,HyperText Transfer Protocol,3,`}</pre>
          </div>

          <div style={{
            marginTop: 14, padding: 12,
            background: '#fff7ed', border: '1px solid #fed7aa',
            borderRadius: 10, fontSize: 12.5, color: '#9a3412', lineHeight: 1.55,
          }}>
            <strong>İpucu:</strong> Excel'de aç(ıl)dığında Türkçe karakterler bozulursa
            dosyayı VS Code veya Notepad++ ile düzenleyebilirsin (UTF-8 destekler).
            Excel için "Veri → Metinden/CSV'den" yolunu seçip UTF-8 kodlaması ile aç.
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <SectionHeader kicker="02" title="Dosya yükle" />

        <div
          onClick={() => document.getElementById('fileInput')?.click()}
          style={{
            padding: '48px 24px', textAlign: 'center' as const,
            background: '#fff',
            border: `2px dashed ${file ? tokens.indigo : tokens.hairline}`,
            borderRadius: 14, cursor: 'pointer',
            transition: 'all .15s',
          }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: file ? tokens.indigoSoft : tokens.ivory,
            color: file ? tokens.indigo : tokens.subtle,
            display: 'grid', placeItems: 'center',
            margin: '0 auto 16px',
          }}>
            <Upload size={26} />
          </div>
          <h3 style={{
            margin: '0 0 6px', fontFamily: tokens.serif,
            fontSize: 22, fontWeight: 400, color: tokens.ink,
            letterSpacing: '-0.01em',
          }}>{file ? file.name : 'CSV Dosyası Seç'}</h3>
          <p style={{ margin: 0, color: tokens.subtle, fontSize: 13 }}>
            Tıklayarak dosya seç veya buraya sürükle
          </p>
          <input
            id="fileInput" type="file" accept=".csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {file && (
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Btn variant="primary" onClick={handleUpload} disabled={uploading}
              icon={<Upload size={14} />}>
              {uploading ? 'Yükleniyor…' : 'Yükle ve İçe Aktar'}
            </Btn>
          </div>
        )}
      </section>

      {result && (
        <section style={{
          padding: 24,
          background: success ? '#ecfdf5' : failed ? '#fef2f2' : '#fff7ed',
          border: `1px solid ${success ? '#bbf7d0' : failed ? '#fecaca' : '#fed7aa'}`,
          borderRadius: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            {success || partial
              ? <CheckCircle2 size={20} style={{ color: tokens.good }} />
              : <AlertCircle size={20} style={{ color: tokens.bad }} />}
            <div style={{
              fontFamily: tokens.serif, fontSize: 22, fontWeight: 400,
              color: success ? tokens.good : failed ? tokens.bad : '#9a3412',
            }}>
              İçe aktarma tamamlandı
            </div>
          </div>

          <div style={{
            fontFamily: tokens.mono, fontSize: 14,
            color: tokens.ink, marginBottom: result.errors.length > 0 ? 16 : 0,
          }}>
            <strong>{result.imported}</strong> soru başarıyla içe aktarıldı
            {result.errors.length > 0 && <> · <strong>{result.errors.length}</strong> hata</>}
          </div>

          {result.errors.length > 0 && (
            <ul style={{
              margin: '8px 0 16px', padding: '12px 14px 12px 32px',
              background: '#fff', border: `1px solid ${tokens.hairline}`,
              borderRadius: 10,
              fontFamily: tokens.mono, fontSize: 12.5,
              color: tokens.bad, lineHeight: 1.7,
            }}>
              {result.errors.map((err, idx) => <li key={idx}>{err}</li>)}
            </ul>
          )}

          <Btn variant="primary" onClick={() => navigate('/instructor/questions')}
            icon={<FileText size={14} />}>
            Soru Bankasına Git
          </Btn>
        </section>
      )}
    </PageShell>
  );
}
