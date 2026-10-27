import React, { useState, useEffect } from 'react';
import { reportAPI } from '../../services/api';
import { Users, CalendarCheck, Clock, GraduationCap, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getManagerMetrics();
      setMetrics(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load manager metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading manager portal...</span>
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
          <h3 className="fw-bold mb-1">Manager Overview</h3>
          <p className="text-muted small mb-0">Monitor team capacity, review leave submissions, and track skill development programs.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/manager/leaves" className="btn btn-primary d-flex align-items-center gap-2">
            <CalendarCheck size={16} />
            <span>Review Team Leaves</span>
          </Link>
          <Link to="/manager/trainings" className="btn btn-outline-secondary d-flex align-items-center gap-2">
            <GraduationCap size={16} />
            <span>Manage Trainings</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-custom p-3 d-flex align-items-center gap-3">
            <div className="stat-icon bg-primary bg-opacity-10 text-primary">
              <Users size={24} />
            </div>
            <div>
              <div className="text-muted small fw-medium">Team Members</div>
              <div className="fs-4 fw-bold">{metrics?.teamSize || 0}</div>
              <div className="text-muted small">Assigned team</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-custom p-3 d-flex align-items-center gap-3">
            <div className="stat-icon bg-warning bg-opacity-10 text-warning">
              <CalendarCheck size={24} />
            </div>
            <div>
              <div className="text-muted small fw-medium">Pending Approvals</div>
              <div className="fs-4 fw-bold">{metrics?.pendingLeaves || 0}</div>
              <div className="text-muted small">Requires your action</div>
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
              <div className="fs-4 fw-bold">{metrics?.checkedInToday || 0}</div>
              <div className="text-muted small">Present today</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card-custom p-3 d-flex align-items-center gap-3">
            <div className="stat-icon bg-info bg-opacity-10 text-info">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="text-muted small fw-medium">Active Trainings</div>
              <div className="fs-4 fw-bold">{metrics?.activeTrainings || 0}</div>
              <div className="text-muted small">Programs in progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Roster Overview */}
      <div className="card-custom p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <Users size={20} className="text-primary" />
            <span>Direct Team Members</span>
          </h5>
          <Link to="/manager/team" className="small text-primary text-decoration-none fw-semibold d-flex align-items-center">
            <span>View team directory</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {metrics?.teamMembers && metrics.teamMembers.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-custom">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Member Name</th>
                  <th>Job Title</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.teamMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <span className="badge bg-light text-dark border font-monospace">
                        {member.employeeCode}
                      </span>
                    </td>
                    <td className="fw-semibold text-dark">{member.name}</td>
                    <td>{member.jobTitle}</td>
                    <td className="text-muted small">{member.department}</td>
                    <td>
                      <span className={`status-badge badge-${member.isActive ? 'active' : 'inactive'}`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted small mb-0">No team members assigned under your reporting line yet.</p>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
