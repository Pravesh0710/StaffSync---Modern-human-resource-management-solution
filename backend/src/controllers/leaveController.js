const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');

/**
 * @route   POST /api/leaves
 * @desc    Submit a new leave application
 * @access  Private (Employee, Manager, HR for self)
 */
exports.applyLeave = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No associated employee profile found for this account'
      });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided for start date or end date'
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date'
      });
    }

    // Check for overlapping active (PENDING or APPROVED) leave requests
    const overlapping = await LeaveRequest.findOne({
      employeeId: req.employee._id,
      status: { $in: ['PENDING', 'APPROVED'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending or approved leave request overlapping this period'
      });
    }

    const leave = await LeaveRequest.create({
      employeeId: req.employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      status: 'PENDING'
    });

    const populatedLeave = await LeaveRequest.findById(leave._id)
      .populate('employeeId', 'firstName lastName employeeCode department');

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: populatedLeave
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/leaves/my-leaves
 * @desc    Get leave requests of logged in user
 * @access  Private (Employee)
 */
exports.getMyLeaves = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No employee profile associated with this account'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = { employeeId: req.employee._id };

    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await LeaveRequest.countDocuments(query);

    const leaves = await LeaveRequest.find(query)
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: leaves.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: leaves
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/leaves
 * @desc    Get all leave requests (HR views all, Manager views team)
 * @access  Private (HR, Manager)
 */
exports.getLeaveRequests = async (req, res, next) => {
  try {
    const { status, department, page = 1, limit = 10 } = req.query;
    let query = {};

    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    // Role-based scope filtering
    if (req.user.role === 'MANAGER') {
      if (!req.employee) {
        return res.status(403).json({
          success: false,
          message: 'Manager profile not linked to an employee record'
        });
      }

      // Find all employees reporting to this manager or in manager's department
      const teamEmployees = await Employee.find({
        $or: [
          { managerId: req.employee._id },
          { department: req.employee.department }
        ]
      }).select('_id');

      const teamIds = teamEmployees.map(emp => emp._id);
      query.employeeId = { $in: teamIds };
    } else if (department) {
      // HR filtering by department
      const deptEmployees = await Employee.find({ department }).select('_id');
      query.employeeId = { $in: deptEmployees.map(e => e._id) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await LeaveRequest.countDocuments(query);

    const leaves = await LeaveRequest.find(query)
      .populate({
        path: 'employeeId',
        select: 'firstName lastName employeeCode department jobTitle managerId',
        populate: { path: 'managerId', select: 'firstName lastName' }
      })
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: leaves.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: leaves
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/leaves/:id/review
 * @desc    Approve or reject a leave request
 * @access  Private (HR, Manager)
 */
exports.reviewLeave = async (req, res, next) => {
  try {
    const { status, reviewComments = '' } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either APPROVED or REJECTED'
      });
    }

    const leave = await LeaveRequest.findById(req.params.id)
      .populate('employeeId');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Role-based authority validation
    if (req.user.role === 'MANAGER') {
      // Manager can only review requests from their direct reports or department
      const isDirectReport = req.employee && String(leave.employeeId.managerId) === String(req.employee._id);
      const isSameDept = req.employee && leave.employeeId.department === req.employee.department;

      if (!isDirectReport && !isSameDept) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to review leave requests for employees outside your team.'
        });
      }
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.reviewComments = reviewComments;

    await leave.save();

    const updated = await LeaveRequest.findById(leave._id)
      .populate('employeeId', 'firstName lastName employeeCode department')
      .populate('reviewedBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()} successfully`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/leaves/:id
 * @desc    Cancel a pending leave request (by owner employee)
 * @access  Private (Employee)
 */
exports.cancelLeave = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Only creator employee or HR can cancel
    if (req.user.role !== 'HR') {
      if (!req.employee || String(leave.employeeId) !== String(req.employee._id)) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to cancel this leave request'
        });
      }
    }

    if (leave.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a leave request that has already been ${leave.status.toLowerCase()}`
      });
    }

    await LeaveRequest.findByIdAndDelete(leave._id);

    return res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};
