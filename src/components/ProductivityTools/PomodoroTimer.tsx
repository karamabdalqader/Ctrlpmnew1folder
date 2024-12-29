import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  Checkbox,
  Tabs,
  Tab,
  Paper,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  Card,
  CardContent,
  Alert,
  Slider,
  CircularProgress
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloudIcon from '@mui/icons-material/Cloud';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';

import { soundData } from '../../utils/soundData';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  completedAt?: Date;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Sound {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  file: string;
}

const AMBIENT_SOUNDS: Sound[] = [
  {
    id: 'water',
    name: 'Ocean Waves',
    description: 'Calming ocean waves to help you stay focused and relaxed',
    icon: <WaterDropIcon />,
    file: 'water.mp3'
  },
  {
    id: 'fire',
    name: 'Crackling Fire',
    description: 'Cozy fireplace sounds for a warm, comfortable atmosphere',
    icon: <LocalFireDepartmentIcon />,
    file: 'fire.mp3'
  },
  {
    id: 'rain',
    name: 'Gentle Rain',
    description: 'Soft rainfall to create a peaceful working environment',
    icon: <CloudIcon />,
    file: 'rain.mp3'
  },
  {
    id: 'cafe',
    name: 'Coffee Shop',
    description: 'Ambient coffee shop noise for a productive atmosphere',
    icon: <LocalCafeIcon />,
    file: 'cafe.mp3'
  }
];

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const PomodoroTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [showSoundInfo, setShowSoundInfo] = useState<string | null>(null);
  const [soundLoadingStatus, setSoundLoadingStatus] = useState<{ [key: string]: 'loading' | 'loaded' | 'error' }>({});
  const theme = useTheme();
  
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  // Load sounds
  useEffect(() => {
    const loadSound = async (sound: Sound) => {
      setSoundLoadingStatus(prev => ({ ...prev, [sound.id]: 'loading' }));
      try {
        const audio = new Audio();
        audio.loop = true;
        audio.volume = soundVolume;
        audio.preload = 'auto';

        // Add event listeners for better error handling
        const loadPromise = new Promise((resolve, reject) => {
          const onCanPlay = () => {
            console.log(`Sound ${sound.name} loaded successfully`);
            resolve(true);
          };
          const onError = (e: Event) => {
            console.error(`Error loading sound ${sound.name}:`, e);
            reject(e);
          };
          
          audio.addEventListener('canplaythrough', onCanPlay, { once: true });
          audio.addEventListener('error', onError, { once: true });
        });

        // Set source and start loading
        audio.src = `${process.env.PUBLIC_URL}/sounds/${sound.file}`;
        
        try {
          await loadPromise;
          setSoundLoadingStatus(prev => ({ ...prev, [sound.id]: 'loaded' }));
          return audio;
        } catch (error) {
          throw error;
        }
      } catch (error) {
        console.error(`Error loading sound ${sound.name}:`, error);
        setSoundLoadingStatus(prev => ({ ...prev, [sound.id]: 'error' }));
        return null;
      }
    };

    // Load all sounds
    const loadSounds = async () => {
      console.log('Starting to load sounds...');
      for (const sound of AMBIENT_SOUNDS) {
        console.log(`Loading sound: ${sound.name}`);
        const audio = await loadSound(sound);
        if (audio) {
          console.log(`Successfully loaded: ${sound.name}`);
          audioRefs.current[sound.id] = audio;
        } else {
          console.error(`Failed to load: ${sound.name}`);
        }
      }
    };

    loadSounds();

    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  // Update volume when it changes
  useEffect(() => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.volume = soundVolume;
      }
    });
  }, [soundVolume]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      playNotificationSound();
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { 
        id: Date.now(), 
        text: newTask, 
        completed: false 
      }]);
      setNewTask('');
    }
  };

  const toggleTaskCompletion = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date() : undefined
          }
        : task
    ));
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const toggleSound = async (soundId: string) => {
    if (isMuted) return;

    const audio = audioRefs.current[soundId];
    if (!audio) {
      console.error(`Sound ${soundId} not loaded`);
      return;
    }

    try {
      if (selectedSound === soundId) {
        await audio.pause();
        audio.currentTime = 0;
        setSelectedSound(null);
      } else {
        // Stop any currently playing sound
        if (selectedSound && audioRefs.current[selectedSound]) {
          const currentAudio = audioRefs.current[selectedSound];
          await currentAudio?.pause();
          if (currentAudio) currentAudio.currentTime = 0;
        }

        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        setSelectedSound(soundId);
      }
    } catch (error) {
      console.error(`Error playing sound ${soundId}:`, error);
      setSoundLoadingStatus(prev => ({ ...prev, [soundId]: 'error' }));
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
        }
      });
      setSelectedSound(null);
    }
  };

  const playNotificationSound = () => {
    if (!isMuted && notificationSound.current) {
      notificationSound.current.play().catch(error => {
        console.error('Error playing notification:', error);
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: 3 }}>
      {showHelp && (
        <Card sx={{ mb: 3, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Welcome to the Pomodoro Timer!
              </Typography>
              <Button size="small" onClick={() => setShowHelp(false)}>
                Hide Guide
              </Button>
            </Box>
            <Typography variant="body1" paragraph>
              The Pomodoro Technique is a time management method that uses a timer to break work into focused 25-minute intervals, separated by short breaks.
            </Typography>
            <Typography variant="body2" component="div">
              <strong>Instructions:</strong>
              <ul>
                <li>Start the timer and focus on your task for 25 minutes</li>
                <li>Add tasks to track what you're working on</li>
                <li>Use ambient sounds to help maintain focus</li>
                <li>Take a 5-minute break when the timer rings</li>
                <li>After 4 pomodoros, take a longer 15-30 minute break</li>
              </ul>
            </Typography>
          </CardContent>
        </Card>
      )}
      <Typography variant="h4" gutterBottom align="center" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        Pomodoro Timer
        <Tooltip title="Show guide">
          <IconButton size="small" onClick={() => setShowHelp(true)}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Typography>
      
      <Paper elevation={3} sx={{ mb: 4, p: 3, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontFamily: 'monospace', mb: 2 }}>
          {formatTime(timeLeft)}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Tooltip title={isRunning ? "Pause timer" : "Start timer"}>
            <IconButton onClick={toggleTimer} color="primary" size="large">
              {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset timer">
            <IconButton onClick={resetTimer} color="secondary" size="large">
              <StopIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ 
          minHeight: '280px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          p: 2
        }}>
          <Typography variant="subtitle1" gutterBottom>
            Ambient Sounds
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: 1,
            minHeight: '48px'
          }}>
            {AMBIENT_SOUNDS.map((sound) => (
              <Tooltip 
                key={sound.id}
                title={
                  <Box>
                    <Typography variant="subtitle2">{sound.name}</Typography>
                    <Typography variant="caption">{sound.description}</Typography>
                    {soundLoadingStatus[sound.id] === 'error' && (
                      <Typography variant="caption" color="error">
                        Error loading sound
                      </Typography>
                    )}
                  </Box>
                }
              >
                <Box sx={{ 
                  display: 'inline-flex',
                  minWidth: '48px',
                  minHeight: '48px',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconButton
                    onClick={() => toggleSound(sound.id)}
                    color={selectedSound === sound.id ? 'primary' : 'default'}
                    disabled={isMuted || soundLoadingStatus[sound.id] !== 'loaded'}
                    onMouseEnter={() => setShowSoundInfo(sound.id)}
                    onMouseLeave={() => setShowSoundInfo(null)}
                  >
                    {soundLoadingStatus[sound.id] === 'loading' ? (
                      <CircularProgress size={24} />
                    ) : (
                      sound.icon
                    )}
                  </IconButton>
                </Box>
              </Tooltip>
            ))}
            <Tooltip title={isMuted ? "Unmute sounds" : "Mute sounds"}>
              <Box sx={{ 
                display: 'inline-flex',
                minWidth: '48px',
                minHeight: '48px',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IconButton onClick={toggleMute} color={isMuted ? 'error' : 'default'}>
                  {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>
              </Box>
            </Tooltip>
          </Box>

          <Box sx={{ 
            height: '60px',  
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            borderRadius: 1
          }}>
            {showSoundInfo ? (
              <Typography variant="caption" color="text.secondary">
                {AMBIENT_SOUNDS.find(s => s.id === showSoundInfo)?.description}
              </Typography>
            ) : selectedSound ? (
              <Typography variant="body2" color="text.secondary">
                Playing: {AMBIENT_SOUNDS.find(s => s.id === selectedSound)?.name}
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Hover over a sound icon to see its description
              </Typography>
            )}
          </Box>

          {selectedSound && (
            <Box sx={{ width: 200, mx: 'auto' }}>
              <Slider
                value={soundVolume * 100}
                onChange={(_, value) => setSoundVolume(Number(value) / 100)}
                aria-label="Volume"
                size="small"
                valueLabelDisplay="auto"
                valueLabelFormat={value => `${value}%`}
              />
            </Box>
          )}

          {Object.values(soundLoadingStatus).some(status => status === 'error') && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Some sounds failed to load. Please check your internet connection or try refreshing the page.
            </Alert>
          )}
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ mt: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          centered
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
            }
          }}
        >
          <Tab label={`Active Tasks (${activeTasks.length})`} />
          <Tab label={`Completed Tasks (${completedTasks.length})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="What are you working on?"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                helperText="Press Enter or click Add to create a task"
              />
              <Tooltip title="Add new task">
                <Button variant="contained" onClick={addTask}>
                  Add
                </Button>
              </Tooltip>
            </Box>

            <List>
              {activeTasks.map((task) => (
                <ListItem key={task.id} disablePadding>
                  <Tooltip title="Mark as complete">
                    <Checkbox
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task.id)}
                    />
                  </Tooltip>
                  <ListItemText primary={task.text} />
                  <ListItemSecondaryAction>
                    <Tooltip title="Delete task">
                      <IconButton edge="end" onClick={() => deleteTask(task.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {activeTasks.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No active tasks. Add a task to get started!
                </Typography>
              )}
            </List>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <List>
            {completedTasks.map((task) => (
              <ListItem 
                key={task.id}
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <Tooltip title="Mark as incomplete">
                  <Checkbox
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                  />
                </Tooltip>
                <ListItemText 
                  primary={task.text}
                  secondary={task.completedAt && `Completed: ${formatDate(task.completedAt)}`}
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Delete task">
                    <IconButton edge="end" onClick={() => deleteTask(task.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {completedTasks.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No completed tasks yet. Keep up the good work!
              </Typography>
            )}
          </List>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default PomodoroTimer;
