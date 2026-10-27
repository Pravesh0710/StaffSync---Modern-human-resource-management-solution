import React, { useState, useEffect } from 'react';
import { reportAPI } from '../../services/api';
import { Users, CalendarCheck, Clock, Building, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HRDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getHRMetrics();
      setMetrics(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load HR metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading metrics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2">
        <AlertCircle size={18} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h3 className="fw-bold mb-1">HR Administration Dashboard</h3>
          <p className="text-muted small mb-0">Overview of organizational workforce, attendance, and leave requests.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/hr/employees" className="btn btn-primary d-flex align-items-center gap-2">
            <Users size={16} />
            <span>Manage Employees</span>
          </Link>
          <Link to="/hr/leaves" className="btn btn-outline-secondary d-flex align-items-center gap-2">
            <CalendarCheck size={16} />
            <span>Review Leaves</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-custom p-3 d-flex align-items-center gap-3">
            <div className="stat-icon bg-primary bg-opacity-10 text-primary">
              <Users size={24} />
            </div>
            <div>
              <div className="text-muted small fw-medium">Total Employees</div>
              <div className="fs-4 fw-bold">{metrics?.totalEmployees || 0}</div>
              <div className="text-success small fw-medium">{metrics?.activeEmployees || 0} Active</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-custom p-3 d-flex align-items-center gap-3">
            <div className="stat-icon bg-warning bg-opacity-10 text-warning">
              <CalendarCheck size={24} />
            </div>
            <div>
              <div className="text-muted small fw-medium">Pending Leaves</div>
              <div className="fs-4 fw-bold">{metrics?.pendingLeaves || 0}</div>
              <div className="text-muted small">Awaiting review</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-custom p-3 d-flex align-items-center gap-3">
            <div className="stat-icon bg-success bg-opacity-10 text-success">
              <Clock size={24} />
            </div>
            <div>
              <div className="text-muted small fw-medium">Checked In Today</div>
              <div className="fs-4 fw-bold">{metrics?.attendance?.totalCheckedIn || 0}</div>
              <div className="text-muted small">{metrics?.attendance?.attendanceRate || 0}% workforce</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-custom p-3 d-flex align-items-center gap-3">
            <div className="stat-icon bg-info bg-opacity-10 text-info">
              <Building size={24} />
            </div>
            <div>
              <div className="text-muted small fw-medium">Departments</div>
              <div className="fs-4 fw-bold">{metrics?.departments?.length || 0}</div>
              <div className="text-muted small">Active divisions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Department Distribution & Recent Leaves */}
      <div className="row g-4">
        {/* Department Breakdown */}
        <div className="col-12 col-lg-5">
          <div className="card-custom h-100 p-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Building size={20} className="text-primary" />
              <span>Department Distribution</span>
            </h5>
            {metrics?.departments && metrics.departments.length > 0 ? (
              <div className="d-flex flex-column gap-3 mt-3">
                {metrics.departments.map((dept) => {
                  const pct = metrics.totalEmployees > 0
                    ? Math.round((dept.count / metrics.totalEmployees) * 100)
                    : 0;
                  return (
                    <div key={dept.department}>
                      <div className="d-flex justify-content-between small fw-medium mb-1">
                        <span>{dept.department}</span>
                        <span className="text-muted">{dept.count} members ({pct}%)</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: `${pct}%` }}
                          aria-valuenow={pct}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted small">No department data recorded yet.</p>
            )}
          </div>
        </div>

        {/* Recent Leave Applications */}
        <div className="col-12 col-lg-7">
          <div className="card-custom h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <CalendarCheck size={20} className="text-warning" />
                <span>Recent Leave Applications</span>
              </h5>
              <Link to="/hr/leaves" className="small text-primary text-decoration-none fw-semibold d-flex align-items-center">
                <span>View all</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {metrics?.recentLeaves && metrics.recentLeaves.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-custom">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.recentLeaves.map((leave) => (
                      <tr key={leave._id}>
                        <td>
                          <div className="fw-semibold">
                            {leave.employeeId?.firstName} {leave.employeeId?.lastName}
                          </div>
                          <div className="text-muted small">{leave.employeeId?.department}</div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">{leave.leaveType}</span>
                        </td>
                        <td className="small">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td>
                          <span className={`status-badge badge-${leave.status.toLowerCase().replace('_', '-')}`}>
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted small">No recent leave requests found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
