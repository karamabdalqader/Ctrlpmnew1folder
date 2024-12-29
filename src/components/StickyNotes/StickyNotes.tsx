import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  Button,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  Note as NoteIcon,
  AttachFile as AttachFileIcon,
  Info as InfoIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { Project } from '../../types/project';
import './StickyNotes.css';
import { AZURE_CONFIG } from '../../config/azure-config';

interface Note {
  id: number;
  type: 'text' | 'voice';
  content: string;
  transcription?: string;
  timestamp: string;
  projectId: string;
  projectName: string;
  priority: 'low' | 'medium' | 'high';
  color?: string;
}

interface SimpleProject {
  id: string;
  name: string;
}

interface NoteInput {
  type: 'text' | 'voice';
  content: string;
  color?: string;
}

const StickyNote: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedProject, setSelectedProject] = useState<SimpleProject | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [transcriptionStatus, setTranscriptionStatus] = useState<string>('');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [processingDialogOpen, setProcessingDialogOpen] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recognition = useRef<any>(null);

  const addDebugLog = (message: string) => {
    console.log(message);
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      const parsedProjects = JSON.parse(storedProjects);
      setProjects(parsedProjects);
      if (parsedProjects.length > 0) {
        setSelectedProject({
          id: parsedProjects[0].id,
          name: parsedProjects[0].name
        });
      }
    }
  }, []);

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (noteInput: NoteInput) => {
    const newNote: Note = {
      id: Date.now(),
      type: noteInput.type,
      content: noteInput.content,
      timestamp: new Date().toLocaleString(),
      color: '#fff7b1',
      priority: selectedPriority,
      projectId: selectedProject?.id || '',
      projectName: selectedProject?.name || 'No Project'
    };
    setNotes(prevNotes => [...prevNotes, newNote]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteText.trim()) {
      addNote({
        type: 'text',
        content: noteText,
      });
      setNoteText('');
    }
  };

  const handleVoiceRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorder.current = recorder;
        audioChunks.current = [];

        const newNoteId = Date.now();
        const newNote: Note = {
          id: newNoteId,
          type: 'voice',
          content: 'Voice Note (Recording...)',
          transcription: '',
          timestamp: new Date().toLocaleString(),
          color: '#fff7b1',
          priority: selectedPriority,
          projectId: selectedProject?.id || '',
          projectName: selectedProject?.name || 'No Project'
        };
        setNotes(prevNotes => [...prevNotes, newNote]);

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = true;
        recognition.current.interimResults = true;
        recognition.current.lang = 'ar-SA';

        let finalTranscript = '';
        let interimTranscript = '';

        recognition.current.onresult = (event: any) => {
          interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript + ' ';
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          console.log('Final transcript:', finalTranscript);
          console.log('Interim transcript:', interimTranscript);

          setNotes(prevNotes => 
            prevNotes.map(note => 
              note.id === newNoteId
                ? {
                    ...note,
                    transcription: (finalTranscript + interimTranscript).trim(),
                    content: 'Voice Note'
                  }
                : note
            )
          );
        };

        recognition.current.onerror = (event: any) => {
          console.error('Recognition error:', event.error);
          setTranscriptionStatus(`Error: ${event.error}`);
        };

        recognition.current.onend = () => {
          console.log('Recognition ended');
          setTranscriptionStatus('Recording stopped');
          
          setNotes(prevNotes => 
            prevNotes.map(note => 
              note.id === newNoteId
                ? {
                    ...note,
                    transcription: finalTranscript.trim(),
                    content: 'Voice Note (Completed)'
                  }
                : note
            )
          );
        };

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          if (mediaRecorder.current?.stream) {
            mediaRecorder.current.stream.getTracks().forEach(track => {
              track.stop();
            });
          }
          audioChunks.current = [];
          recognition.current.stop();
        };

        recorder.start();
        recognition.current.start();
        console.log('Recognition started');
        setTranscriptionStatus('Recording started');
        setIsRecording(true);
      } catch (error: unknown) {
        console.error('Error starting voice recording:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setTranscriptionStatus('Error starting recording: ' + errorMessage);
      }
    } else {
      if (mediaRecorder.current) {
        mediaRecorder.current.stop();
        setIsRecording(false);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, noteId: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);

    setNotes(prevNotes => prevNotes.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          fileName: file.name,
          fileUrl: fileUrl,
          fileType: file.type
        };
      }
      return note;
    }));

    const updatedNotes = notes.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          fileName: file.name,
          fileUrl: fileUrl,
          fileType: file.type
        };
      }
      return note;
    });
    localStorage.setItem('notes', JSON.stringify(updatedNotes));

    event.target.value = '';
  };

  const handleFileDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRandomColor = (): string => {
    return '#fff7b1';
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditedContent(note.content);
  };

  const handleSaveEdit = (noteId: number) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === noteId
          ? {
              ...note,
              content: editedContent,
            }
          : note
      )
    );
    setEditingNoteId(null);
    setEditedContent('');
  };

  const handlePriorityChange = (noteId: number, priority: 'low' | 'medium' | 'high') => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === noteId
          ? { ...note, priority }
          : note
      )
    );
  };

  const handleDeleteNote = (noteId: number) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditedContent('');
  };

  const handleProjectChange = (e: any) => {
    const project = projects.find(p => p.id === e.target.value);
    if (project) {
      setSelectedProject({
        id: project.id,
        name: project.name
      });
    }
  };

  const PRIORITY_COLORS = {
    low: '#4CAF50',    // Green
    medium: '#FF9800', // Orange
    high: '#F44336'    // Red
  };

  const useStyles = {
    container: {
      p: 3,
      height: '100%',
      overflowY: 'auto'
    },
    inputSection: {
      mb: 4
    },
    noteGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 2,
      direction: 'ltr'
    },
    noteCard: {
      width: 300,
      m: 1,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    },
    cardHeader: {
      pb: 1,
      '& .MuiCardHeader-content': {
        overflow: 'hidden'
      }
    },
    cardContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 2,
      p: 2
    },
    projectChip: {
      borderRadius: '8px',
      fontWeight: 500,
      fontSize: '0.75rem',
      height: 'auto',
      padding: '4px 8px',
      '& .MuiChip-label': {
        padding: '0',
        overflow: 'visible',
        whiteSpace: 'normal',
        lineHeight: '1.2'
      }
    },
    actionButton: {
      padding: '8px',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)'
      }
    },
    textField: {
      '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        backgroundColor: '#fff',
        '&:hover fieldset': {
          borderColor: 'primary.main'
        }
      }
    },
    select: {
      '& .MuiOutlinedInput-root': {
        borderRadius: '8px'
      }
    },
    attachmentBox: {
      marginTop: '16px',
      padding: '12px',
      borderRadius: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px'
    },
    noteContent: {
      flex: 1,
      marginBottom: '16px'
    },
    attachmentSection: {
      marginTop: 'auto'
    }
  };

  return (
    <Box sx={useStyles.container}>
      <Box sx={useStyles.inputSection}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Sticky Notes
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8f9fa' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: '#1976d2' }}>
                How to use:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NoteIcon fontSize="small" /> Text Note:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                    Type your note in the text box below and click "Add Note"
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MicIcon fontSize="small" /> Voice Note:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                    Click the microphone icon to start/stop recording
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <FormControl fullWidth sx={useStyles.select}>
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={selectedProject?.id || ''}
                    label="Project"
                    onChange={handleProjectChange}
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: { xs: '100%', md: '200px' }, ...useStyles.select }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={selectedPriority}
                    label="Priority"
                    onChange={(e) => setSelectedPriority(e.target.value as 'low' | 'medium' | 'high')}
                  >
                    <MenuItem value="low">Low Priority</MenuItem>
                    <MenuItem value="medium">Medium Priority</MenuItem>
                    <MenuItem value="high">High Priority</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: '12px', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Type your note here..."
                      multiline
                      rows={3}
                      fullWidth
                      sx={useStyles.textField}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Write your note and click the note icon to save
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
                    <Tooltip title="Save note">
                      <IconButton
                        color="primary"
                        type="submit"
                        sx={useStyles.actionButton}
                      >
                        <NoteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={isRecording ? "Stop recording" : "Start voice recording"}>
                      <IconButton
                        color={isRecording ? 'error' : 'primary'}
                        onClick={handleVoiceRecording}
                        sx={useStyles.actionButton}
                      >
                        {isRecording ? <StopIcon /> : <MicIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Paper>
        </form>
      </Box>

      <Box sx={useStyles.noteGrid}>
        {notes.map((note) => (
          <Card
            key={note.id}
            sx={{
              ...useStyles.noteCard,
              backgroundColor: note.color || '#fff7b1'
            }}
          >
            <CardHeader
              sx={{
                ...useStyles.cardHeader,
                backgroundColor: PRIORITY_COLORS[note.priority],
                color: 'white'
              }}
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleStartEdit(note)}
                      sx={{ color: 'white' }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteNote(note.id)}
                      sx={{ color: 'white' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {note.type === 'voice' ? 'Voice Note' : 'Text Note'}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1,
                    textTransform: 'capitalize'
                  }}>
                    {note.priority} Priority
                  </Typography>
                </Box>
              }
              subheader={
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {note.timestamp}
                </Typography>
              }
            />
            <CardContent sx={useStyles.cardContent}>
              <Box sx={{ flex: 1, direction: 'ltr', textAlign: 'left' }}>
                {editingNoteId === note.id ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      multiline
                      rows={4}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      fullWidth
                      variant="outlined"
                      sx={{ direction: 'ltr' }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button
                        startIcon={<SaveIcon />}
                        onClick={() => handleSaveEdit(note.id)}
                        variant="contained"
                        size="small"
                      >
                        Save
                      </Button>
                      <Button
                        startIcon={<CloseIcon />}
                        onClick={handleCancelEdit}
                        variant="outlined"
                        size="small"
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                      {note.content}
                    </Typography>
                    {note.type === 'voice' && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                          Transcription:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          whiteSpace: 'pre-wrap', 
                          direction: note.transcription?.match(/[\u0600-\u06FF]/) ? 'rtl' : 'ltr',
                          minHeight: '3em'
                        }}>
                          {note.transcription || transcriptionStatus || 'Transcribing...'}
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </Box>
              {note.projectName && (
                <Chip
                  label={note.projectName}
                  size="small"
                  sx={{
                    ...useStyles.projectChip,
                    mt: 2,
                    bgcolor: 'rgba(0,0,0,0.08)'
                  }}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default StickyNote;
