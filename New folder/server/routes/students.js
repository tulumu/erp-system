const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');
const User = require('../models/User');

// Get all students (admin/teacher only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'parent') {
      const students = await Student.find({ parent: req.user.id })
        .populate('parent', 'firstName lastName email');
      return res.json(students);
    }

    const students = await Student.find()
      .populate('parent', 'firstName lastName email');
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get student by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('parent', 'firstName lastName email');

    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Check if user has permission to view student
    if (req.user.role === 'parent' && student.parent.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    res.json(student);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Student not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Add academic result
router.post('/:id/results', auth, async (req, res) => {
  try {
    if (req.user.role === 'parent') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    const { subject, marks, totalMarks, examType } = req.body;
    student.academicResults.unshift({
      subject,
      marks,
      totalMarks,
      examType,
      date: new Date()
    });

    await student.save();
    res.json(student.academicResults);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add PE performance
router.post('/:id/pe-performance', auth, async (req, res) => {
  try {
    if (req.user.role === 'parent') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    const { activity, performance, teacherRemarks } = req.body;
    student.pePerformance.unshift({
      activity,
      performance,
      teacherRemarks,
      date: new Date()
    });

    await student.save();
    res.json(student.pePerformance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add reading time
router.post('/:id/reading-time', auth, async (req, res) => {
  try {
    if (req.user.role === 'parent') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    const { minutes, bookTitle, teacherRemarks } = req.body;
    student.readingTime.unshift({
      minutes,
      bookTitle,
      teacherRemarks,
      date: new Date()
    });

    await student.save();
    res.json(student.readingTime);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;