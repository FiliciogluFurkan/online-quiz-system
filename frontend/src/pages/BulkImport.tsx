import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import api from '../api/axios';

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8f9fa',
    padding: '40px 24px',
    fontFamily: 'Inter, system-ui',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '14px',
    marginBottom: '16px',
    color: '#64748b',
  },
  header: {
    background: 'white',
    padding: '30px',
    borderRadius: '16px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '32px',
    fontWeight: 900,
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '15px',
    lineHeight: 1.6,
  },
  card: {
    background: 'white',
    padding: '30px',
    borderRadius: '16px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    margin: '0 0 16px',
    fontSize: '20px',
    fontWeight: 800,
  },
  uploadArea: {
    border: '2px dashed #cbd5e1',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center' as const,
    background: '#f8fafc',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  uploadIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: '#eff6ff',
    color: '#2563eb',
    display: 'grid',
    placeItems: 'center',
    margin: '0 auto 16px',
  },
  uploadButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '14px',
    marginTop: '16px',
  },
  downloadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '14px',
  },
  infoBox: {
    padding: '16px',
    background: '#eff6ff',
    borderRadius: '10px',
    border: '1px solid #bfdbfe',
    marginTop: '16px',
  },
  infoTitle: {
    margin: '0 0 8px',
    fontSize: '14px',
    fontWeight: 800,
    color: '#1e40af',
  },
  infoList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#475569',
    fontSize: '14px',
    lineHeight: 1.8,
  },
  resultBox: {
    padding: '20px',
    borderRadius: '12px',
    marginTop: '20px',
  },
  resultTitle: {
    margin: '0 0 12px',
    fontSize: '18px',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  errorList: {
    margin: '12px 0 0',
    paddingLeft: '20px',
    color: '#dc2626',
    fontSize: '14px',
    lineHeight: 1.8,
  },
};

export default function BulkImport() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
"2+2 kaç eder?",MULTIPLE_CHOICE,"A) 3\nB) 4\nC) 5\nD) 6",B,1,
"Türkiye'nin başkenti Ankara'dır",TRUE_FALSE,,true,1,
"Osmanlı İmparatorluğu hangi yılda kuruldu?",SHORT_ANSWER,,1299,2,1`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'soru_sablonu.csv';
    link.click();
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={() => navigate('/instructor/questions')} style={styles.backBtn}>
          <ArrowLeft size={18} />
          Soru Bankasına Dön
        </button>

        <div style={styles.header}>
          <h1 style={styles.title}>Toplu Soru İçe Aktarma</h1>
          <p style={styles.subtitle}>
            CSV dosyası ile birden fazla soruyu tek seferde sisteme yükleyin
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Şablon İndir</h2>
          <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '14px' }}>
            Önce şablon dosyayı indirin ve sorularınızı bu formata göre hazırlayın
          </p>
          <button onClick={downloadTemplate} style={styles.downloadBtn}>
            <Download size={18} />
            Şablon Dosyayı İndir (CSV)
          </button>

          <div style={styles.infoBox}>
            <div style={styles.infoTitle}>CSV Formatı:</div>
            <ul style={styles.infoList}>
              <li>
                <strong>Soru Metni:</strong> Sorunun kendisi
              </li>
              <li>
                <strong>Tip:</strong> MULTIPLE_CHOICE, TRUE_FALSE, veya SHORT_ANSWER
              </li>
              <li>
                <strong>Seçenekler:</strong> Çoktan seçmeli için seçenekler (her satır \n ile
                ayrılır)
              </li>
              <li>
                <strong>Doğru Cevap:</strong> Doğru cevap (çoktan seçmeli için harf: A, B, C...)
              </li>
              <li>
                <strong>Puan:</strong> Soru puanı (varsayılan: 1)
              </li>
              <li>
                <strong>Kategori ID:</strong> Kategori ID'si (opsiyonel)
              </li>
            </ul>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Dosya Yükle</h2>

          <div
            style={styles.uploadArea}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <div style={styles.uploadIcon}>
              <Upload size={32} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700 }}>
              {file ? file.name : 'CSV Dosyası Seçin'}
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              Tıklayın veya dosyayı sürükleyin
            </p>
            <input
              id="fileInput"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {file && (
            <button onClick={handleUpload} disabled={uploading} style={styles.uploadButton}>
              <Upload size={18} />
              {uploading ? 'Yükleniyor...' : 'Yükle ve İçe Aktar'}
            </button>
          )}
        </div>

        {result && (
          <div
            style={{
              ...styles.resultBox,
              background: result.errors.length > 0 ? '#fef2f2' : '#ecfdf5',
              border: `2px solid ${result.errors.length > 0 ? '#fecaca' : '#bbf7d0'}`,
            }}
          >
            <div
              style={{
                ...styles.resultTitle,
                color: result.errors.length > 0 ? '#dc2626' : '#16a34a',
              }}
            >
              {result.errors.length > 0 ? (
                <AlertCircle size={24} />
              ) : (
                <CheckCircle2 size={24} />
              )}
              İçe Aktarma Tamamlandı
            </div>

            <p style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
              ✓ {result.imported} soru başarıyla içe aktarıldı
            </p>

            {result.errors.length > 0 && (
              <>
                <p style={{ margin: '12px 0 0', fontSize: '15px', fontWeight: 700, color: '#dc2626' }}>
                  ✗ {result.errors.length} hata oluştu:
                </p>
                <ul style={styles.errorList}>
                  {result.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </>
            )}

            <button
              onClick={() => navigate('/instructor/questions')}
              style={{
                ...styles.uploadButton,
                marginTop: '16px',
                background: '#16a34a',
              }}
            >
              <FileText size={18} />
              Soru Bankasına Git
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
