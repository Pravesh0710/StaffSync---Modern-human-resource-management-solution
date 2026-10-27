import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  CalendarCheck,
  Clock,
  Bell,
  GraduationCap,
  LayoutDashboard,
  UserCheck,
  LogOut,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    switch (user.role) {
      case 'HR':
        return [
          { to: '/hr', label: 'HR Overview', icon: LayoutDashboard },
          { to: '/hr/employees', label: 'Employee Records', icon: Users },
          { to: '/hr/leaves', label: 'Leave Requests', icon: CalendarCheck },
          { to: '/hr/attendance', label: 'Attendance & Reports', icon: FileSpreadsheet },
          { to: '/hr/announcements', label: 'Announcements', icon: Bell }
        ];
      case 'MANAGER':
        return [
          { to: '/manager', label: 'Team Dashboard', icon: LayoutDashboard },
          { to: '/manager/team', label: 'Team Directory', icon: Users },
          { to: '/manager/leaves', label: 'Leave Approvals', icon: CalendarCheck },
          { to: '/manager/trainings', label: 'Trainings & Development', icon: GraduationCap }
        ];
      case 'EMPLOYEE':
      default:
        return [
          { to: '/employee', label: 'My Dashboard', icon: LayoutDashboard },
          { to: '/employee/profile', label: 'My Profile', icon: UserCheck },
          { to: '/employee/leaves', label: 'My Leaves', icon: CalendarCheck },
          { to: '/employee/attendance', label: 'My Attendance', icon: Clock },
          { to: '/employee/trainings', label: 'My Trainings', icon: GraduationCap },
          { to: '/employee/announcements', label: 'Company Updates', icon: Bell }
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <NavLink to="/" className="sidebar-logo">
          <Layers className="text-primary" size={26} />
          <span>StaffSync <span className="badge bg-primary fs-8">HRM</span></span>
        </NavLink>
      </div>

      <nav className="sidebar-nav">
        <small className="text-uppercase text-muted px-3 mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>
          {user.role} Portal
        </small>
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/hr' || link.to === '/manager' || link.to === '/employee'}
              className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2"
          style={{ fontSize: '0.9rem' }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
