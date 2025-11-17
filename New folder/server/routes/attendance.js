const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// Get attendance records
router.get('/', auth, async (req, res) => {
  try {
    const { studentId, startDate, endDate } = req.query;
    let query = {};

    if (studentId) {
      query.student = studentId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // If parent, only show their children's attendance
    if (req.user.role === 'parent') {
      const students = await Student.find({ parent: req.user.id }).select('_id');
      query.student = { $in: students.map(s => s._id) };
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'firstName lastName studentId')
      .populate('verifiedBy', 'firstName lastName')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Mark attendance (teacher/admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'parent') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { studentId, status, reason, lateMinutes } = req.body;

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Check if attendance already marked for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ msg: 'Attendance already marked for today' });
    }

    const attendance = new Attendance({
      student: studentId,
      date: new Date(),
      status,
      reason,
      lateMinutes,
      verifiedBy: req.user.id
    });

    await attendance.save();

    // Populate response data
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('student', 'firstName lastName studentId')
      .populate('verifiedBy', 'firstName lastName');

    res.json(populatedAttendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update attendance (teacher/admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role === 'parent') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { status, reason, lateMinutes } = req.body;
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ msg: 'Attendance record not found' });
    }

    attendance.status = status || attendance.status;
    attendance.reason = reason || attendance.reason;
    attendance.lateMinutes = lateMinutes || attendance.lateMinutes;
    attendance.verifiedBy = req.user.id;

    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('student', 'firstName lastName studentId')
      .populate('verifiedBy', 'firstName lastName');

    res.json(populatedAttendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Parent acknowledge attendance
router.post('/:id/acknowledge', auth, async (req, res) => {
  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const attendance = await Attendance.findById(req.params.id)
      .populate('student');

    if (!attendance) {
      return res.status(404).json({ msg: 'Attendance record not found' });
    }

    // Verify parent owns the student
    if (attendance.student.parent.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    attendance.parentAcknowledged = true;
    attendance.parentResponse = req.body.response || '';

    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('student', 'firstName lastName studentId')
      .populate('verifiedBy', 'firstName lastName');

    res.json(populatedAttendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;