import React, { useState, useEffect } from 'react';
import { authAPI, employeeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, MapPin, ShieldAlert, CheckCircle2, Lock, Save, Briefcase } from 'lucide-react';

const MyProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editable fields form state
  const [formData, setFormData] = useState({
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  // Password change state
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getMe();
      const emp = res.data.user.employee;
      setProfile(emp);

      if (emp) {
        setFormData({
          phone: emp.phone || '',
          address: {
            street: emp.address?.street || '',
            city: emp.address?.city || '',
            state: emp.address?.state || '',
            zipCode: emp.address?.zipCode || '',
            country: emp.address?.country || ''
          },
          emergencyContact: {
            name: emp.emergencyContact?.name || '',
            relationship: emp.emergencyContact?.relationship || '',
            phone: emp.emergencyContact?.phone || ''
          }
        });
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setSubmitting(true);
      await employeeAPI.update(profile._id, formData);
      setSuccessMsg('Personal contact and emergency information updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update personal profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }

    if (pwData.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long');
      return;
    }

    try {
      setPwSubmitting(true);
      await authAPI.changePassword({
        currentPassword: pwData.currentPassword,
        newPassword: pwData.newPassword
      });
      setPwSuccess('Password changed successfully!');
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSuccess(''), 4000);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* Title */}
      <div>
        <h3 className="fw-bold mb-1">My Personal Profile</h3>
        <p className="text-muted small mb-0">View your organizational placement and update permitted personal contact details.</p>
      </div>

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 small py-2 mb-0">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-0">
          <ShieldAlert size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Overview (Read-Only Organization Fields) */}
      <div className="card-custom p-4">
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
          <Briefcase size={20} />
          <span>Employment & Organization Details</span>
        </h5>

        <div className="row g-3">
          <div className="col-12 col-sm-6 col-md-3">
            <small className="text-muted d-block">Employee ID</small>
            <span className="font-monospace fw-semibold">{profile?.employeeCode || 'N/A'}</span>
          </div>

          <div className="col-12 col-sm-6 col-md-3">
            <small className="text-muted d-block">Full Legal Name</small>
            <span className="fw-semibold text-dark">{user?.name}</span>
          </div>

          <div className="col-12 col-sm-6 col-md-3">
            <small className="text-muted d-block">Assigned Department</small>
            <span className="fw-semibold text-dark">{profile?.department || 'Unassigned'}</span>
          </div>

          <div className="col-12 col-sm-6 col-md-3">
            <small className="text-muted d-block">Job Title</small>
            <span className="fw-semibold text-dark">{profile?.jobTitle || 'Associate'}</span>
          </div>

          <div className="col-12 col-sm-6 col-md-3">
            <small className="text-muted d-block">Reporting Manager</small>
            <span className="fw-semibold text-dark">
              {profile?.managerId ? `${profile.managerId.firstName} ${profile.managerId.lastName}` : 'Direct HR / Management'}
            </span>
          </div>

          <div className="col-12 col-sm-6 col-md-3">
            <small className="text-muted d-block">Work Email</small>
            <span className="fw-semibold text-dark">{user?.email}</span>
          </div>

          <div className="col-12 col-sm-6 col-md-3">
            <small className="text-muted d-block">Joining Date</small>
            <span className="fw-semibold text-dark">
              {new Date(profile?.dateOfJoining || Date.now()).toLocaleDateString()}
            </span>
          </div>

          <div className="col-12 col-sm-6 col-md-3">
            <small className="text-muted d-block">Account Role</small>
            <span className="badge bg-primary">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Editable Permitted Personal Profile Fields */}
      <div className="card-custom p-4">
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
          <User size={20} className="text-primary" />
          <span>Update Permitted Personal Information</span>
        </h5>
        <p className="text-muted small mb-4">
          In accordance with HRM security policy, you may update your personal phone, residential address, and emergency contact details below.
        </p>

        <form onSubmit={handleProfileSubmit}>
          {/* Contact & Address */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">Personal Mobile / Phone</label>
              <input
                type="text"
                className="form-control"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">Street Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="123 Main Street"
                value={formData.address.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value }
                  })
                }
              />
            </div>

            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold">City</label>
              <input
                type="text"
                className="form-control"
                placeholder="City"
                value={formData.address.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value }
                  })
                }
              />
            </div>

            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold">State / Province</label>
              <input
                type="text"
                className="form-control"
                placeholder="State"
                value={formData.address.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, state: e.target.value }
                  })
                }
              />
            </div>

            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold">Zip / Postal Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="Zip Code"
                value={formData.address.zipCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, zipCode: e.target.value }
                  })
                }
              />
            </div>

            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold">Country</label>
              <input
                type="text"
                className="form-control"
                placeholder="Country"
                value={formData.address.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, country: e.target.value }
                  })
                }
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <h6 className="fw-bold mb-3 text-secondary">Emergency Contact</h6>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Contact Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Contact Name"
                value={formData.emergencyContact.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                  })
                }
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Relationship</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Spouse, Parent, Sibling"
                value={formData.emergencyContact.relationship}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                  })
                }
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Emergency Phone</label>
              <input
                type="text"
                className="form-control"
                placeholder="+1 (555) 999-9999"
                value={formData.emergencyContact.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                  })
                }
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary d-flex align-items-center gap-2">
            <Save size={16} />
            <span>{submitting ? 'Saving...' : 'Save Personal Details'}</span>
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card-custom p-4">
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
          <Lock size={20} className="text-secondary" />
          <span>Security & Password</span>
        </h5>

        {pwSuccess && (
          <div className="alert alert-success d-flex align-items-center gap-2 small py-2 mb-3">
            <CheckCircle2 size={16} />
            <span>{pwSuccess}</span>
          </div>
        )}

        {pwError && (
          <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-3">
            <ShieldAlert size={16} />
            <span>{pwError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '500px' }}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Current Password</label>
            <input
              type="password"
              className="form-control"
              required
              value={pwData.currentPassword}
              onChange={(e) => setPwData({ ...pwData, currentPassword: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">New Password (min 6 characters)</label>
            <input
              type="password"
              className="form-control"
              required
              value={pwData.newPassword}
              onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              required
              value={pwData.confirmPassword}
              onChange={(e) => setPwData({ ...pwData, confirmPassword: e.target.value })}
            />
          </div>

          <button type="submit" disabled={pwSubmitting} className="btn btn-outline-primary">
            {pwSubmitting ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;
