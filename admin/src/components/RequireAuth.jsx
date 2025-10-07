import React from 'react';
import { useAuth } from '../AuthContext';
import { Navigate } from 'react-router-dom';

export default function RequireAuth({ children, adminOnly = true }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container-xl">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (adminOnly && !user) return <Navigate to="/forbidden" replace />;

  return children;
}
