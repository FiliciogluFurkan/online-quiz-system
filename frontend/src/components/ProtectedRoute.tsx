import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  roles?: string[];
  children: ReactNode;
}

export default function ProtectedRoute({ roles, children }: Props) {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (roles && !roles.some(hasRole)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
