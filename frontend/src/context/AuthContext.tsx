import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import keycloak from '../keycloak';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: { username: string; email: string; roles: string[] } | null;
  token: string | null;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [token, setToken] = useState<string | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false,
      })
      .then((authenticated) => {
        setIsAuthenticated(authenticated);

        // Keycloak callback parametrelerini URL'den temizle
        if (window.location.hash.includes('state=') || window.location.hash.includes('session_state=')) {
          const cleanUrl = window.location.pathname + window.location.search;
          window.history.replaceState({}, '', cleanUrl);
        }

        if (authenticated && keycloak.tokenParsed) {
          const p = keycloak.tokenParsed as Record<string, unknown>;
          setUser({
            username: (p.preferred_username as string) || '',
            email: (p.email as string) || '',
            roles: ((p.realm_access as Record<string, string[]>)?.roles) || [],
          });
          setToken(keycloak.token || null);

          // Token'ı periyodik olarak yenile (her 30 saniyede bir kontrol et)
          setInterval(() => {
            keycloak.updateToken(70).then((refreshed) => {
              if (refreshed) {
                setToken(keycloak.token || null);
              }
            }).catch(() => {
              console.error('Failed to refresh token');
            });
          }, 30000);
        }
      })
      .catch((err) => console.error('Keycloak init error:', err))
      .finally(() => setLoading(false));

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => keycloak.logout());
    };
  }, []);

  const login = () => keycloak.login();
  const logout = () => keycloak.logout({ redirectUri: window.location.origin });
  const hasRole = (role: string) => user?.roles.includes(role) ?? false;

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, token, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
