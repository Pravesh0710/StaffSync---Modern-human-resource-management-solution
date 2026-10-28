import axios from 'axios';

// Normalize API URL: supports VITE_API_URL, VITE_API_BASE_URL, or local fallback /api
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '/api';
  // If the user provided root domain e.g. "https://staffsync-api.onrender.com", append "/api"
  const cleanUrl = envUrl.trim().replace(/\/$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staffsync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s and format errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if session expired
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('staffsync_token');
        localStorage.removeItem('staffsync_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data)
};

// Employee API
export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  toggleStatus: (id) => api.patch(`/employees/${id}/toggle-status`),
  delete: (id) => api.delete(`/employees/${id}`)
};

// Leave Management API
export const leaveAPI = {
  apply: (data) => api.post('/leaves', data),
  getMyLeaves: (params) => api.get('/leaves/my-leaves', { params }),
  getAll: (params) => api.get('/leaves', { params }),
  review: (id, data) => api.patch(`/leaves/${id}/review`, data),
  cancel: (id) => api.delete(`/leaves/${id}`)
};

// Attendance API
export const attendanceAPI = {
  checkIn: (data) => api.post('/attendance/check-in', data || {}),
  checkOut: (data) => api.post('/attendance/check-out', data || {}),
  getToday: () => api.get('/attendance/today'),
  getMyHistory: (params) => api.get('/attendance/my-history', { params }),
  getAll: (params) => api.get('/attendance', { params }),
  recordManual: (data) => api.post('/attendance/manual', data)
};

// Announcements API
export const announcementAPI = {
  getAll: (params) => api.get('/announcements', { params }),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`)
};

// Training & Development API
export const trainingAPI = {
  getMyTrainings: () => api.get('/trainings/my-trainings'),
  getAll: (params) => api.get('/trainings', { params }),
  create: (data) => api.post('/trainings', data),
  update: (id, data) => api.put(`/trainings/${id}`, data),
  delete: (id) => api.delete(`/trainings/${id}`)
};

// Reporting & Analytics API
export const reportAPI = {
  getHRMetrics: () => api.get('/reports/hr-metrics'),
  getManagerMetrics: () => api.get('/reports/manager-metrics'),
  getAttendanceReport: (params) => api.get('/reports/attendance-report', { params })
};

// Notifications API
export const notificationAPI = {
  getMyNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all')
};

export default api;
