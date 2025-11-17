import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Person, School, Timer } from '@mui/icons-material';
import axios from 'axios';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const StudentProfile = () => {
  const { id } = useParams();
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const [studentRes, performanceRes, attendanceRes] = await Promise.all([
          axios.get(`/api/students/${id}`),
          axios.get(`/api/performance/${id}`),
          axios.get(`/api/attendance?studentId=${id}`)
        ]);

        setStudent(studentRes.data);
        setPerformance(performanceRes.data);
        setAttendance(attendanceRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching student data:', error);
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!student) {
    return (
      <Typography variant="h6" align="center">
        Student not found
      </Typography>
    );
  }

  return (
    <div>
      <Grid container spacing={3}>
        {/* Student Basic Info */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Avatar
                  sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}
                >
                  <Person sx={{ fontSize: 60 }} />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h4">
                  {student.firstName} {student.lastName}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Student ID: {student.studentId}
                </Typography>
                <Typography variant="body1">
                  Grade: {student.grade} | Section: {student.section}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Tabs Section */}
        <Grid item xs={12}>
          <Paper elevation={3}>
            <Tabs value={value} onChange={handleTabChange} centered>
              <Tab label="Academic Results" />
              <Tab label="PE Performance" />
              <Tab label="Reading Progress" />
            </Tabs>

            {/* Academic Results Tab */}
            <TabPanel value={value} index={0}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell>Marks</TableCell>
                      <TableCell>Total Marks</TableCell>
                      <TableCell>Percentage</TableCell>
                      <TableCell>Exam Type</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {student.academicResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{result.subject}</TableCell>
                        <TableCell>{result.marks}</TableCell>
                        <TableCell>{result.totalMarks}</TableCell>
                        <TableCell>
                          {((result.marks / result.totalMarks) * 100).toFixed(2)}%
                        </TableCell>
                        <TableCell>{result.examType}</TableCell>
                        <TableCell>
                          {new Date(result.date).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* PE Performance Tab */}
            <TabPanel value={value} index={1}>
              <Grid container spacing={3}>
                {student.pePerformance.map((performance, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{performance.activity}</Typography>
                        <Chip
                          label={performance.performance}
                          color={
                            performance.performance === 'Excellent'
                              ? 'success'
                              : performance.performance === 'Good'
                              ? 'primary'
                              : 'warning'
                          }
                          sx={{ mt: 1 }}
                        />
                        <Typography variant="body2" sx={{ mt: 2 }}>
                          {performance.teacherRemarks}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(performance.date).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            {/* Reading Progress Tab */}
            <TabPanel value={value} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Reading Statistics
                      </Typography>
                      <Grid container spacing={3}>
                        {student.readingTime.map((reading, index) => (
                          <Grid item xs={12} md={6} key={index}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 2,
                              }}
                            >
                              <Timer sx={{ mr: 1 }} />
                              <Box>
                                <Typography variant="subtitle1">
                                  {reading.bookTitle}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {reading.minutes} minutes on{' '}
                                  {new Date(reading.date).toLocaleDateString()}
                                </Typography>
                                {reading.teacherRemarks && (
                                  <Typography variant="body2" sx={{ mt: 1 }}>
                                    {reading.teacherRemarks}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default StudentProfile;