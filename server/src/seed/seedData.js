require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Employee = require('../models/Employee');
const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const TrainingProgram = require('../models/TrainingProgram');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staffsync';
    console.log(`[Seed] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB.');

    // Clear existing collections
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      LeaveRequest.deleteMany({}),
      Attendance.deleteMany({}),
      Announcement.deleteMany({}),
      TrainingProgram.deleteMany({})
    ]);

    const defaultPassword = 'Password123!';

    // 1. Create Users
    console.log('[Seed] Creating demo users...');
    const hrUser = await User.create({
      name: 'Sarah Connor',
      email: 'hr@staffsync.com',
      passwordHash: defaultPassword,
      role: 'HR',
      isActive: true
    });

    const managerUser = await User.create({
      name: 'Michael Scott',
      email: 'manager@staffsync.com',
      passwordHash: defaultPassword,
      role: 'MANAGER',
      isActive: true
    });

    const empUser1 = await User.create({
      name: 'Jim Halpert',
      email: 'employee@staffsync.com',
      passwordHash: defaultPassword,
      role: 'EMPLOYEE',
      isActive: true
    });

    const empUser2 = await User.create({
      name: 'Pam Beesly',
      email: 'pam@staffsync.com',
      passwordHash: defaultPassword,
      role: 'EMPLOYEE',
      isActive: true
    });

    const empUser3 = await User.create({
      name: 'Dwight Schrute',
      email: 'dwight@staffsync.com',
      passwordHash: defaultPassword,
      role: 'EMPLOYEE',
      isActive: true
    });

    // 2. Create Employee Profiles
    console.log('[Seed] Creating employee profiles...');
    const hrEmp = await Employee.create({
      userId: hrUser._id,
      employeeCode: 'EMP-0001',
      firstName: 'Sarah',
      lastName: 'Connor',
      department: 'Human Resources',
      jobTitle: 'Head of People & Culture',
      phone: '+1 (555) 234-5678',
      dateOfJoining: new Date('2022-01-15'),
      address: {
        street: '100 Cyberdyne Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      },
      emergencyContact: {
        name: 'John Connor',
        relationship: 'Son',
        phone: '+1 (555) 999-1234'
      },
      isActive: true
    });

    const mgrEmp = await Employee.create({
      userId: managerUser._id,
      employeeCode: 'EMP-0002',
      firstName: 'Michael',
      lastName: 'Scott',
      department: 'Engineering',
      jobTitle: 'Engineering Manager',
      phone: '+1 (555) 345-6789',
      dateOfJoining: new Date('2022-03-01'),
      address: {
        street: '1725 Slough Avenue',
        city: 'Scranton',
        state: 'PA',
        zipCode: '18503',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Jan Levinson',
        relationship: 'Partner',
        phone: '+1 (555) 888-2345'
      },
      isActive: true
    });

    const emp1 = await Employee.create({
      userId: empUser1._id,
      employeeCode: 'EMP-0003',
      firstName: 'Jim',
      lastName: 'Halpert',
      department: 'Engineering',
      jobTitle: 'Senior Full Stack Developer',
      managerId: mgrEmp._id,
      phone: '+1 (555) 456-7890',
      dateOfJoining: new Date('2023-01-10'),
      address: {
        street: '42 Main St',
        city: 'Scranton',
        state: 'PA',
        zipCode: '18503',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Pam Beesly',
        relationship: 'Spouse',
        phone: '+1 (555) 567-8901'
      },
      isActive: true
    });

    const emp2 = await Employee.create({
      userId: empUser2._id,
      employeeCode: 'EMP-0004',
      firstName: 'Pam',
      lastName: 'Beesly',
      department: 'Engineering',
      jobTitle: 'UI/UX Designer',
      managerId: mgrEmp._id,
      phone: '+1 (555) 567-8901',
      dateOfJoining: new Date('2023-04-18'),
      address: {
        street: '42 Main St',
        city: 'Scranton',
        state: 'PA',
        zipCode: '18503',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Jim Halpert',
        relationship: 'Spouse',
        phone: '+1 (555) 456-7890'
      },
      isActive: true
    });

    const emp3 = await Employee.create({
      userId: empUser3._id,
      employeeCode: 'EMP-0005',
      firstName: 'Dwight',
      lastName: 'Schrute',
      department: 'Sales',
      jobTitle: 'Assistant to the Regional Manager',
      phone: '+1 (555) 678-9012',
      dateOfJoining: new Date('2022-06-01'),
      address: {
        street: 'Beet Farm Rd',
        city: 'Scranton',
        state: 'PA',
        zipCode: '18503',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Mose Schrute',
        relationship: 'Cousin',
        phone: '+1 (555) 777-3456'
      },
      isActive: true
    });

    // 3. Create Announcements
    console.log('[Seed] Creating announcements...');
    await Announcement.create([
      {
        title: 'Welcome to StaffSync HRM Platform!',
        content: 'We are excited to launch our unified Human Resource Management portal. Employees can now mark attendance, request leaves, view training programs, and stay updated.',
        createdBy: hrUser._id,
        audience: 'ALL',
        priority: 'HIGH',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Q4 Product Roadmap & Engineering Sprint Review',
        content: 'Engineering team all-hands meeting scheduled for this Thursday at 2:00 PM EST. Please make sure all PRs are submitted by Wednesday EOD.',
        createdBy: managerUser._id,
        audience: 'ENGINEERING',
        priority: 'NORMAL',
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Annual Health Benefits & Open Enrollment Window',
        content: 'Open enrollment for healthcare benefits is open until the end of the month. Visit the HR portal to review updated coverage options.',
        createdBy: hrUser._id,
        audience: 'ALL',
        priority: 'URGENT',
        publishedAt: new Date()
      }
    ]);

    // 4. Create Training Programs
    console.log('[Seed] Creating training programs...');
    await TrainingProgram.create([
      {
        title: 'Modern Cloud Architecture & Microservices',
        description: 'Comprehensive 4-week training covering containerization with Docker, Kubernetes orchestration, and cloud-native backend architectures.',
        department: 'Engineering',
        assignedEmployees: [emp1._id, emp2._id],
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        status: 'UPCOMING',
        createdBy: managerUser._id
      },
      {
        title: 'Design Systems & Accessible UI with React',
        description: 'Best practices for scalable frontend component design, WCAG 2.1 compliance, and state management.',
        department: 'Engineering',
        assignedEmployees: [emp2._id],
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'IN_PROGRESS',
        createdBy: managerUser._id
      },
      {
        title: 'Workplace Ergonomics & Cyber Safety 2026',
        description: 'Mandatory company-wide training on ergonomics, security hygiene, and phishing prevention.',
        department: 'All',
        assignedEmployees: [emp1._id, emp2._id, emp3._id, mgrEmp._id, hrEmp._id],
        startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'IN_PROGRESS',
        createdBy: hrUser._id
      }
    ]);

    // 5. Create Leave Requests
    console.log('[Seed] Creating leave requests...');
    await LeaveRequest.create([
      {
        employeeId: emp1._id,
        leaveType: 'ANNUAL',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        reason: 'Family vacation trip',
        status: 'PENDING'
      },
      {
        employeeId: emp2._id,
        leaveType: 'CASUAL',
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        reason: 'Personal family event',
        status: 'PENDING'
      },
      {
        employeeId: emp3._id,
        leaveType: 'SICK',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        reason: 'Seasonal flu recovery',
        status: 'APPROVED',
        reviewedBy: hrUser._id,
        reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        reviewComments: 'Approved. Get well soon!'
      }
    ]);

    // 6. Create Attendance Records
    console.log('[Seed] Creating attendance records...');
    const today = new Date();
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const checkInTime = new Date(todayNormalized.getTime() + 9 * 60 * 60 * 1000); // 9:00 AM

    await Attendance.create([
      {
        employeeId: emp1._id,
        date: todayNormalized,
        checkIn: checkInTime,
        status: 'PRESENT',
        notes: 'Checked in on time'
      },
      {
        employeeId: mgrEmp._id,
        date: todayNormalized,
        checkIn: new Date(todayNormalized.getTime() + 8.5 * 60 * 60 * 1000), // 8:30 AM
        status: 'PRESENT',
        notes: 'Morning management standup'
      },
      {
        employeeId: hrEmp._id,
        date: todayNormalized,
        checkIn: new Date(todayNormalized.getTime() + 9 * 60 * 60 * 1000),
        status: 'PRESENT'
      }
    ]);

    // Create a few past attendance records for Jim Halpert
    for (let i = 1; i <= 5; i++) {
      const pastDate = new Date(todayNormalized.getTime() - i * 24 * 60 * 60 * 1000);
      const pastCheckIn = new Date(pastDate.getTime() + 9 * 60 * 60 * 1000);
      const pastCheckOut = new Date(pastDate.getTime() + 17.5 * 60 * 60 * 1000); // 8.5 hrs
      await Attendance.create({
        employeeId: emp1._id,
        date: pastDate,
        checkIn: pastCheckIn,
        checkOut: pastCheckOut,
        workHours: 8.5,
        status: 'PRESENT'
      });
    }

    console.log('\n======================================================');
    console.log(' StaffSync Seed Data Initialized Successfully! ');
    console.log('======================================================');
    console.log('Demo Credentials (all accounts use password: Password123!):');
    console.log('  1. HR Administrator:  hr@staffsync.com');
    console.log('  2. Manager:           manager@staffsync.com');
    console.log('  3. Employee:          employee@staffsync.com');
    console.log('  4. Employee 2:        pam@staffsync.com');
    console.log('  5. Employee 3:        dwight@staffsync.com');
    console.log('======================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
