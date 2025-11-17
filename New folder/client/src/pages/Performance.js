import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { Bar, Line } from 'react-chartjs-2';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Performance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [performanceData, setPerformanceData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    marks: '',
    totalMarks: '',
    examType: '',
    activity: '',
    performance: '',
    teacherRemarks: '',
    minutes: '',
    bookTitle: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
      if (res.data.length > 0) {
        setSelectedStudent(res.data[0]._id);
        await fetchPerformanceData(res.data[0]._id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const fetchPerformanceData = async (studentId) => {
    try {
      const res = await axios.get(`/api/performance/${studentId}`);
      setPerformanceData(res.data);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };

  const handleStudentChange = async (event) => {
    setSelectedStudent(event.target.value);
    await fetchPerformanceData(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      subject: '',
      marks: '',
      totalMarks: '',
      examType: '',
      activity: '',
      performance: '',
      teacherRemarks: '',
      minutes: '',
      bookTitle: ''
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      let endpoint = '';
      let data = {};

      switch (dialogType) {
        case 'academic':
          endpoint = `/api/students/${selectedStudent}/results`;
          data = {
            subject: formData.subject,
            marks: parseInt(formData.marks),
            totalMarks: parseInt(formData.totalMarks),
            examType: formData.examType
          };
          break;

        case 'pe':
          endpoint = `/api/students/${selectedStudent}/pe-performance`;
          data = {
            activity: formData.activity,
            performance: formData.performance,
            teacherRemarks: formData.teacherRemarks
          };
          break;

        case 'reading':
          endpoint = `/api/students/${selectedStudent}/reading-time`;
          data = {
            minutes: parseInt(formData.minutes),
            bookTitle: formData.bookTitle,
            teacherRemarks: formData.teacherRemarks
          };
          break;

        default:
          return;
      }

      await axios.post(endpoint, data);
      await fetchPerformanceData(selectedStudent);
      handleCloseDialog();
    } catch (error) {
      console.error('Error submitting performance data:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" gutterBottom>
            Student Performance
          </Typography>
          {user.role !== 'parent' && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select Student</InputLabel>
              <Select
                value={selectedStudent}
                onChange={handleStudentChange}
                label="Select Student"
              >
                {students.map((student) => (
                  <MenuItem key={student._id} value={student._id}>
                    {student.firstName} {student.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Academic Results" />
              <Tab label="PE Performance" />
              <Tab label="Reading Progress" />
            </Tabs>

            {/* Academic Results Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {user.role !== 'parent' && (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenDialog('academic')}
                    >
                      Add Academic Result
                    </Button>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      {performanceData?.academicResults?.length > 0 ? (
                        <Bar
                          data={{
                            labels: performanceData.academicResults.map(r => r.subject),
                            datasets: [{
                              label: 'Marks Percentage',
                              data: performanceData.academicResults.map(
                                r => (r.marks / r.totalMarks) * 100
                              ),
                              backgroundColor: '#1976d2'
                            }]
                          }}
                          options={{
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: 100
                              }
                            }
                          }}
                        />
                      ) : (
                        <Typography>No academic results available</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* PE Performance Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                {user.role !== 'parent' && (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenDialog('pe')}
                    >
                      Add PE Performance
                    </Button>
                  </Grid>
                )}
                {performanceData?.pePerformance?.map((record, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{record.activity}</Typography>
                        <Typography color="textSecondary" gutterBottom>
                          Performance: {record.performance}
                        </Typography>
                        <Typography variant="body2">
                          {record.teacherRemarks}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(record.date).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            {/* Reading Progress Tab */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                {user.role !== 'parent' && (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenDialog('reading')}
                    >
                      Add Reading Time
                    </Button>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      {performanceData?.readingTime?.length > 0 ? (
                        <Line
                          data={{
                            labels: performanceData.readingTime.map(
                              r => new Date(r.date).toLocaleDateString()
                            ),
                            datasets: [{
                              label: 'Reading Minutes',
                              data: performanceData.readingTime.map(r => r.minutes),
                              borderColor: '#2196f3',
                              fill: false
                            }]
                          }}
                          options={{
                            scales: {
                              y: {
                                beginAtZero: true
                              }
                            }
                          }}
                        />
                      ) : (
                        <Typography>No reading data available</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Performance Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'academic' && 'Add Academic Result'}
          {dialogType === 'pe' && 'Add PE Performance'}
          {dialogType === 'reading' && 'Add Reading Time'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {dialogType === 'academic' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Marks"
                    name="marks"
                    type="number"
                    value={formData.marks}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Total Marks"
                    name="totalMarks"
                    type="number"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Exam Type"
                    name="examType"
                    value={formData.examType}
                    onChange={handleInputChange}
                  />
                </Grid>
              </>
            )}

            {dialogType === 'pe' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Activity"
                    name="activity"
                    value={formData.activity}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Performance</InputLabel>
                    <Select
                      name="performance"
                      value={formData.performance}
                      onChange={handleInputChange}
                      label="Performance"
                    >
                      <MenuItem value="Excellent">Excellent</MenuItem>
                      <MenuItem value="Good">Good</MenuItem>
                      <MenuItem value="Average">Average</MenuItem>
                      <MenuItem value="Needs Improvement">Needs Improvement</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Teacher Remarks"
                    name="teacherRemarks"
                    multiline
                    rows={3}
                    value={formData.teacherRemarks}
                    onChange={handleInputChange}
                  />
                </Grid>
              </>
            )}

            {dialogType === 'reading' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Book Title"
                    name="bookTitle"
                    value={formData.bookTitle}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Minutes Read"
                    name="minutes"
                    type="number"
                    value={formData.minutes}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Teacher Remarks"
                    name="teacherRemarks"
                    multiline
                    rows={3}
                    value={formData.teacherRemarks}
                    onChange={handleInputChange}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Performance;