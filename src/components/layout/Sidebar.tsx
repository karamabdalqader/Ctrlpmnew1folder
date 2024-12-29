import React, { useEffect, useState } from 'react';
import { 
  Box, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  styled,
  Divider,
  Collapse,
  Typography,
  alpha,
  useTheme,
  Badge,
  Avatar
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Assignment as AssignmentIcon, 
  Notifications, 
  ExitToApp,
  ExpandLess,
  ExpandMore,
  FolderOpen,
  Add as AddIcon,
  StickyNote2 as StickyNoteIcon,
  Settings as SettingsIcon,
  Feedback as FeedbackIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  BuildCircle as BuildCircleIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import NotificationBadge from '../notifications/NotificationBadge';

interface SidebarProps {
  onClose?: () => void;
}

interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: 'active' | 'completed' | 'on-hold';
  startDate: string;
  dueDate: string;
  teamSize: number;
  tasksCount: {
    total: number;
    completed: number;
  };
  logo: string;
  budget: number;
  amountInvoiced: number;
  amountCollected: number;
  amountSpent: number;
  projectValue: number;
  createdAt: Date;
  updatedAt: string;
}

const StyledDrawer = styled(Box)(({ theme }) => ({
  width: 280,
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  backgroundImage: `linear-gradient(to bottom, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.background.paper, 0.95)})`,
  color: theme.palette.text.primary,
  display: 'flex',
  flexDirection: 'column',
  borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: '4px 0 8px rgba(0, 0, 0, 0.05)',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  margin: '4px 12px',
  borderRadius: '12px',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.16),
    },
  },
  '& .MuiListItemIcon-root': {
    color: theme.palette.text.secondary,
    minWidth: 40,
  },
  [theme.breakpoints.down('sm')]: {
    margin: '2px 8px',
    padding: '8px 16px',
  },
  transition: 'all 0.2s ease-in-out',
}));

const NewProjectButton = styled(ListItemButton)(({ theme }) => ({
  margin: '4px 12px',
  borderRadius: '12px',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
  '& .MuiListItemIcon-root': {
    color: theme.palette.primary.main,
    minWidth: 40,
  },
  transition: 'all 0.2s ease-in-out',
}));

const ProjectListItem = styled(ListItemButton)(({ theme }) => ({
  margin: '2px 12px',
  borderRadius: '8px',
  paddingLeft: theme.spacing(4),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.16),
    },
  },
  '& .MuiListItemIcon-root': {
    minWidth: 32,
    color: theme.palette.text.secondary,
  },
  '& .MuiListItemText-root': {
    margin: 0,
    '& .MuiTypography-root': {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
  },
  transition: 'all 0.2s ease-in-out',
}));

