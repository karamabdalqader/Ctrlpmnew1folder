import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
  styled,
  Menu,
  MenuItem,
  Collapse,
  Alert,
} from '@mui/material';
import {
  ArrowUpward as UpvoteIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  PlayArrow as StartIcon
} from '@mui/icons-material';
import { FeedbackItem, NewFeedbackInput, FeedbackResponse } from '../../types/feedback';
import { useUser } from '../../contexts/UserContext';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const UpvoteButton = styled(IconButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  '&.upvoted': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
})) as typeof IconButton;

const Feedback = () => {
  const theme = useTheme();
  const { userProfile, isAuthenticated } = useUser();
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openResponseDialog, setOpenResponseDialog] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [newResponse, setNewResponse] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [newFeedback, setNewFeedback] = useState<NewFeedbackInput>({
    title: '',
    description: '',
  });

  useEffect(() => {
    // Mock data - In a real app, this would be an API call
    const mockFeedback: FeedbackItem[] = [
      {
        id: '1',
        title: 'Add Dark Mode',
        description: 'It would be great to have a dark mode option for better visibility at night.',
        author: { id: 'user2', name: 'Jane Smith' },
        upvotes: 5,
        upvotedBy: ['user3', 'user4'],
        createdAt: new Date().toISOString(),
        status: 'pending',
        responses: [
          {
            id: 'resp1',
            content: 'We are considering this for our next sprint.',
            author: { id: 'admin1', name: 'Admin User', isAdmin: true },
            createdAt: new Date().toISOString(),
          }
        ],
      },
    ];
    setFeedbackItems(mockFeedback);
  }, []);

  const handleUpvote = (feedbackId: string) => {
    if (!isAuthenticated || !userProfile) {
      return; // Don't allow upvoting if not authenticated
    }

    // Check if user has already upvoted
    const feedback = feedbackItems.find(item => item.id === feedbackId);
    if (!feedback || feedback.upvotedBy.includes(userProfile.id)) {
      return; // Don't allow multiple upvotes
    }

    setFeedbackItems(items =>
      items.map(item => {
        if (item.id === feedbackId) {
          return {
            ...item,
            upvotes: item.upvotes + 1,
            upvotedBy: [...item.upvotedBy, userProfile.id],
          };
        }
        return item;
      })
    );
  };

  const handleSubmit = () => {
    if (!isAuthenticated || !userProfile) {
      return; // Don't allow submission if not authenticated
    }

    if (!newFeedback.title || !newFeedback.description) return;

    const newItem: FeedbackItem = {
      id: Date.now().toString(),
      ...newFeedback,
      author: {
        id: userProfile.id,
        name: userProfile.name,
      },
      upvotes: 0,
      upvotedBy: [],
      createdAt: new Date().toISOString(),
      status: 'pending',
      responses: [],
    };

    setFeedbackItems(prev => [newItem, ...prev]);
    setNewFeedback({ title: '', description: '' });
    setOpenDialog(false);
  };

  const handleResponseSubmit = () => {
    if (!isAuthenticated || !userProfile || !selectedFeedback || !newResponse.trim()) {
      return;
    }

    const response: FeedbackResponse = {
      id: Date.now().toString(),
      content: newResponse,
      author: {
        id: userProfile.id,
        name: userProfile.name,
        isAdmin: userProfile.isAdmin,
      },
      createdAt: new Date().toISOString(),
    };

    setFeedbackItems(items =>
      items.map(item =>
        item.id === selectedFeedback.id
          ? { ...item, responses: [...item.responses, response] }
          : item
      )
    );

    setNewResponse('');
    setOpenResponseDialog(false);
    setSelectedFeedback(null);
  };

  const handleStatusChange = (feedbackId: string, newStatus: FeedbackItem['status']) => {
    setFeedbackItems(items =>
      items.map(item =>
        item.id === feedbackId
          ? { ...item, status: newStatus }
          : item
      )
    );
    setAnchorEl(null);
  };

  const getStatusColor = (status: FeedbackItem['status']) => {
    const colors = {
      pending: theme.palette.warning.main,
      'in-progress': theme.palette.info.main,
      completed: theme.palette.success.main,
      rejected: theme.palette.error.main,
    };
    return colors[status];
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Feedback & Feature Requests</Typography>
        {isAuthenticated ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Feedback
          </Button>
        ) : (
          <Alert severity="info" sx={{ flex: 1, ml: 2 }}>
            Please sign in to add feedback and participate in discussions
          </Alert>
        )}
      </Box>

      <List>
        {feedbackItems.map(item => (
          <StyledCard key={item.id}>
            <CardContent>
              <Box display="flex" gap={2}>
                <Box display="flex" flexDirection="column" alignItems="center" mr={2}>
                  <UpvoteButton
                    className={userProfile && item.upvotedBy.includes(userProfile.id) ? 'upvoted' : ''}
                    onClick={() => handleUpvote(item.id)}
                    disabled={!isAuthenticated || (userProfile ? item.upvotedBy.includes(userProfile.id) : false)}
                  >
                    <UpvoteIcon />
                  </UpvoteButton>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {item.upvotes}
                  </Typography>
                </Box>

                <Box flex={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6">{item.title}</Typography>
                      <Chip
                        label={item.status}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getStatusColor(item.status), 0.1),
                          color: getStatusColor(item.status),
                        }}
                      />
                    </Box>
                    {userProfile?.isAdmin && (
                      <>
                        <IconButton onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedFeedback(item);
                        }}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedFeedback?.id === item.id}
                          onClose={() => setAnchorEl(null)}
                        >
                          <MenuItem onClick={() => handleStatusChange(item.id, 'in-progress')}>
                            <StartIcon sx={{ mr: 1 }} /> Mark In Progress
                          </MenuItem>
                          <MenuItem onClick={() => handleStatusChange(item.id, 'completed')}>
                            <CheckIcon sx={{ mr: 1 }} /> Mark Completed
                          </MenuItem>
                          <MenuItem onClick={() => handleStatusChange(item.id, 'rejected')}>
                            <CloseIcon sx={{ mr: 1 }} /> Reject
                          </MenuItem>
                        </Menu>
                      </>
                    )}
                  </Box>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {item.description}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Posted by {item.author.name}
                    </Typography>
                    {isAuthenticated && (
                      <Button
                        size="small"
                        startIcon={<ReplyIcon />}
                        onClick={() => {
                          setSelectedFeedback(item);
                          setOpenResponseDialog(true);
                        }}
                      >
                        Reply
                      </Button>
                    )}
                  </Box>

                  {/* Responses Section */}
                  {item.responses.length > 0 && (
                    <Box mt={2}>
                      <Button
                        size="small"
                        onClick={() => setExpandedFeedback(expandedFeedback === item.id ? null : item.id)}
                      >
                        {item.responses.length} Response{item.responses.length !== 1 ? 's' : ''}
                      </Button>
                      <Collapse in={expandedFeedback === item.id}>
                        <List>
                          {item.responses.map(response => (
                            <Box
                              key={response.id}
                              sx={{
                                ml: 4,
                                mt: 1,
                                p: 2,
                                backgroundColor: response.author.isAdmin
                                  ? alpha(theme.palette.primary.main, 0.05)
                                  : alpha(theme.palette.grey[100], 0.5),
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant="body2">{response.content}</Typography>
                              <Box display="flex" justifyContent="space-between" mt={1}>
                                <Typography variant="caption" color="text.secondary">
                                  {response.author.isAdmin && (
                                    <Chip
                                      label="Admin"
                                      size="small"
                                      sx={{ mr: 1, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
                                    />
                                  )}
                                  {response.author.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(response.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </List>
                      </Collapse>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        ))}
      </List>

      {/* New Feedback Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Feedback</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newFeedback.title}
            onChange={(e) => setNewFeedback(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newFeedback.description}
            onChange={(e) => setNewFeedback(prev => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={openResponseDialog} onClose={() => setOpenResponseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Response</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Response"
            fullWidth
            multiline
            rows={4}
            value={newResponse}
            onChange={(e) => setNewResponse(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResponseDialog(false)}>Cancel</Button>
          <Button onClick={handleResponseSubmit} variant="contained">Submit Response</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Feedback;
