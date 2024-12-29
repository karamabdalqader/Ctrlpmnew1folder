import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  Tooltip,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add as AddIcon } from '@mui/icons-material';
import { Project } from '../types/project';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import { useCurrency } from '../contexts/CurrencyContext';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const ResponsiveGrid = styled(Grid)(({ theme }) => ({
  '& .MuiGrid-item': {
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    '& .MuiTableCell-root': {
      padding: theme.spacing(1),
      '&:first-of-type': {
        paddingLeft: theme.spacing(1),
      },
      '&:last-of-type': {
        paddingRight: theme.spacing(1),
      },
    },
  },
}));

// Initialize with empty projects array
// Projects should be fetched from your backend or state management system
const initialProjects: Project[] = [];

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { convertAmount, formatAmount } = useCurrency();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [openDialog, setOpenDialog] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month'>('week');
  const [newProject, setNewProject] = useState<Partial<Project>>({
    status: 'active',
    progress: 0,
    tasksCount: { total: 0, completed: 0 },
  });

  const projectStats = useMemo(() => {
    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalTeamMembers: projects.reduce((acc, p) => acc + (p.teamSize || 0), 0),
      averageProgress: projects.length ? Math.round(
        projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length
      ) : 0,
      totalProjectValue: projects.reduce((acc, p) => acc + convertAmount(p.projectValue || 0), 0),
      totalInvoiced: projects.reduce((acc, p) => acc + convertAmount(p.amountInvoiced || 0), 0),
      totalCollected: projects.reduce((acc, p) => acc + convertAmount(p.amountCollected || 0), 0),
      projectsByStatus: projects.reduce((acc: Record<string, number>, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {}),
      progressOverTime: projects.map(p => ({
        id: p.name,
        data: [
          { x: p.startDate || new Date().toISOString(), y: 0 },
          { x: new Date().toISOString().split('T')[0], y: p.progress || 0 },
        ],
      })),
      financialMetrics: [
        {
          metric: 'Project Value',
          value: projects.reduce((acc, p) => acc + convertAmount(p.projectValue || 0), 0),
        },
        {
          metric: 'Invoiced',
          value: projects.reduce((acc, p) => acc + convertAmount(p.amountInvoiced || 0), 0),
        },
        {
          metric: 'Collected',
          value: projects.reduce((acc, p) => acc + convertAmount(p.amountCollected || 0), 0),
        },
      ],
    };
    return stats;
  }, [projects, convertAmount]);

  const getFilteredFinancialData = () => {
    const now = new Date();
    const startDate = timeFilter === 'week' 
      ? new Date(now.setDate(now.getDate() - 7))
      : new Date(now.setMonth(now.getMonth() - 1));

    const filteredProjects = projects.filter(p => new Date(p.startDate) >= startDate);
    
    // If no projects match the filter, return empty data with 0 values
    if (filteredProjects.length === 0) {
      return [
        {
          id: 'Collected',
          data: [{ x: 'No Data', y: 0 }]
        },
        {
          id: 'Invoiced',
          data: [{ x: 'No Data', y: 0 }]
        }
      ];
    }

    return [
      {
        id: 'Collected',
        data: filteredProjects.map(p => ({
          x: p.name,
          y: convertAmount(p.amountCollected || 0),
        })),
      },
      {
        id: 'Invoiced',
        data: filteredProjects.map(p => ({
          x: p.name,
          y: convertAmount(p.amountInvoiced || 0),
        })),
      },
    ];
  };

  const calculateProjectHealth = (project: Project): number => {
    if (!project) return 0;
    
    const progressScore = project.progress || 0;
    const taskScore = project.tasksCount.total > 0 
      ? ((project.tasksCount.completed || 0) / project.tasksCount.total) * 100 
      : 0;
    
    // Convert timeline status to score
    const timelineStatus = calculateTimelineStatus(project.startDate, project.dueDate);
    const timeScore = timelineStatus === 'On Track' ? 100 
      : timelineStatus === 'At Risk' ? 50
      : timelineStatus === 'Delayed' ? 25
      : 0;

    const financialScore = (project.amountCollected && project.projectValue && project.projectValue > 0)
      ? (project.amountCollected / project.projectValue) * 100
      : 0;

    return Math.round((progressScore + taskScore + timeScore + financialScore) / 4);
  };

  const calculateTimelineStatus = (startDate: string, dueDate: string): 'On Track' | 'At Risk' | 'Delayed' => {
    if (!startDate || !dueDate) return 'At Risk';

    const start = new Date(startDate);
    const end = new Date(dueDate);
    const now = new Date();

    const totalDuration = end.getTime() - start.getTime();
    const elapsedDuration = now.getTime() - start.getTime();
    
    if (totalDuration <= 0) return 'At Risk';
    
    const percentageComplete = (elapsedDuration / totalDuration) * 100;

    if (percentageComplete <= 75) return 'On Track';
    if (percentageComplete <= 100) return 'At Risk';
    return 'Delayed';
  };

  const calculatePerformance = (project: Project): number => {
    const progressScore = project.progress || 0;
    const taskScore = project.tasksCount.total > 0 
      ? ((project.tasksCount.completed || 0) / project.tasksCount.total) * 100 
      : 0;
    const financialScore = (project.amountCollected && project.projectValue && project.projectValue > 0)
      ? (project.amountCollected / project.projectValue) * 100
      : 0;
  
    return Math.round((progressScore + taskScore + financialScore) / 3);
  };

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.description || !newProject.dueDate) {
      return;
    }

    const project: Project = {
      id: String(Date.now()),
      name: newProject.name,
      description: newProject.description,
      progress: 0,
      status: 'active' as const,
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      teamSize: 1,
      tasksCount: {
        total: 0,
        completed: 0,
      },
      logo: '',
      budget: 0,
      amountInvoiced: 0,
      amountCollected: 0,
      amountSpent: 0,
      projectValue: 0,
      createdAt: new Date(),
      updatedAt: new Date().toISOString(),
      phases: [] // Initialize with empty phases array
    };

    setProjects([...projects, project]);
    setOpenDialog(false);
    setNewProject({
      status: 'active',
      progress: 0,
      tasksCount: { total: 0, completed: 0 },
    });
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            color: theme.palette.text.primary 
          }}
        >
          Projects Dashboard
        </Typography>
      </Box>

      {/* Summary Cards */}
      <ResponsiveGrid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledPaper>
            <Typography 
              variant="subtitle2" 
              color={theme.palette.text.secondary}
            >
              Total Projects
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                color: theme.palette.text.primary 
              }}
            >
              {projectStats.totalProjects}
            </Typography>
            <Typography 
              variant="body2" 
              color={theme.palette.success.main} 
              sx={{ mt: 1 }}
            >
              {projectStats.activeProjects} Active
            </Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledPaper>
            <Typography 
              variant="subtitle2" 
              color={theme.palette.text.secondary}
            >
              Total Value
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                color: theme.palette.text.primary 
              }}
            >
              {formatAmount(projectStats.totalProjectValue)}
            </Typography>
            <Typography 
              variant="body2" 
              color={theme.palette.text.secondary} 
              sx={{ mt: 1 }}
            >
              Across all projects
            </Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledPaper>
            <Typography 
              variant="subtitle2" 
              color={theme.palette.text.secondary}
            >
              Total Collected
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                color: theme.palette.text.primary 
              }}
            >
              {formatAmount(projectStats.totalCollected)}
            </Typography>
            <Typography 
              variant="body2" 
              color={theme.palette.warning.main} 
              sx={{ mt: 1 }}
            >
              {formatAmount(projectStats.totalProjectValue - projectStats.totalCollected)} Remaining
            </Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledPaper>
            <Typography 
              variant="subtitle2" 
              color={theme.palette.text.secondary}
            >
              Team Members
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                color: theme.palette.text.primary 
              }}
            >
              {projectStats.totalTeamMembers}
            </Typography>
            <Typography 
              variant="body2" 
              color={theme.palette.text.secondary} 
              sx={{ mt: 1 }}
            >
              Across {projectStats.activeProjects} active projects
            </Typography>
          </StyledPaper>
        </Grid>
      </ResponsiveGrid>

      {/* Projects Table */}
      <ResponsiveGrid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Progress</TableCell>
                  <TableCell align="center">CtrlPM AI Health</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Project Value</TableCell>
                  <TableCell align="right">Invoiced</TableCell>
                  <TableCell align="right">Collected</TableCell>
                  <TableCell align="right">Remaining</TableCell>
                  <TableCell align="center">Team Size</TableCell>
                  <TableCell align="center">Tasks</TableCell>
                  <TableCell align="center">Timeline</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => {
                  const health = calculateProjectHealth(project);
                  const timelineStatus = calculateTimelineStatus(project.startDate, project.dueDate);
                  const remainingAmount = convertAmount((project.projectValue || 0) - (project.amountCollected || 0));
                  
                  return (
                    <TableRow
                      key={project.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      hover
                      onClick={() => navigate(`/projects/${project.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell component="th" scope="row">
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            color: theme.palette.text.primary 
                          }}
                        >
                          {project.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          noWrap 
                          sx={{ 
                            maxWidth: 200, 
                            color: theme.palette.text.secondary 
                          }}
                        >
                          {project.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={project.progress || 0}
                            sx={{ width: 100 }}
                          />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: theme.palette.text.primary 
                            }}
                          >
                            {(project.progress || 0)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={`AI Health Score: ${health}%`}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Chip
                              label={`${health}%`}
                              color={health >= 70 ? 'success' : health >= 40 ? 'warning' : 'error'}
                              size="small"
                            />
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={project.status}
                          color={project.status === 'active' ? 'primary' : project.status === 'completed' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: theme.palette.text.primary 
                          }}
                        >
                          {formatAmount(project.projectValue || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: theme.palette.text.primary 
                          }}
                        >
                          {formatAmount(project.amountInvoiced || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: theme.palette.text.primary 
                          }}
                        >
                          {formatAmount(project.amountCollected || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          color={remainingAmount > 0 ? theme.palette.warning.main : theme.palette.success.main}
                        >
                          {formatAmount(remainingAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: theme.palette.text.primary 
                          }}
                        >
                          {project.teamSize}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: theme.palette.text.primary 
                          }}
                        >
                          {(project.tasksCount.completed || 0)}/{(project.tasksCount.total || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={`Start: ${new Date(project.startDate).toLocaleDateString()}\nDue: ${new Date(project.dueDate).toLocaleDateString()}`}>
                          <Chip
                            label={timelineStatus}
                            color={
                              timelineStatus === 'On Track' ? 'success' :
                              timelineStatus === 'At Risk' ? 'warning' : 'error'
                            }
                            size="small"
                          />
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </Grid>
      </ResponsiveGrid>

      {/* Financial Overview Chart */}
      <ResponsiveGrid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme.palette.text.primary 
                }}
              >
                Financial Overview
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={timeFilter}
                  label="Time Period"
                  onChange={(e) => setTimeFilter(e.target.value as 'week' | 'month')}
                >
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveLine
                data={getFilteredFinancialData()}
                margin={{ top: 20, right: 120, bottom: 50, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ 
                  type: 'linear',
                  min: 0,
                  max: 'auto'
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: 'Projects',
                  legendOffset: 40
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Amount ($)',
                  legendOffset: -50,
                  format: (value) => formatAmount(value)
                }}
                enablePoints={true}
                pointSize={10}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                enableGridX={false}
                enableGridY={true}
                enableArea={true}
                areaOpacity={0.1}
                useMesh={true}
                legends={[
                  {
                    anchor: 'right',
                    direction: 'column',
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: 'left-to-right',
                    itemWidth: 80,
                    itemHeight: 20,
                    symbolSize: 12,
                    symbolShape: 'circle'
                  }
                ]}
              />
            </Box>
          </StyledPaper>
        </Grid>
      </ResponsiveGrid>

      {/* Financial Overview */}
      <Grid item xs={12} md={6} lg={4}>
        <StyledPaper>
          <Typography variant="h6" gutterBottom>
            Financial Overview
          </Typography>
          <Box sx={{ mt: 2 }}>
            {projectStats.financialMetrics.map((metric, index) => (
              <Box key={metric.metric} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {metric.metric}
                </Typography>
                <Typography variant="h5">
                  {formatAmount(metric.value)}
                </Typography>
                {index < projectStats.financialMetrics.length - 1 && (
                  <Box sx={{ my: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(metric.value / projectStats.totalProjectValue) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                      }}
                    />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </StyledPaper>
      </Grid>

      {/* Create Project Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Project Name"
              value={newProject.name || ''}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              required
            />
            <TextField
              label="Description"
              value={newProject.description || ''}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              multiline
              rows={3}
              required
            />
            <TextField
              label="Team Size"
              type="number"
              value={newProject.teamSize || ''}
              onChange={(e) => setNewProject({ ...newProject, teamSize: Number(e.target.value) })}
              required
            />
            <TextField
              label="Due Date"
              type="date"
              value={newProject.dueDate || ''}
              onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained" color="primary">
            Create Project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
