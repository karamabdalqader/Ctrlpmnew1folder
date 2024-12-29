import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Upload as UploadIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Comment as CommentIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpOutlineIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import OpenAI from 'openai';
import { useDropzone } from 'react-dropzone';
import mammoth from 'mammoth';

interface MeetingSummary {
  id: string;
  date: string;
  title: string;
  meetingDetails: {
    dateTime: string;
    participants: string[];
    objective: string;
  };
  agenda: string[];
  keyDiscussions: {
    topic: string;
    points: string[];
  }[];
  decisions: string[];
  actionItems: {
    task: string;
    assignee: string;
    deadline: string;
  }[];
  openQuestions: string[];
  nextSteps: string[];
  additionalNotes: string[];
  comments: string[];
}

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const MeetingSummarizer: React.FC = () => {
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<MeetingSummary | null>(null);
  const [savedSummaries, setSavedSummaries] = useState<MeetingSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [editingSummaryId, setEditingSummaryId] = useState<string | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  // Add migration function
  const migrateSummary = (oldSummary: any): MeetingSummary => {
    return {
      id: oldSummary.id || Date.now().toString(),
      date: oldSummary.date || new Date().toISOString(),
      title: oldSummary.title || 'Untitled Meeting',
      meetingDetails: oldSummary.meetingDetails || {
        dateTime: oldSummary.date || new Date().toISOString(),
        participants: [],
        objective: oldSummary.summary || ''
      },
      agenda: oldSummary.agenda || [],
      keyDiscussions: oldSummary.keyDiscussions || [{
        topic: 'Discussion Points',
        points: oldSummary.keyPoints || []
      }],
      decisions: oldSummary.decisions || [],
      actionItems: oldSummary.actionItems ? 
        (typeof oldSummary.actionItems[0] === 'string' ? 
          oldSummary.actionItems.map((item: string) => ({
            task: item,
            assignee: 'Unassigned',
            deadline: 'TBD'
          })) : 
          oldSummary.actionItems) : 
        [],
      openQuestions: oldSummary.openQuestions || [],
      nextSteps: oldSummary.nextSteps || [],
      additionalNotes: oldSummary.additionalNotes || [],
      comments: oldSummary.comments || []
    };
  };

  // Update the loadSavedSummaries function
  const loadSavedSummaries = useCallback(() => {
    const saved = localStorage.getItem('meetingSummaries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate each summary to new format
        const migratedSummaries = Array.isArray(parsed) ? 
          parsed.map(migrateSummary) : 
          [];
        setSavedSummaries(migratedSummaries);
      } catch (error) {
        console.error('Error loading saved summaries:', error);
        setSavedSummaries([]);
      }
    }
  }, []);

  useEffect(() => {
    // Load saved summaries from localStorage
    loadSavedSummaries();
  }, []);

  const saveSummariesToStorage = (summaries: MeetingSummary[]) => {
    localStorage.setItem('meetingSummaries', JSON.stringify(summaries));
    setSavedSummaries(summaries);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setFileName(file.name);

    try {
      let text = '';
      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else {
        text = await file.text();
      }
      
      // Extract title from filename up to second dash
      const titleParts = file.name.split('-');
      if (titleParts.length >= 2) {
        const autoTitle = titleParts.slice(0, 2).join('-').trim().replace(/\.[^/.]+$/, '');
        setMeetingTitle(autoTitle);
      }
      
      setTranscript(text);
    } catch (error) {
      console.error('Error reading file:', error);
      setError('Error reading file. Please try again.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  const chunkText = (text: string, maxChunkSize: number = 2000): string[] => {
    const chunks: string[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        // If a single sentence is too long, split it
        if (sentence.length > maxChunkSize) {
          const words = sentence.split(' ');
          let tempChunk = '';
          for (const word of words) {
            if ((tempChunk + ' ' + word).length > maxChunkSize) {
              chunks.push(tempChunk.trim());
              tempChunk = word;
            } else {
              tempChunk += (tempChunk ? ' ' : '') + word;
            }
          }
          if (tempChunk) {
            currentChunk = tempChunk;
          }
        } else {
          currentChunk = sentence;
        }
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  };

  const generateSummary = async () => {
    if (!transcript.trim()) {
      setError('Please paste a meeting transcript or upload a document');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Only generate title if we don't already have one from the filename
      let autoTitle = meetingTitle;
      if (!autoTitle) {
        setMeetingTitle('Generating title...');
        const titleResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional meeting title generator. Create a concise, descriptive title based on the meeting content."
            },
            {
              role: "user",
              content: `Generate a short, descriptive title (maximum 6 words) for this meeting based on its transcript. Return ONLY the title, nothing else.\n\nTranscript:\n${transcript.slice(0, 300)}...`
            }
          ]
        });

        autoTitle = titleResponse.choices[0]?.message?.content?.trim() || `Meeting Summary ${new Date().toLocaleDateString()}`;
        setMeetingTitle(autoTitle);
      }

      // Split transcript into chunks if it's too large
      const chunks = chunkText(transcript);
      let combinedSummary = '';

      // Process each chunk
      for (const chunk of chunks) {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are an assistant tasked with creating professional, comprehensive Meeting Minutes (MoM) from detailed meeting transcripts. The MoM should be concise yet thorough, capturing the meeting's essence, key decisions, and actionable outcomes. Extract information in a structured format that includes meeting details, agenda, key discussions, decisions, action items, and next steps.

Always return a valid JSON object with the following structure:
{
  "meetingDetails": {
    "dateTime": "Extract or infer meeting date/time",
    "participants": ["List of participants with roles if available"],
    "objective": "Main meeting objective/purpose"
  },
  "agenda": ["List of topics discussed"],
  "keyDiscussions": [
    {
      "topic": "Topic/agenda item",
      "points": ["Critical points discussed", "Questions raised", "Context provided"]
    }
  ],
  "decisions": ["List of agreed-upon decisions and resolutions"],
  "actionItems": [
    {
      "task": "Specific task",
      "assignee": "Person responsible",
      "deadline": "Target completion date"
    }
  ],
  "openQuestions": ["Unresolved questions requiring follow-up"],
  "nextSteps": ["Future actions and next meetings"],
  "additionalNotes": ["Other relevant observations or clarifications"]
}`
            },
            {
              role: "user",
              content: `${chunks.length > 1 ? 'This is part of a longer transcript. ' : ''}Analyze this meeting transcript and provide a summary following the specified JSON format:

              Here's the transcript:
              ${chunk}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        const content = response.choices[0]?.message?.content;
        if (!content) continue;

        try {
          const parsedChunk = JSON.parse(content.trim());
          combinedSummary += (combinedSummary ? '\n' : '') + content.trim();
        } catch (parseError) {
          console.error('Error parsing chunk response:', parseError);
          continue;
        }
      }

      // Combine all chunks into a final summary if there were multiple chunks
      let finalSummary;
      if (chunks.length > 1) {
        const combinedResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an assistant tasked with creating professional, comprehensive Meeting Minutes (MoM) from detailed meeting transcripts. The MoM should be concise yet thorough, capturing the meeting's essence, key decisions, and actionable outcomes. Combine multiple summary chunks into a single coherent summary. Return a valid JSON object."
            },
            {
              role: "user",
              content: `Combine these meeting summary chunks into a single coherent summary. Return in the same JSON format:

              ${combinedSummary}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        const finalContent = combinedResponse.choices[0]?.message?.content;
        if (!finalContent) throw new Error('Failed to combine summaries');
        
        finalSummary = JSON.parse(finalContent.trim());
      } else {
        finalSummary = JSON.parse(combinedSummary.trim());
      }

      // Validate the required fields
      if (!finalSummary.meetingDetails || !finalSummary.agenda || !Array.isArray(finalSummary.keyDiscussions) || 
          !Array.isArray(finalSummary.decisions) || !Array.isArray(finalSummary.actionItems) || 
          !Array.isArray(finalSummary.openQuestions) || !Array.isArray(finalSummary.nextSteps) || 
          !Array.isArray(finalSummary.additionalNotes)) {
        throw new Error('Invalid summary format: Missing required fields');
      }

      const newSummary: MeetingSummary = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        title: autoTitle,
        meetingDetails: finalSummary.meetingDetails,
        agenda: finalSummary.agenda || [],
        keyDiscussions: finalSummary.keyDiscussions || [],
        decisions: finalSummary.decisions || [],
        actionItems: finalSummary.actionItems || [],
        openQuestions: finalSummary.openQuestions || [],
        nextSteps: finalSummary.nextSteps || [],
        additionalNotes: finalSummary.additionalNotes || [],
        comments: []
      };

      setCurrentSummary(newSummary);
      const updatedSummaries = [newSummary, ...savedSummaries];
      saveSummariesToStorage(updatedSummaries);
      
      // Clear form
      setTranscript('');
      setFileName(null);
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate summary. Please try again.');
      setMeetingTitle('');  // Clear the "Generating title..." message
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSummary = (id: string) => {
    const updatedSummaries = savedSummaries.filter(summary => summary.id !== id);
    saveSummariesToStorage(updatedSummaries);
  };

  const handleEditSummary = (id: string) => {
    setEditingSummaryId(id);
    const summaryToEdit = savedSummaries.find(summary => summary.id === id);
    if (summaryToEdit) {
      setCurrentSummary(summaryToEdit);
    }
  };

  const handleSaveEdit = (id: string) => {
    if (!currentSummary) return;
    
    const updatedSummaries = savedSummaries.map(summary => 
      summary.id === id ? currentSummary : summary
    );
    saveSummariesToStorage(updatedSummaries);
    setEditingSummaryId(null);
  };

  const handleAddComment = () => {
    if (!selectedSummaryId || !newComment.trim()) return;

    const updatedSummaries = savedSummaries.map(summary => {
      if (summary.id === selectedSummaryId) {
        return {
          ...summary,
          comments: [...summary.comments, newComment]
        };
      }
      return summary;
    });

    saveSummariesToStorage(updatedSummaries);
    setNewComment('');
    setCommentDialogOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Meeting Summarizer
        </Typography>

        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="transcript-help-content"
            id="transcript-help-header"
          >
            <Typography>How to Get Meeting Transcripts</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle1" gutterBottom>
              Follow these steps to get transcripts from different platforms:
            </Typography>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Microsoft Teams</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="1. During the meeting"
                      secondary="• Click on More actions (three dots) > Start transcription"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="2. After the meeting"
                      secondary="• Go to the meeting chat > Click on More actions (three dots) next to the transcript > Open in Teams > Download"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="3. Alternative method"
                      secondary="• Open the meeting recording > Three dots menu > Open transcript > Download"
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Google Meet</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="1. Before the meeting"
                      secondary="• Click on More options (three dots) > Settings > Captions > Turn on captions"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="2. During the meeting"
                      secondary="• Click Activities > Transcripts > Save transcript"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="3. After the meeting"
                      secondary="• The transcript will be saved to your Google Drive in a folder called 'Meet Recordings'"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Note"
                      secondary="• Google Workspace Enterprise editions have additional transcription features"
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Zoom</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="1. Enable transcription (Host only)"
                      secondary="• Sign in to Zoom web portal > Settings > Recording > Enable Audio Transcript"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="2. During the meeting"
                      secondary="• Click Closed Caption > Enable Auto-Transcription"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="3. After the meeting"
                      secondary="• Go to Recordings in your Zoom web portal > Click on the recording > Click on Audio Transcript > Download"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Alternative method"
                      secondary="• If you have local recordings: Open the recording > Click on Transcript > Save"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Note"
                      secondary="• Transcription feature availability depends on your Zoom plan"
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                After obtaining your transcript, you can either paste it directly into the text field below or upload the transcript file.
                Supported file formats: .txt, .doc, .docx
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 3,
            mb: 2,
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main'
            }
          }}
        >
          <input {...getInputProps()} />
          <UploadIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography>
            {isDragActive
              ? 'Drop the file here'
              : 'Drag & drop a file here, or click to select'}
          </Typography>
          {fileName && (
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              Selected file: {fileName}
            </Typography>
          )}
        </Box>

        <TextField
          fullWidth
          multiline
          rows={6}
          label="Or paste meeting transcript here"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={generateSummary}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <AssignmentIcon />}
        >
          {isLoading ? 'Generating Summary...' : 'Generate Summary'}
        </Button>
      </Paper>

      {/* Saved Summaries Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Saved Summaries
      </Typography>
      
      <Stack spacing={2}>
        {savedSummaries.map((summary) => (
          <Card key={summary.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {summary.title}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Meeting Details
                </Typography>
                <Typography variant="body2" paragraph>
                  Date/Time: {new Date(summary.meetingDetails?.dateTime || summary.date).toLocaleString()}
                  <br />
                  Objective: {summary.meetingDetails?.objective || 'No objective specified'}
                  <br />
                  Participants: {(summary.meetingDetails?.participants || []).join(', ') || 'No participants listed'}
                </Typography>

                {summary.agenda && summary.agenda.length > 0 && (
                  <>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Agenda
                    </Typography>
                    <List dense>
                      {summary.agenda.map((item, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <AssignmentIcon />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {summary.keyDiscussions && summary.keyDiscussions.length > 0 && (
                  <>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Key Discussions
                    </Typography>
                    {summary.keyDiscussions.map((discussion, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">{discussion.topic}</Typography>
                        <List dense>
                          {discussion.points.map((point, pointIndex) => (
                            <ListItem key={pointIndex}>
                              <ListItemIcon>
                                <CheckCircleIcon />
                              </ListItemIcon>
                              <ListItemText primary={point} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    ))}
                  </>
                )}

                {summary.decisions && summary.decisions.length > 0 && (
                  <>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Decisions Made
                    </Typography>
                    <List dense>
                      {summary.decisions.map((decision, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckCircleIcon />
                          </ListItemIcon>
                          <ListItemText primary={decision} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {summary.actionItems && summary.actionItems.length > 0 && (
                  <>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Action Items
                    </Typography>
                    <List dense>
                      {summary.actionItems.map((item, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <AssignmentIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={item.task}
                            secondary={`Assignee: ${item.assignee} | Deadline: ${item.deadline}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {summary.openQuestions && summary.openQuestions.length > 0 && (
                  <>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Open Questions
                    </Typography>
                    <List dense>
                      {summary.openQuestions.map((question, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <HelpOutlineIcon />
                          </ListItemIcon>
                          <ListItemText primary={question} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {summary.nextSteps && summary.nextSteps.length > 0 && (
                  <>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Next Steps
                    </Typography>
                    <List dense>
                      {summary.nextSteps.map((step, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <ArrowForwardIcon />
                          </ListItemIcon>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {summary.additionalNotes && summary.additionalNotes.length > 0 && (
                  <>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Additional Notes
                    </Typography>
                    <List dense>
                      {summary.additionalNotes.map((note, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <DescriptionIcon />
                          </ListItemIcon>
                          <ListItemText primary={note} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Box>

              {summary.comments && summary.comments.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Comments:
                  </Typography>
                  <List dense>
                    {summary.comments.map((comment, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CommentIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={comment} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </CardContent>
            
            <CardActions>
              {editingSummaryId === summary.id ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Edit Meeting Summary
                  </Typography>

                  <TextField
                    fullWidth
                    label="Title"
                    value={currentSummary?.title || ''}
                    onChange={(e) => setCurrentSummary(curr => curr ? {...curr, title: e.target.value} : null)}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Meeting Details
                  </Typography>
                  <TextField
                    fullWidth
                    label="Date/Time"
                    type="datetime-local"
                    value={currentSummary?.meetingDetails.dateTime.slice(0, 16) || ''}
                    onChange={(e) => setCurrentSummary(curr => curr ? {
                      ...curr,
                      meetingDetails: {
                        ...curr.meetingDetails,
                        dateTime: new Date(e.target.value).toISOString()
                      }
                    } : null)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Objective"
                    multiline
                    rows={2}
                    value={currentSummary?.meetingDetails.objective || ''}
                    onChange={(e) => setCurrentSummary(curr => curr ? {
                      ...curr,
                      meetingDetails: {
                        ...curr.meetingDetails,
                        objective: e.target.value
                      }
                    } : null)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Participants (comma-separated)"
                    value={currentSummary?.meetingDetails.participants.join(', ') || ''}
                    onChange={(e) => setCurrentSummary(curr => curr ? {
                      ...curr,
                      meetingDetails: {
                        ...curr.meetingDetails,
                        participants: e.target.value.split(',').map(p => p.trim()).filter(p => p)
                      }
                    } : null)}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Agenda Items
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Agenda Items (one per line)"
                    value={currentSummary?.agenda.join('\n') || ''}
                    onChange={(e) => setCurrentSummary(curr => curr ? {
                      ...curr,
                      agenda: e.target.value.split('\n').map(item => item.trim()).filter(item => item)
                    } : null)}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Key Discussions
                  </Typography>
                  {currentSummary?.keyDiscussions.map((discussion, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label={`Topic ${index + 1}`}
                        value={discussion.topic}
                        onChange={(e) => setCurrentSummary(curr => {
                          if (!curr) return null;
                          const newDiscussions = [...curr.keyDiscussions];
                          newDiscussions[index] = {
                            ...newDiscussions[index],
                            topic: e.target.value
                          };
                          return {...curr, keyDiscussions: newDiscussions};
                        })}
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Discussion Points (one per line)"
                        value={discussion.points.join('\n')}
                        onChange={(e) => setCurrentSummary(curr => {
                          if (!curr) return null;
                          const newDiscussions = [...curr.keyDiscussions];
                          newDiscussions[index] = {
                            ...newDiscussions[index],
                            points: e.target.value.split('\n').map(p => p.trim()).filter(p => p)
                          };
                          return {...curr, keyDiscussions: newDiscussions};
                        })}
                      />
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentSummary(curr => curr ? {
                      ...curr,
                      keyDiscussions: [...curr.keyDiscussions, { topic: '', points: [] }]
                    } : null)}
                    sx={{ mb: 2 }}
                  >
                    Add Discussion Topic
                  </Button>

                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Decisions
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Decisions Made (one per line)"
                    value={currentSummary?.decisions.join('\n') || ''}
                    onChange={(e) => setCurrentSummary(curr => curr ? {
                      ...curr,
                      decisions: e.target.value.split('\n').map(d => d.trim()).filter(d => d)
                    } : null)}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Action Items
                  </Typography>
                  {currentSummary?.actionItems.map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Task"
                        value={item.task}
                        onChange={(e) => setCurrentSummary(curr => {
                          if (!curr) return null;
                          const newItems = [...curr.actionItems];
                          newItems[index] = { ...newItems[index], task: e.target.value };
                          return {...curr, actionItems: newItems};
                        })}
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        fullWidth
                        label="Assignee"
                        value={item.assignee}
                        onChange={(e) => setCurrentSummary(curr => {
                          if (!curr) return null;
                          const newItems = [...curr.actionItems];
                          newItems[index] = { ...newItems[index], assignee: e.target.value };
                          return {...curr, actionItems: newItems};
                        })}
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        fullWidth
                        label="Deadline"
                        value={item.deadline}
                        onChange={(e) => setCurrentSummary(curr => {
                          if (!curr) return null;
                          const newItems = [...curr.actionItems];
                          newItems[index] = { ...newItems[index], deadline: e.target.value };
                          return {...curr, actionItems: newItems};
                        })}
                      />
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentSummary(curr => curr ? {
                      ...curr,
                      actionItems: [...curr.actionItems, { task: '', assignee: '', deadline: '' }]
                    } : null)}
                    sx={{ mb: 2 }}
                  >
                    Add Action Item
                  </Button>

                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Open Questions
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Open Questions (one per line)"
                    value={currentSummary?.openQuestions.join('\n') || ''}
                    onChange={(e) => setCurrentSummary(curr => curr ? {
                      ...curr,
                      openQuestions: e.target.value.split('\n').map(q => q.trim()).filter(q => q)
                    } : null)}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Next Steps
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Next Steps (one per line)"
                    value={currentSummary?.nextSteps.join('\n') || ''}
                    onChange={(e) => setCurrentSummary(curr => curr ? {
                      ...curr,
                      nextSteps: e.target.value.split('\n').map(s => s.trim()).filter(s => s)
                    } : null)}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Additional Notes
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Additional Notes (one per line)"
                    value={currentSummary?.additionalNotes.join('\n') || ''}
                    onChange={(e) => setCurrentSummary(curr => curr ? {
                      ...curr,
                      additionalNotes: e.target.value.split('\n').map(n => n.trim()).filter(n => n)
                    } : null)}
                    sx={{ mb: 2 }}
                  />
                </Box>
              ) : (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => handleEditSummary(summary.id)}
                >
                  Edit
                </Button>
              )}
              <Button
                startIcon={<CommentIcon />}
                onClick={() => {
                  setSelectedSummaryId(summary.id);
                  setCommentDialogOpen(true);
                }}
              >
                Add Comment
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                onClick={() => handleDeleteSummary(summary.id)}
              >
                Delete
              </Button>
            </CardActions>
          </Card>
        ))}
      </Stack>

      {/* Comment Dialog */}
      <Dialog
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Enter your comment here..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddComment} variant="contained">
            Add Comment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeetingSummarizer;
