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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  MenuBook as MenuBookIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ReadingTracker = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [readingData, setReadingData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    minutes: '',
    bookTitle: '',
    pagesRead: '',
    notes: ''
  });

  useEffect(() => {
    if (user.role === 'parent') {
      fetchParentStudents();
    } else {
      fetchAllStudents();
    }
  }, [user.role]);

  useEffect(() => {
    if (selectedStudent) {
      fetchReadingData();
    }
  }, [selectedStudent]);

  const fetchParentStudents = async () => {
    try {
      const res = await axios.get('/api/students/parent');
      setStudents(res.data);
      if (res.data.length > 0) {
        setSelectedStudent(res.data[0]._id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching parent\'s students:', error);
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const fetchReadingData = async () => {
    try {
      const res = await axios.get(`/api/students/${selectedStudent}/reading`);
      setReadingData(res.data);
    } catch (error) {
      console.error('Error fetching reading data:', error);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      minutes: '',
      bookTitle: '',
      pagesRead: '',
      notes: ''
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
      await axios.post(`/api/students/${selectedStudent}/reading`, formData);
      fetchReadingData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error submitting reading record:', error);
    }
  };

  const calculateTotalReadingTime = () => {
    return readingData.reduce((total, record) => total + record.minutes, 0);
  };

  const calculateAverageReadingTime = () => {
    if (readingData.length === 0) return 0;
    return Math.round(calculateTotalReadingTime() / readingData.length);
  };

  const getChartData = () => {
    const lastSevenRecords = readingData.slice(-7);
    return {
      labels: lastSevenRecords.map(record => new Date(record.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Reading Minutes',
          data: lastSevenRecords.map(record => record.minutes),
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
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
            Reading Tracker
          </Typography>
          {selectedStudent && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Add Reading Record
            </Button>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Select Student</InputLabel>
            <Select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              label="Select Student"
            >
              {students.map((student) => (
                <MenuItem key={student._id} value={student._id}>
                  {student.firstName} {student.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {selectedStudent && (
          <>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Reading Time
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <TimerIcon sx={{ mr: 1 }} />
                    <Typography variant="h4">
                      {calculateTotalReadingTime()} minutes
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Average Reading Time
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <TrendingUpIcon sx={{ mr: 1 }} />
                    <Typography variant="h4">
                      {calculateAverageReadingTime()} minutes/day
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Reading Progress (Last 7 Days)
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    {readingData.length > 0 ? (
                      <Line
                        data={getChartData()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'Minutes'
                              }
                            }
                          }
                        }}
                      />
                    ) : (
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                      >
                        <Typography color="textSecondary">
                          No reading data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Book Title</TableCell>
                      <TableCell align="right">Pages Read</TableCell>
                      <TableCell align="right">Minutes</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {readingData.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell>
                          {new Date(record.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{record.bookTitle}</TableCell>
                        <TableCell align="right">{record.pagesRead}</TableCell>
                        <TableCell align="right">{record.minutes}</TableCell>
                        <TableCell>{record.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </>
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Reading Record</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Book Title"
                name="bookTitle"
                value={formData.bookTitle}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Pages Read"
                name="pagesRead"
                value={formData.pagesRead}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Minutes Read"
                name="minutes"
                value={formData.minutes}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={4}
                value={formData.notes}
                onChange={handleInputChange}
              />
            </Grid>
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

export default ReadingTracker;