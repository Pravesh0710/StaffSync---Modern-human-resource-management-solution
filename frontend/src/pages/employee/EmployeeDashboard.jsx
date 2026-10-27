import React, { useState, useEffect } from 'react';
import { attendanceAPI, leaveAPI, announcementAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Clock, CalendarCheck, Bell, CheckCircle2, ArrowRight, AlertCircle, LogIn, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);
  const [punchMsg, setPunchMsg] = useState('');
  const [punchError, setPunchError] = useState('');

  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live digital clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchTodayAttendance();
    fetchRecentAnnouncements();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      setLoadingAttendance(true);
      const res = await attendanceAPI.getToday();
      setTodayAttendance(res.data.data);
    } catch (err) {
      console.error('Failed to load today attendance', err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const fetchRecentAnnouncements = async () => {
    try {
      const res = await announcementAPI.getAll({ limit: 3 });
      setRecentAnnouncements(res.data.data);
    } catch (err) {
      console.error('Failed to load announcements', err);
    }
  };

  const handleCheckIn = async () => {
    setPunchError('');
    setPunchMsg('');
    try {
      setPunchLoading(true);
      const res = await attendanceAPI.checkIn({ notes: 'Employee portal check-in' });
      setPunchMsg(res.data.message);
      fetchTodayAttendance();
      setTimeout(() => setPunchMsg(''), 5000);
    } catch (err) {
      setPunchError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setPunchLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setPunchError('');
    setPunchMsg('');
    try {
      setPunchLoading(true);
      const res = await attendanceAPI.checkOut({ notes: 'Employee portal check-out' });
      setPunchMsg(res.data.message);
      fetchTodayAttendance();
      setTimeout(() => setPunchMsg(''), 5000);
    } catch (err) {
      setPunchError(err.response?.data?.message || 'Check-out failed');
    } finally {
      setPunchLoading(false);
    }
  };

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const hasCheckedIn = todayAttendance && todayAttendance.checkIn;
  const hasCheckedOut = todayAttendance && todayAttendance.checkOut;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Welcome Banner */}
      <div>
        <h3 className="fw-bold mb-1">Welcome back, {user?.name}!</h3>
        <p className="text-muted small mb-0">StaffSync Employee Self-Service Workspace.</p>
      </div>

      {punchMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 small py-2 mb-0">
          <CheckCircle2 size={16} />
          <span>{punchMsg}</span>
        </div>
      )}

      {punchError && (
        <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-0">
          <AlertCircle size={16} />
          <span>{punchError}</span>
        </div>
      )}

      {/* Main Punch Clock & Quick Actions Row */}
      <div className="row g-4">
        {/* Attendance Punch Card */}
        <div className="col-12 col-lg-6">
          <div className="punch-card h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.08em' }}>
                  Daily Attendance Tracker
                </span>
                <span className={`badge ${hasCheckedIn ? 'bg-success' : 'bg-secondary'}`}>
                  {hasCheckedIn ? (hasCheckedOut ? 'Completed' : 'Shift Active') : 'Not Checked In'}
                </span>
              </div>

              <div className="live-clock text-white mt-1 mb-1">{timeString}</div>
              <div className="text-muted small mb-4">{dateString}</div>

              {/* Status details */}
              <div className="p-3 rounded-3 mb-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                <div className="row g-2 text-center">
                  <div className="col-6 border-end border-secondary border-opacity-25">
                    <small className="text-muted d-block">Clock In</small>
                    <span className="fw-bold fs-6">
                      {hasCheckedIn
                        ? new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Clock Out</small>
                    <span className="fw-bold fs-6">
                      {hasCheckedOut
                        ? new Date(todayAttendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-2">
              {!hasCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  disabled={punchLoading}
                  className="btn btn-success flex-1 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                >
                  <LogIn size={18} />
                  <span>{punchLoading ? 'Recording...' : 'Punch In (Start Shift)'}</span>
                </button>
              ) : !hasCheckedOut ? (
                <button
                  onClick={handleCheckOut}
                  disabled={punchLoading}
                  className="btn btn-danger flex-1 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                >
                  <LogOut size={18} />
                  <span>{punchLoading ? 'Recording...' : 'Punch Out (End Shift)'}</span>
                </button>
              ) : (
                <div className="btn btn-secondary flex-1 py-2 text-center disabled">
                  Attendance Completed ({todayAttendance.workHours} hrs logged)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links & Shortcuts */}
        <div className="col-12 col-lg-6">
          <div className="row g-3 h-100">
            <div className="col-12 col-sm-6">
              <Link to="/employee/leaves" className="text-decoration-none">
                <div className="card-custom p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="stat-icon bg-warning bg-opacity-10 text-warning mb-3">
                      <CalendarCheck size={24} />
                    </div>
                    <h6 className="fw-bold text-dark mb-1">Time Off & Leaves</h6>
                    <p className="text-muted small mb-0">Apply for annual, sick, or casual leaves and track review status.</p>
                  </div>
                  <span className="small text-primary fw-semibold mt-3 d-flex align-items-center gap-1">
                    <span>Manage Leaves</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </div>

            <div className="col-12 col-sm-6">
              <Link to="/employee/attendance" className="text-decoration-none">
                <div className="card-custom p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="stat-icon bg-primary bg-opacity-10 text-primary mb-3">
                      <Clock size={24} />
                    </div>
                    <h6 className="fw-bold text-dark mb-1">Attendance History</h6>
                    <p className="text-muted small mb-0">Review monthly timesheets, check-in logs, and total hours.</p>
                  </div>
                  <span className="small text-primary fw-semibold mt-3 d-flex align-items-center gap-1">
                    <span>View Timesheets</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </div>

            <div className="col-12 col-sm-6">
              <Link to="/employee/profile" className="text-decoration-none">
                <div className="card-custom p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="stat-icon bg-success bg-opacity-10 text-success mb-3">
                      <CheckCircle2 size={24} />
                    </div>
                    <h6 className="fw-bold text-dark mb-1">Personal Profile</h6>
                    <p className="text-muted small mb-0">Update permitted personal details, phone, and emergency contact.</p>
                  </div>
                  <span className="small text-primary fw-semibold mt-3 d-flex align-items-center gap-1">
                    <span>Edit Profile</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </div>

            <div className="col-12 col-sm-6">
              <Link to="/employee/trainings" className="text-decoration-none">
                <div className="card-custom p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="stat-icon bg-info bg-opacity-10 text-info mb-3">
                      <Bell size={24} />
                    </div>
                    <h6 className="fw-bold text-dark mb-1">Trainings & Upskilling</h6>
                    <p className="text-muted small mb-0">View assigned training programs and track development milestones.</p>
                  </div>
                  <span className="small text-primary fw-semibold mt-3 d-flex align-items-center gap-1">
                    <span>Explore Tracks</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="card-custom p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <Bell size={18} className="text-primary" />
            <span>Company Announcements</span>
          </h5>
          <Link to="/employee/announcements" className="small text-primary text-decoration-none fw-semibold">
            View all updates
          </Link>
        </div>

        {recentAnnouncements.length === 0 ? (
          <p className="text-muted small mb-0">No active announcements at this time.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {recentAnnouncements.map((ann) => (
              <div key={ann._id} className="p-3 bg-light rounded-3 border">
                <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                  <h6 className="fw-bold text-dark mb-0">{ann.title}</h6>
                  <span className="badge bg-primary-subtle text-primary border small">
                    {ann.priority}
                  </span>
                </div>
                <p className="text-muted small mb-1">{ann.content}</p>
                <small className="text-muted">
                  {new Date(ann.publishedAt).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
