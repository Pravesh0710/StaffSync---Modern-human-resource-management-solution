import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import { CalendarCheck, CheckCircle2, XCircle, AlertCircle, Filter } from 'lucide-react';

const TeamLeaveApprovals = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [reviewComments, setReviewComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await leaveAPI.getAll({ status: statusFilter || undefined });
      setLeaves(res.data.data);
    } catch (err) {
      console.error('Failed to load team leaves', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (leave, status) => {
    setSelectedLeave(leave);
    setReviewStatus(status);
    setReviewComments(status === 'APPROVED' ? 'Approved by Manager' : '');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    try {
      setSubmitting(true);
      await leaveAPI.review(selectedLeave._id, {
        status: reviewStatus,
        reviewComments
      });
      setActionMessage(`Leave request ${reviewStatus.toLowerCase()} successfully.`);
      setSelectedLeave(null);
      fetchLeaves();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to review leave');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Title */}
      <div>
        <h3 className="fw-bold mb-1">Team Leave Approvals</h3>
        <p className="text-muted small mb-0">Review time-off requests submitted by members of your team.</p>
      </div>

      {actionMessage && (
        <div className="alert alert-success d-flex align-items-center gap-2 small py-2">
          <CheckCircle2 size={16} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter */}
      <div className="card-custom p-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white text-muted">
                <Filter size={16} />
              </span>
              <select
                className="form-select border-start-0"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Requests</option>
                <option value="PENDING">Pending Action</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-custom">
        <div className="table-responsive">
          <table className="table table-custom">
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                    <span className="text-muted">Loading team requests...</span>
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No leave requests found for your team.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div className="fw-semibold">
                        {leave.employeeId?.firstName} {leave.employeeId?.lastName}
                      </div>
                      <div className="text-muted small">
                        {leave.employeeId?.employeeCode} • {leave.employeeId?.jobTitle}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{leave.leaveType}</span>
                    </td>
                    <td className="small">
                      <div className="fw-medium">
                        {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="small text-muted" style={{ maxWidth: '240px' }}>
                      <span className="text-truncate d-inline-block" style={{ maxWidth: '220px' }} title={leave.reason}>
                        {leave.reason}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge badge-${leave.status.toLowerCase()}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="text-end">
                      {leave.status === 'PENDING' ? (
                        <div className="btn-group btn-group-sm">
                          <button
                            onClick={() => handleOpenReview(leave, 'APPROVED')}
                            className="btn btn-outline-success"
                            title="Approve"
                          >
                            <CheckCircle2 size={15} />
                            <span className="ms-1 d-none d-md-inline">Approve</span>
                          </button>
                          <button
                            onClick={() => handleOpenReview(leave, 'REJECTED')}
                            className="btn btn-outline-danger"
                            title="Reject"
                          >
                            <XCircle size={15} />
                            <span className="ms-1 d-none d-md-inline">Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted small">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedLeave && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {reviewStatus === 'APPROVED' ? 'Approve' : 'Reject'} Team Leave
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedLeave(null)}></button>
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body">
                  <div className="p-3 bg-light rounded-3 mb-3 small">
                    <div>
                      <strong>Employee:</strong> {selectedLeave.employeeId?.firstName} {selectedLeave.employeeId?.lastName}
                    </div>
                    <div>
                      <strong>Dates:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()} to {new Date(selectedLeave.endDate).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Reason:</strong> {selectedLeave.reason}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Manager Feedback / Comments</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Add an optional comment for the employee..."
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedLeave(null)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`btn ${reviewStatus === 'APPROVED' ? 'btn-success' : 'btn-danger'}`}
                  >
                    {submitting ? 'Submitting...' : `Confirm ${reviewStatus}`}
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

export default TeamLeaveApprovals;
