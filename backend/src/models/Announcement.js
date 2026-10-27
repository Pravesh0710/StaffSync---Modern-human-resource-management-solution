const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required']
    },
    audience: {
      type: String,
      enum: ['ALL', 'HR', 'MANAGER', 'EMPLOYEE', 'ENGINEERING', 'SALES', 'MARKETING', 'OPERATIONS'],
      default: 'ALL'
    },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL'
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    publishedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

announcementSchema.index({ audience: 1, isPublished: 1, publishedAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
