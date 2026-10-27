import React, { useState, useEffect } from 'react';
import { trainingAPI } from '../../services/api';
import { GraduationCap, Plus, Calendar, CheckCircle2, Edit, Trash2 } from 'lucide-react';

const TrainingManagement = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: 'Engineering',
    startDate: '',
    endDate: '',
    status: 'UPCOMING'
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const res = await trainingAPI.getAll();
      setTrainings(res.data.data);
    } catch (err) {
      console.error('Failed to load trainings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      department: 'Engineering',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'UPCOMING'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (prog) => {
    setEditingId(prog._id);
    setFormData({
      title: prog.title,
      description: prog.description,
      department: prog.department,
      startDate: new Date(prog.startDate).toISOString().split('T')[0],
      endDate: new Date(prog.endDate).toISOString().split('T')[0],
      status: prog.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingId) {
        await trainingAPI.update(editingId, formData);
        setSuccessMsg('Training program updated!');
      } else {
        await trainingAPI.create(formData);
        setSuccessMsg('Training program created!');
      }
      setShowModal(false);
      fetchTrainings();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save training program');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training program?')) return;
    try {
      await trainingAPI.delete(id);
      setSuccessMsg('Training program deleted.');
      fetchTrainings();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h3 className="fw-bold mb-1">Trainings & Development</h3>
          <p className="text-muted small mb-0">Create, assign, and track technical training tracks and professional workshops.</p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary d-flex align-items-center gap-2">
          <Plus size={16} />
          <span>New Training Program</span>
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 small py-2 mb-0">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary spinner-border-sm me-2"></div>
          <span className="text-muted">Loading trainings...</span>
        </div>
      ) : trainings.length === 0 ? (
        <div className="card-custom p-5 text-center text-muted">
          <GraduationCap size={40} className="mb-2 text-muted" />
          <p className="mb-0">No training programs created yet.</p>
        </div>
      ) : (
        <div className="row g-3">
          {trainings.map((prog) => (
            <div key={prog._id} className="col-12 col-md-6 col-xl-4">
              <div className="card-custom p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className={`status-badge badge-${prog.status.toLowerCase().replace('_', '-')}`}>
                      {prog.status.replace('_', ' ')}
                    </span>
                    <div className="btn-group btn-group-sm">
                      <button onClick={() => handleOpenEdit(prog)} className="btn btn-outline-secondary" title="Edit">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => handleDelete(prog._id)} className="btn btn-outline-danger" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h5 className="fw-bold text-dark mb-1">{prog.title}</h5>
                  <div className="text-muted small mb-3">Target: {prog.department}</div>

                  <p className="text-muted small mb-3" style={{ minHeight: '48px' }}>
                    {prog.description}
                  </p>
                </div>

                <div className="border-top pt-3 small text-muted d-flex align-items-center justify-content-between">
                  <span className="d-flex align-items-center gap-1">
                    <Calendar size={13} />
                    {new Date(prog.startDate).toLocaleDateString()} - {new Date(prog.endDate).toLocaleDateString()}
                  </span>
                  <span>{prog.assignedEmployees?.length || 0} enrolled</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingId ? 'Edit Training Program' : 'Create Training Track'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Program Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Advanced TypeScript & Clean Architecture"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Target Department</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        <option value="All">All Departments</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Sales">Sales</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Operations">Operations</option>
                        <option value="Human Resources">Human Resources</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Program Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="UPCOMING">Upcoming</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
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
                    <label className="form-label small fw-semibold">Syllabus & Objectives *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      required
                      placeholder="Outline training goals, prerequisites, and expected outcomes..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Saving...' : editingId ? 'Update Program' : 'Publish Program'}
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

export default TrainingManagement;
