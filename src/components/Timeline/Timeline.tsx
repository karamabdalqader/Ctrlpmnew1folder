import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { getProjectData, saveProjectData } from '../../types/project';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'milestone' | 'task' | 'meeting';
}

interface TimelineProps {
  projectId: string;
}

const Timeline: React.FC<TimelineProps> = ({ projectId }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({
    title: '',
    description: '',
    date: '',
    type: 'milestone',
  });

  useEffect(() => {
    const projectData = getProjectData(projectId);
    setEvents(projectData.timeline || []);
  }, [projectId]);

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.date) return;

    const projectData = getProjectData(projectId);
    let updatedEvents: TimelineEvent[];

    if (selectedEvent) {
      // Edit existing event
      updatedEvents = events.map((event) =>
        event.id === selectedEvent.id
          ? { ...newEvent, id: selectedEvent.id } as TimelineEvent
          : event
      );
    } else {
      // Add new event
      const newTimelineEvent: TimelineEvent = {
        ...newEvent as TimelineEvent,
        id: Math.random().toString(36).substr(2, 9),
      };
      updatedEvents = [...events, newTimelineEvent];
    }

    // Sort events by date
    updatedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setEvents(updatedEvents);
    projectData.timeline = updatedEvents;
    saveProjectData(projectId, projectData);

    handleCloseDialog();
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter((event) => event.id !== eventId);
    setEvents(updatedEvents);

    const projectData = getProjectData(projectId);
    projectData.timeline = updatedEvents;
    saveProjectData(projectId, projectData);
  };

  const handleEditEvent = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setNewEvent(event);
    setOpenDialog(true);
  };

  const handleOpenDialog = () => {
    setSelectedEvent(null);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      type: 'milestone',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      type: 'milestone',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Project Timeline</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Event
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <List>
          {events.map((event) => (
            <ListItem
              key={event.id}
              secondaryAction={
                <Box>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleEditEvent(event)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={event.title}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      {new Date(event.date).toLocaleDateString()} - {event.type}
                    </Typography>
                    <br />
                    {event.description}
                  </>
                }
              />
            </ListItem>
          ))}
          {events.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No events yet"
                secondary="Click 'Add Event' to create your first timeline event"
              />
            </ListItem>
          )}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedEvent ? 'Edit Event' : 'Add New Event'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            select
            margin="dense"
            label="Type"
            fullWidth
            value={newEvent.type}
            onChange={(e) =>
              setNewEvent({
                ...newEvent,
                type: e.target.value as 'milestone' | 'task' | 'meeting',
              })
            }
            SelectProps={{
              native: true,
            }}
          >
            <option value="milestone">Milestone</option>
            <option value="task">Task</option>
            <option value="meeting">Meeting</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveEvent} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Timeline;
