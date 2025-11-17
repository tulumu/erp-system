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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  Schedule,
  Person,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Complaints = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openResponseDialog, setOpenResponseDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    type: '',
    title: '',
    description: '',
    priority: 'medium'
  });
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetchComplaints();
    if (user.role !== 'parent') {
      fetchStudents();
    }
  }, [user.role]);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('/api/complaints');
      setComplaints(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleOpenResponseDialog = (complaint) => {
    setSelectedComplaint(complaint);
    setOpenResponseDialog(true);
  };

  const handleCloseResponseDialog = () => {
    setOpenResponseDialog(false);
    setSelectedComplaint(null);
    setResponse('');
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      type: '',
      title: '',
      description: '',
      priority: 'medium'
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
      await axios.post('/api/complaints', formData);
      fetchComplaints();
      handleCloseDialog();
    } catch (error) {
      console.error('Error submitting complaint:', error);
    }
  };

  const handleSubmitResponse = async () => {
    try {
      await axios.post(`/api/complaints/${selectedComplaint._id}/responses`, {
        message: response
      });
      fetchComplaints();
      handleCloseResponseDialog();
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'pending':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
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
            Complaints & Communication
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
          >
            New Complaint
          </Button>
        </Grid>

        <Grid item xs={12}>
          {complaints.map((complaint) => (
            <Card key={complaint._id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{complaint.title}</Typography>
                      <Box>
                        <Chip
                          label={complaint.status}
                          color={getStatusColor(complaint.status)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={complaint.priority}
                          color={getPriorityColor(complaint.priority)}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography color="textSecondary" gutterBottom>
                      Student: {complaint.student.firstName} {complaint.student.lastName}
                    </Typography>
                    <Typography variant="body1">{complaint.description}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Responses:
                    </Typography>
                    <List>
                      {complaint.responses.map((response, index) => (
                        <React.Fragment key={index}>
                          <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                              <Avatar>
                                <Person />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography>
                                  {response.user.firstName} {response.user.lastName}
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ ml: 1 }}
                                  >
                                    ({new Date(response.timestamp).toLocaleString()})
                                  </Typography>
                                </Typography>
                              }
                              secondary={response.message}
                            />
                          </ListItem>
                          {index < complaint.responses.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenResponseDialog(complaint)}
                      sx={{ mt: 2 }}
                    >
                      Add Response
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>

      {/* New Complaint Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>New Complaint</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {user.role !== 'parent' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Student</InputLabel>
                  <Select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    label="Student"
                  >
                    {students.map((student) => (
                      <MenuItem key={student._id} value={student._id}>
                        {student.firstName} {student.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Type"
                >
                  <MenuItem value="academic">Academic</MenuItem>
                  <MenuItem value="behavioral">Behavioral</MenuItem>
                  <MenuItem value="facility">Facility</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
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

      {/* Response Dialog */}
      <Dialog open={openResponseDialog} onClose={handleCloseResponseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Response</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Your Response"
            multiline
            rows={4}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResponseDialog}>Cancel</Button>
          <Button onClick={handleSubmitResponse} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Complaints;