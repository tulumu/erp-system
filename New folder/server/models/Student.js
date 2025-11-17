const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  grade: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicResults: [{
    subject: String,
    marks: Number,
    totalMarks: Number,
    examType: String,
    date: Date
  }],
  pePerformance: [{
    activity: String,
    performance: String,
    date: Date,
    teacherRemarks: String
  }],
  readingTime: [{
    date: Date,
    minutes: Number,
    bookTitle: String,
    teacherRemarks: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', StudentSchema);