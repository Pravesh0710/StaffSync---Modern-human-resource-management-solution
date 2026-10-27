const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Helper to normalize date to UTC/local midnight
const getNormalizedDate = (dateString) => {
  const date = dateString ? new Date(dateString) : new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * @route   POST /api/attendance/check-in
 * @desc    Record employee check-in for the day
 * @access  Private (Employee, Manager, HR)
 */
exports.checkIn = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No associated employee profile found for this account'
      });
    }

    const today = getNormalizedDate();
    const now = new Date();

    // Check if attendance record already exists for today
    let attendance = await Attendance.findOne({
      employeeId: req.employee._id,
      date: today
    });

    if (attendance && attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in for today at ' + attendance.checkIn.toLocaleTimeString(),
        data: attendance
      });
    }

    if (!attendance) {
      attendance = new Attendance({
        employeeId: req.employee._id,
        date: today,
        checkIn: now,
        status: 'PRESENT',
        notes: req.body.notes || ''
      });
    } else {
      attendance.checkIn = now;
      attendance.status = 'PRESENT';
      if (req.body.notes) attendance.notes = req.body.notes;
    }

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: 'Check-in recorded successfully at ' + now.toLocaleTimeString(),
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/attendance/check-out
 * @desc    Record employee check-out for the day
 * @access  Private (Employee, Manager, HR)
 */
exports.checkOut = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No associated employee profile found for this account'
      });
    }

    const today = getNormalizedDate();
    const now = new Date();

    const attendance = await Attendance.findOne({
      employeeId: req.employee._id,
      date: today
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You must check in first before checking out.'
      });
    }

    attendance.checkOut = now;

    // Calculate total hours worked
    const diffMs = now - new Date(attendance.checkIn);
    const hours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    attendance.workHours = hours;

    // If worked less than 4 hours, mark as HALF_DAY, else PRESENT
    if (hours < 4) {
      attendance.status = 'HALF_DAY';
    } else {
      attendance.status = 'PRESENT';
    }

    if (req.body.notes) {
      attendance.notes = (attendance.notes ? attendance.notes + ' | ' : '') + req.body.notes;
    }

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: `Check-out recorded successfully at ${now.toLocaleTimeString()}. Total hours: ${hours} hrs`,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/attendance/today
 * @desc    Get logged in employee's attendance status for today
 * @access  Private
 */
exports.getMyTodayAttendance = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(200).json({
        success: true,
        data: null
      });
    }

    const today = getNormalizedDate();
    const attendance = await Attendance.findOne({
      employeeId: req.employee._id,
      date: today
    });

    return res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/attendance/my-history
 * @desc    Get attendance history for logged in user
 * @access  Private
 */
exports.getMyAttendanceHistory = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No associated employee profile found'
      });
    }

    const { startDate, endDate, page = 1, limit = 15 } = req.query;
    const query = { employeeId: req.employee._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = getNormalizedDate(startDate);
      if (endDate) query.date.$lte = getNormalizedDate(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Attendance.countDocuments(query);

    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: records.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: records
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/attendance
 * @desc    Get organization attendance records (HR views all, Manager views team)
 * @access  Private (HR, Manager)
 */
exports.getAllAttendance = async (req, res, next) => {
  try {
    const { date, department, status, page = 1, limit = 15 } = req.query;
    const query = {};

    // Date filtering (defaults to today if date query is provided or specified)
    if (date) {
      query.date = getNormalizedDate(date);
    }

    if (status) {
      query.status = status;
    }

    // Role-based scope filtering
    if (req.user.role === 'MANAGER') {
      if (!req.employee) {
        return res.status(403).json({
          success: false,
          message: 'Manager profile not linked to an employee record'
        });
      }
      const teamEmployees = await Employee.find({
        $or: [
          { managerId: req.employee._id },
          { department: req.employee.department }
        ]
      }).select('_id');
      query.employeeId = { $in: teamEmployees.map(e => e._id) };
    } else if (department) {
      const deptEmployees = await Employee.find({ department }).select('_id');
      query.employeeId = { $in: deptEmployees.map(e => e._id) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Attendance.countDocuments(query);

    const records = await Attendance.find(query)
      .populate('employeeId', 'firstName lastName employeeCode department jobTitle')
      .sort({ date: -1, checkIn: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: records.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: records
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/attendance/manual
 * @desc    HR manual attendance entry or status adjustment
 * @access  Private (HR only)
 */
exports.recordManualAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, workHours, notes } = req.body;

    const normalizedDate = getNormalizedDate(date);

    let record = await Attendance.findOne({ employeeId, date: normalizedDate });

    if (record) {
      if (status) record.status = status;
      if (checkIn) record.checkIn = new Date(checkIn);
      if (checkOut) record.checkOut = new Date(checkOut);
      if (workHours !== undefined) record.workHours = workHours;
      if (notes) record.notes = notes;
      await record.save();
    } else {
      record = await Attendance.create({
        employeeId,
        date: normalizedDate,
        status: status || 'PRESENT',
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        workHours: workHours || 0,
        notes: notes || 'Manually recorded by HR'
      });
    }

    const populated = await Attendance.findById(record._id)
      .populate('employeeId', 'firstName lastName employeeCode department');

    return res.status(200).json({
      success: true,
      message: 'Attendance record saved successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};
