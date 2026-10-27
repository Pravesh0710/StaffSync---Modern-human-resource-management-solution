const Announcement = require('../models/Announcement');

/**
 * @route   POST /api/announcements
 * @desc    Publish a new company or department announcement
 * @access  Private (HR, Manager)
 */
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, audience = 'ALL', priority = 'NORMAL', isPublished = true } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      createdBy: req.user._id,
      audience,
      priority,
      isPublished,
      publishedAt: new Date()
    });

    const populated = await Announcement.findById(announcement._id)
      .populate('createdBy', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/announcements
 * @desc    Get announcements relevant to current user role and department
 * @access  Private
 */
exports.getAnnouncements = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    let query = { isPublished: true };

    // If HR, show all
    if (req.user.role !== 'HR') {
      const allowedAudiences = ['ALL', req.user.role];
      if (req.employee && req.employee.department) {
        allowedAudiences.push(req.employee.department.toUpperCase());
      }
      query.audience = { $in: allowedAudiences };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Announcement.countDocuments(query);

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email role')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: announcements.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: announcements
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/announcements/:id
 * @desc    Update an announcement
 * @access  Private (HR, Creator Manager)
 */
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Role check: HR can update any; Manager can update only their own
    if (req.user.role !== 'HR' && String(announcement.createdBy) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this announcement'
      });
    }

    const fields = ['title', 'content', 'audience', 'priority', 'isPublished'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) announcement[f] = req.body[f];
    });

    await announcement.save();

    const updated = await Announcement.findById(announcement._id)
      .populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/announcements/:id
 * @desc    Delete an announcement
 * @access  Private (HR, Creator Manager)
 */
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Role check
    if (req.user.role !== 'HR' && String(announcement.createdBy) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this announcement'
      });
    }

    await Announcement.findByIdAndDelete(announcement._id);

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
