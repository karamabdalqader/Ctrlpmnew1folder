import React, { useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  LinearProgress,
  Box,
  Chip,
  Stack,
  Grid,
  Tooltip,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types/project';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../hooks/useNotifications';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const notificationSentRef = useRef<boolean>(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'primary';
      case 'on-hold':
        return 'warning';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    // Only send notification if project is near completion and notification hasn't been sent
    if (project.progress >= 90 && !notificationSentRef.current) {
      const notificationId = `project_completion_${project.id}`;
      addNotification({
        title: `Project Near Completion: ${project.name}`,
        message: `Project is ${project.progress}% complete`,
        type: project.frequency || 'info', // Default to 'info' if frequency is undefined
      });
      notificationSentRef.current = true;
    }
  }, [project.progress, project.id, project.name, project.frequency, addNotification]);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {project.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {project.description}
        </Typography>
        
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={project.status}
            color={getStatusColor(project.status)}
            size="small"
          />
          <Chip
            label={`Due: ${new Date(project.dueDate).toLocaleDateString()}`}
            size="small"
          />
          <Chip
            label={`Team: ${project.teamSize}`}
            size="small"
          />
        </Stack>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          {project.projectValue && (
            <Grid item xs={6}>
              <Tooltip title="Project Value">
                <Typography variant="body2" color="text.secondary">
                  Value: ${project.projectValue.toLocaleString()}
                </Typography>
              </Tooltip>
            </Grid>
          )}
          {project.amountInvoiced && (
            <Grid item xs={6}>
              <Tooltip title="Amount Invoiced">
                <Typography variant="body2" color="text.secondary">
                  Invoiced: ${project.amountInvoiced.toLocaleString()}
                </Typography>
              </Tooltip>
            </Grid>
          )}
          {project.amountCollected && (
            <Grid item xs={6}>
              <Tooltip title="Amount Collected">
                <Typography variant="body2" color="text.secondary">
                  Collected: ${project.amountCollected.toLocaleString()}
                </Typography>
              </Tooltip>
            </Grid>
          )}
          {project.amountSpent && (
            <Grid item xs={6}>
              <Tooltip title="Amount Spent">
                <Typography variant="body2" color="text.secondary">
                  Spent: ${project.amountSpent.toLocaleString()}
                </Typography>
              </Tooltip>
            </Grid>
          )}
        </Grid>

        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Progress: {project.progress}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={project.progress}
            sx={{ mt: 1 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary">
          Tasks: {project.tasksCount.completed}/{project.tasksCount.total}
        </Typography>
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          color="primary"
          onClick={() => navigate(`/projects/${project.id}`)}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
