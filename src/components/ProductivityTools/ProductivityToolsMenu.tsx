import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardActionArea, 
  CardContent,
  Dialog,
  IconButton
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import VideocamIcon from '@mui/icons-material/Videocam';
import CloseIcon from '@mui/icons-material/Close';
import PomodoroTimer from './PomodoroTimer';
import ScreenRecorder from './ScreenRecorder';

interface ToolOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  component: React.ReactNode;
}

const ProductivityToolsMenu: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);

  const tools: ToolOption[] = [
    {
      id: 'pomodoro',
      title: 'Pomodoro Timer',
      icon: <TimerIcon sx={{ fontSize: 40 }} />,
      description: 'Focus timer with task management and ambient sounds',
      component: <PomodoroTimer />
    },
    {
      id: 'screen-recorder',
      title: 'Screen Recorder',
      icon: <VideocamIcon sx={{ fontSize: 40 }} />,
      description: 'Record your screen with webcam overlay and audio options',
      component: <ScreenRecorder />
    },
    // Add more tools here as they are developed
  ];

  const handleToolClick = (toolId: string) => {
    if (toolId === 'pomodoro') {
      setPomodoroOpen(true);
    } else {
      setSelectedTool(toolId);
    }
  };

  const handlePomodoroClose = () => {
    setPomodoroOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Productivity Tools
      </Typography>
      <Grid container spacing={2}>
        {tools.map((tool) => (
          <Grid item xs={12} sm={6} md={4} key={tool.id}>
            <Card>
              <CardActionArea onClick={() => handleToolClick(tool.id)}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    {tool.icon}
                    <Typography variant="h6" component="div">
                      {tool.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {tool.description}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Screen Recorder shown directly on page */}
      {selectedTool === 'screen-recorder' && (
        <Box sx={{ mt: 2 }}>
          <ScreenRecorder />
        </Box>
      )}

      {/* Pomodoro Timer in modal */}
      <Dialog
        fullWidth
        maxWidth="md"
        open={pomodoroOpen}
        onClose={handlePomodoroClose}
        PaperProps={{
          sx: {
            minHeight: '80vh',
            maxHeight: '90vh',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={handlePomodoroClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ px: 3, pb: 3 }}>
          <PomodoroTimer />
        </Box>
      </Dialog>
    </Box>
  );
};

export default ProductivityToolsMenu;
