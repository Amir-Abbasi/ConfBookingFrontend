import React, { useState, useEffect } from 'react';
import {
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import RoomList from './components/RoomList';
import BookingDialog from './components/BookingDialog';
import BookingTable from './components/BookingTable';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const theme = createTheme();

const AppContent = () => {
  const { user, token, logout } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [openBooking, setOpenBooking] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRoom) {
      fetchBookings();
    }
  }, [selectedRoom]);

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rooms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  const fetchBookings = async () => {
    if (!selectedRoom) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${selectedRoom.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const handleBookingComplete = () => {
    setOpenBooking(false);
    fetchBookings();
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    if (room) {
      fetchBookings();
    }
  };

  if (!user) {
    return <Login />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Conference Room Booking
          </Typography>
          {user.is_admin && (
            <Button color="inherit" href="#admin" sx={{ mr: 2 }}>
              Admin Panel
            </Button>
          )}
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          pt: 8,
        }}
      >
        {user.is_admin ? (
          <AdminPanel />
        ) : (
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <RoomList
              rooms={rooms}
              selectedRoom={selectedRoom}
              onRoomSelect={handleRoomSelect}
              setOpenBooking={setOpenBooking}
            />
            <BookingTable bookings={bookings} />
            <BookingDialog
              open={openBooking}
              onClose={() => setOpenBooking(false)}
              onComplete={handleBookingComplete}
              room={selectedRoom}
            />
          </Container>
        )}
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;