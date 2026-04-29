import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import keycloak from '../keycloak';

interface AuthContextType {
  isAuthenticated: boolean;
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
      })
      .then((authenticated) => {
        console.log('Keycloak init success! Authenticated:', authenticated);
        setIsAuthenticated(authenticated);
        
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
        } else {
          console.log('Not authenticated, no token');
        }
      })
      .catch((error) => {
        console.error('Keycloak init error:', error);
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
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, hasRole }}>
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
