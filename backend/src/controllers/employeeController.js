const Employee = require('../models/Employee');
const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');

/**
 * @route   GET /api/employees
 * @desc    Get all employees with pagination, search, and filtering
 * @access  Private (HR, Manager)
 */
exports.getAllEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', department = '', isActive } = req.query;

    const query = {};

    // Manager role scope restriction: can view their direct reports or department
    if (req.user.role === 'MANAGER') {
      if (req.employee) {
        query.$or = [
          { managerId: req.employee._id },
          { department: req.employee.department },
          { _id: req.employee._id }
        ];
      }
    }

    // Filter by department if specified
    if (department) {
      query.department = department;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search by name or employeeCode
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeCode: searchRegex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Employee.countDocuments(query);

    const employees = await Employee.find(query)
      .populate('userId', 'email role isActive')
      .populate('managerId', 'firstName lastName employeeCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: employees.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: employees
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/employees/:id
 * @desc    Get single employee details
 * @access  Private (HR, Manager for team, Employee for self)
 */
exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId', 'email role isActive createdAt')
      .populate('managerId', 'firstName lastName employeeCode department');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found'
      });
    }

    // Authorization check:
    // HR can view anyone
    // Manager can view themselves, their direct reports, or team members
    // Employee can view only their own record
    if (req.user.role === 'EMPLOYEE') {
      if (!req.employee || String(req.employee._id) !== String(employee._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own employee record.'
        });
      }
    } else if (req.user.role === 'MANAGER') {
      const isSelf = req.employee && String(req.employee._id) === String(employee._id);
      const isDirectReport = req.employee && String(employee.managerId?._id || employee.managerId) === String(req.employee._id);
      const isSameDept = req.employee && employee.department === req.employee.department;

      if (!isSelf && !isDirectReport && !isSameDept) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view members within your team or department.'
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/employees
 * @desc    Create a new employee with user account
 * @access  Private (HR only)
 */
exports.createEmployee = async (req, res, next) => {
  try {
    const {
      email,
      password,
      role = 'EMPLOYEE',
      firstName,
      lastName,
      department,
      jobTitle,
      managerId,
      phone,
      dateOfJoining,
      address,
      emergencyContact
    } = req.body;

    // Check if user email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user account with this email already exists'
      });
    }

    // Auto-generate employeeCode or use custom if provided
    let employeeCode = req.body.employeeCode;
    if (!employeeCode) {
      const count = await Employee.countDocuments();
      employeeCode = `EMP-${String(count + 101).padStart(4, '0')}`;
    }

    // Create user account
    const user = await User.create({
      name: `${firstName} ${lastName}`.trim(),
      email: email.toLowerCase(),
      passwordHash: password || 'Welcome@123',
      role,
      isActive: true
    });

    // Create employee record
    const employee = await Employee.create({
      userId: user._id,
      employeeCode,
      firstName,
      lastName,
      department,
      jobTitle,
      managerId: managerId || null,
      phone: phone || '',
      dateOfJoining: dateOfJoining || new Date(),
      address: address || {},
      emergencyContact: emergencyContact || {},
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: 'Employee record created successfully',
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/employees/:id
 * @desc    Update employee details
 * @access  Private (HR full update, Employee updates permitted personal fields)
 */
exports.updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (req.user.role === 'HR') {
      // HR has full update rights
      const allowedFields = [
        'firstName', 'lastName', 'department', 'jobTitle',
        'managerId', 'phone', 'dateOfJoining', 'address',
        'emergencyContact', 'isActive'
      ];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          employee[field] = req.body[field];
        }
      });

      // Update linked user name if firstName or lastName changed
      if (req.body.firstName || req.body.lastName) {
        await User.findByIdAndUpdate(employee.userId, {
          name: `${employee.firstName} ${employee.lastName}`.trim()
        });
      }

      // If updating active status, update linked User as well
      if (req.body.isActive !== undefined) {
        await User.findByIdAndUpdate(employee.userId, {
          isActive: req.body.isActive
        });
      }

      await employee.save();
      return res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: employee
      });
    } else {
      // Ordinary employee or manager updating profile
      // Must be their own profile
      if (!req.employee || String(req.employee._id) !== String(employee._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own profile.'
        });
      }

      // Restricted to permitted personal fields: phone, address, emergencyContact
      if (req.body.phone !== undefined) employee.phone = req.body.phone;
      if (req.body.address) {
        employee.address = { ...employee.address.toObject(), ...req.body.address };
      }
      if (req.body.emergencyContact) {
        employee.emergencyContact = { ...employee.emergencyContact.toObject(), ...req.body.emergencyContact };
      }

      await employee.save();
      return res.status(200).json({
        success: true,
        message: 'Personal profile updated successfully',
        data: employee
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/employees/:id/toggle-status
 * @desc    Deactivate or reactivate an employee
 * @access  Private (HR only)
 */
exports.toggleEmployeeStatus = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    employee.isActive = !employee.isActive;
    await employee.save();

    // Sync with User model
    await User.findByIdAndUpdate(employee.userId, { isActive: employee.isActive });

    return res.status(200).json({
      success: true,
      message: `Employee successfully ${employee.isActive ? 'activated' : 'deactivated'}`,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/employees/:id
 * @desc    Safely delete employee or deactivate if historical records exist
 * @access  Private (HR only)
 */
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check for historical data (Leave or Attendance records)
    const [leaveCount, attendanceCount] = await Promise.all([
      LeaveRequest.countDocuments({ employeeId: employee._id }),
      Attendance.countDocuments({ employeeId: employee._id })
    ]);

    if (leaveCount > 0 || attendanceCount > 0) {
      // Historical data exists! Protect integrity by deactivating instead of deleting.
      employee.isActive = false;
      await employee.save();
      await User.findByIdAndUpdate(employee.userId, { isActive: false });

      return res.status(200).json({
        success: true,
        message: 'Employee record contains historical data (leaves or attendance) and has been safely deactivated instead of deleted to maintain compliance and audit logs.',
        deactivated: true
      });
    }

    // If no historical records, clean removal
    await Promise.all([
      Employee.findByIdAndDelete(employee._id),
      User.findByIdAndDelete(employee.userId)
    ]);

    return res.status(200).json({
      success: true,
      message: 'Employee and user account removed successfully',
      deleted: true
    });
  } catch (error) {
    next(error);
  }
};
