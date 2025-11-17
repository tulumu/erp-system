import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  CircularProgress,
} from '@mui/material';
import { Bar, Line } from 'react-chartjs-2';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    attendance: [],
    performance: [],
    complaints: [],
    readingTime: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        let endpoint = '/api/students';
        if (user.role === 'parent') {
          const response = await axios.get(endpoint);
          const studentData = response.data;
          
          // Process attendance data
          const attendanceResponse = await Promise.all(
            studentData.map(student =>
              axios.get(`/api/attendance?studentId=${student._id}`)
            )
          );

          // Process performance data
          const performanceResponse = await Promise.all(
            studentData.map(student =>
              axios.get(`/api/performance/${student._id}/analytics`)
            )
          );

          // Process complaints
          const complaintsResponse = await axios.get('/api/complaints');

          setStats({
            students: studentData,
            attendance: attendanceResponse.map(res => res.data).flat(),
            performance: performanceResponse.map(res => res.data),
            complaints: complaintsResponse.data
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Attendance Overview */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Attendance Overview
            </Typography>
            <Card>
              <CardContent>
                {stats.attendance.length > 0 ? (
                  <Bar
                    data={{
                      labels: ['Present', 'Absent', 'Late'],
                      datasets: [{
                        label: 'Attendance Status',
                        data: [
                          stats.attendance.filter(a => a.status === 'present').length,
                          stats.attendance.filter(a => a.status === 'absent').length,
                          stats.attendance.filter(a => a.status === 'late').length
                        ],
                        backgroundColor: ['#4caf50', '#f44336', '#ff9800']
                      }]
                    }}
                    options={{
                      responsive: true,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                ) : (
                  <Typography>No attendance data available</Typography>
                )}
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        {/* Academic Performance */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Academic Performance
            </Typography>
            <Card>
              <CardContent>
                {stats.performance.length > 0 ? (
                  <Line
                    data={{
                      labels: stats.performance[0].reading.dailyReadingTrend.map(
                        entry => new Date(entry.date).toLocaleDateString()
                      ),
                      datasets: [{
                        label: 'Reading Minutes',
                        data: stats.performance[0].reading.dailyReadingTrend.map(
                          entry => entry.minutes
                        ),
                        borderColor: '#2196f3',
                        fill: false
                      }]
                    }}
                    options={{
                      responsive: true,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                ) : (
                  <Typography>No performance data available</Typography>
                )}
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        {/* Recent Complaints */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Complaints
            </Typography>
            <List>
              {stats.complaints.slice(0, 5).map((complaint, index) => (
                <React.Fragment key={complaint._id}>
                  <ListItem>
                    <ListItemText
                      primary={complaint.title}
                      secondary={
                        `Status: ${complaint.status} | Priority: ${complaint.priority}`
                      }
                    />
                  </ListItem>
                  {index < 4 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Reading Progress */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Reading Progress
            </Typography>
            <Card>
              <CardContent>
                {stats.performance.length > 0 ? (
                  <Box>
                    <Typography variant="h3" align="center" color="primary">
                      {Math.round(stats.performance[0].reading.averageMinutesPerDay)}
                    </Typography>
                    <Typography variant="subtitle1" align="center">
                      Average Minutes Per Day
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      Total Books Read: {stats.performance[0].reading.booksRead}
                    </Typography>
                  </Box>
                ) : (
                  <Typography>No reading data available</Typography>
                )}
              </CardContent>
            </Card>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;