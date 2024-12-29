import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
} from '@mui/material';
import { Project } from '../../types/project';

// Add Task type to Project interface
interface ProjectTask {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  parentId?: string;
  dependencies?: string[];
}

interface ProjectWithTasks extends Project {
  tasks?: ProjectTask[];
}

interface GanttChartProps {
  project: ProjectWithTasks;
  onUpdate?: (updatedProject: ProjectWithTasks) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({ project, onUpdate }) => {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);

  useEffect(() => {
    // Convert project tasks to Gantt tasks
    const projectTasks = project.tasks?.map(task => ({
      ...task,
      start_date: new Date(task.startDate),
      end_date: new Date(task.endDate),
    })) || [];

    setTasks(projectTasks);
  }, [project]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Project Timeline
      </Typography>
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
        <div ref={ganttContainer} style={{ width: '100%', height: '500px' }}>
          {/* Placeholder for Gantt chart visualization */}
          <Typography color="text.secondary">
            Gantt chart visualization will be implemented here. Consider using libraries like @devexpress/dx-react-scheduler or react-gantt-chart.
          </Typography>
        </div>
      </Paper>
    </Box>
  );
};

export default GanttChart;
