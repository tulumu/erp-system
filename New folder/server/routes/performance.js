const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');

// Get student performance data
router.get('/:studentId', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Verify parent relationship if applicable
    if (req.user.role === 'parent' && student.parent.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const performance = {
      academicResults: student.academicResults,
      pePerformance: student.pePerformance,
      readingTime: student.readingTime
    };

    res.json(performance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get performance analytics
router.get('/:studentId/analytics', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Verify parent relationship if applicable
    if (req.user.role === 'parent' && student.parent.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Calculate academic performance analytics
    const academicAnalytics = student.academicResults.reduce((acc, result) => {
      if (!acc[result.subject]) {
        acc[result.subject] = {
          totalMarks: 0,
          totalMaxMarks: 0,
          examCount: 0
        };
      }
      acc[result.subject].totalMarks += result.marks;
      acc[result.subject].totalMaxMarks += result.totalMarks;
      acc[result.subject].examCount += 1;
      return acc;
    }, {});

    // Calculate average marks percentage by subject
    Object.keys(academicAnalytics).forEach(subject => {
      academicAnalytics[subject].averagePercentage =
        (academicAnalytics[subject].totalMarks / academicAnalytics[subject].totalMaxMarks) * 100;
    });

    // Calculate PE performance analytics
    const peAnalytics = student.pePerformance.reduce((acc, activity) => {
      if (!acc[activity.activity]) {
        acc[activity.activity] = [];
      }
      acc[activity.activity].push({
        performance: activity.performance,
        date: activity.date
      });
      return acc;
    }, {});

    // Calculate reading time analytics
    const readingAnalytics = {
      totalMinutes: 0,
      averageMinutesPerDay: 0,
      booksRead: new Set(student.readingTime.map(r => r.bookTitle)).size,
      dailyReadingTrend: student.readingTime.map(r => ({
        date: r.date,
        minutes: r.minutes
      })).sort((a, b) => new Date(a.date) - new Date(b.date))
    };

    readingAnalytics.totalMinutes = student.readingTime.reduce((sum, r) => sum + r.minutes, 0);
    
    // Calculate average minutes per day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentReadings = student.readingTime.filter(r => 
      new Date(r.date) >= thirtyDaysAgo
    );

    readingAnalytics.averageMinutesPerDay = recentReadings.length ?
      recentReadings.reduce((sum, r) => sum + r.minutes, 0) / 30 : 0;

    const analytics = {
      academic: academicAnalytics,
      pe: peAnalytics,
      reading: readingAnalytics
    };

    res.json(analytics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add performance comment (teacher only)
router.post('/:studentId/comments', auth, async (req, res) => {
  try {
    if (req.user.role === 'parent') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    const { type, comment } = req.body;
    let updateField;

    switch (type) {
      case 'academic':
        updateField = 'academicResults';
        break;
      case 'pe':
        updateField = 'pePerformance';
        break;
      case 'reading':
        updateField = 'readingTime';
        break;
      default:
        return res.status(400).json({ msg: 'Invalid comment type' });
    }

    // Add comment to the most recent entry of the specified type
    if (student[updateField].length > 0) {
      student[updateField][0].teacherRemarks = comment;
      await student.save();
    }

    res.json(student[updateField]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;