const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');

describe('Employee Management & Role Permissions', () => {
  let hrToken, employeeToken, hrUser, employeeUser;

  beforeEach(async () => {
    // Create HR User
    hrUser = await User.create({
      name: 'HR Admin',
      email: 'hr@example.com',
      passwordHash: 'Password123!',
      role: 'HR'
    });

    const hrLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'hr@example.com', password: 'Password123!' });
    hrToken = hrLogin.body.token;

    // Create Regular Employee
    employeeUser = await User.create({
      name: 'Regular Emp',
      email: 'emp@example.com',
      passwordHash: 'Password123!',
      role: 'EMPLOYEE'
    });

    const empLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'emp@example.com', password: 'Password123!' });
    employeeToken = empLogin.body.token;
  });

  it('HR should create an employee record successfully', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        department: 'Engineering',
        jobTitle: 'Developer'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.firstName).toBe('John');
    expect(res.body.data.employeeCode).toBeDefined();
  });

  it('Regular employee should be forbidden from creating employee records', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        firstName: 'Hacker',
        lastName: 'User',
        email: 'hacker@company.com',
        department: 'Engineering',
        jobTitle: 'Developer'
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('HR should retrieve list of employees', async () => {
    // Create an employee first
    await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        firstName: 'Sam',
        lastName: 'Wilson',
        email: 'sam.wilson@company.com',
        department: 'Operations',
        jobTitle: 'Operations Analyst'
      });

    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${hrToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('Regular employee should be forbidden from viewing full employee directory', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(403);
  });
});
