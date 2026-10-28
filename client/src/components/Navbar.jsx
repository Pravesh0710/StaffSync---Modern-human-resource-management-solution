import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { User, Calendar, Bell, Check, Clock, ExternalLink } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getMyNotifications();
      if (res.data.success) {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds for new notifications
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, link) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (link) {
        setIsOpen(false);
        navigate(link);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        <span className="text-muted d-flex align-items-center gap-2 small">
          <Calendar size={16} />
          {todayStr}
        </span>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="position-relative" ref={dropdownRef}>
          <button
            type="button"
            className="btn btn-light rounded-circle position-relative p-2 border d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px' }}
            onClick={() => setIsOpen(!isOpen)}
            title="Notifications"
          >
            <Bell size={18} className="text-secondary" />
            {unreadCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light"
                style={{ fontSize: '0.65rem' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div
              className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border overflow-hidden"
              style={{ width: '340px', zIndex: 1050, maxHeight: '420px', display: 'flex', flexDirection: 'column' }}
            >
              <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
                <span className="fw-semibold fs-6">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-sm btn-link text-decoration-none p-0 text-primary small"
                    onClick={handleMarkAllAsRead}
                    disabled={loading}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="overflow-auto flex-grow-1" style={{ maxHeight: '320px' }}>
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-muted small">
                    <Bell size={28} className="text-muted mb-2 opacity-50" />
                    <div>No notifications yet</div>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`p-3 border-bottom small position-relative ${!notif.isRead ? 'bg-primary-subtle' : 'bg-white'}`}
                      style={{ cursor: notif.link ? 'pointer' : 'default', transition: 'background-color 0.15s' }}
                      onClick={() => handleMarkAsRead(notif._id, notif.link)}
                    >
                      <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
                        <strong className="text-dark d-block" style={{ fontSize: '0.85rem' }}>
                          {notif.title}
                        </strong>
                        {!notif.isRead && (
                          <span className="badge bg-primary rounded-pill" style={{ fontSize: '0.6rem' }}>
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-muted mb-1" style={{ fontSize: '0.8rem', lineHeight: '1.3' }}>
                        {notif.message}
                      </p>
                      <div className="d-flex align-items-center justify-content-between text-muted" style={{ fontSize: '0.7rem' }}>
                        <span className="d-flex align-items-center gap-1">
                          <Clock size={12} />
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {notif.link && (
                          <span className="text-primary d-flex align-items-center gap-1">
                            View <ExternalLink size={10} />
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-end d-none d-sm-block">
          <div className="fw-semibold text-dark fs-6">{user.name}</div>
          <div className="text-muted small">{user.email}</div>
        </div>

        <span className={`role-pill ${user.role}`}>
          {user.role}
        </span>

        <div
          className="rounded-circle bg-light d-flex align-items-center justify-content-center text-primary border"
          style={{ width: '40px', height: '40px' }}
        >
          <User size={20} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
