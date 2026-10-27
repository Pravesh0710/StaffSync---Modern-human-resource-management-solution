const Employee = require('../models/Employee');
const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');
const TrainingProgram = require('../models/TrainingProgram');

// Helper to normalize date
const getNormalizedDate = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * @route   GET /api/reports/hr-metrics
 * @desc    Get aggregated overview metrics for HR dashboard
 * @access  Private (HR only)
 */
exports.getHRMetrics = async (req, res, next) => {
  try {
    const today = getNormalizedDate();

    // Parallel aggregate queries for speed and efficiency
    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      todayAttendance,
      pendingLeaves,
      departmentBreakdown,
      recentLeaves
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ isActive: true }),
      Employee.countDocuments({ isActive: false }),
      Attendance.find({ date: today }),
      LeaveRequest.countDocuments({ status: 'PENDING' }),
      Employee.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      LeaveRequest.find()
        .populate('employeeId', 'firstName lastName employeeCode department')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Calculate attendance breakdown
    const presentToday = todayAttendance.filter(a => a.status === 'PRESENT').length;
    const halfDayToday = todayAttendance.filter(a => a.status === 'HALF_DAY').length;
    const onLeaveToday = todayAttendance.filter(a => a.status === 'ON_LEAVE').length;
    const checkedInCount = todayAttendance.filter(a => !!a.checkIn).length;

    const attendanceRate = activeEmployees > 0
      ? Math.round((checkedInCount / activeEmployees) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        pendingLeaves,
        attendance: {
          totalCheckedIn: checkedInCount,
          present: presentToday,
          halfDay: halfDayToday,
          onLeave: onLeaveToday,
          attendanceRate
        },
        departments: departmentBreakdown.map(d => ({
          department: d._id || 'Unassigned',
          count: d.count
        })),
        recentLeaves
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/manager-metrics
 * @desc    Get aggregated metrics for Manager dashboard
 * @access  Private (Manager only)
 */
exports.getManagerMetrics = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(403).json({
        success: false,
        message: 'Manager profile not linked to an employee record'
      });
    }

    const today = getNormalizedDate();

    // Find all team members reporting to this manager or in manager's department
    const teamMembers = await Employee.find({
      $or: [
        { managerId: req.employee._id },
        { department: req.employee.department }
      ]
    });

    const teamMemberIds = teamMembers.map(m => m._id);

    const [teamAttendance, pendingTeamLeaves, activeTrainings] = await Promise.all([
      Attendance.find({
        employeeId: { $in: teamMemberIds },
        date: today
      }),
      LeaveRequest.countDocuments({
        employeeId: { $in: teamMemberIds },
        status: 'PENDING'
      }),
      TrainingProgram.countDocuments({
        $or: [
          { createdBy: req.user._id },
          { department: req.employee.department },
          { department: 'All' }
        ],
        status: { $in: ['UPCOMING', 'IN_PROGRESS'] }
      })
    ]);

    const checkedInTeam = teamAttendance.filter(a => !!a.checkIn).length;

    return res.status(200).json({
      success: true,
      data: {
        teamSize: teamMembers.length,
        checkedInToday: checkedInTeam,
        pendingLeaves: pendingTeamLeaves,
        activeTrainings,
        teamMembers: teamMembers.map(m => ({
          id: m._id,
          employeeCode: m.employeeCode,
          name: `${m.firstName} ${m.lastName}`,
          jobTitle: m.jobTitle,
          department: m.department,
          isActive: m.isActive
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/attendance-report
 * @desc    Detailed attendance statistical report
 * @access  Private (HR only)
 */
exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, department } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const query = {
      date: { $gte: getNormalizedDate(start), $lte: getNormalizedDate(end) }
    };

    if (department) {
      const deptEmployees = await Employee.find({ department }).select('_id');
      query.employeeId = { $in: deptEmployees.map(e => e._id) };
    }

    const records = await Attendance.find(query)
      .populate('employeeId', 'firstName lastName employeeCode department jobTitle')
      .sort({ date: -1 });

    const totalRecords = records.length;
    const presentCount = records.filter(r => r.status === 'PRESENT').length;
    const halfDayCount = records.filter(r => r.status === 'HALF_DAY').length;
    const totalWorkHours = records.reduce((sum, r) => sum + (r.workHours || 0), 0);
    const averageWorkHours = totalRecords > 0 ? (totalWorkHours / totalRecords).toFixed(1) : 0;

    return res.status(200).json({
      success: true,
      data: {
        startDate: start,
        endDate: end,
        totalRecords,
        presentCount,
        halfDayCount,
        totalWorkHours,
        averageWorkHours,
        records
      }
    });
  } catch (error) {
    next(error);
  }
};
