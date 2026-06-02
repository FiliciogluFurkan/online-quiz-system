import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [homeHovered, setHomeHovered] = useState(false);
  const [logoutHovered, setLogoutHovered] = useState(false);

  if (location.pathname === '/' || !isAuthenticated) return null;

  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '6px', padding: '6px',
      borderRadius: '999px', background: 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(14px)', border: '1px solid #e2e8f0',
      boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
    }}>
      <button
        onClick={() => navigate('/')}
        title="Ana Sayfa"
        onMouseEnter={() => setHomeHovered(true)}
        onMouseLeave={() => setHomeHovered(false)}
        style={iconButtonStyle('#f1f5f9', '#334155', homeHovered)}
      >
        <Home size={16} />
      </button>

      <NotificationBell />

      <div style={{ width: '1px', height: '18px', background: '#e2e8f0', margin: '0 2px' }} />

      <button
        onClick={logout}
        title="Çıkış Yap"
        onMouseEnter={() => setLogoutHovered(true)}
        onMouseLeave={() => setLogoutHovered(false)}
        style={iconButtonStyle('#fff1f2', '#dc2626', logoutHovered)}
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}

const iconButtonStyle = (bg: string, color: string, hovered: boolean) => ({
  width: '34px', height: '34px', borderRadius: '999px',
  border: '1px solid #e2e8f0', background: bg, color,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'all 0.2s ease',
  transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
  boxShadow: hovered ? '0 8px 18px rgba(15,23,42,0.12)' : 'none',
});
