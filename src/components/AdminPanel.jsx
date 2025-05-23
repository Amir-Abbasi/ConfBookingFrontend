import React, { useState, useEffect } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Chip,
  FormControlLabel,
  Switch,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import { Delete, Edit, Person, MeetingRoom, Event } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ padding: '20px 0' }}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const AdminPanel = () => {
  const { user: currentUser, token } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
    fetchRooms();
    fetchAllBookings();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to fetch users');
    }
  };

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
      setError('Failed to fetch rooms');
    }
  };

  const fetchAllBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
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
      setError('Failed to fetch bookings');
    }
  };

  const handleOpenDialog = (type, data = {}) => {
    setDialogType(type);
    setFormData(data);
    setOpenDialog(true);
    if (data.id) {
      setEditingId(data.id);
    }
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({});
    setEditingId(null);
    setError('');
  };

  const validateForm = () => {
    if (dialogType === 'user') {
      if (!formData.username?.trim() || !formData.email?.trim()) {
        setError('Username and email are required');
        return false;
      }
      if (!editingId && !formData.password?.trim()) {
        setError('Password is required for new users');
        return false;
      }
    } else if (dialogType === 'room') {
      if (!formData.name?.trim() || !formData.capacity || !formData.floor) {
        setError('Name, capacity, and floor are required');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let url = 'http://localhost:5000/api/';
      let method = 'POST';
      let requestData = { ...formData };

      if (dialogType === 'user') {
        if (editingId) {
          url += `users/${editingId}`;
          method = 'PUT';
          // Remove password if it's empty (no password change)
          if (!requestData.password) {
            delete requestData.password;
          }
        } else {
          url += 'auth/register';
        }
      } else if (dialogType === 'room') {
        url += 'rooms';
        if (editingId) {
          url += `/${editingId}`;
          method = 'PUT';
        }
        // Ensure capacity and floor are numbers
        requestData.capacity = parseInt(requestData.capacity) || 0;
        requestData.floor = parseInt(requestData.floor) || 0;
        // Ensure features is an array
        if (typeof requestData.features === 'string') {
          requestData.features = requestData.features.split(',').map(f => f.trim()).filter(Boolean);
        } else if (!Array.isArray(requestData.features)) {
          requestData.features = [];
        }
      }

      console.log('Making request to:', url);
      console.log('Method:', method);
      console.log('Request data:', requestData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || data.message || (data.details ? `Operation failed: ${data.details}` : 'Operation failed'));
      }

      if (dialogType === 'user') {
        fetchUsers();
      } else {
        fetchRooms();
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to submit:', error);
      setError(error.message || 'Failed to update. Please try again.');
    }
  };

  const handleDelete = async (type, id) => {
    if (type === 'user' && id === currentUser.id) {
      setError("You cannot delete your own account");
      return;
    }

    try {
      const url = `http://localhost:5000/api/${type}s/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Delete operation failed');
      }

      if (type === 'user') {
        fetchUsers();
      } else {
        fetchRooms();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      setError(`Failed to delete ${type}`);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }

      fetchAllBookings();
    } catch (error) {
      console.error('Failed to delete booking:', error);
      setError('Failed to delete booking');
    }
  };

  const getRoomName = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'Unknown Room';
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Admin Panel
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab icon={<Person />} label="Users" />
          <Tab icon={<MeetingRoom />} label="Rooms" />
          <Tab icon={<Event />} label="Bookings" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog('user')}
            sx={{ mb: 2 }}
          >
            Add New User
          </Button>
          
          <List>
            {users.map((user) => (
              <React.Fragment key={user.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person color="action" />
                        <Typography>{user.username}</Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" component="div">
                          Email: {user.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" component="div">
                          Created: {new Date(user.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={user.is_admin ? 'Admin' : 'User'}
                      color={user.is_admin ? 'primary' : 'default'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton
                      edge="end"
                      onClick={() => handleOpenDialog('user', {
                        ...user,
                        password: '' // Don't send password for editing
                      })}
                      sx={{ mr: 1 }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete('user', user.id)}
                      disabled={user.id === currentUser.id}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog('room')}
            sx={{ mb: 2 }}
          >
            Add New Room
          </Button>
          
          <List>
            {rooms.map((room) => (
              <React.Fragment key={room.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MeetingRoom color="action" />
                        <Typography>{room.name}</Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" component="div">
                          Capacity: {room.capacity} people | Floor: {room.floor}
                        </Typography>
                        {room.features && (
                          <Typography variant="body2" color="text.secondary" component="div">
                            Features: {room.features.join(', ')}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleOpenDialog('room', room)}
                      sx={{ mr: 1 }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete('room', room.id)}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Room</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Purpose</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(bookings || [])
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.room_name || getRoomName(booking.room_id)}</TableCell>
                      <TableCell>{booking.user_name}</TableCell>
                      <TableCell>
                        {booking.start_time ? format(parseISO(booking.start_time), 'PPpp') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {booking.end_time ? format(parseISO(booking.end_time), 'PPpp') : 'N/A'}
                      </TableCell>
                      <TableCell>{booking.purpose}</TableCell>
                      <TableCell>
                        {booking.created_at ? format(parseISO(booking.created_at), 'PPpp') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteBooking(booking.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={bookings ? bookings.length : 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </TabPanel>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingId ? 'Edit' : 'Add New'} {dialogType === 'user' ? 'User' : 'Room'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          {dialogType === 'user' && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Username"
                fullWidth
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <TextField
                margin="dense"
                label={editingId ? "New Password (leave blank to keep current)" : "Password"}
                type="password"
                fullWidth
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_admin || false}
                    onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                  />
                }
                label="Admin Access"
                sx={{ mt: 1 }}
              />
            </>
          )}
          {dialogType === 'room' && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Room Name"
                fullWidth
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Capacity"
                type="number"
                fullWidth
                value={formData.capacity || ''}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              />
              <TextField
                margin="dense"
                label="Floor"
                type="number"
                fullWidth
                value={formData.floor || ''}
                onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
              />
              <TextField
                margin="dense"
                label="Features (comma-separated)"
                fullWidth
                value={formData.features ? (Array.isArray(formData.features) ? formData.features.join(', ') : formData.features) : ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  features: e.target.value.split(',').map(f => f.trim()).filter(Boolean)
                })}
                helperText="Example: Projector, Whiteboard, Video Conference"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingId ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;