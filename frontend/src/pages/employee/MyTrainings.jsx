import React, { useState, useEffect } from 'react';
import { trainingAPI } from '../../services/api';
import { GraduationCap, Calendar, CheckCircle2 } from 'lucide-react';

const MyTrainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTrainings();
  }, []);

  const fetchMyTrainings = async () => {
    try {
      setLoading(true);
      const res = await trainingAPI.getMyTrainings();
      setTrainings(res.data.data);
    } catch (err) {
      console.error('Failed to load trainings', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h3 className="fw-bold mb-1">My Training Programs</h3>
        <p className="text-muted small mb-0">Professional development curricula and technical tracks assigned to you.</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary spinner-border-sm me-2"></div>
          <span className="text-muted">Loading assigned programs...</span>
        </div>
      ) : trainings.length === 0 ? (
        <div className="card-custom p-5 text-center text-muted">
          <GraduationCap size={40} className="mb-2 text-muted" />
          <p className="mb-0">You currently have no training programs assigned.</p>
        </div>
      ) : (
        <div className="row g-3">
          {trainings.map((prog) => (
            <div key={prog._id} className="col-12 col-md-6">
              <div className="card-custom p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className={`status-badge badge-${prog.status.toLowerCase().replace('_', '-')}`}>
                      {prog.status.replace('_', ' ')}
                    </span>
                    <span className="badge bg-light text-dark border small">{prog.department}</span>
                  </div>

                  <h5 className="fw-bold text-dark mb-2">{prog.title}</h5>
                  <p className="text-muted small mb-4">{prog.description}</p>
                </div>

                <div className="border-top pt-3 small text-muted d-flex align-items-center justify-content-between">
                  <span className="d-flex align-items-center gap-1">
                    <Calendar size={13} />
                    {new Date(prog.startDate).toLocaleDateString()} - {new Date(prog.endDate).toLocaleDateString()}
                  </span>
                  <span>Assigned to you</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTrainings;