const SidebarSection = styled(Box)(({ theme }) => ({
  padding: '16px 0 8px 24px',
  '& .MuiTypography-root': {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
}));

const Sidebar = ({ onClose }: SidebarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [openProjects, setOpenProjects] = useState(true);
  const [openArchived, setOpenArchived] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    // Listen for new notifications
    const handleNewNotification = () => {
      setNotificationCount(prev => prev + 1);
    };

    window.addEventListener('newNotification', handleNewNotification);
    
    // Check for unread notifications on mount
    const unreadCount = parseInt(localStorage.getItem('unreadNotifications') || '0', 10);
    setNotificationCount(unreadCount);

    return () => {
      window.removeEventListener('newNotification', handleNewNotification);
    };
  }, []);

  const handleNotificationClick = () => {
    navigate('/notifications');
    // Reset notification count when visiting notifications page
    setNotificationCount(0);
    localStorage.setItem('unreadNotifications', '0');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', onClick: () => handleNavigation('/') },
    { 
      text: 'Notifications', 
      icon: (
        <NotificationBadge count={notificationCount}>
          <Notifications />
        </NotificationBadge>
      ), 
      path: '/notifications',
      onClick: handleNotificationClick
    },
  ];

  const generateProjectId = () => {
    return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleNewProject = () => {
    const projectId = generateProjectId();
    const projectNumber = projects.length + 1;
    const newProject: Project = {
      id: projectId,
      name: `Project ${projectNumber}`,
      description: '',
      progress: 0,
      status: 'active',
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
      updatedAt: new Date().toISOString()
    };

    // Update state and localStorage
    setProjects(prevProjects => {
      const updatedProjects = [...prevProjects, newProject];
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      return updatedProjects;
    });

    navigate(`/projects/${projectId}`);
    setOpenProjects(true);
  };

  const isActive = (path: string) => location.pathname === path;

  const activeProjects = projects.filter(project => project.status !== 'completed');
  const archivedProjects = projects.filter(project => project.status === 'completed');

  useEffect(() => {
    const handleProjectUpdate = (event: CustomEvent) => {
      const { projectId, projectName, projectStatus } = event.detail;
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === projectId
            ? { ...project, name: projectName, status: projectStatus }
            : project
        )
      );
    };

    window.addEventListener('projectUpdated', handleProjectUpdate as EventListener);
    return () => {
      window.removeEventListener('projectUpdated', handleProjectUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  return (
    <StyledDrawer>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Logo />
      </Box>
      
      <Divider sx={{ 
        opacity: 0.2,
        mx: 2,
        borderColor: theme => alpha(theme.palette.divider, 0.2)
      }} />

      <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
        <SidebarSection>
          <Typography>Main Menu</Typography>
        </SidebarSection>
        
        <List component="nav" sx={{ px: 1 }}>
          {menuItems.map((item) => (
            <StyledListItemButton
              key={item.text}
              selected={isActive(item.path)}
              onClick={item.onClick}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: isActive(item.path) ? 600 : 400
                }}
              />
            </StyledListItemButton>
          ))}
          <StyledListItemButton
            selected={isActive('/notes')}
            onClick={() => handleNavigation('/notes')}
          >
            <ListItemIcon>
              <StickyNoteIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Sticky Notes"
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: isActive('/notes') ? 600 : 400
              }}
            />
          </StyledListItemButton>
          <StyledListItemButton
            selected={isActive('/productivity-tools')}
            onClick={() => handleNavigation('/productivity-tools')}
          >
            <ListItemIcon>
              <BuildCircleIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Productivity Tools"
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: isActive('/productivity-tools') ? 600 : 400
              }}
            />
          </StyledListItemButton>
        </List>

        <SidebarSection>
          <Typography>Projects</Typography>
        </SidebarSection>

        <List component="nav" sx={{ px: 1 }}>
          <StyledListItemButton onClick={() => setOpenProjects(!openProjects)}>
            <ListItemIcon>
              <FolderOpen />
            </ListItemIcon>
            <ListItemText 
              primary="Active Projects"
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: 500
              }}
            />
            {openProjects ? <ExpandLess /> : <ExpandMore />}
          </StyledListItemButton>

          <Collapse in={openProjects} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {activeProjects.map((project) => (
                <ProjectListItem
                  key={project.id}
                  selected={isActive(`/projects/${project.id}`)}
                  onClick={() => handleNavigation(`/projects/${project.id}`)}
                >
                  <ListItemIcon>
                    <AssignmentIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={project.name}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isActive(`/projects/${project.id}`) ? 600 : 400
                    }}
                  />
                </ProjectListItem>
              ))}
            </List>
          </Collapse>

          {/* Archived Projects Section */}
          <StyledListItemButton 
            onClick={() => setOpenArchived(!openArchived)}
            sx={{ mt: 1 }}
          >
            <ListItemIcon>
              <FolderOpen />
            </ListItemIcon>
            <ListItemText 
              primary="Archived Projects"
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: 500
              }}
            />
            {openArchived ? <ExpandLess /> : <ExpandMore />}
          </StyledListItemButton>

          <Collapse in={openArchived} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {archivedProjects.map((project) => (
                <ProjectListItem
                  key={project.id}
                  selected={isActive(`/projects/${project.id}`)}
                  onClick={() => handleNavigation(`/projects/${project.id}`)}
                >
                  <ListItemIcon>
                    <AssignmentIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={project.name}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isActive(`/projects/${project.id}`) ? 600 : 400,
                      sx: { color: theme.palette.text.secondary }
                    }}
                  />
                </ProjectListItem>
              ))}
              {archivedProjects.length === 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    py: 2,
                    px: 4,
                    color: theme.palette.text.secondary,
                    fontStyle: 'italic'
                  }}
                >
                  No archived projects
                </Typography>
              )}
            </List>
          </Collapse>

          <NewProjectButton onClick={handleNewProject}>
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText 
              primary="New Project"
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: 500
              }}
            />
          </NewProjectButton>
        </List>
      </Box>

      <Divider sx={{ 
        opacity: 0.2,
        mx: 2,
        borderColor: theme => alpha(theme.palette.divider, 0.2)
      }} />

      <List sx={{ p: 2 }}>
        <StyledListItemButton
          onClick={() => handleNavigation('/settings')}
          selected={location.pathname === '/settings'}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </StyledListItemButton>

        <StyledListItemButton
          onClick={() => handleNavigation('/feedback')}
          selected={location.pathname === '/feedback'}
        >
          <ListItemIcon>
            <FeedbackIcon />
          </ListItemIcon>
          <ListItemText primary="Feedback" />
        </StyledListItemButton>

        <StyledListItemButton
          onClick={() => handleNavigation('/profile')}
          selected={location.pathname === '/profile'}
        >
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </StyledListItemButton>

        <Divider sx={{ my: 1, mx: 2 }} />

        <StyledListItemButton>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText 
            primary="Logout"
            primaryTypographyProps={{
              fontSize: '0.95rem'
            }}
          />
        </StyledListItemButton>
      </List>
    </StyledDrawer>
  );
};

export default Sidebar;
