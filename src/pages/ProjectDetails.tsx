import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Tabs,
  Tab,
  Alert,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  alpha,
  Link,
  Stack,
  useTheme,
  Slider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Assessment as AssessmentIcon,
  SmartToy as SmartToyIcon,
  Recommend as RecommendIcon,
  Lightbulb as LightbulbIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
  InsertChartOutlined as InsertChartOutlinedIcon,
  Event as EventIcon,
  CalendarToday as CalendarTodayIcon,
  FiberManualRecord as FiberManualRecordIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  DonutLarge as DonutLargeIcon,
  Label as LabelIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  AutoGraph as AutoGraphIcon,
  ViewTimeline as ViewTimelineIcon,
  Paid as PaidIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Info as InfoIcon,
  Task as TaskIcon,
  PlayCircle as PlayCircleFilledIcon,
  Pending as PendingIcon,
  PriorityHigh as PriorityHighIcon,
  Block as BlockIcon,
  Flag as FlagIcon,
  ChangeCircle as ChangeCircleIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Bookmark as BookmarkAddIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import OpenAI from 'openai';
import KanbanBoard from '../components/KanbanBoard/KanbanBoard';
import FileUpload from '../components/FileManagement/FileUpload';
import InvoiceList from '../components/InvoiceManagement/InvoiceList';
import { Project, getProjectData, saveProjectData } from '../types/project';
import { Column, Task as KanbanTask } from '../components/KanbanBoard/types';
import ProjectTimeline, { TimelineEvent } from '../components/Timeline/ProjectTimeline';
import ProjectAssistant from '../components/ProjectAssistant/ProjectAssistant';
import SmartProjectInsights from '../components/SmartProjectInsights/SmartProjectInsights';
import MeetingSummarizer from '../components/MeetingSummarizer/MeetingSummarizer';
import ProjectMaturity from '../components/ProjectMaturity';
import SpeedMeter from '../components/SpeedMeter';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTranslation } from 'react-i18next';
import { Currency, worldCurrencies } from '../contexts/CurrencyContext';
import {
  calculateDocumentationScore,
  calculateTaskScore,
  calculateTeamScore,
  calculateTimelineScore,
  calculateRiskScore,
} from '../utils/projectMetrics';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
}

