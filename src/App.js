import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import axios from 'axios';

function App() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [bookings, setBookings] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newBooking, setNewBooking] = useState({
    user_name: '',
    start_time: '',
    end_time: '',
    purpose: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchBookings(selectedRoom);
    }
  }, [selectedRoom]);

  const fetchRooms = async () => {
    const response = await axios.get('http://localhost:5000/api/rooms');
    setRooms(response.data);
    if (response.data.length > 0) {
      setSelectedRoom(response.data[0].id);
    }
  };

  const fetchBookings = async (roomId) => {
    const response = await axios.get(`http://localhost:5000/api/bookings/${roomId}`);
    setBookings(response.data);
  };

  const handleInputChange = (e) => {
    setNewBooking({
      ...newBooking,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitBooking = async () => {
    await axios.post('http://localhost:5000/api/bookings', {
      room_id: selectedRoom,
      ...newBooking
    });
    setOpenDialog(false);
    setNewBooking({
      user_name: '',
      start_time: '',
      end_time: '',
      purpose: ''
    });
    fetchBookings(selectedRoom);
  };

  const handleDeleteBooking = async (id) => {
    await axios.delete(`http://localhost:5000/api/bookings/${id}`);
    fetchBookings(selectedRoom);
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Conference Room Booking System
      </Typography>
      
      <FormControl fullWidth style={{ marginBottom: '20px' }}>
        <InputLabel>Select Room</InputLabel>
        <Select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
        >
          {rooms.map(room => (
            <MenuItem key={room.id} value={room.id}>
              {room.name} (Floor {room.floor}, Capacity: {room.capacity})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<AddIcon />}
        onClick={() => setOpenDialog(true)}
        style={{ marginBottom: '20px' }}
      >
        Book This Room
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Booked By</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map(booking => (
              <TableRow key={booking.id}>
                <TableCell>{booking.user_name}</TableCell>
                <TableCell>{format(parseISO(booking.start_time), 'PPpp')}</TableCell>
                <TableCell>{format(parseISO(booking.end_time), 'PPpp')}</TableCell>
                <TableCell>{booking.purpose}</TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteBooking(booking.id)}
                  >
                    Cancel
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Book Conference Room</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Your Name"
            name="user_name"
            value={newBooking.user_name}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Start Time"
            type="datetime-local"
            name="start_time"
            value={newBooking.start_time}
            onChange={handleInputChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="End Time"
            type="datetime-local"
            name="end_time"
            value={newBooking.end_time}
            onChange={handleInputChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Purpose"
            name="purpose"
            value={newBooking.purpose}
            onChange={handleInputChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitBooking} color="primary">Book</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;