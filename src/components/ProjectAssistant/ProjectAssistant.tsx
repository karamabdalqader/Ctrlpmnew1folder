import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Button,
  ButtonGroup,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Drawer,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Menu,
  MenuItem,
  Badge,
  Tab,
  Tabs,
} from '@mui/material';
import {
  HelpOutline as HelpOutlineIcon,
  School as SchoolIcon,
  AccountTree as AccountTreeIcon,
  Speed as SpeedIcon,
  Checklist as ChecklistIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  Description as DescriptionIcon,
  Insights as InsightsIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Lightbulb as LightbulbIcon,
  NotificationsActive as NotificationsActiveIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { Project } from '../../types/project';
import ProjectChecklist from './ProjectChecklist';
import ProjectTemplate from './ProjectTemplate';
import RiskMatrix from './RiskMatrix';
import WBSBuilder from './WBSBuilder';
import { methodologyConfigs } from './methodologyConfigs';
import { WBSNode } from './types';
import Joyride from 'react-joyride';
import KnowledgeBase from './KnowledgeBase';

interface ProjectAssistantProps {
  project: Project;
  onUpdate?: (updatedProject: Project) => void;
}

interface JoyrideStepType {
  target: string;
  content: string;
  title?: string;
  disableBeacon?: boolean;
}

const ProjectAssistant: React.FC<ProjectAssistantProps> = ({ project, onUpdate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activePhase, setActivePhase] = useState<string>('');  
  const [selectedMethodology, setSelectedMethodology] = useState<'pmp' | 'prince2' | 'agile'>('pmp');
  const [showTour, setShowTour] = useState(true);
  const [activeTool, setActiveTool] = useState<'wbs' | 'risk' | 'checklist'>('checklist');
  const [wbsData, setWbsData] = useState<WBSNode>({
    id: '1',
    name: project.name,
    description: project.description,
    owner: '',
    children: [],
  });
  const [risks, setRisks] = useState<any[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [insights, setInsights] = useState<Array<{
    type: 'success' | 'warning' | 'info';
    message: string;
    action?: string;
  }>>([]);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'warning' | 'error';
    read: boolean;
  }>>([]);

  useEffect(() => {
    // Generate AI-powered insights based on project data
    generateProjectInsights();
  }, [project]);

  const generateProjectInsights = async () => {
    // Simulated AI insights - replace with actual AI integration
    const newInsights = [
      {
        type: 'warning' as const,
        message: 'Task completion rate has decreased by 15% this week',
        action: 'View Tasks',
      },
      {
        type: 'success' as const,
        message: 'Project is currently under budget by 10%',
        action: 'View Budget',
      },
      {
        type: 'info' as const,
        message: 'New best practice recommendation available for your project type',
        action: 'Learn More',
      },
    ];
    setInsights(newInsights);
  };

  // Initialize phase data when methodology or phase changes
  useEffect(() => {
    if (activePhase) {
      const currentPhaseConfig = methodologyConfigs[selectedMethodology].phases.find(p => p.id === activePhase);
      if (currentPhaseConfig) {
        // Find or initialize the phase in the project
        let projectPhase = project.phases.find(p => p.id === activePhase);
        
        // If phase doesn't exist or doesn't have checklists, initialize it
        if (!projectPhase || !projectPhase.checklists || projectPhase.checklists.length === 0) {
          projectPhase = {
            id: activePhase,
            name: currentPhaseConfig.name,
            title: currentPhaseConfig.title,
            description: currentPhaseConfig.description,
            insights: [...currentPhaseConfig.insights],
            templates: [...(currentPhaseConfig.templates || [])],
            checklists: currentPhaseConfig.checklists.map(checklist => ({
              ...checklist,
              items: checklist.items.map(item => ({
                ...item,
                id: item.id || Math.random().toString(36).substr(2, 9),
                completed: item.completed || false,
                note: item.note || ''
              }))
            })),
            bestPractices: [...(currentPhaseConfig.bestPractices || [])],
            tools: [...(currentPhaseConfig.tools || [])]
          };
          
          const updatedProject = {
            ...project,
            phases: project.phases.filter(p => p.id !== activePhase).concat(projectPhase)
          };
          onUpdate?.(updatedProject);
        }
      }
    }
  }, [activePhase, selectedMethodology]);

  // Tutorial steps
  const [steps] = useState<JoyrideStepType[]>([
    {
      target: '.methodology-selector',
      content: 'Select your preferred project management methodology. The assistant will adapt its guidance and tools accordingly.',
      title: 'Choose Your Methodology',
      disableBeacon: true,
    },
    {
      target: '.phase-navigator',
      content: 'Navigate through different project phases. Each phase contains specific tools and guidance.',
      title: 'Phase Navigation',
    },
    {
      target: '.tools-section',
      content: 'Access various project management tools like WBS Builder, Risk Matrix, and Checklist.',
      title: 'Project Tools',
    },
  ]);

  const handleMethodologyChange = (methodology: 'pmp' | 'prince2' | 'agile') => {
    setSelectedMethodology(methodology);
    setActivePhase('');
  };

  const handleWBSChange = (newData: WBSNode) => {
    setWbsData(newData);
  };

  const handleRiskAdd = (risk: any) => {
    setRisks([...risks, { ...risk, id: Date.now().toString() }]);
  };

  const handleTemplateSubmit = (template: any) => {
    const updatedProject = { ...project };
    const phaseIndex = updatedProject.phases.findIndex(p => p.id === activePhase);
    if (phaseIndex !== -1) {
      // Update project with template data
      updatedProject.phases[phaseIndex].templates = updatedProject.phases[phaseIndex].templates || [];
      updatedProject.phases[phaseIndex].templates.push(template);
      onUpdate?.(updatedProject);
    }
  };

  // Get current phase data
  const currentPhase = project.phases.find(p => p.id === activePhase) || 
    methodologyConfigs[selectedMethodology].phases.find(p => p.id === activePhase) || 
    methodologyConfigs[selectedMethodology].phases[0];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid container spacing={3}>
          {/* Project Insights */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2 
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: 'text.primary',
                    fontWeight: 500
                  }}
                >
                  <InsightsIcon /> Project Insights
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setShowHelp(!showHelp)}
                  color="primary"
                >
                  <HelpOutlineIcon />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                {insights.map((insight, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card>
                      <CardContent>
                        <Alert 
                          severity={insight.type}
                          action={
                            insight.action && (
                              <Button color="inherit" size="small">
                                {insight.action}
                              </Button>
                            )
                          }
                        >
                          {insight.message}
                        </Alert>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Methodology Selector */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Select Project Methodology</Typography>
              <ButtonGroup variant="outlined" size={isMobile ? "small" : "medium"}>
                <Button
                  onClick={() => handleMethodologyChange('pmp')}
                  variant={selectedMethodology === 'pmp' ? 'contained' : 'outlined'}
                  startIcon={<SchoolIcon />}
                  sx={{ 
                    minWidth: 120,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                    }
                  }}
                >
                  PMP
                </Button>
                <Button
                  onClick={() => handleMethodologyChange('prince2')}
                  variant={selectedMethodology === 'prince2' ? 'contained' : 'outlined'}
                  startIcon={<AccountTreeIcon />}
                  sx={{ minWidth: 120 }}
                >
                  PRINCE2
                </Button>
                <Button
                  onClick={() => handleMethodologyChange('agile')}
                  variant={selectedMethodology === 'agile' ? 'contained' : 'outlined'}
                  startIcon={<SpeedIcon />}
                  sx={{ minWidth: 120 }}
                >
                  Agile
                </Button>
              </ButtonGroup>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content Area */}
      <Grid container spacing={3}>
        {/* Left Sidebar - Phase Navigation */}
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={0} 
            className="phase-navigator"
            sx={{ 
              p: 2, 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%',
              minHeight: 400
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Project Phases
            </Typography>
            <Stepper 
              activeStep={methodologyConfigs[selectedMethodology].phases.findIndex(phase => phase.id === activePhase)} 
              orientation="vertical" 
              sx={{ 
                '& .MuiStepLabel-root': {
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderRadius: 1
                  }
                }
              }}
            >
              {methodologyConfigs[selectedMethodology].phases.map((phase, index) => (
                <Step key={phase.name}>
                  <StepLabel onClick={() => setActivePhase(phase.id)}>
                    <Typography variant="body2" fontWeight={activePhase === phase.id ? 'bold' : 'normal'}>
                      {phase.name}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={9}>
          <Paper 
            elevation={0}
            className="tools-section" 
            sx={{ 
              p: 3, 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              minHeight: 600
            }}
          >
            {/* Phase Title and Description */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                {currentPhase.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentPhase.description}
              </Typography>
            </Box>

            {/* Tools Navigation */}
            <ButtonGroup variant="outlined" size="small" sx={{ mb: 2 }}>
              <Button
                onClick={() => setActiveTool('checklist')}
                variant={activeTool === 'checklist' ? 'contained' : 'outlined'}
              >
                Checklist
              </Button>
              <Button
                onClick={() => setActiveTool('risk')}
                variant={activeTool === 'risk' ? 'contained' : 'outlined'}
              >
                Risk Matrix
              </Button>
              <Button
                onClick={() => setActiveTool('wbs')}
                variant={activeTool === 'wbs' ? 'contained' : 'outlined'}
              >
                WBS
              </Button>
            </ButtonGroup>

            {/* Tool Content */}
            <Box sx={{ mt: 2 }}>
              {activeTool === 'checklist' && currentPhase.checklists && currentPhase.checklists.length > 0 && (
                <ProjectChecklist
                  checklist={currentPhase.checklists[0]}
                  onChecklistUpdate={(updatedChecklist) => {
                    const updatedProject = { ...project };
                    const phaseIndex = updatedProject.phases.findIndex(p => p.id === activePhase);
                    
                    if (phaseIndex === -1) {
                      // Phase doesn't exist, create it
                      updatedProject.phases.push({
                        id: activePhase,
                        name: currentPhase.name,
                        title: currentPhase.title,
                        description: currentPhase.description,
                        insights: [...currentPhase.insights],
                        templates: [],
                        checklists: [updatedChecklist],
                        bestPractices: [],
                        tools: []
                      });
                    } else {
                      // Update existing phase
                      if (!updatedProject.phases[phaseIndex].checklists) {
                        updatedProject.phases[phaseIndex].checklists = [];
                      }
                      updatedProject.phases[phaseIndex].checklists[0] = updatedChecklist;
                    }
                    
                    onUpdate?.(updatedProject);
                  }}
                />
              )}
              {activeTool === 'wbs' && (
                <WBSBuilder 
                  data={wbsData} 
                  onChange={handleWBSChange} 
                />
              )}
              {activeTool === 'risk' && (
                <Box>
                  <RiskMatrix 
                    risks={risks}
                    onRiskAdd={handleRiskAdd}
                  />
                  <Typography variant="h6" gutterBottom>Risk Matrix Guidelines</Typography>
                  
                  {/* Risk Matrix Overview */}
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Overview</Typography>
                    <Typography variant="body2">
                      The Risk Matrix is a visualization tool that helps in assessing and prioritizing risks based on:
                      <ul>
                        <li>Probability: The likelihood of the risk occurring</li>
                        <li>Impact: The potential effect on the project if the risk occurs</li>
                      </ul>
                    </Typography>
                  </Paper>

                  {/* How to Use */}
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>How to Use</Typography>
                    <Typography variant="body2" component="div">
                      <ol>
                        <li>Identify potential risks in your project</li>
                        <li>For each risk, assess:
                          <ul>
                            <li>Probability (Low, Medium, High)</li>
                            <li>Impact (Low, Medium, High)</li>
                          </ul>
                        </li>
                        <li>Place the risk in the appropriate cell of the matrix</li>
                        <li>Develop mitigation strategies based on the risk's position</li>
                      </ol>
                    </Typography>
                  </Paper>

                  {/* Risk Categories */}
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Risk Categories</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ p: 1, bgcolor: '#ffebee', borderRadius: 1 }}>
                          <Typography variant="subtitle2">High Impact, High Probability</Typography>
                          <Typography variant="body2">Requires immediate attention and detailed mitigation plans</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ p: 1, bgcolor: '#fff3e0', borderRadius: 1 }}>
                          <Typography variant="subtitle2">High Impact, Low Probability</Typography>
                          <Typography variant="body2">Develop contingency plans</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ p: 1, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                          <Typography variant="subtitle2">Low Impact, High Probability</Typography>
                          <Typography variant="body2">Monitor and manage through standard procedures</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ p: 1, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                          <Typography variant="subtitle2">Low Impact, Low Probability</Typography>
                          <Typography variant="body2">Monitor periodically</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Best Practices */}
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Best Practices</Typography>
                    <Typography variant="body2" component="div">
                      <ul>
                        <li>Review and update the risk matrix regularly</li>
                        <li>Involve team members and stakeholders in risk identification</li>
                        <li>Document mitigation strategies for each identified risk</li>
                        <li>Track the effectiveness of implemented mitigation measures</li>
                        <li>Use historical data to improve risk assessment accuracy</li>
                      </ul>
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Joyride
        steps={steps}
        run={showTour}
        continuous
        showSkipButton
        styles={{
          options: {
            primaryColor: '#1976d2',
          },
        }}
        callback={(data) => {
          const { status } = data;
          if (status === 'finished' || status === 'skipped') {
            setShowTour(false);
          }
        }}
      />

      {/* Help Drawer */}
      <Drawer
        anchor="right"
        open={showHelp}
        onClose={() => setShowHelp(false)}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 } } }}
      >
        <KnowledgeBase 
          methodology={selectedMethodology}
          phase={currentPhase}
        />
      </Drawer>
    </Container>
  );
};

export default ProjectAssistant;
