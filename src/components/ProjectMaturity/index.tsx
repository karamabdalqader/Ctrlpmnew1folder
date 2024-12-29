import React from 'react';
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Task as TaskIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { Project } from '../../types/project';
import {
  calculateDocumentationScore,
  calculateTaskScore,
  calculateTeamScore,
  calculateTimelineScore,
  calculateRiskScore,
  getDocumentationDetails,
  getTaskDetails,
  getTeamDetails,
  getTimelineDetails,
  getRiskDetails,
} from '../../utils/projectMetrics';
import SpeedMeter from '../SpeedMeter'; // Assuming SpeedMeter is a separate component

interface ProjectMaturityProps {
  project: Project;
  size?: number;
  thickness?: number;
}

interface MaturityMetric {
  name: string;
  score: number;
  description: string;
  icon: React.ReactNode;
  details: string[];
}

const ProjectMaturity: React.FC<ProjectMaturityProps> = ({ 
  project,
  size = 60, 
  thickness = 4 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const radius = (size - thickness) / 2;
  const circumference = radius * 2 * Math.PI;

  const calculateMaturityMetrics = (project: Project): MaturityMetric[] => {
    return [
      {
        name: 'Documentation',
        score: calculateDocumentationScore(project),
        description: 'Project documentation completeness',
        icon: <DescriptionIcon />,
        details: getDocumentationDetails(project),
      },
      {
        name: 'Task Management',
        score: calculateTaskScore(project),
        description: 'Task tracking and progress',
        icon: <TaskIcon />,
        details: getTaskDetails(project),
      },
      {
        name: 'Team Collaboration',
        score: calculateTeamScore(project),
        description: 'Team engagement and communication',
        icon: <PeopleIcon />,
        details: getTeamDetails(project),
      },
      {
        name: 'Timeline Management',
        score: calculateTimelineScore(project),
        description: 'Project timeline and milestones',
        icon: <TimelineIcon />,
        details: getTimelineDetails(project),
      },
      {
        name: 'Risk Management',
        score: calculateRiskScore(project),
        description: 'Risk assessment and mitigation',
        icon: <AssessmentIcon />,
        details: getRiskDetails(project),
      },
    ];
  };

  const metrics = calculateMaturityMetrics(project);
  const value = Math.round(metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length);
  const offset = circumference - (value / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const needleRotation = -90 + (180 * value) / 100;

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'maturity-popover' : undefined;

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1
      }}>
        <Box
          onClick={handleClick}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <SpeedMeter
            value={value}
            size={200}
            thickness={6}
          />
        </Box>
      </Box>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Project Maturity Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Overall Score: {value}%
          </Typography>
          <Divider sx={{ my: 1 }} />
          <List>
            {metrics.map((metric, index) => (
              <React.Fragment key={metric.name}>
                <ListItem>
                  <ListItemIcon>{metric.icon}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">{metric.name}</Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: getColor(metric.score) }}
                        >
                          {Math.round(metric.score)}%
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {metric.description}
                        </Typography>
                        <List dense>
                          {metric.details.map((detail, i) => (
                            <ListItem key={i} dense>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <InfoIcon fontSize="small" color="info" />
                              </ListItemIcon>
                              <ListItemText
                                primary={detail}
                                primaryTypographyProps={{
                                  variant: 'body2',
                                  color: 'text.secondary',
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    }
                  />
                </ListItem>
                {index < metrics.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Popover>
    </Box>
  );
};

export default ProjectMaturity;
