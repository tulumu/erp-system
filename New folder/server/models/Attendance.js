const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true
  },
  reason: {
    type: String,
    default: ''
  },
  lateMinutes: {
    type: Number,
    default: 0
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notifiedParent: {
    type: Boolean,
    default: false
  },
  parentAcknowledged: {
    type: Boolean,
    default: false
  },
  parentResponse: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient querying
AttendanceSchema.index({ student: 1, date: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);