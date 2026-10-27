const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const LeaveRequest = require('../src/models/LeaveRequest');

describe('Leave Request Management Workflow', () => {
  let employeeToken, hrToken, managerToken, empProfile, managerProfile;

  beforeEach(async () => {
    // 1. HR
    await User.create({
      name: 'HR Admin',
      email: 'hr@example.com',
      passwordHash: 'Password123!',
      role: 'HR'
    });
    const hrLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'hr@example.com', password: 'Password123!' });
    hrToken = hrLogin.body.token;

    // 2. Manager
    const mgrUser = await User.create({
      name: 'Manager Bob',
      email: 'manager@example.com',
      passwordHash: 'Password123!',
      role: 'MANAGER'
    });
    managerProfile = await Employee.create({
      userId: mgrUser._id,
      employeeCode: 'MGR-001',
      firstName: 'Bob',
      lastName: 'Manager',
      department: 'Engineering',
      jobTitle: 'Engineering Lead'
    });
    const mgrLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@example.com', password: 'Password123!' });
    managerToken = mgrLogin.body.token;

    // 3. Employee
    const empUser = await User.create({
      name: 'Employee Alice',
      email: 'alice@example.com',
      passwordHash: 'Password123!',
      role: 'EMPLOYEE'
    });
    empProfile = await Employee.create({
      userId: empUser._id,
      employeeCode: 'EMP-001',
      firstName: 'Alice',
      lastName: 'Employee',
      department: 'Engineering',
      jobTitle: 'Junior Dev',
      managerId: managerProfile._id
    });
    const empLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'Password123!' });
    employeeToken = empLogin.body.token;
  });

  it('Employee should submit a leave request successfully', async () => {
    const res = await request(app)
      .post('/api/leaves')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        leaveType: 'ANNUAL',
        startDate: '2026-11-01',
        endDate: '2026-11-05',
        reason: 'Vacation'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PENDING');
  });

  it('Should reject leave when end date is earlier than start date', async () => {
    const res = await request(app)
      .post('/api/leaves')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        leaveType: 'ANNUAL',
        startDate: '2026-11-10',
        endDate: '2026-11-05',
        reason: 'Time travel vacation'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('Manager should review and approve team leave request', async () => {
    // Submit leave request
    const applyRes = await request(app)
      .post('/api/leaves')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        leaveType: 'SICK',
        startDate: '2026-11-01',
        endDate: '2026-11-02',
        reason: 'Flu'
      });

    const leaveId = applyRes.body.data._id;

    // Manager approves
    const reviewRes = await request(app)
      .patch(`/api/leaves/${leaveId}/review`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        status: 'APPROVED',
        reviewComments: 'Take rest and recover'
      });

    expect(reviewRes.statusCode).toBe(200);
    expect(reviewRes.body.success).toBe(true);
    expect(reviewRes.body.data.status).toBe('APPROVED');
  });
});
