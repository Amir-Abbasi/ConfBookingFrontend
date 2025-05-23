import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Typography,
  Box
} from '@mui/material';
import { isAfter, isBefore, parseISO } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

const BookingDialog = ({ open, onClose, onComplete, room }) => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    purpose: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          room_id: room.id,
          user_name: user.username,
          ...formData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      setFormData({
        start_time: '',
        end_time: '',
        purpose: ''
      });
      onComplete();
    } catch (err) {
      setError(err.message);
    }
  };

  const validateForm = () => {
    if (!formData.start_time || !formData.end_time || !formData.purpose) {
      setError('All fields are required');
      return false;
    }

    const start = parseISO(formData.start_time);
    const end = parseISO(formData.end_time);
    const now = new Date();

    if (isBefore(start, now)) {
      setError('Cannot book in the past');
      return false;
    }

    if (!isAfter(end, start)) {
      setError('End time must be after start time');
      return false;
    }

    return true;
  };

  const handleClose = () => {
    setFormData({
      start_time: '',
      end_time: '',
      purpose: ''
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Book {room?.name}</DialogTitle>
      <DialogContent>
        {room && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="primary">
              Room Details:
            </Typography>
            <Typography variant="body2">
              Capacity: {room.capacity} people
            </Typography>
            <Typography variant="body2">
              Floor: {room.floor}
            </Typography>
            {room.features && (
              <Typography variant="body2">
                Features: {room.features.join(', ')}
              </Typography>
            )}
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          fullWidth
          label="Start Time"
          type="datetime-local"
          value={formData.start_time}
          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          fullWidth
          label="End Time"
          type="datetime-local"
          value={formData.end_time}
          onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          fullWidth
          label="Purpose"
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          margin="normal"
          multiline
          rows={3}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Book Room
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingDialog; 