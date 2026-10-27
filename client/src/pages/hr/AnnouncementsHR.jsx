import React, { useState, useEffect } from 'react';
import { announcementAPI } from '../../services/api';
import { Bell, Plus, Trash2, Edit, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

const AnnouncementsHR = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audience: 'ALL',
    priority: 'NORMAL'
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ title: '', content: '', audience: 'ALL', priority: 'NORMAL' });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      content: item.content,
      audience: item.audience,
      priority: item.priority
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingId) {
        await announcementAPI.update(editingId, formData);
        setSuccessMsg('Announcement updated successfully!');
      } else {
        await announcementAPI.create(formData);
        setSuccessMsg('Announcement published successfully!');
      }
      setShowModal(false);
      fetchAnnouncements();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementAPI.delete(id);
      setSuccessMsg('Announcement removed.');
      fetchAnnouncements();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-danger text-white';
      case 'HIGH': return 'bg-warning text-dark';
      case 'LOW': return 'bg-secondary text-white';
      default: return 'bg-primary text-white';
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h3 className="fw-bold mb-1">Company Announcements</h3>
          <p className="text-muted small mb-0">Publish organization broadcasts, policy updates, and team notifications.</p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary d-flex align-items-center gap-2">
          <Plus size={16} />
          <span>New Announcement</span>
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 small py-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Announcements List */}
      <div className="d-flex flex-column gap-3">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary spinner-border-sm me-2"></div>
            <span className="text-muted">Loading announcements...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="card-custom p-5 text-center text-muted">
            <Bell size={40} className="mb-2 text-muted" />
            <p className="mb-0">No announcements published yet. Click "New Announcement" to create one.</p>
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item._id} className="card-custom p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className={`badge ${getPriorityBadgeClass(item.priority)} px-2 py-1`}>
                    {item.priority}
                  </span>
                  <span className="badge bg-light text-dark border">
                    Audience: {item.audience}
                  </span>
                  <span className="text-muted small d-flex align-items-center gap-1">
                    <Calendar size={13} />
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="btn-group btn-group-sm">
                  <button onClick={() => handleOpenEdit(item)} className="btn btn-outline-secondary" title="Edit">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="btn btn-outline-danger" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h5 className="fw-bold text-dark mb-2">{item.title}</h5>
              <p className="text-muted small mb-3" style={{ whiteSpace: 'pre-line' }}>{item.content}</p>

              <div className="text-muted small border-top pt-2">
                Published by: <strong>{item.createdBy?.name || 'Administrator'}</strong>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingId ? 'Edit Announcement' : 'Create New Announcement'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Annual Company All-Hands Meeting"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Target Audience</label>
                      <select
                        className="form-select"
                        value={formData.audience}
                        onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                      >
                        <option value="ALL">Entire Company (ALL)</option>
                        <option value="HR">HR Team</option>
                        <option value="MANAGER">Managers Only</option>
                        <option value="EMPLOYEE">Employees Only</option>
                        <option value="ENGINEERING">Engineering</option>
                        <option value="SALES">Sales</option>
                        <option value="MARKETING">Marketing</option>
                        <option value="OPERATIONS">Operations</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Priority Level</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="NORMAL">Normal</option>
                        <option value="LOW">Low</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Announcement Content *</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      required
                      placeholder="Write your announcement details here..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Publishing...' : editingId ? 'Update Announcement' : 'Publish Announcement'}
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

export default AnnouncementsHR;
