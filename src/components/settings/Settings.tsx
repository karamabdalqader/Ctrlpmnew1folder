import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  alpha,
  useTheme,
  FormGroup,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  PlayArrow as StartIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { FeedbackItem } from '../../types/feedback';
import { useCurrency, worldCurrencies } from '../../contexts/CurrencyContext';
import { useAuth } from '../../contexts/AuthContext';
import { getCSRFToken, validateCSRFToken } from '../../utils/csrf';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [editMode, setEditMode] = useState(false);
  const { user } = useAuth();
  const [userSettings, setUserSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    isAdmin: user?.isAdmin || false,
    language: 'en',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { currency, setCurrency } = useCurrency();

  // Language options with native names
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'zh', name: 'Chinese (Simplified)', nativeName: '中文' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'fa', name: 'Persian (Farsi)', nativeName: 'فارسی' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  ];

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
      // Add more mock items
    ];
    setFeedbackItems(mockFeedback);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const csrfToken = getCSRFToken();
      
      if (!validateCSRFToken(csrfToken)) {
        throw new Error('Invalid CSRF token');
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
        body: JSON.stringify(userSettings),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Settings" />
          {userSettings.isAdmin && <Tab label="Admin Dashboard" />}
        </Tabs>
      </Box>

      {/* Settings Panel */}
      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Settings</Typography>
            <IconButton onClick={() => setEditMode(!editMode)}>
              {editMode ? <SaveIcon onClick={handleSaveSettings} /> : <EditIcon />}
            </IconButton>
          </Box>

          {/* Profile Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              Profile Information
            </Typography>
            <TextField
              fullWidth
              label="Name"
              value={userSettings.name}
              onChange={(e) => setUserSettings({ ...userSettings, name: e.target.value })}
              disabled={!editMode}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              value={userSettings.email}
              onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
              disabled={!editMode}
              sx={{ mb: 2 }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Currency Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              Currency Settings
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={currency.code}
                onChange={(e) => {
                  const selectedCurrency = worldCurrencies.find(c => c.code === e.target.value);
                  if (selectedCurrency) {
                    setCurrency(selectedCurrency);
                  }
                }}
                disabled={!editMode}
              >
                {worldCurrencies.map((curr) => (
                  <MenuItem key={curr.code} value={curr.code}>
                    {curr.name} ({curr.symbol})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Language Section */}
          <Box>
            <Typography variant="subtitle1" gutterBottom color="primary">
              Language Settings
            </Typography>
            <TextField
              select
              fullWidth
              label="Select Language"
              value={userSettings.language}
              onChange={(e) => setUserSettings({ ...userSettings, language: e.target.value })}
              disabled={!editMode}
              sx={{ mb: 2 }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: { maxHeight: 300 }
                  }
                }
              }}
            >
              {languages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  <Box display="flex" justifyContent="space-between" width="100%">
                    <Typography>{lang.name}</Typography>
                    <Typography color="text.secondary" sx={{ ml: 2 }}>
                      {lang.nativeName}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {editMode && (
            <Box mt={4}>
              <Button
                variant="contained"
                onClick={handleSaveSettings}
                startIcon={<SaveIcon />}
              >
                Save Settings
              </Button>
            </Box>
          )}
        </Paper>
      </TabPanel>

      {/* Admin Dashboard Panel */}
      {userSettings.isAdmin && (
        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ width: '100%' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Upvotes</TableCell>
                    <TableCell>Responses</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feedbackItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{item.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.description.substring(0, 100)}...
                        </Typography>
                      </TableCell>
                      <TableCell>{item.author.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          size="small"
                          sx={{
                            backgroundColor: alpha(getStatusColor(item.status), 0.1),
                            color: getStatusColor(item.status),
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">{item.upvotes}</TableCell>
                      <TableCell>{item.responses.length}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setSelectedFeedback(item);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem
                onClick={() => selectedFeedback && handleStatusChange(selectedFeedback.id, 'in-progress')}
              >
                <StartIcon sx={{ mr: 1 }} /> Mark In Progress
              </MenuItem>
              <MenuItem
                onClick={() => selectedFeedback && handleStatusChange(selectedFeedback.id, 'completed')}
              >
                <CheckIcon sx={{ mr: 1 }} /> Mark Completed
              </MenuItem>
              <MenuItem
                onClick={() => selectedFeedback && handleStatusChange(selectedFeedback.id, 'rejected')}
              >
                <CloseIcon sx={{ mr: 1 }} /> Reject
              </MenuItem>
            </Menu>
          </Paper>
        </TabPanel>
      )}
    </Box>
  );
};

export default Settings;
