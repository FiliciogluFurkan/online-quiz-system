import api, { API_ORIGIN } from './axios';

/** Bir görsel dosyasını yükler ve sunulabilir göreli yolu döndürür (/uploads/...). */
export async function uploadQuestionImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/uploads/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.url as string;
}

/** Göreli görsel yolunu tam URL'ye çevirir (data: ve http: olduğu gibi bırakılır). */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return API_ORIGIN + url;
}
