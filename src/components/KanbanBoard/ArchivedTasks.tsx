import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { Task } from './types';

interface ArchivedTasksProps {
  tasks: Task[];
  onRestoreTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const ArchivedTasks: React.FC<ArchivedTasksProps> = ({
  tasks,
  onRestoreTask,
  onDeleteTask,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button
        startIcon={<ArchiveIcon />}
        onClick={handleOpen}
        variant="outlined"
        sx={{ mt: 2 }}
      >
        View Archived Tasks
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <ArchiveIcon />
            <Typography variant="h6">Archived Tasks</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {tasks.length === 0 ? (
              <Typography color="textSecondary" align="center">
                No archived tasks
              </Typography>
            ) : (
              tasks.map((task) => (
                <Card key={task.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2">{task.title}</Typography>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => onRestoreTask(task)}
                          title="Restore task"
                        >
                          <RestoreIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onDeleteTask(task.id)}
                          title="Delete permanently"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {task.description}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="primary">
                        {task.priority}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Due: {task.dueDate}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ArchivedTasks;
