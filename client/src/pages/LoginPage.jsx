import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);

      // Navigate to destination or role home
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'HR') {
        navigate('/hr', { replace: true });
      } else if (user.role === 'MANAGER') {
        navigate('/manager', { replace: true });
      } else {
        navigate('/employee', { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5 px-3">
      <div className="card-custom p-4 p-sm-5 w-100 shadow-sm" style={{ maxWidth: '460px' }}>
        {/* Brand */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-3 p-3 mb-3 shadow-sm">
            <Layers size={32} />
          </div>
          <h3 className="fw-bold text-dark mb-1">StaffSync HRM</h3>
          <p className="text-muted small">Human Resource & Workforce Management System</p>
        </div>

        {isExpired && (
          <div className="alert alert-warning d-flex align-items-center gap-2 small py-2 mb-3">
            <AlertCircle size={16} />
            <span>Your session has expired. Please log in again.</span>
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-3">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Work Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Mail size={18} />
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-1"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Lock size={18} />
              </span>
              <input
                type="password"
                className="form-control border-start-0 ps-1"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Helpers */}
        <div className="mt-4 pt-3 border-top text-center">
          <small className="text-muted d-block mb-2 fw-semibold">Quick Demo Login (1-Click Fill):</small>
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            <button
              type="button"
              onClick={() => handleDemoFill('hr@staffsync.com', 'Password123!')}
              className="btn btn-sm btn-outline-danger"
            >
              HR Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('manager@staffsync.com', 'Password123!')}
              className="btn btn-sm btn-outline-primary"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('employee@staffsync.com', 'Password123!')}
              className="btn btn-sm btn-outline-success"
            >
              Employee
            </button>
          </div>
        </div>

        {/* Sign up link */}
        <p className="text-center text-muted small mt-4 mb-0">
          New to StaffSync?{' '}
          <Link to="/signup" className="text-primary fw-semibold text-decoration-none">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
