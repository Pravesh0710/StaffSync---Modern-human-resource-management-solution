import React, { useState, useEffect } from 'react';
import { announcementAPI } from '../../services/api';
import { Bell, Calendar, User } from 'lucide-react';

const MyAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementAPI.getAll();
      setAnnouncements(res.data.data);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-danger text-white';
      case 'HIGH': return 'bg-warning text-dark';
      case 'LOW': return 'bg-secondary text-white';
      default: return 'bg-primary text-white';
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h3 className="fw-bold mb-1">Company Announcements</h3>
        <p className="text-muted small mb-0">Official internal broadcasts, company updates, and policy notices.</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary spinner-border-sm me-2"></div>
          <span className="text-muted">Loading announcements...</span>
        </div>
      ) : announcements.length === 0 ? (
        <div className="card-custom p-5 text-center text-muted">
          <Bell size={40} className="mb-2 text-muted" />
          <p className="mb-0">No active announcements at this time.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {announcements.map((item) => (
            <div key={item._id} className="card-custom p-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className={`badge ${getPriorityBadge(item.priority)} px-2 py-1 small`}>
                  {item.priority}
                </span>
                <span className="text-muted small d-flex align-items-center gap-1">
                  <Calendar size={13} />
                  {new Date(item.publishedAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <h5 className="fw-bold text-dark mb-2">{item.title}</h5>
              <p className="text-muted small mb-3" style={{ whiteSpace: 'pre-line' }}>{item.content}</p>

              <div className="text-muted small border-top pt-2 d-flex align-items-center gap-1">
                <User size={13} />
                <span>Posted by: {item.createdBy?.name || 'HR Management'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAnnouncements;
