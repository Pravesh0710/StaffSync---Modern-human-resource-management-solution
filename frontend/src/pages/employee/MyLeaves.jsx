import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import { CalendarCheck, Plus, Trash2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'ANNUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const res = await leaveAPI.getMyLeaves();
      setLeaves(res.data.data);
    } catch (err) {
      console.error('Failed to load leaves', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApplyModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      leaveType: 'ANNUAL',
      startDate: today,
      endDate: today,
      reason: ''
    });
    setFormError('');
    setShowApplyModal(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setFormError('End date cannot be earlier than start date.');
      return;
    }

    try {
      setSubmitting(true);
      await leaveAPI.apply(formData);
      setActionSuccess('Leave request submitted successfully!');
      setShowApplyModal(false);
      fetchMyLeaves();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave request?')) return;
    try {
      await leaveAPI.cancel(leaveId);
      setActionSuccess('Leave request cancelled.');
      fetchMyLeaves();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel leave');
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h3 className="fw-bold mb-1">Time Off & Leave Requests</h3>
          <p className="text-muted small mb-0">Apply for leave, review application history, and monitor approval status.</p>
        </div>
        <button onClick={handleOpenApplyModal} className="btn btn-primary d-flex align-items-center gap-2">
          <Plus size={16} />
          <span>Apply for Leave</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="alert alert-success d-flex align-items-center gap-2 small py-2 mb-0">
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Leave History Table */}
      <div className="card-custom">
        <div className="table-responsive">
          <table className="table table-custom">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Reviewer Feedback</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                    <span className="text-muted">Loading your leave requests...</span>
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No leave requests found. Click "Apply for Leave" to request time off.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => {
                  const startDate = new Date(leave.startDate);
                  const endDate = new Date(leave.endDate);
                  const diffDays = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr key={leave._id}>
                      <td>
                        <span className="badge bg-light text-dark border fw-semibold">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td className="small">
                        <div className="fw-medium text-dark">
                          {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <span className="small fw-semibold">{diffDays} {diffDays === 1 ? 'day' : 'days'}</span>
                      </td>
                      <td className="small text-muted" style={{ maxWidth: '220px' }}>
                        <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }} title={leave.reason}>
                          {leave.reason}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge badge-${leave.status.toLowerCase()}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {leave.reviewComments ? (
                          <div>
                            <span>"{leave.reviewComments}"</span>
                            {leave.reviewedBy && <small className="d-block text-muted">Reviewed by: {leave.reviewedBy.name}</small>}
                          </div>
                        ) : (
                          <span className="fst-italic text-muted">No notes</span>
                        )}
                      </td>
                      <td className="text-end">
                        {leave.status === 'PENDING' ? (
                          <button
                            onClick={() => handleCancelLeave(leave._id)}
                            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                            title="Cancel Request"
                          >
                            <Trash2 size={13} />
                            <span>Cancel</span>
                          </button>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Submit Leave Application</h5>
                <button type="button" className="btn-close" onClick={() => setShowApplyModal(false)}></button>
              </div>
              <form onSubmit={handleApplySubmit}>
                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-3">
                      <AlertCircle size={16} />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Leave Category *</label>
                    <select
                      className="form-select"
                      value={formData.leaveType}
                      onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    >
                      <option value="ANNUAL">Annual Leave / Vacation</option>
                      <option value="SICK">Sick Leave</option>
                      <option value="CASUAL">Casual Personal Leave</option>
                      <option value="MATERNITY">Maternity Leave</option>
                      <option value="PATERNITY">Paternity Leave</option>
                      <option value="UNPAID">Unpaid Leave</option>
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Reason for Leave *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      required
                      placeholder="Briefly state reason for taking leave..."
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowApplyModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Submitting...' : 'Submit Leave Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLeaves;
