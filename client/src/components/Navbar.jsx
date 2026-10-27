import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Calendar } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();

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
