import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading StaffSync...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Determine user's home dashboard based on role
    const homePath =
      user.role === 'HR'
        ? '/hr'
        : user.role === 'MANAGER'
        ? '/manager'
        : '/employee';

    return (
      <div className="container py-5 text-center">
        <div className="card-custom p-5 mx-auto" style={{ maxWidth: '500px' }}>
          <ShieldAlert className="text-danger mb-3" size={56} />
          <h4 className="fw-bold mb-2">Access Denied</h4>
          <p className="text-muted mb-4">
            Your account role (<strong>{user.role}</strong>) does not have permission to view this section.
          </p>
          <a href={homePath} className="btn btn-primary px-4">
            Go to Your Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
