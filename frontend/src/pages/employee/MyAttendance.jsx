import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../../services/api';
import { Clock, Calendar, Filter, CheckCircle2 } from 'lucide-react';

const MyAttendance = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [startDate, endDate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: 31
      };
      const res = await attendanceAPI.getMyHistory(params);
      setHistory(res.data.data);
    } catch (err) {
      console.error('Failed to load attendance history', err);
    } finally {
      setLoading(false);
    }
  };

  const totalHours = history.reduce((sum, h) => sum + (h.workHours || 0), 0);
  const daysPresent = history.filter((h) => h.status === 'PRESENT' || h.status === 'HALF_DAY').length;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Title */}
      <div>
        <h3 className="fw-bold mb-1">My Attendance History</h3>
        <p className="text-muted small mb-0">Review your daily punch records, hours worked, and monthly attendance timeline.</p>
      </div>

      {/* Stats Summary */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card-custom p-3">
            <div className="text-muted small fw-medium">Days Attended</div>
            <div className="fs-4 fw-bold text-success">{daysPresent} days</div>
            <div className="text-muted small">In displayed period</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <div className="card-custom p-3">
            <div className="text-muted small fw-medium">Total Work Hours</div>
            <div className="fs-4 fw-bold text-primary">{totalHours.toFixed(1)} hrs</div>
            <div className="text-muted small">Cumulative logged time</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <div className="card-custom p-3">
            <div className="text-muted small fw-medium">Average Daily Hours</div>
            <div className="fs-4 fw-bold">{daysPresent > 0 ? (totalHours / daysPresent).toFixed(1) : 0} hrs/day</div>
            <div className="text-muted small">Average shift length</div>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="card-custom p-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <label className="form-label small fw-semibold text-muted mb-1">From Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-5">
            <label className="form-label small fw-semibold text-muted mb-1">To Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-2 d-flex align-items-end">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="btn btn-outline-secondary w-100"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card-custom">
        <div className="table-responsive">
          <table className="table table-custom">
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Hours Worked</th>
                <th>Status</th>
                <th>Shift Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                    <span className="text-muted">Loading attendance history...</span>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No attendance records logged for the selected period.
                  </td>
                </tr>
              ) : (
                history.map((record) => {
                  const dateStr = new Date(record.date).toLocaleDateString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  const checkInStr = record.checkIn
                    ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '—';

                  const checkOutStr = record.checkOut
                    ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'In Progress';

                  return (
                    <tr key={record._id}>
                      <td className="fw-semibold text-dark">{dateStr}</td>
                      <td>
                        <span className="font-monospace small">{checkInStr}</span>
                      </td>
                      <td>
                        <span className="font-monospace small text-muted">{checkOutStr}</span>
                      </td>
                      <td>
                        <span className="fw-bold">{record.workHours ? `${record.workHours} hrs` : '—'}</span>
                      </td>
                      <td>
                        <span className={`status-badge badge-${record.status.toLowerCase().replace('_', '-')}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="small text-muted">{record.notes || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;
