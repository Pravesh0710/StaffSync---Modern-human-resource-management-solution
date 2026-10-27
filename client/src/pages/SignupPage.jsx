import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Layers, Mail, Lock, User, Phone, Briefcase, Building2,
  AlertCircle, CheckCircle, ArrowRight, Eye, EyeOff
} from 'lucide-react';

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
  'Finance', 'Operations', 'Human Resources', 'Legal', 'General'
];

const SignupPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: '',
    jobTitle: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setErrorMsg('');
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Full name is required.';
    if (!form.email.trim()) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = 'Enter a valid email address.';
    if (!form.password) errors.password = 'Password is required.';
    else if (form.password.length < 6)
      errors.password = 'Password must be at least 6 characters.';
    if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword)
      errors.confirmPassword = 'Passwords do not match.';
    if (!form.department) errors.department = 'Please select a department.';
    if (!form.jobTitle.trim()) errors.jobTitle = 'Job title is required.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        department: form.department,
        jobTitle: form.jobTitle.trim(),
        role: 'EMPLOYEE' // self-signup always creates employee accounts
      });

      setSuccess(true);
      setTimeout(() => navigate('/employee', { replace: true }), 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', color: 'danger', width: '20%' };
    if (p.length < 8) return { label: 'Weak', color: 'warning', width: '40%' };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p))
      return { label: 'Strong', color: 'success', width: '100%' };
    if (/[A-Z]/.test(p) || /[0-9]/.test(p))
      return { label: 'Moderate', color: 'info', width: '65%' };
    return { label: 'Fair', color: 'warning', width: '50%' };
  };

  const strength = passwordStrength();

  return (
    <div className="d-flex align-items-start justify-content-center min-vh-100 bg-light py-5 px-3">
      <div className="card border-0 shadow-sm w-100" style={{ maxWidth: '520px', borderRadius: '16px' }}>
        <div className="card-body p-4 p-sm-5">

          {/* Brand Header */}
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-3 p-3 mb-3 shadow-sm">
              <Layers size={32} />
            </div>
            <h4 className="fw-bold text-dark mb-1">Create your Account</h4>
            <p className="text-muted small mb-0">Join StaffSync as an employee</p>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="alert alert-success d-flex align-items-center gap-2 small py-2 mb-3">
              <CheckCircle size={16} />
              <span>Account created! Redirecting to your dashboard…</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-3">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Full Name */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Full Name <span className="text-danger">*</span></label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><User size={16} /></span>
                <input
                  type="text"
                  name="name"
                  className={`form-control border-start-0 ps-1 ${fieldErrors.name ? 'is-invalid' : ''}`}
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
                {fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Work Email <span className="text-danger">*</span></label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><Mail size={16} /></span>
                <input
                  type="email"
                  name="email"
                  className={`form-control border-start-0 ps-1 ${fieldErrors.email ? 'is-invalid' : ''}`}
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
              </div>
            </div>

            {/* Phone (optional) */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Phone <span className="text-muted fw-normal">(optional)</span></label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><Phone size={16} /></span>
                <input
                  type="tel"
                  name="phone"
                  className="form-control border-start-0 ps-1"
                  placeholder="+1 555 000 0000"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Department + Job Title side-by-side */}
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label small fw-semibold text-secondary">Department <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted"><Building2 size={16} /></span>
                  <select
                    name="department"
                    className={`form-select border-start-0 ${fieldErrors.department ? 'is-invalid' : ''}`}
                    value={form.department}
                    onChange={handleChange}
                  >
                    <option value="">Select…</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {fieldErrors.department && <div className="invalid-feedback">{fieldErrors.department}</div>}
                </div>
              </div>
              <div className="col-6">
                <label className="form-label small fw-semibold text-secondary">Job Title <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted"><Briefcase size={16} /></span>
                  <input
                    type="text"
                    name="jobTitle"
                    className={`form-control border-start-0 ps-1 ${fieldErrors.jobTitle ? 'is-invalid' : ''}`}
                    placeholder="e.g. Developer"
                    value={form.jobTitle}
                    onChange={handleChange}
                  />
                  {fieldErrors.jobTitle && <div className="invalid-feedback">{fieldErrors.jobTitle}</div>}
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="mb-1">
              <label className="form-label small fw-semibold text-secondary">Password <span className="text-danger">*</span></label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><Lock size={16} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-control border-start-0 border-end-0 ps-1 ${fieldErrors.password ? 'is-invalid' : ''}`}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-group-text bg-white text-muted border-start-0"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
              </div>
            </div>

            {/* Password strength bar */}
            {strength && (
              <div className="mb-3">
                <div className="progress" style={{ height: '4px' }}>
                  <div
                    className={`progress-bar bg-${strength.color}`}
                    style={{ width: strength.width, transition: 'width 0.3s' }}
                  />
                </div>
                <small className={`text-${strength.color}`}>{strength.label}</small>
              </div>
            )}

            {/* Confirm Password */}
            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">Confirm Password <span className="text-danger">*</span></label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><Lock size={16} /></span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`form-control border-start-0 border-end-0 ps-1 ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-group-text bg-white text-muted border-start-0"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {fieldErrors.confirmPassword && <div className="invalid-feedback">{fieldErrors.confirmPassword}</div>}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  <span>Creating Account…</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-muted small mt-4 mb-0">
            Already have an account?{' '}
            <Link to="/login" className="text-primary fw-semibold text-decoration-none">
              Sign in
            </Link>
          </p>

          <hr className="my-3" />
          <p className="text-center text-muted" style={{ fontSize: '0.72rem' }}>
            Self-registration creates an <strong>Employee</strong> account.
            HR or Manager accounts are provisioned by your HR administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
