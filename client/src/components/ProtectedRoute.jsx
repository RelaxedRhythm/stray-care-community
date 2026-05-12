import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, admin, volunteer }) {
  const { user, loading, isAdmin, isVolunteer } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">Loading…</div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  if (volunteer && !isVolunteer && !isAdmin) return <Navigate to="/volunteer" replace />;
  return children;
}
