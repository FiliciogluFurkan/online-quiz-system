import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/' || !isAuthenticated) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px',
        borderRadius: '999px',
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(14px)',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
      }}
    >
      {/* Home */}
      <button
        onClick={() => navigate('/')}
        title="Ana Sayfa"
        style={iconButtonStyle('#f1f5f9', '#334155')}
      >
        <Home size={16} />
      </button>

      {/* Divider */}
      <div
        style={{
          width: '1px',
          height: '18px',
          background: '#e2e8f0',
          margin: '0 2px',
        }}
      />

      {/* Logout */}
      <button
        onClick={logout}
        title="Çıkış Yap"
        style={iconButtonStyle('#fff1f2', '#dc2626')}
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}

/* reusable button */
const iconButtonStyle = (bg: string, color: string) => ({
  width: '34px',
  height: '34px',
  borderRadius: '999px',
  border: '1px solid #e2e8f0',
  background: bg,
  color: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});

/* hover effects */
document.addEventListener('mouseover', (e: any) => {
  if (e.target.closest('button')) {
    const btn = e.target.closest('button');
    btn.style.transform = 'translateY(-2px)';
    btn.style.boxShadow = '0 8px 18px rgba(15,23,42,0.12)';
  }
});

document.addEventListener('mouseout', (e: any) => {
  if (e.target.closest('button')) {
    const btn = e.target.closest('button');
    btn.style.transform = 'translateY(0)';
    btn.style.boxShadow = 'none';
  }
});