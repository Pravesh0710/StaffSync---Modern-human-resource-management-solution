const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const Attendance = require('../src/models/Attendance');

describe('Attendance Workflow & Calculations', () => {
  let employeeToken, employeeUser, empProfile;

  beforeEach(async () => {
    employeeUser = await User.create({
      name: 'Attendance Tester',
      email: 'attendance.tester@example.com',
      passwordHash: 'Password123!',
      role: 'EMPLOYEE'
    });

    empProfile = await Employee.create({
      userId: employeeUser._id,
      employeeCode: 'EMP-ATT-01',
      firstName: 'Attendance',
      lastName: 'Tester',
      department: 'QA',
      jobTitle: 'QA Engineer'
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'attendance.tester@example.com', password: 'Password123!' });
    employeeToken = loginRes.body.token;
  });

  it('Employee should be able to check in', async () => {
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ notes: 'Arrived at desk' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.checkIn).toBeDefined();
    expect(res.body.data.status).toBe('PRESENT');
  });

  it('Employee should not be allowed duplicate check-in on same day', async () => {
    // Check in first
    await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${employeeToken}`);

    // Attempt second check in
    const secondRes = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(secondRes.statusCode).toBe(400);
    expect(secondRes.body.success).toBe(false);
  });

  it('Employee should check out and compute work hours', async () => {
    // Check in
    await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${employeeToken}`);

    // Check out
    const checkoutRes = await request(app)
      .post('/api/attendance/check-out')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ notes: 'Leaving for the day' });

    expect(checkoutRes.statusCode).toBe(200);
    expect(checkoutRes.body.success).toBe(true);
    expect(checkoutRes.body.data.checkOut).toBeDefined();
    expect(checkoutRes.body.data.workHours).toBeDefined();
  });
});