interface ProjectHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  recommendations: string[];
  bestPractices: string[];
  risks: {
    level: 'low' | 'medium' | 'high';
    description: string;
  }[];
  nextSteps: string[];
  lastUpdated: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const { convertAmount, formatAmount, currency, getCurrencyDisplay } = useCurrency();
  const { i18n } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<Project>({
    id: id || '',
    name: '',
    description: '',
    progress: 0,
    status: 'active',
    startDate: '',
    dueDate: '',
    teamSize: 0,
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
  });
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const [newBookmark, setNewBookmark] = useState<Partial<Bookmark>>({});
  const [projectHealth, setProjectHealth] = useState<ProjectHealth>({
    status: 'warning',
    score: 0,
    recommendations: [],
    bestPractices: [],
    risks: [],
    nextSteps: [],
    lastUpdated: new Date().toISOString(),
  });
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [logoUploadAnchor, setLogoUploadAnchor] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const statusOptions: Array<'active' | 'completed' | 'on-hold'> = ['active', 'completed', 'on-hold'];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimelineChange = (newEvents: TimelineEvent[]) => {
    setTimelineEvents(newEvents);
  };

  const handleAddBookmark = () => {
    if (!newBookmark.title || !newBookmark.url) return;
    
    const bookmark: Bookmark = {
      id: Math.random().toString(36).substr(2, 9),
      title: newBookmark.title,
      url: newBookmark.url,
      description: newBookmark.description || '',
    };
    
    setBookmarks([...bookmarks, bookmark]);
    setNewBookmark({});
    setBookmarkDialogOpen(false);
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const handleEditClick = () => {
    setEditedProject(editedProject);
    setIsEditing(true);
  };

  const handleSaveProject = () => {
    // Update project in localStorage
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const projects = JSON.parse(savedProjects);
      const updatedProjects = projects.map((project: any) => 
        project.id === editedProject.id 
          ? { ...project, ...editedProject, updatedAt: new Date().toISOString() }
          : project
      );
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      
      // Dispatch custom event for project update
      const updateEvent = new CustomEvent('projectUpdated', {
        detail: {
          projectId: editedProject.id,
          projectName: editedProject.name,
          projectStatus: editedProject.status
        }
      });
      window.dispatchEvent(updateEvent);
    }

    setIsEditing(false);
  };

  const handleTeamMemberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTeamSize = parseInt(event.target.value) || 0;
    setEditedProject({
      ...editedProject,
      teamSize: newTeamSize
    });
  };

  const calculateDuration = () => {
    const start = new Date(editedProject.startDate);
    const end = new Date(editedProject.dueDate);
    const durationInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const durationInMonths = Math.ceil(durationInDays / 30);
    return {
      days: durationInDays,
      months: durationInMonths,
      elapsed: Math.ceil((new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    };
  };

  const handleLogoClick = (event: React.MouseEvent<HTMLElement>) => {
    setLogoUploadAnchor(event.currentTarget);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedProject({
          ...editedProject,
          logo: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
    setLogoUploadAnchor(null);
  };

  const evaluateProjectHealth = async () => {
    setIsLoading(true);
    try {
      const duration = calculateDuration();
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a friendly and experienced Project Management Professional (PMP) expert who specializes in making complex project management concepts simple and clear. Your goal is to help project managers by:

            1. Using simple, clear language that even a 9-year-old could understand
            2. Highlighting key terms in bold
            3. Using real-world examples
            4. Providing actionable advice based on PMP best practices
            5. Considering PRINCE2 and Agile methodologies when relevant

            When analyzing projects, focus on these key areas:
            1. Money Management (Budget vs Spending)
            2. Time Management (Schedule & Deadlines)
            3. Team Management (People & Skills)
            4. Task Progress (Work Completion)
            5. Project Goals (Success Metrics)

            Format your response as a JSON object with these sections:
            {
              "recommendations": [
                "Simple, actionable advice with highlighted key terms"
              ],
              "bestPractices": [
                "Easy-to-understand best practice with PMP terms explained simply"
              ],
              "risks": [
                {
                  "level": "high/medium/low",
                  "description": "Clear risk description with key terms and simple solution"
                }
              ],
              "nextSteps": [
                "Simple next step with clear goal and expected outcome"
              ]
            }`
          },
          {
            role: "user",
            content: `Please analyze this project in simple terms:

            Project Overview:
            - Name: ${editedProject.name}
            - What it's about: ${editedProject.description}
            - Current Status: ${editedProject.status}
            
            Money Stuff:
            - Total Worth: $${editedProject.projectValue || 0}
            - Money Available: $${editedProject.budget || 0}
            - Money Spent: $${editedProject.amountSpent || 0}
            - How much of budget used: ${editedProject.budget ? Math.round((editedProject.amountSpent || 0) / editedProject.budget * 100) : 0}%
            
            Time Info:
            - Started: ${editedProject.startDate}
            - Due: ${editedProject.dueDate}
            - How long: ${duration.months} months (${duration.days} total days)
            - Days passed: ${duration.elapsed} days (${Math.round(duration.elapsed / duration.days * 100)}% of time used)
            
            Work Progress:
            - How much done: ${editedProject.progress}%
            - Tasks finished: ${editedProject.tasksCount.completed} out of ${editedProject.tasksCount.total}
            - Task success rate: ${Math.round((editedProject.tasksCount.completed / editedProject.tasksCount.total) * 100)}%
            
            Team Info:
            - Team size: ${editedProject.teamSize} people
            - Tasks per person: ${Math.round(editedProject.tasksCount.total / editedProject.teamSize)}

            Please help us understand:
            1. What's going well and what needs attention?
            2. What should we do next?
            3. What risks should we watch out for?
            4. What are some good practices we should follow?

            Make it simple and clear with highlighted important words!`
          }
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        max_tokens: 1000,
      });

      const analysis = JSON.parse(completion.choices[0].message.content || '{}');
      
      setProjectHealth({
        status: editedProject.progress >= 80 ? 'healthy' : editedProject.progress >= 60 ? 'warning' : 'critical',
        score: editedProject.progress,
        recommendations: analysis.recommendations || [],
        bestPractices: analysis.bestPractices || [],
        risks: analysis.risks || [],
        nextSteps: analysis.nextSteps || [],
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error analyzing project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = () => {
    try {
      // Get current projects from localStorage
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        const updatedProjects = projects.filter((project: Project) => project.id !== id);
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        
        // Remove project-specific data
        localStorage.removeItem(`project_data_${id}`);
        
        // Navigate back to dashboard
        window.location.href = '/dashboard';
      }
    } catch (error) {
      setDeleteError('Failed to delete project. Please try again.');
    }
  };

  const handleArchiveProject = () => {
    const updatedProject: Project = {
      ...editedProject,
      status: 'completed' as const,
      updatedAt: new Date().toISOString()
    };
    setEditedProject(updatedProject);
    
    // Update project in localStorage
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const projects = JSON.parse(savedProjects);
      const updatedProjects = projects.map((project: Project) => 
        project.id === updatedProject.id 
          ? updatedProject
          : project
      );
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      
      // Dispatch custom event for project update
      const updateEvent = new CustomEvent('projectUpdated', {
        detail: {
          projectId: updatedProject.id,
          projectName: updatedProject.name,
          projectStatus: updatedProject.status
        }
      });
      window.dispatchEvent(updateEvent);
    }
  };

  const handleKanbanUpdate = (columns: Column[]) => {
    const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);
    const completedTasks = columns.find(col => col.id === 'done')?.tasks.length || 0;
    
    // Update the project's task count
    const updatedProject = {
      ...editedProject,
      tasksCount: {
        total: totalTasks,
        completed: completedTasks
      }
    };
    
    setEditedProject(updatedProject);
    
    // Save the updated project
    const projectData = getProjectData(id || '');
    projectData.kanban.columns = columns;
    saveProjectData(id || '', projectData);
    
    // Update local storage with new project data
    localStorage.setItem(`project_${id}`, JSON.stringify(updatedProject));
  };

  useEffect(() => {
    if (id) {
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        const project = projects.find((p: any) => p.id === id);
        if (project) {
          setEditedProject(prev => ({ ...prev, ...project }));
        }
      }
    }
  }, [id]);

  // Helper functions for project summary
  const getTimelineStatus = (startDate: string, dueDate: string, progress: number): string => {
    const start = new Date(startDate);
    const end = new Date(dueDate);
    const today = new Date();
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const daysElapsed = (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const expectedProgress = (daysElapsed / totalDays) * 100;

    if (today > end) {
      return `Project is overdue. Currently at ${progress}% completion.`;
    } else if (progress >= expectedProgress) {
      return `On track or ahead of schedule. ${Math.round(expectedProgress)}% expected vs ${progress}% actual.`;
    } else {
      return `Behind schedule. ${Math.round(expectedProgress)}% expected vs ${progress}% actual.`;
    }
  };

  const generateProjectInsights = (project: Project, health: ProjectHealth): string[] => {
    const insights: string[] = [];
    
    // Progress-based insights
    if (project.progress) {
      if (project.progress < 25) {
        insights.push("Project is in early stages. Focus on setting up proper foundations and clear communication channels.");
      } else if (project.progress > 75) {
        insights.push("Project is nearing completion. Priority should be on quality assurance and documentation.");
      }
    }

    // Task-based insights
    const completedTasks = project.tasksCount?.completed || 0;
    const totalTasks = project.tasksCount?.total || 0;
    
    if (totalTasks > 0) {
      insights.push(`${completedTasks} out of ${totalTasks} tasks completed (${Math.round((completedTasks/totalTasks) * 100)}% task completion rate).`);
    }

    // Risk-based insights
    const highRisks = health.risks.filter(risk => risk.level === 'high').length;
    if (highRisks > 0) {
      insights.push(`${highRisks} high-risk items identified that need immediate attention.`);
    }

    // Timeline-based insights
    const today = new Date();
    const endDate = new Date(project.dueDate);
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining > 0) {
      insights.push(`${daysRemaining} days remaining until project deadline.`);
    } else {
      insights.push(`Project is ${Math.abs(daysRemaining)} days past the original deadline.`);
    }

    return insights;
  };

  const generateActionItems = (project: Project, health: ProjectHealth): string[] => {
    const actions: string[] = [];
    
    // Add recommendations based on project health
    actions.push(...health.recommendations);

    // Task-based actions
    if (project.tasksCount.total > project.tasksCount.completed) {
      actions.push("Review and prioritize remaining tasks to maintain project momentum.");
    }

    // Timeline-based actions
    const today = new Date();
    const endDate = new Date(project.dueDate);
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 14 && project.progress && project.progress < 80) {
      actions.push("Consider reviewing project scope and timeline due to approaching deadline.");
    }

    // Risk-based actions
    const highRisks = health.risks.filter(risk => risk.level === 'high');
    if (highRisks.length > 0) {
      actions.push("Schedule risk assessment meeting to address high-risk items.");
      highRisks.forEach(risk => {
        actions.push(`Address high-risk item: ${risk.description}`);
      });
    }

    return actions;
  };

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      maxWidth: '100%', 
      minHeight: '100vh', 
      mx: 'auto', 
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 2, sm: 3 }, 
      overflow: 'hidden', 
    }}>
      {/* Header Section */}
      <Paper 
        elevation={2}
        sx={{ 
          borderRadius: { xs: 1, sm: 2 },
          overflow: 'hidden',
          background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.background.paper, 0.8)})`,
          width: '100%',
        }}
      >
        {/* Project Status Banner */}
        <Box 
          sx={{ 
            px: 3,
            py: 1,
            bgcolor: theme => {
              switch(editedProject.status) {
                case 'active': return alpha(theme.palette.success.main, 0.1);
                case 'completed': return alpha(theme.palette.info.main, 0.1);
                case 'on-hold': return alpha(theme.palette.warning.main, 0.1);
                default: return alpha(theme.palette.grey[500], 0.1);
              }
            },
            borderBottom: '1px solid',
            borderColor: theme => {
              switch(editedProject.status) {
                case 'active': return alpha(theme.palette.success.main, 0.2);
                case 'completed': return alpha(theme.palette.info.main, 0.2);
                case 'on-hold': return alpha(theme.palette.warning.main, 0.2);
                default: return alpha(theme.palette.grey[500], 0.2);
              }
            },
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500,
                color: theme => {
                  switch(editedProject.status) {
                    case 'active': return theme.palette.success.main;
                    case 'completed': return theme.palette.info.main;
                    case 'on-hold': return theme.palette.warning.main;
                    default: return theme.palette.grey[500];
                  }
                }
              }}
            >
              {editedProject.status.toUpperCase()}
            </Typography>
            <Box 
              component="span" 
              sx={{ 
                width: 6, 
                height: 6, 
                borderRadius: '50%',
                bgcolor: theme => {
                  switch(editedProject.status) {
                    case 'active': return theme.palette.success.main;
                    case 'completed': return theme.palette.info.main;
                    case 'on-hold': return theme.palette.warning.main;
                    default: return theme.palette.grey[500];
                  }
                }
              }} 
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Project Start Date">
              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarTodayIcon fontSize="small" /> Start: {new Date(editedProject.startDate).toLocaleDateString()}
              </Typography>
            </Tooltip>
            <Tooltip title="Project Due Date">
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  color: theme => {
                    const daysLeft = Math.ceil((new Date(editedProject.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return daysLeft < 7 ? theme.palette.error.main :
                           daysLeft < 14 ? theme.palette.warning.main :
                           theme.palette.success.main;
                  }
                }}
              >
                <EventIcon fontSize="small" /> Due: {new Date(editedProject.dueDate).toLocaleDateString()}
              </Typography>
            </Tooltip>
          </Box>
        </Box>

        {/* Main Project Info */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Left Column - Project Identity */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                {/* Logo Section */}
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={editedProject.logo}
                    alt={editedProject.name}
                    sx={{ 
                      width: { xs: 64, sm: 80 }, 
                      height: { xs: 64, sm: 80 },
                      cursor: 'pointer',
                      boxShadow: 2,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      }
                    }}
                    onClick={handleLogoClick}
                  />
                  <input
                    accept="image/*"
                    type="file"
                    hidden
                    id="logo-upload"
                    onChange={handleLogoUpload}
                  />
                  <Tooltip title="Change project logo">
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: -8,
                        right: -8,
                        backgroundColor: 'background.paper',
                        boxShadow: 2,
                        transition: 'all 0.2s',
                        '&:hover': { 
                          backgroundColor: 'background.paper',
                          transform: 'scale(1.1)',
                        },
                      }}
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      <PhotoLibraryIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      display: 'block',
                      mb: 1
                    }}
                  >
                    Project Name
                  </Typography>
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {editedProject.name}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<EditIcon />}
                          onClick={handleEditClick}
                        >
                          Edit Project
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          startIcon={<ArchiveIcon />}
                          onClick={handleArchiveProject}
                        >
                          Archive
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => setDeleteDialogOpen(true)}
                        >
                          Delete Project
                        </Button>
                      </Box>
                    </Box>
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    color="textSecondary"
                    sx={{ mb: 2 }}
                  >
                    {editedProject.description}
                  </Typography>

                  {/* Project Links and Bookmarks Section */}
                  <Box 
                    sx={{ 
                      backgroundColor: 'transparent',
                      borderRadius: 1
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center', 
                      mb: 1,
                      gap: 1
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2 
                      }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 500, 
                            color: theme.palette.text.primary, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            '& .MuiSvgIcon-root': {
                              fontSize: '1.2rem',
                            }
                          }}
                        >
                          <BookmarkAddIcon /> Project Links
                        </Typography>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => setBookmarkDialogOpen(true)}
                          sx={{
                            textTransform: 'none',
                            color: theme.palette.primary.main,
                            minWidth: 'auto',
                            p: '2px 8px',
                            '&:hover': {
                              backgroundColor: 'transparent',
                              color: theme.palette.primary.dark,
                            }
                          }}
                        >
                          Add Link
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 0.5, 
                      flexWrap: 'wrap',
                      alignItems: 'center'
                    }}>
                      {bookmarks.map((bookmark) => (
                        <Button
                          key={bookmark.id}
                          variant="text"
                          size="small"
                          startIcon={<LinkIcon fontSize="small" />}
                          onClick={() => window.open(bookmark.url, '_blank')}
                          sx={{ 
                            py: 0.5,
                            px: 1,
                            borderRadius: 1,
                            textTransform: 'none',
                            color: theme.palette.text.primary,
                            fontSize: '0.875rem',
                            justifyContent: 'flex-start',
                            minWidth: 'auto',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08)
                            }
                          }}
                        >
                          {bookmark.title}
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBookmark(bookmark.id);
                            }}
                            sx={{
                              ml: 0.5,
                              p: 0.25,
                              color: theme.palette.text.secondary,
                              '&:hover': {
                                color: theme.palette.error.main,
                                backgroundColor: 'transparent'
                              }
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: '0.875rem' }} />
                          </IconButton>
                        </Button>
                      ))}
                      {bookmarks.length === 0 && (
                        <Typography 
                          variant="body2" 
                          color="textSecondary"
                          sx={{ 
                            py: 1,
                            fontSize: '0.875rem'
                          }}
                        >
                          No links added yet. Click 'Add Link' to add your first project link.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                </Box>
              </Box>
            </Grid>

            {/* Project Insights Section */}
            <Grid item xs={12}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  mb: 3,
                  borderRadius: 2, 
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 600, 
                    color: theme.palette.text.primary,
                    fontSize: '1.25rem'
                  }}
                >
                  Project Insights
                </Typography>

                {/* Project Health Meters */}
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 6,
                  mb: 4
                }}>
                  <Tooltip title="Click to view detailed project maturity metrics and recommendations" arrow placement="top">
                    <Box sx={{ textAlign: 'center', cursor: 'pointer' }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          mb: 2,
                          color: theme.palette.text.secondary,
                          fontSize: '1rem',
                          fontWeight: 500
                        }}
                      >
                        Project Maturity
                      </Typography>
                      <ProjectMaturity project={editedProject} size={200} thickness={6} />
                    </Box>
                  </Tooltip>
                  <Tooltip title="Click to view detailed progress breakdown and timeline" arrow placement="top">
                    <Box sx={{ textAlign: 'center', cursor: 'pointer' }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          mb: 2,
                          color: theme.palette.text.secondary,
                          fontSize: '1rem',
                          fontWeight: 500
                        }}
                      >
                        Progress
                      </Typography>
                      <SpeedMeter value={editedProject.progress || 0} size={200} thickness={6} />
                    </Box>
                  </Tooltip>
                </Box>

                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2
                }}>
                  <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          color: theme.palette.primary.main
                        }}
                      >
                        Detailed Project Metrics
                      </Typography>
                      <Tooltip title="Comprehensive metrics showing project performance" placement="top-start" arrow>
                        <InfoIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                      </Tooltip>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.03),
                          }}
                        >
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                Documentation
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DescriptionIcon color="primary" />
                                <Typography variant="body2">
                                  {calculateDocumentationScore(editedProject)}% Complete
                                </Typography>
                              </Box>
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                Task Management
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TaskIcon color="primary" />
                                <Typography variant="body2">
                                  {calculateTaskScore(editedProject)}% Efficiency
                                </Typography>
                              </Box>
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                Team Collaboration
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <GroupIcon color="primary" />
                                <Typography variant="body2">
                                  {calculateTeamScore(editedProject)}% Engagement
                                </Typography>
                              </Box>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.03),
                          }}
                        >
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                Timeline Management
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TimelineIcon color="primary" />
                                <Typography variant="body2">
                                  {calculateTimelineScore(editedProject)}% On Schedule
                                </Typography>
                              </Box>
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                Risk Management
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AssessmentIcon color="primary" />
                                <Typography variant="body2">
                                  {calculateRiskScore(editedProject)}% Controlled
                                </Typography>
                              </Box>
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                Overall Health
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HealthAndSafetyIcon color="primary" />
                                <Typography variant="body2">
                                  {projectHealth.status === 'healthy' ? 'Good' : 
                                   projectHealth.status === 'warning' ? 'Needs Attention' : 'Critical'}
                                </Typography>
                              </Box>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.03),
                          }}
                        >
                          <Typography variant="subtitle2" gutterBottom>
                            Recommendations
                          </Typography>
                          <List dense>
                            {projectHealth.recommendations.map((rec, index) => (
                              <ListItem key={index}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <RecommendIcon color="primary" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={rec}
                                  primaryTypographyProps={{
                                    variant: 'body2',
                                    color: 'text.secondary',
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Paper>

                  <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          color: theme.palette.primary.main
                        }}
                      >
                        Timeline Management
                    </Typography>
                      <Tooltip title="Project timeline and milestones" placement="top-start" arrow>
                        <InfoIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Tooltip title="Overall completion status of project deliverables and milestones" arrow placement="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TaskIcon color="primary" fontSize="small" />
                          <Typography variant="body2">
                            Progress: {editedProject.progress}%
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title={`${editedProject.tasksCount.completed} tasks completed out of ${editedProject.tasksCount.total} total tasks`} arrow placement="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AssignmentTurnedInIcon 
                            color="info" 
                            fontSize="small"
                          />
                          <Typography variant="body2">
                            Tasks: {editedProject.tasksCount.completed}/{editedProject.tasksCount.total}
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title={`Project timeline: ${new Date(editedProject.startDate).toLocaleDateString()} - ${new Date(editedProject.dueDate).toLocaleDateString()}`} arrow placement="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarTodayIcon 
                            color="success" 
                            fontSize="small"
                          />
                          <Typography variant="body2">
                            Duration: {calculateDuration().months} months
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title={`${editedProject.teamSize} team members actively working on this project`} arrow placement="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GroupIcon 
                            color="warning" 
                            fontSize="small"
                          />
                          <Typography variant="body2">
                            Team Size: {editedProject.teamSize}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  </Paper>

                  <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          color: theme.palette.primary.main
                        }}
                      >
                        Deliverables Overview
                    </Typography>
                      <Tooltip title="Track project deliverables" placement="bottom-start" arrow>
                        <InfoIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Tooltip title="Overall completion status of project deliverables and milestones" arrow placement="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TaskIcon color="primary" fontSize="small" />
                          <Typography variant="body2">
                            Progress: {editedProject.progress}%
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title={`${editedProject.tasksCount.completed} tasks completed out of ${editedProject.tasksCount.total} total tasks`} arrow placement="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AssignmentTurnedInIcon 
                            color="info" 
                            fontSize="small"
                          />
                          <Typography variant="body2">
                            Tasks: {editedProject.tasksCount.completed}/{editedProject.tasksCount.total}
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title={`Project timeline: ${new Date(editedProject.startDate).toLocaleDateString()} - ${new Date(editedProject.dueDate).toLocaleDateString()}`} arrow placement="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarTodayIcon 
                            color="success" 
                            fontSize="small"
                          />
                          <Typography variant="body2">
                            Duration: {calculateDuration().months} months
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title={`${editedProject.teamSize} team members actively working on this project`} arrow placement="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GroupIcon 
                            color="warning" 
                            fontSize="small"
                          />
                          <Typography variant="body2">
                            Team Size: {editedProject.teamSize}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  </Paper>

                  <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          color: theme.palette.primary.main
                        }}
                      >
                        Revenue Overview
                    </Typography>
                      <Tooltip title="Financial metrics and tracking" placement="bottom-start" arrow>
                        <InfoIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Tooltip title="Total expected revenue from this project - this is the maximum amount that can be invoiced" arrow placement="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                            <AutoGraphIcon color="primary" fontSize="small" />
                          </Box>
                          <Typography variant="body2" sx={{ minWidth: 120 }}>
                            Project Value:
                          </Typography>
                          <Typography variant="body2" color="text.primary">
                            {formatAmount(editedProject?.projectValue || 0)}
                          </Typography>
                        </Box>
                      </Tooltip>

                      <Tooltip title={`Amount billed to client out of total project value (${((editedProject?.amountInvoiced || 0) / (editedProject?.projectValue || 1) * 100).toFixed(1)}% of project value)`} arrow placement="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                            <ReceiptIcon color="info" fontSize="small" />
                          </Box>
                          <Typography variant="body2" sx={{ minWidth: 120 }}>
                            Amount Invoiced:
                          </Typography>
                          <Typography variant="body2" color="text.primary">
                            {formatAmount(editedProject?.amountInvoiced || 0)}
                            <Typography component="span" variant="caption" color="info.main" sx={{ ml: 1 }}>
                              ({((editedProject?.amountInvoiced || 0) / (editedProject?.projectValue || 1) * 100).toFixed(1)}%)
                            </Typography>
                          </Typography>
                        </Box>
                      </Tooltip>

                      <Tooltip title={`Payments received from invoiced amount (${((editedProject?.amountCollected || 0) / (editedProject?.amountInvoiced || 1) * 100).toFixed(1)}% of invoiced amount)`} arrow placement="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                            <PaidIcon color="success" fontSize="small" />
                          </Box>
                          <Typography variant="body2" sx={{ minWidth: 120 }}>
                            Amount Collected:
                          </Typography>
                          <Typography variant="body2" color="text.primary">
                            {formatAmount(editedProject?.amountCollected || 0)}
                            <Typography component="span" variant="caption" color="success.main" sx={{ ml: 1 }}>
                              ({((editedProject?.amountCollected || 0) / (editedProject?.amountInvoiced || 1) * 100).toFixed(1)}%)
                            </Typography>
                          </Typography>
                        </Box>
                      </Tooltip>

                      <Tooltip title={`Total expenses against project budget (${((editedProject?.amountSpent || 0) / (editedProject?.budget || 1) * 100).toFixed(1)}% of allocated budget)`} arrow placement="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                            <AccountBalanceWalletIcon color="warning" fontSize="small" />
                          </Box>
                          <Typography variant="body2" sx={{ minWidth: 120 }}>
                            Amount Spent:
                          </Typography>
                          <Typography variant="body2" color="text.primary">
                            {formatAmount(editedProject?.amountSpent || 0)}
                            <Typography component="span" variant="caption" color="warning.main" sx={{ ml: 1 }}>
                              ({((editedProject?.amountSpent || 0) / (editedProject?.budget || 1) * 100).toFixed(1)}%)
                            </Typography>
                          </Typography>
                        </Box>
                      </Tooltip>

                      <Tooltip title={`Overall collection progress (${((editedProject?.amountCollected || 0) / (editedProject?.projectValue || 1) * 100).toFixed(1)}% of total project value collected)`} arrow placement="right">
                        <Box sx={{ width: '100%' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={((editedProject?.amountCollected || 0) / (editedProject?.projectValue || 1) * 100)}
                            sx={{ 
                              mt: 1,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
                              '& .MuiLinearProgress-bar': {
                                bgcolor: theme => {
                                  const collectedPercentage = ((editedProject?.amountCollected || 0) / (editedProject?.projectValue || 1)) * 100;
                                  return collectedPercentage > 90 ? theme.palette.success.main :
                                         collectedPercentage > 60 ? theme.palette.info.main :
                                         theme.palette.warning.main;
                                }
                              }
                            }}
                          />
                        </Box>
                      </Tooltip>
                    </Box>
                  </Paper>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* AI Assistant Section */}
      <Paper 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mt: 3, 
          borderRadius: 2, 
          boxShadow: theme => `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
          background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.background.paper, 0.8)})`
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'primary.main',
              width: 48,
              height: 48,
              boxShadow: 2
            }}>
              <SmartToyIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" color="primary" fontWeight="bold">
                CtrlPM AI Assistant
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Your Intelligent Project Management Assistant
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AssessmentIcon />}
            onClick={evaluateProjectHealth}
            disabled={isLoading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              }
            }}
          >
            Analyze Project
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
            <CircularProgress size={48} />
            <Typography variant="body1" color="textSecondary">
              Analyzing project data...
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* Project Summary */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3,
                borderRadius: 2, 
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <InsertChartOutlinedIcon color="primary" />
                <Typography variant="h6" color="primary">
                  Project Summary
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body1" paragraph>
                    Based on the current project data, here's an AI-generated analysis of your project:
                  </Typography>
                </Grid>
                
                {/* Progress Overview */}
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" color="primary" fontWeight="bold" gutterBottom>
                      Progress Status
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {`${editedProject.tasksCount?.completed || 0} out of ${editedProject.tasksCount?.total || 0} tasks completed`}
                      {editedProject.progress && ` (${editedProject.progress}% overall progress)`}
                    </Typography>
                  </Box>
                </Grid>

                {/* Timeline Status */}
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" color="primary" fontWeight="bold" gutterBottom>
                      Timeline Status
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {getTimelineStatus(editedProject.startDate, editedProject.dueDate, editedProject.progress || 0)}
                    </Typography>
                  </Box>
                </Grid>

                {/* Risk Level */}
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" color="primary" fontWeight="bold" gutterBottom>
                      Current Risk Level
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={projectHealth.status === 'healthy' ? 'Low Risk' : 
                               projectHealth.status === 'warning' ? 'Medium Risk' : 'High Risk'}
                        color={projectHealth.status === 'healthy' ? 'success' : 
                               projectHealth.status === 'warning' ? 'warning' : 'error'}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Grid>

                {/* Key Insights */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="primary" fontWeight="bold" gutterBottom>
                    Key Insights
                  </Typography>
                  <List dense>
                    {generateProjectInsights(editedProject, projectHealth).map((insight, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <FiberManualRecordIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                        </ListItemIcon>
                        <ListItemText primary={insight} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                {/* Action Items */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="primary" fontWeight="bold" gutterBottom>
                    Recommended Actions
                  </Typography>
                  <List dense>
                    {generateActionItems(editedProject, projectHealth).map((action, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <PlayArrowIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        </ListItemIcon>
                        <ListItemText primary={action} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Paper>

            {/* Health Score Card */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3,
                mb: 3,
                backgroundColor: theme => 
                  projectHealth.status === 'healthy' ? alpha(theme.palette.success.main, 0.1) :
                  projectHealth.status === 'warning' ? alpha(theme.palette.warning.main, 0.1) :
                  alpha(theme.palette.error.main, 0.1),
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 3
              }}
            >
              <Box sx={{ 
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 3,
                position: 'relative'
              }}>
                <Typography 
                  variant="h3" 
                  color={
                    projectHealth.status === 'healthy' ? 'success.main' :
                    projectHealth.status === 'warning' ? 'warning.main' :
                    'error.main'
                  }
                  sx={{ 
                    fontWeight: 'bold',
                    lineHeight: 1,
                    mb: 0.5
                  }}
                >
                  {projectHealth.score}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500
                  }}
                >
                  out of 100
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Project Health Score
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: projectHealth.status === 'healthy' ? 'success.main' : 
                           projectHealth.status === 'warning' ? 'warning.main' : 'error.main',
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  {projectHealth.status === 'healthy' ? 'Healthy' : 
                   projectHealth.status === 'warning' ? 'Needs Attention' : 'Critical Issues'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last updated: {new Date(projectHealth.lastUpdated).toLocaleString()}
                </Typography>
              </Box>
            </Paper>

            {/* Project Management Assistant Section */}
            <Paper sx={{ p: 3, mt: 4, borderRadius: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SmartToyIcon color="primary" />
                  Project Management Assistant
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Get AI-powered assistance and recommendations for your project
                </Typography>
              </Box>
              <ProjectAssistant project={editedProject} />
            </Paper>

            {/* Analysis Grid */}
            <Grid container spacing={3}>
              {/* Recommendations */}
              {projectHealth.recommendations.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <RecommendIcon color="primary" />
                      <Typography variant="h6" color="primary">
                        Smart Suggestions
                      </Typography>
                    </Box>
                    <List>
                      {projectHealth.recommendations.map((rec, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <FiberManualRecordIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={<div dangerouslySetInnerHTML={{ 
                              __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            }} />}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              )}

              {/* Best Practices */}
              {projectHealth.bestPractices.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LightbulbIcon color="primary" />
                      <Typography variant="h6" color="primary">
                        Pro Tips
                      </Typography>
                    </Box>
                    <List>
                      {projectHealth.bestPractices.map((practice, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <FiberManualRecordIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={<div dangerouslySetInnerHTML={{ 
                              __html: practice.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            }} />}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              )}

              {/* Risks */}
              {projectHealth.risks.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <WarningIcon color="error" />
                      <Typography variant="h6" color="error">
                        Watch Out For
                      </Typography>
                    </Box>
                    <List>
                      {projectHealth.risks.map((risk, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <FiberManualRecordIcon sx={{ 
                              fontSize: 8, 
                              color: risk.level === 'high' ? 'error.main' :
                                     risk.level === 'medium' ? 'warning.main' : 'success.main'
                            }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={<div dangerouslySetInnerHTML={{ 
                              __html: risk.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            }} />}
                            secondary={`Risk Level: ${risk.level.toUpperCase()}`}
                            secondaryTypographyProps={{
                              sx: {
                                color: risk.level === 'high' ? 'error.main' :
                                       risk.level === 'medium' ? 'warning.main' : 'success.main',
                                fontWeight: 'bold',
                                mt: 0.5
                              }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              )}

              {/* Next Steps */}
              {projectHealth.nextSteps.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PlayArrowIcon color="primary" />
                      <Typography variant="h6" color="primary">
                        Next Actions
                      </Typography>
                    </Box>
                    <List>
                      {projectHealth.nextSteps.map((step, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <FiberManualRecordIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={<div dangerouslySetInnerHTML={{ 
                              __html: step.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            }} />}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Tabs Section */}
      <Box sx={{ mt: 4, display: 'flex', gap: 3 }}>
        {/* Vertical Tabs */}
        <Paper
          elevation={0}
          sx={{
            width: 280,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            position: 'sticky',
            top: 24,
            alignSelf: 'flex-start',
            maxHeight: 'calc(100vh - 48px)',
            overflowY: 'auto',
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Project Navigation
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Access different aspects of your project
            </Typography>
          </Box>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="project tabs"
            orientation="vertical"
            sx={{
              '& .MuiTab-root': {
                minHeight: 72,
                py: 2,
                px: 2,
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 500,
                color: 'text.secondary',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: theme => alpha(theme.palette.primary.main, 0.05),
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.1)',
                    color: 'primary.main',
                  },
                },
                '&.Mui-selected': {
                  color: 'primary.main',
                  bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
                  fontWeight: 600,
                  '& .MuiSvgIcon-root': {
                    color: 'primary.main',
                  },
                  '& .tab-description': {
                    color: 'primary.main',
                  },
                },
              },
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
            <Tooltip title="Manage and track project tasks using Kanban board" placement="right" arrow>
              <Tab 
                icon={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                    <AssignmentTurnedInIcon sx={{ transition: 'transform 0.2s' }} />
                    <Box>
                      <Typography variant="body2" sx={{ textAlign: 'left', lineHeight: 1.2 }}>Tasks</Typography>
                      <Typography className="tab-description" variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'left' }}>
                        Kanban board view
                      </Typography>
                    </Box>
                  </Box>
                }
                iconPosition="start"
                sx={{ gap: 1 }}
              />
            </Tooltip>
            <Tooltip title="Get AI-powered insights and analytics about your project" placement="right" arrow>
              <Tab 
                icon={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                    <AutoGraphIcon sx={{ transition: 'transform 0.2s' }} />
                    <Box>
                      <Typography variant="body2" sx={{ textAlign: 'left', lineHeight: 1.2 }}>Smart Insights</Typography>
                      <Typography className="tab-description" variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'left' }}>
                        Project analytics
                      </Typography>
                    </Box>
                  </Box>
                }
                iconPosition="start"
                sx={{ gap: 1 }}
              />
            </Tooltip>
            <Tooltip title="Record and summarize project meetings with AI" placement="right" arrow>
              <Tab 
                icon={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                    <GroupIcon sx={{ transition: 'transform 0.2s' }} />
                    <Box>
                      <Typography variant="body2" sx={{ textAlign: 'left', lineHeight: 1.2 }}>Meetings</Typography>
                      <Typography className="tab-description" variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'left' }}>
                        Meeting summaries
                      </Typography>
                    </Box>
                  </Box>
                }
                iconPosition="start"
                sx={{ gap: 1 }}
              />
            </Tooltip>
            <Tooltip title="View project timeline and major milestones" placement="right" arrow>
              <Tab 
                icon={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                    <TimelineIcon sx={{ transition: 'transform 0.2s' }} />
                    <Box>
                      <Typography variant="body2" sx={{ textAlign: 'left', lineHeight: 1.2 }}>Timeline</Typography>
                      <Typography className="tab-description" variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'left' }}>
                        Project milestones
                      </Typography>
                    </Box>
                  </Box>
                }
                iconPosition="start"
                sx={{ gap: 1 }}
              />
            </Tooltip>
            <Tooltip title="Manage project documents and files" placement="right" arrow>
              <Tab 
                icon={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                    <DescriptionIcon sx={{ transition: 'transform 0.2s' }} />
                    <Box>
                      <Typography variant="body2" sx={{ textAlign: 'left', lineHeight: 1.2 }}>Files</Typography>
                      <Typography className="tab-description" variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'left' }}>
                        Document management
                      </Typography>
                    </Box>
                  </Box>
                }
                iconPosition="start"
                sx={{ gap: 1 }}
              />
            </Tooltip>
            <Tooltip title="Track project invoices and payments" placement="right" arrow>
              <Tab 
                icon={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                    <ReceiptIcon sx={{ transition: 'transform 0.2s' }} />
                    <Box>
                      <Typography variant="body2" sx={{ textAlign: 'left', lineHeight: 1.2 }}>Invoices</Typography>
                      <Typography className="tab-description" variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'left' }}>
                        Financial tracking
                      </Typography>
                    </Box>
                  </Box>
                }
                iconPosition="start"
                sx={{ gap: 1 }}
              />
            </Tooltip>
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              minHeight: 'calc(100vh - 200px)',
              '& .MuiTabPanel-root': {
                height: '100%',
                padding: 0,
                '& > div': {
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }
              }
            }}
          >
            <TabPanel value={tabValue} index={0}>
              <KanbanBoard projectId={id || ''} onUpdate={handleKanbanUpdate} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ height: '100%', minHeight: 'calc(100vh - 250px)' }}>
                <SmartProjectInsights projectId={id} />
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <MeetingSummarizer />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <ProjectTimeline events={timelineEvents} onEventsChange={handleTimelineChange} />
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
              <FileUpload projectId={id || ''} />
            </TabPanel>
            <TabPanel value={tabValue} index={5}>
              <InvoiceList projectId={id || ''} />
            </TabPanel>
          </Paper>
        </Box>
      </Box>

      {/* Bookmark Dialog */}
      <Dialog 
        open={bookmarkDialogOpen} 
        onClose={() => setBookmarkDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: 500,
          }
        }}
      >
        <DialogTitle>Add Project Bookmark</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newBookmark.title || ''}
            onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="URL"
            fullWidth
            value={newBookmark.url || ''}
            onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={newBookmark.description || ''}
            onChange={(e) => setNewBookmark({ ...newBookmark, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookmarkDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddBookmark} variant="contained">
            Add Bookmark
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this project? This action cannot be undone.
          </Typography>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteProject} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onClose={() => setIsEditing(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            Edit Project Details
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Update your project information below. All fields marked with * are required.
            </Typography>
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Tooltip title="Enter a clear and concise name that identifies your project">
                  <TextField
                    required
                    fullWidth
                    label="Project Name"
                    value={editedProject.name}
                    onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                    placeholder="e.g., Website Redesign 2024"
                    helperText="A unique name to identify your project"
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12}>
                <Tooltip title="Provide a detailed description of your project's goals and scope">
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Project Description"
                    value={editedProject.description}
                    onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                    placeholder="Describe your project's objectives, scope, and key deliverables..."
                    helperText="Include key objectives and deliverables"
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Tooltip title="Select the current status of your project">
                  <FormControl fullWidth>
                    <InputLabel>Project Status</InputLabel>
                    <Select
                      value={editedProject.status}
                      onChange={(e) => setEditedProject({ ...editedProject, status: e.target.value as any })}
                      label="Project Status"
                    >
                      {statusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FiberManualRecordIcon
                              sx={{
                                mr: 1,
                                fontSize: 12,
                                color: status === 'active' ? 'success.main' :
                                       status === 'completed' ? 'info.main' : 'warning.main'
                              }}
                            />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Tooltip title="Enter the total number of team members working on this project">
                  <TextField
                    type="number"
                    fullWidth
                    label="Team Size"
                    value={editedProject.teamSize}
                    onChange={(e) => setEditedProject({ ...editedProject, teamSize: parseInt(e.target.value) })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Avatar sx={{ width: 24, height: 24 }} /></InputAdornment>,
                    }}
                    helperText="Number of team members involved"
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Tooltip title="Set the project's start date">
                  <TextField
                    type="date"
                    fullWidth
                    label="Start Date"
                    value={editedProject.startDate}
                    onChange={(e) => setEditedProject({ ...editedProject, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><CalendarTodayIcon /></InputAdornment>,
                    }}
                    helperText="When does the project begin?"
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Tooltip title="Set the project's due date">
                  <TextField
                    type="date"
                    fullWidth
                    label="Due Date"
                    value={editedProject.dueDate}
                    onChange={(e) => setEditedProject({ ...editedProject, dueDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><EventIcon /></InputAdornment>,
                    }}
                    helperText="When should the project be completed?"
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Tooltip title="Enter the project's total value">
                  <TextField
                    type="number"
                    fullWidth
                    label="Project Value"
                    value={editedProject.projectValue || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, projectValue: parseFloat(e.target.value) || 0 })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">{getCurrencyDisplay()}</InputAdornment>,
                    }}
                    helperText="Total value of the project"
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Tooltip title="Enter the project's budget">
                  <TextField
                    type="number"
                    fullWidth
                    label="Budget"
                    value={editedProject.budget || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, budget: parseFloat(e.target.value) || 0 })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">{getCurrencyDisplay()}</InputAdornment>,
                    }}
                    helperText="Total budget allocated for the project"
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12}>
                <Tooltip title="Track the overall progress of your project">
                  <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Project Progress
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Slider
                        value={editedProject.progress}
                        onChange={(_event: Event, value: number | number[], _activeThumb: number) => {
                          const newValue = Array.isArray(value) ? value[0] : value;
                          setEditedProject({ ...editedProject, progress: newValue });
                        }}
                        valueLabelDisplay="auto"
                        step={5}
                        marks
                        min={0}
                        max={100}
                        sx={{ flexGrow: 1 }}
                      />
                      <Typography variant="body2">
                        {editedProject.progress}%
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="textSecondary">
                      Drag the slider to update project completion percentage
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button onClick={handleSaveProject} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetails;
