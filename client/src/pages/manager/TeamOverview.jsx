import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../../services/api';
import { Users, Mail, Phone, Search, Building, UserCheck } from 'lucide-react';

const TeamOverview = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await employeeAPI.getAll({ limit: 50, search });
      setTeam(res.data.data);
    } catch (err) {
      console.error('Failed to load team', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTeam();
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Title */}
      <div>
        <h3 className="fw-bold mb-1">Team Directory</h3>
        <p className="text-muted small mb-0">Overview of engineers and team associates reporting to you.</p>
      </div>

      {/* Search */}
      <div className="card-custom p-3">
        <form onSubmit={handleSearch} className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search team member by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </div>
          </div>
        </form>
      </div>

      {/* Team Cards Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary spinner-border-sm me-2"></div>
          <span className="text-muted">Loading team members...</span>
        </div>
      ) : team.length === 0 ? (
        <div className="card-custom p-5 text-center text-muted">
          <Users size={40} className="mb-2 text-muted" />
          <p className="mb-0">No team members found.</p>
        </div>
      ) : (
        <div className="row g-3">
          {team.map((member) => (
            <div key={member._id} className="col-12 col-md-6 col-xl-4">
              <div className="card-custom p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-light text-dark border font-monospace">
                      {member.employeeCode}
                    </span>
                    <span className={`status-badge badge-${member.isActive ? 'active' : 'inactive'}`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-1">
                    {member.firstName} {member.lastName}
                  </h5>
                  <div className="text-primary small fw-semibold mb-3">{member.jobTitle}</div>

                  <div className="d-flex flex-column gap-2 small text-muted">
                    <div className="d-flex align-items-center gap-2">
                      <Building size={14} />
                      <span>{member.department}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Mail size={14} />
                      <span className="text-truncate">{member.userId?.email || 'N/A'}</span>
                    </div>
                    {member.phone && (
                      <div className="d-flex align-items-center gap-2">
                        <Phone size={14} />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-top pt-3 mt-3 text-muted small">
                  Joined: {new Date(member.dateOfJoining || member.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamOverview;
