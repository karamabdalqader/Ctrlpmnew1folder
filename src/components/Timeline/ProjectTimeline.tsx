import React, { useState, useEffect } from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  Paper,
  Typography,
  IconButton,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Task as TaskIcon,
  Flag as MilestoneIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import TimelineImport from './TimelineImport';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'milestone' | 'task' | 'event';
  status: 'completed' | 'in-progress' | 'planned';
}

interface ProjectTimelineProps {
  events: TimelineEvent[];
  onEventsChange: (events: TimelineEvent[]) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return '#4caf50';
    case 'in-progress':
      return '#2196f3';
    case 'planned':
      return '#ff9800';
    default:
      return '#757575';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'milestone':
      return <MilestoneIcon />;
    case 'task':
      return <TaskIcon />;
    case 'event':
      return <EventIcon />;
    default:
      return <TaskIcon />;
  }
};

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ events, onEventsChange }) => {
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [editedEvent, setEditedEvent] = useState<TimelineEvent>({
    id: '',
    title: '',
    description: '',
    date: '',
    type: 'task',
    status: 'planned',
  });

  const handleEditClick = (event: TimelineEvent) => {
    setEditingEvent(event);
    setEditedEvent({ ...event });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (eventId: string) => {
    const updatedEvents = events.filter((event) => event.id !== eventId);
    onEventsChange(updatedEvents);
  };

  const handleEditSave = () => {
    if (editingEvent) {
      const updatedEvents = events.map((event) =>
        event.id === editingEvent.id ? editedEvent : event
      );
      onEventsChange(updatedEvents);
      setIsEditDialogOpen(false);
      setEditingEvent(null);
    }
  };

  const handleImportComplete = (importedEvents: TimelineEvent[]) => {
    const updatedEvents = [...events, ...importedEvents];
    onEventsChange(updatedEvents);
    setImportDialogOpen(false);
  };

  const handleAddNew = () => {
    const newEvent: TimelineEvent = {
      id: String(Date.now()),
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'task',
      status: 'planned',
    };
    setEditingEvent(null);
    setEditedEvent(newEvent);
    setIsEditDialogOpen(true);
  };

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Box sx={{ position: 'absolute', right: 16, top: -48, zIndex: 1 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          sx={{ mr: 1 }}
        >
          Add Event
        </Button>
        <Button
          variant="outlined"
          onClick={() => setImportDialogOpen(true)}
          sx={{ mr: 1 }}
        >
          Import
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setClearDialogOpen(true)}
        >
          Clear Timeline
        </Button>
      </Box>

      <Timeline position="alternate">
        {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((event) => (
            <TimelineItem key={event.id}>
              <TimelineOppositeContent sx={{ flex: 0.2 }}>
                <Typography variant="body2" color="text.secondary">
                  {new Date(event.date).toLocaleDateString()}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot sx={{ bgcolor: getStatusColor(event.status) }}>
                  {getTypeIcon(event.type)}
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Paper elevation={3} sx={{ p: 2, position: 'relative' }}>
                  <Box sx={{ 
                    pr: 8, // Add right padding to prevent text from overlapping with buttons
                    width: '100%',
                    wordBreak: 'break-word' // Allow text to wrap
                  }}>
                    <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.description}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Status: {event.status}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(event)}
                        sx={{ bgcolor: 'background.paper' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(event.id)}
                        sx={{ bgcolor: 'background.paper' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
      </Timeline>

      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvent ? 'Edit Event' : 'Add New Event'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={editedEvent.title}
              onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={editedEvent.description}
              onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
            />
            <TextField
              label="Date"
              type="date"
              fullWidth
              value={editedEvent.date}
              onChange={(e) => setEditedEvent({ ...editedEvent, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={editedEvent.type}
                label="Type"
                onChange={(e) => setEditedEvent({ 
                  ...editedEvent, 
                  type: e.target.value as 'milestone' | 'task' | 'event'
                })}
              >
                <MenuItem value="milestone">Milestone</MenuItem>
                <MenuItem value="task">Task</MenuItem>
                <MenuItem value="event">Event</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editedEvent.status}
                label="Status"
                onChange={(e) => setEditedEvent({ 
                  ...editedEvent, 
                  status: e.target.value as 'completed' | 'in-progress' | 'planned'
                })}
              >
                <MenuItem value="planned">Planned</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              if (editingEvent) {
                handleEditSave();
              } else {
                const updatedEvents = [...events, editedEvent];
                onEventsChange(updatedEvents);
                setIsEditDialogOpen(false);
              }
            }}
            disabled={!editedEvent.title || !editedEvent.date}
          >
            {editingEvent ? 'Save Changes' : 'Add Event'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        aria-labelledby="clear-dialog-title"
        aria-describedby="clear-dialog-description"
      >
        <DialogTitle id="clear-dialog-title">
          Clear Timeline
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear all timeline events? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              onEventsChange([]);
              setClearDialogOpen(false);
            }}
            color="error"
            variant="contained"
          >
            Clear All
          </Button>
        </DialogActions>
      </Dialog>

      <TimelineImport
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImportComplete}
      />
    </Box>
  );
};

export default ProjectTimeline;
