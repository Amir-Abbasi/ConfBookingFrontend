import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { Delete as DeleteIcon, Event as EventIcon } from '@mui/icons-material';
import { format, parseISO, isAfter } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

const BookingTable = ({ bookings }) => {
  const { user, token } = useAuth();

  const isBookingActive = (booking) => {
    const now = new Date();
    const endTime = parseISO(booking.end_time);
    return isAfter(endTime, now);
  };

  const getBookingStatus = (booking) => {
    if (isBookingActive(booking)) {
      return <Chip label="Active" color="success" size="small" />;
    }
    return <Chip label="Past" color="default" size="small" />;
  };

  const handleDelete = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Refresh the bookings list (you'll need to implement this)
      // This could be done by lifting the state up or using a context
      window.location.reload();
    } catch (error) {
      console.error('Error canceling booking:', error);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Box p={2} bgcolor="primary.main" color="primary.contrastText">
        <Typography variant="h6" component="div">
          <EventIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Current Bookings
        </Typography>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>Booked By</TableCell>
            <TableCell>Start Time</TableCell>
            <TableCell>End Time</TableCell>
            <TableCell>Purpose</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography color="textSecondary">
                  No bookings found for this room
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            bookings.map(booking => (
              <TableRow 
                key={booking.id}
                sx={{
                  bgcolor: isBookingActive(booking) ? 'rgba(0, 200, 0, 0.04)' : 'inherit'
                }}
              >
                <TableCell>{getBookingStatus(booking)}</TableCell>
                <TableCell>{booking.user_name}</TableCell>
                <TableCell>{format(parseISO(booking.start_time), 'PPpp')}</TableCell>
                <TableCell>{format(parseISO(booking.end_time), 'PPpp')}</TableCell>
                <TableCell>{booking.purpose}</TableCell>
                <TableCell>
                  {(user.is_admin || booking.user_name === user.username) && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(booking.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BookingTable; 