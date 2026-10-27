import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// HR Pages
import HRDashboard from './pages/hr/HRDashboard';
import EmployeeManagement from './pages/hr/EmployeeManagement';
import LeaveManagementHR from './pages/hr/LeaveManagementHR';
import AttendanceReports from './pages/hr/AttendanceReports';
import AnnouncementsHR from './pages/hr/AnnouncementsHR';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import TeamOverview from './pages/manager/TeamOverview';
import TeamLeaveApprovals from './pages/manager/TeamLeaveApprovals';
import TrainingManagement from './pages/manager/TrainingManagement';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyProfile from './pages/employee/MyProfile';
import MyLeaves from './pages/employee/MyLeaves';
import MyAttendance from './pages/employee/MyAttendance';
import MyAnnouncements from './pages/employee/MyAnnouncements';
import MyTrainings from './pages/employee/MyTrainings';

// Common Dashboard Layout Wrapper with Sidebar & Navbar
const DashboardLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="content-body">{children}</main>
      </div>
    </div>
  );
};

// Index root redirection based on authenticated user role
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'HR') return <Navigate to="/hr" replace />;
  if (user.role === 'MANAGER') return <Navigate to="/manager" replace />;
  return <Navigate to="/employee" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* HR Administration Portal */}
          <Route
            path="/hr"
            element={
              <ProtectedRoute allowedRoles={['HR']}>
                <DashboardLayout>
                  <HRDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/employees"
            element={
              <ProtectedRoute allowedRoles={['HR']}>
                <DashboardLayout>
                  <EmployeeManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/leaves"
            element={
              <ProtectedRoute allowedRoles={['HR']}>
                <DashboardLayout>
                  <LeaveManagementHR />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/attendance"
            element={
              <ProtectedRoute allowedRoles={['HR']}>
                <DashboardLayout>
                  <AttendanceReports />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/announcements"
            element={
              <ProtectedRoute allowedRoles={['HR']}>
                <DashboardLayout>
                  <AnnouncementsHR />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Manager Portal */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'HR']}>
                <DashboardLayout>
                  <ManagerDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/team"
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'HR']}>
                <DashboardLayout>
                  <TeamOverview />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/leaves"
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'HR']}>
                <DashboardLayout>
                  <TeamLeaveApprovals />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/trainings"
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'HR']}>
                <DashboardLayout>
                  <TrainingManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Employee Self-Service Portal */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'HR']}>
                <DashboardLayout>
                  <EmployeeDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'HR']}>
                <DashboardLayout>
                  <MyProfile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/leaves"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'HR']}>
                <DashboardLayout>
                  <MyLeaves />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/attendance"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'HR']}>
                <DashboardLayout>
                  <MyAttendance />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/announcements"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'HR']}>
                <DashboardLayout>
                  <MyAnnouncements />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/trainings"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'HR']}>
                <DashboardLayout>
                  <MyTrainings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
