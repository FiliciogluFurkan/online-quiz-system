import axios from 'axios';
import keycloak from '../keycloak';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Token ekle
api.interceptors.request.use(
  (config) => {
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401 hatalarını yakala ve token refresh yap
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 401 hatası ve daha önce retry yapılmamışsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Token'ı yenilemeyi dene (5 saniye içinde expire olacaksa yenile)
        const refreshed = await keycloak.updateToken(5);
        
        if (refreshed) {
          // Token yenilendi, yeni token ile isteği tekrar gönder
          originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
          return api.request(originalRequest);
        } else {
          // Token hala geçerli ama 401 aldık, login sayfasına yönlendir
          console.warn('Token valid but 401 received, redirecting to login');
          keycloak.login();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Token refresh başarısız, login sayfasına yönlendir
        console.error('Token refresh failed:', refreshError);
        keycloak.login();
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
