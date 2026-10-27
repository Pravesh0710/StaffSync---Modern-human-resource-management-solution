import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import { CalendarCheck, CheckCircle2, XCircle, AlertCircle, Filter, MessageSquare } from 'lucide-react';

const LeaveManagementHR = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Review modal
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [reviewComments, setReviewComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, [page, statusFilter, departmentFilter]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        status: statusFilter || undefined,
        department: departmentFilter || undefined
      };
      const res = await leaveAPI.getAll(params);
      setLeaves(res.data.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load leaves', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewModal = (leave, status) => {
    setSelectedLeave(leave);
    setReviewStatus(status);
    setReviewComments(status === 'APPROVED' ? 'Approved by HR' : '');
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
      setActionMessage(`Leave request marked as ${reviewStatus} successfully.`);
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
        <h3 className="fw-bold mb-1">Leave Requests & Approvals</h3>
        <p className="text-muted small mb-0">Review, approve, or reject employee leave applications across the organization.</p>
      </div>

      {actionMessage && (
        <div className="alert alert-success d-flex align-items-center gap-2 small py-2">
          <CheckCircle2 size={16} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card-custom p-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="input-group">
              <span className="input-group-text bg-white text-muted">
                <Filter size={16} />
              </span>
              <select
                className="form-select border-start-0"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Review Statuses</option>
                <option value="PENDING">Pending Only</option>
                <option value="APPROVED">Approved Only</option>
                <option value="REJECTED">Rejected Only</option>
              </select>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <select
              className="form-select"
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="card-custom">
        <div className="table-responsive">
          <table className="table table-custom">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Duration & Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Reviewer Notes</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    <span className="text-muted">Loading leave requests...</span>
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No leave requests found matching filters.
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
                        <div className="fw-semibold text-dark">
                          {leave.employeeId?.firstName} {leave.employeeId?.lastName}
                        </div>
                        <div className="text-muted small">
                          {leave.employeeId?.employeeCode} • {leave.employeeId?.department}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td>
                        <div className="fw-medium small">
                          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                        </div>
                        <div className="text-muted small">{diffDays} {diffDays === 1 ? 'day' : 'days'}</div>
                      </td>
                      <td style={{ maxWidth: '220px' }}>
                        <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }} title={leave.reason}>
                          {leave.reason}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge badge-${leave.status.toLowerCase()}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="small text-muted" style={{ maxWidth: '180px' }}>
                        {leave.reviewComments ? (
                          <span>{leave.reviewComments}</span>
                        ) : (
                          <span className="text-muted fst-italic">None</span>
                        )}
                        {leave.reviewedBy && (
                          <div className="text-muted small">By: {leave.reviewedBy.name}</div>
                        )}
                      </td>
                      <td className="text-end">
                        {leave.status === 'PENDING' ? (
                          <div className="btn-group btn-group-sm">
                            <button
                              onClick={() => handleOpenReviewModal(leave, 'APPROVED')}
                              className="btn btn-outline-success"
                              title="Approve Leave"
                            >
                              <CheckCircle2 size={15} />
                              <span className="ms-1 d-none d-md-inline">Approve</span>
                            </button>
                            <button
                              onClick={() => handleOpenReviewModal(leave, 'REJECTED')}
                              className="btn btn-outline-danger"
                              title="Reject Leave"
                            >
                              <XCircle size={15} />
                              <span className="ms-1 d-none d-md-inline">Reject</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenReviewModal(leave, leave.status === 'APPROVED' ? 'REJECTED' : 'APPROVED')}
                            className="btn btn-sm btn-outline-secondary"
                            title="Re-evaluate status"
                          >
                            Update
                          </button>
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

      {/* Review Modal */}
      {selectedLeave && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {reviewStatus === 'APPROVED' ? 'Approve' : 'Reject'} Leave Request
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedLeave(null)}></button>
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body">
                  <div className="mb-3 p-3 bg-light rounded-3">
                    <div className="fw-semibold">
                      {selectedLeave.employeeId?.firstName} {selectedLeave.employeeId?.lastName} ({selectedLeave.employeeId?.employeeCode})
                    </div>
                    <div className="small text-muted mb-2">
                      {selectedLeave.employeeId?.department} • {selectedLeave.leaveType}
                    </div>
                    <div className="small">
                      <strong>Dates:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()} to {new Date(selectedLeave.endDate).toLocaleDateString()}
                    </div>
                    <div className="small mt-1">
                      <strong>Reason:</strong> {selectedLeave.reason}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Review Decision</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          type="radio"
                          id="approveRadio"
                          name="reviewStatus"
                          className="form-check-input"
                          checked={reviewStatus === 'APPROVED'}
                          onChange={() => setReviewStatus('APPROVED')}
                        />
                        <label htmlFor="approveRadio" className="form-check-label text-success fw-semibold">
                          Approve Request
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="radio"
                          id="rejectRadio"
                          name="reviewStatus"
                          className="form-check-input"
                          checked={reviewStatus === 'REJECTED'}
                          onChange={() => setReviewStatus('REJECTED')}
                        />
                        <label htmlFor="rejectRadio" className="form-check-label text-danger fw-semibold">
                          Reject Request
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Review Comments / Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Add an optional comment explaining the approval or rejection..."
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

export default LeaveManagementHR;
