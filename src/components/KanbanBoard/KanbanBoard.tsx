import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import { Add, Delete, Edit, Archive as ArchiveIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import ArchivedTasks from './ArchivedTasks';
import { Task, Column } from './types';

interface KanbanBoardProps {
  projectId: string;
  onUpdate?: (columns: Column[]) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId, onUpdate }) => {
  const { getProjectData, saveProjectData } = require('../../types/project');
  const [columns, setColumns] = useState<Column[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });

  // Load project data when projectId changes
  useEffect(() => {
    const projectData = getProjectData(projectId);
    setColumns(projectData.kanban.columns);
  }, [projectId]);

  // Save changes to project data
  useEffect(() => {
    if (columns.length > 0) {
      const projectData = getProjectData(projectId);
      projectData.kanban.columns = columns;
      saveProjectData(projectId, projectData);
      onUpdate?.(columns);
    }
  }, [columns, projectId, onUpdate]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    const sourceColIndex = columns.findIndex(col => col.id === source.droppableId);
    const destColIndex = columns.findIndex(col => col.id === destination.droppableId);

    // Create a new copy of columns
    const newColumns = [...columns];

    // Get source and destination columns
    const sourceCol = newColumns[sourceColIndex];
    const destCol = newColumns[destColIndex];

    // Create new task arrays
    const sourceTasks = [...sourceCol.tasks];
    const destTasks = sourceColIndex === destColIndex ? sourceTasks : [...destCol.tasks];

    // Remove the task from source
    const [removed] = sourceTasks.splice(source.index, 1);

    // Update task status based on destination column
    const updatedTask = {
      ...removed,
      status: destination.droppableId as 'todo' | 'inProgress' | 'done'
    };

    // Insert the task into destination
    destTasks.splice(destination.index, 0, updatedTask);

    // Update the columns with new task arrays
    newColumns[sourceColIndex] = {
      ...sourceCol,
      tasks: sourceTasks,
    };

    if (sourceColIndex !== destColIndex) {
      newColumns[destColIndex] = {
        ...destCol,
        tasks: destTasks,
      };
    }

    setColumns(newColumns);
  };

  const handleAddTask = (columnId: string) => {
    setSelectedColumn(columnId);
    setEditingTask(null);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
    });
    setOpenDialog(true);
  };

  const handleEditTask = (task: Task, columnId: string) => {
    setSelectedColumn(columnId);
    setEditingTask(task);
    setNewTask({ ...task });
    setOpenDialog(true);
  };

  const handleDeleteTask = (taskId: string, columnId: string) => {
    setColumns(columns.map(col => {
      if (col.id === columnId) {
        return {
          ...col,
          tasks: col.tasks.filter(task => task.id !== taskId),
        };
      }
      return col;
    }));
  };

  const handleArchiveTask = (taskId: string) => {
    const doneColumn = columns.find(col => col.id === 'done');
    if (!doneColumn) return;

    const taskToArchive = doneColumn.tasks.find(task => task.id === taskId);
    if (!taskToArchive) return;

    setColumns(columns.map(col => {
      if (col.id === 'done') {
        return {
          ...col,
          tasks: col.tasks.filter(task => task.id !== taskId),
        };
      }
      return col;
    }));

    setArchivedTasks(prev => [...prev, taskToArchive]);
  };

  const handleRestoreTask = (task: Task) => {
    setArchivedTasks(prev => prev.filter(t => t.id !== task.id));
    setColumns(prev => prev.map(col => {
      if (col.id === 'todo') {
        return {
          ...col,
          tasks: [...col.tasks, task],
        };
      }
      return col;
    }));
  };

  const handleDeleteArchivedTask = (taskId: string) => {
    setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleSaveTask = () => {
    if (!newTask.title || !selectedColumn) return;

    const task: Task = {
      id: editingTask ? editingTask.id : uuidv4(),
      title: newTask.title,
      description: newTask.description || '',
      priority: newTask.priority as 'low' | 'medium' | 'high',
      dueDate: newTask.dueDate || '',
      status: selectedColumn as 'todo' | 'inProgress' | 'done',
      assignedTo: ''
    };

    setColumns(prev => prev.map(col => {
      if (col.id === selectedColumn) {
        if (editingTask) {
          return {
            ...col,
            tasks: col.tasks.map(t => t.id === task.id ? task : t),
          };
        }
        return {
          ...col,
          tasks: [...col.tasks, task],
        };
      }
      return col;
    }));

    setOpenDialog(false);
    setEditingTask(null);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Kanban Board
      </Typography>
      <DragDropContext onDragEnd={onDragEnd}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 2,
          }}
        >
          {columns.map((column) => (
            <Paper
              key={column.id}
              sx={{
                p: 2,
                backgroundColor: '#f5f5f5',
                minHeight: 500,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {column.title}
                </Typography>
                <Box>
                  {column.id === 'done' && column.tasks.length > 0 && (
                    <IconButton
                      size="small"
                      onClick={() => column.tasks.forEach(task => handleArchiveTask(task.id))}
                      title="Archive all completed tasks"
                      sx={{ mr: 1 }}
                    >
                      <ArchiveIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Button
                    startIcon={<Add />}
                    size="small"
                    onClick={() => handleAddTask(column.id)}
                  >
                    Add Task
                  </Button>
                </Box>
              </Box>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{
                      minHeight: 400,
                      backgroundColor: snapshot.isDraggingOver ? '#e3f2fd' : 'transparent',
                      transition: 'background-color 0.2s ease',
                      padding: 1,
                      borderRadius: 1,
                    }}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              mb: 2,
                              transform: snapshot.isDragging ? 'rotate(3deg)' : 'none',
                              transition: 'transform 0.2s ease',
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle2">{task.title}</Typography>
                                <Box>
                                  {column.id === 'done' && (
                                    <IconButton
                                      size="small"
                                      onClick={() => handleArchiveTask(task.id)}
                                      title="Archive task"
                                    >
                                      <ArchiveIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleEditTask(task, column.id)}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleDeleteTask(task.id, column.id)}
                                  >
                                    <Delete fontSize="small" />
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Paper>
          ))}
        </Box>
      </DragDropContext>

      <ArchivedTasks
        tasks={archivedTasks}
        onRestoreTask={handleRestoreTask}
        onDeleteTask={handleDeleteArchivedTask}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Priority"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTask} variant="contained" color="primary">
            {editingTask ? 'Save Changes' : 'Add Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KanbanBoard;
