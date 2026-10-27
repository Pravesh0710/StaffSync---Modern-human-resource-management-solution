const TrainingProgram = require('../models/TrainingProgram');
const Employee = require('../models/Employee');

/**
 * @route   POST /api/trainings
 * @desc    Create a new training program
 * @access  Private (Manager, HR)
 */
exports.createTraining = async (req, res, next) => {
  try {
    const { title, description, department = 'All', assignedEmployees = [], startDate, endDate, status = 'UPCOMING' } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dates provided for training program'
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date'
      });
    }

    const training = await TrainingProgram.create({
      title,
      description,
      department,
      assignedEmployees,
      startDate: start,
      endDate: end,
      status,
      createdBy: req.user._id
    });

    const populated = await TrainingProgram.findById(training._id)
      .populate('assignedEmployees', 'firstName lastName employeeCode department jobTitle')
      .populate('createdBy', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/trainings
 * @desc    Get all training programs (HR views all, Manager views team/dept)
 * @access  Private (HR, Manager)
 */
exports.getAllTrainings = async (req, res, next) => {
  try {
    const { status, department, page = 1, limit = 10 } = req.query;
    let query = {};

    if (status) query.status = status;

    if (req.user.role === 'MANAGER') {
      const managerDept = req.employee ? req.employee.department : null;
      query.$or = [
        { createdBy: req.user._id },
        { department: 'All' },
        ...(managerDept ? [{ department: managerDept }] : [])
      ];
    } else if (department && department !== 'All') {
      query.department = { $in: [department, 'All'] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await TrainingProgram.countDocuments(query);

    const trainings = await TrainingProgram.find(query)
      .populate('assignedEmployees', 'firstName lastName employeeCode department jobTitle')
      .populate('createdBy', 'name email role')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: trainings.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: trainings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/trainings/my-trainings
 * @desc    Get training programs assigned to logged in employee
 * @access  Private (Employee)
 */
exports.getMyTrainings = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No associated employee profile found'
      });
    }

    const query = {
      $or: [
        { assignedEmployees: req.employee._id },
        { department: req.employee.department },
        { department: 'All' }
      ]
    };

    const trainings = await TrainingProgram.find(query)
      .populate('createdBy', 'name email role')
      .sort({ startDate: 1 });

    return res.status(200).json({
      success: true,
      count: trainings.length,
      data: trainings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/trainings/:id
 * @desc    Update a training program
 * @access  Private (HR, Creator Manager)
 */
exports.updateTraining = async (req, res, next) => {
  try {
    const training = await TrainingProgram.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found'
      });
    }

    // Role check: Manager can update their own programs or HR can update any
    if (req.user.role !== 'HR' && String(training.createdBy) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this training program'
      });
    }

    const fields = ['title', 'description', 'department', 'assignedEmployees', 'startDate', 'endDate', 'status'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) training[field] = req.body[field];
    });

    await training.save();

    const updated = await TrainingProgram.findById(training._id)
      .populate('assignedEmployees', 'firstName lastName employeeCode department jobTitle')
      .populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Training program updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/trainings/:id
 * @desc    Delete a training program
 * @access  Private (HR, Creator Manager)
 */
exports.deleteTraining = async (req, res, next) => {
  try {
    const training = await TrainingProgram.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found'
      });
    }

    if (req.user.role !== 'HR' && String(training.createdBy) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this training program'
      });
    }

    await TrainingProgram.findByIdAndDelete(training._id);

    return res.status(200).json({
      success: true,
      message: 'Training program deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
