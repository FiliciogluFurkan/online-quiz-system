import axios from 'axios';
import keycloak from '../keycloak';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retried?: boolean;
  }
}

export const API_ORIGIN = 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retried) {
      originalRequest._retried = true;
      try {
        const refreshed = await keycloak.updateToken(30);
        if (refreshed) {
          originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
          return api.request(originalRequest);
        }
        // Token hala geçerli ama 401 aldık — clock skew / key rotation: login'e yönlendir
        keycloak.login();
        return Promise.reject(error);
      } catch {
        keycloak.login();
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
