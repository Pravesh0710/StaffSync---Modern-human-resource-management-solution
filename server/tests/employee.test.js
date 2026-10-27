const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');

describe('Employee Management & Role Permissions', () => {
  let hrToken, employeeToken, managerToken;
  let hrUser, employeeUser, managerUser;
  let testEmployee; // an Employee record we'll update in email-change tests

  beforeEach(async () => {
    // --- HR User ---
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

    // --- Regular Employee ---
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

    // Create an Employee record for the regular employee
    testEmployee = await Employee.create({
      userId: employeeUser._id,
      employeeCode: 'EMP-0001',
      firstName: 'Regular',
      lastName: 'Emp',
      department: 'Engineering',
      jobTitle: 'Developer'
    });
  });

  // ─── Original tests ───────────────────────────────────────────────────────

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

  // ─── HR Email Change tests ─────────────────────────────────────────────────

  describe('HR: change employee email', () => {
    it('HR can update an employee email successfully', async () => {
      const newEmail = 'updated.emp@company.com';

      const res = await request(app)
        .put(`/api/employees/${testEmployee._id}`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ email: newEmail });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Confirm User document was updated
      const updatedUser = await User.findById(employeeUser._id);
      expect(updatedUser.email).toBe(newEmail);
    });

    it('HR can update email and other fields together', async () => {
      const res = await request(app)
        .put(`/api/employees/${testEmployee._id}`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          email: 'combined.update@company.com',
          phone: '555-9999',
          jobTitle: 'Senior Developer'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.phone).toBe('555-9999');
      expect(res.body.data.jobTitle).toBe('Senior Developer');

      const updatedUser = await User.findById(employeeUser._id);
      expect(updatedUser.email).toBe('combined.update@company.com');
    });

    it('HR gets 409 when trying to assign an already-used email', async () => {
      // hr@example.com is already taken by hrUser
      const res = await request(app)
        .put(`/api/employees/${testEmployee._id}`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ email: 'hr@example.com' });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('HR gets 400 when providing an invalid email format', async () => {
      const res = await request(app)
        .put(`/api/employees/${testEmployee._id}`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ email: 'not-a-valid-email' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('Non-HR (Employee) cannot change another employee email', async () => {
      // Create a second employee that the regular employee tries to update
      const targetUser = await User.create({
        name: 'Target User',
        email: 'target@example.com',
        passwordHash: 'Password123!',
        role: 'EMPLOYEE'
      });
      const targetEmployee = await Employee.create({
        userId: targetUser._id,
        employeeCode: 'EMP-0002',
        firstName: 'Target',
        lastName: 'User',
        department: 'Finance',
        jobTitle: 'Analyst'
      });

      const res = await request(app)
        .put(`/api/employees/${targetEmployee._id}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ email: 'hacked@company.com' });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);

      // Verify email was NOT changed
      const unchanged = await User.findById(targetUser._id);
      expect(unchanged.email).toBe('target@example.com');
    });
  });
});
