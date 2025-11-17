const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Complaint = require('../models/Complaint');
const Student = require('../models/Student');

// Get all complaints
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    // If parent, only show complaints related to their children
    if (req.user.role === 'parent') {
      const students = await Student.find({ parent: req.user.id }).select('_id');
      query.student = { $in: students.map(s => s._id) };
    }

    const complaints = await Complaint.find(query)
      .populate('student', 'firstName lastName studentId')
      .populate('submittedBy', 'firstName lastName role')
      .populate('assignedTo', 'firstName lastName role')
      .populate('responses.user', 'firstName lastName role')
      .populate('resolution.resolvedBy', 'firstName lastName role')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create new complaint
router.post('/', auth, async (req, res) => {
  try {
    const { studentId, type, title, description, priority } = req.body;

    // Verify student exists and parent relationship if applicable
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    if (req.user.role === 'parent' && student.parent.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const complaint = new Complaint({
      student: studentId,
      submittedBy: req.user.id,
      type,
      title,
      description,
      priority
    });

    await complaint.save();

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('student', 'firstName lastName studentId')
      .populate('submittedBy', 'firstName lastName role');

    res.json(populatedComplaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add response to complaint
router.post('/:id/responses', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student');

    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }

    // Verify user has permission to respond
    if (req.user.role === 'parent' && 
        complaint.student.parent.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    complaint.responses.push({
      user: req.user.id,
      message: req.body.message
    });

    await complaint.save();

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('student', 'firstName lastName studentId')
      .populate('submittedBy', 'firstName lastName role')
      .populate('responses.user', 'firstName lastName role');

    res.json(populatedComplaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update complaint status (admin/teacher only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role === 'parent') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { status, resolution } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }

    complaint.status = status;

    if (status === 'resolved') {
      complaint.resolution = {
        description: resolution,
        resolvedBy: req.user.id,
        resolvedAt: new Date()
      };
    }

    await complaint.save();

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('student', 'firstName lastName studentId')
      .populate('submittedBy', 'firstName lastName role')
      .populate('responses.user', 'firstName lastName role')
      .populate('resolution.resolvedBy', 'firstName lastName role');

    res.json(populatedComplaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;