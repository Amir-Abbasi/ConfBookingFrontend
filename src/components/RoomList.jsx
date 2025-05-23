import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button
} from '@mui/material';
import { MeetingRoom as RoomIcon } from '@mui/icons-material';

const RoomList = ({ rooms, selectedRoom, onRoomSelect, setOpenBooking }) => {
  const handleRoomSelect = (room) => {
    onRoomSelect(room);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Select Room</InputLabel>
            <Select
              value={selectedRoom ? selectedRoom.id : ''}
              onChange={(e) => {
                const room = rooms.find(r => r.id === e.target.value);
                handleRoomSelect(room);
              }}
              label="Select Room"
            >
              {rooms.map(room => (
                <MenuItem key={room.id} value={room.id}>
                  {room.name} (Capacity: {room.capacity})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {rooms.map(room => (
          <Grid item xs={12} sm={6} md={4} key={room.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                bgcolor: selectedRoom && selectedRoom.id === room.id ? 'primary.light' : 'background.paper',
                '&:hover': {
                  bgcolor: 'primary.light',
                  transition: 'background-color 0.3s'
                }
              }}
              onClick={() => handleRoomSelect(room)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <RoomIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {room.name}
                  </Typography>
                </Box>
                <Typography color="text.secondary">
                  Floor: {room.floor}
                </Typography>
                <Typography color="text.secondary">
                  Capacity: {room.capacity} people
                </Typography>
                {room.features && room.features.length > 0 && (
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Features: {room.features.join(', ')}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {selectedRoom && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenBooking && setOpenBooking(true)}
          >
            Book {selectedRoom.name}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RoomList; 