import React, { useState, useEffect } from 'react';
import { attendanceAPI, employeeAPI } from '../../services/api';
import { Clock, Calendar, CheckCircle2, AlertCircle, Plus, Filter } from 'lucide-react';

const AttendanceReports = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Manual entry modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [manualData, setManualData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    checkIn: '',
    checkOut: '',
    workHours: 8,
    notes: 'Manually logged by HR'
  });
  const [manualLoading, setManualLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, department, statusFilter]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = {
        date: selectedDate,
        department: department || undefined,
        status: statusFilter || undefined,
        limit: 50
      };
      const res = await attendanceAPI.getAll(params);
      setRecords(res.data.data);
    } catch (err) {
      console.error('Failed to load attendance', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenManualModal = async () => {
    try {
      const res = await employeeAPI.getAll({ limit: 100, isActive: 'true' });
      setAllEmployees(res.data.data);
      if (res.data.data.length > 0) {
        setManualData((prev) => ({ ...prev, employeeId: res.data.data[0]._id }));
      }
      setShowManualModal(true);
    } catch (err) {
      alert('Failed to load employees for manual entry');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      setManualLoading(true);
      await attendanceAPI.recordManual(manualData);
      setSuccessMsg('Attendance record logged successfully!');
      setShowManualModal(false);
      fetchAttendance();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record manual attendance');
    } finally {
      setManualLoading(false);
    }
  };

  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const halfDayCount = records.filter((r) => r.status === 'HALF_DAY').length;
  const totalHours = records.reduce((acc, r) => acc + (r.workHours || 0), 0);
  const avgHours = records.length > 0 ? (totalHours / records.length).toFixed(1) : 0;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h3 className="fw-bold mb-1">Attendance & Daily Reports</h3>
          <p className="text-muted small mb-0">Track daily clock-in/out records, work hours, and workforce punctuality.</p>
        </div>
        <button onClick={handleOpenManualModal} className="btn btn-primary d-flex align-items-center gap-2">
          <Plus size={16} />
          <span>Manual Entry / Adjustment</span>
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 small py-2 mb-0">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="row g-3">
        <div className="col-6 col-lg-3">
          <div className="card-custom p-3">
            <div className="text-muted small fw-medium">Total Logged</div>
            <div className="fs-4 fw-bold">{records.length}</div>
            <div className="text-muted small">Entries recorded</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card-custom p-3">
            <div className="text-muted small fw-medium">Full Day Present</div>
            <div className="fs-4 fw-bold text-success">{presentCount}</div>
            <div className="text-muted small">Standard attendance</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card-custom p-3">
            <div className="text-muted small fw-medium">Half Day / Partial</div>
            <div className="fs-4 fw-bold text-warning">{halfDayCount}</div>
            <div className="text-muted small">&lt; 4 hours logged</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card-custom p-3">
            <div className="text-muted small fw-medium">Avg Work Hours</div>
            <div className="fs-4 fw-bold text-primary">{avgHours} hrs</div>
            <div className="text-muted small">Per logged employee</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-custom p-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white text-muted">
                <Calendar size={16} />
              </span>
              <input
                type="date"
                className="form-control border-start-0"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-4">
            <select
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <div className="col-6 col-md-4">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card-custom">
        <div className="table-responsive">
          <table className="table table-custom">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Hours</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    <span className="text-muted">Loading attendance data...</span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No attendance records for {selectedDate}.
                  </td>
                </tr>
              ) : (
                records.map((rec) => {
                  const checkInTime = rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                  const checkOutTime = rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress';

                  return (
                    <tr key={rec._id}>
                      <td>
                        <div className="fw-semibold">
                          {rec.employeeId?.firstName} {rec.employeeId?.lastName}
                        </div>
                        <div className="text-muted small">{rec.employeeId?.employeeCode}</div>
                      </td>
                      <td>
                        <span className="text-muted small">{rec.employeeId?.department}</span>
                      </td>
                      <td>
                        <span className="font-monospace small fw-semibold text-dark">{checkInTime}</span>
                      </td>
                      <td>
                        <span className="font-monospace small text-muted">{checkOutTime}</span>
                      </td>
                      <td>
                        <span className="fw-bold">{rec.workHours ? `${rec.workHours} hrs` : '—'}</span>
                      </td>
                      <td>
                        <span className={`status-badge badge-${rec.status.toLowerCase().replace('_', '-')}`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="small text-muted" style={{ maxWidth: '200px' }}>
                        {rec.notes || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Manual Attendance Entry</h5>
                <button type="button" className="btn-close" onClick={() => setShowManualModal(false)}></button>
              </div>
              <form onSubmit={handleManualSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Employee *</label>
                    <select
                      className="form-select"
                      required
                      value={manualData.employeeId}
                      onChange={(e) => setManualData({ ...manualData, employeeId: e.target.value })}
                    >
                      {allEmployees.map((e) => (
                        <option key={e._id} value={e._id}>
                          {e.firstName} {e.lastName} ({e.employeeCode}) - {e.department}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={manualData.date}
                        onChange={(e) => setManualData({ ...manualData, date: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Status *</label>
                      <select
                        className="form-select"
                        value={manualData.status}
                        onChange={(e) => setManualData({ ...manualData, status: e.target.value })}
                      >
                        <option value="PRESENT">Present</option>
                        <option value="HALF_DAY">Half Day</option>
                        <option value="ON_LEAVE">On Leave</option>
                        <option value="ABSENT">Absent</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Hours Worked</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      className="form-control"
                      value={manualData.workHours}
                      onChange={(e) => setManualData({ ...manualData, workHours: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Notes / Reason</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Excused manual punch"
                      value={manualData.notes}
                      onChange={(e) => setManualData({ ...manualData, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowManualModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={manualLoading} className="btn btn-primary">
                    {manualLoading ? 'Saving...' : 'Save Record'}
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

export default AttendanceReports;
