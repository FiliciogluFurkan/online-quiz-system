import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import keycloak from '../keycloak';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    username: string;
    email: string;
    roles: string[];
  } | null;
  token: string | null;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [token, setToken] = useState<string | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Sadece bir kere initialize et
    if (isInitialized.current) return;
    isInitialized.current = true;

    console.log('Keycloak init starting...');

    keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false, // Disable iframe check to prevent issues
      })
      .then((authenticated) => {
        console.log('Keycloak init success! Authenticated:', authenticated);
        setIsAuthenticated(authenticated);
        
        // Keycloak callback parametrelerini URL'den temizle
        if (window.location.hash.includes('state=') || window.location.hash.includes('session_state=')) {
          const cleanUrl = window.location.pathname + window.location.search;
          window.history.replaceState({}, '', cleanUrl);
        }
        
        if (authenticated && keycloak.tokenParsed) {
          console.log('Token parsed:', keycloak.tokenParsed);
          const tokenParsed = keycloak.tokenParsed as any;
          const userData = {
            username: tokenParsed.preferred_username || '',
            email: tokenParsed.email || '',
            roles: tokenParsed.realm_access?.roles || [],
          };
          console.log('User data:', userData);
          setUser(userData);
          setToken(keycloak.token || null);
          
          // Token'ı periyodik olarak yenile (her 30 saniyede bir kontrol et)
          setInterval(() => {
            keycloak.updateToken(70).then((refreshed) => {
              if (refreshed) {
                console.log('Token refreshed automatically');
                setToken(keycloak.token || null);
              }
            }).catch(() => {
              console.error('Failed to refresh token');
            });
          }, 30000);
        } else {
          console.log('Not authenticated, no token');
        }
        
        // Keycloak hazır, loading'i kapat
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Keycloak init error:', error);
        setIsLoading(false);
      });

    // Token yenileme
    keycloak.onTokenExpired = () => {
      console.log('Token expired, refreshing...');
      keycloak.updateToken(30).catch(() => {
        console.error('Token refresh failed');
        logout();
      });
    };
  }, []);

  const login = () => {
    keycloak.login();
  };

  const logout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  const hasRole = (role: string) => {
    return user?.roles.includes(role) || false;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, token, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
