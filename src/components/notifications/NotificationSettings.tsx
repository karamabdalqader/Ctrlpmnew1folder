import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Grid,
  Button,
  TextField,
} from '@mui/material';
import debounce from 'lodash/debounce';

export interface NotificationPreferences {
  daily: boolean;
  weekly: boolean;
  monthly: boolean;
  tasks: boolean;
  milestones: boolean;
  budgets: boolean;
  invoices: boolean;
  deliveryNotes: boolean;
  risks: boolean;
  emailAddress: string;
}

const NotificationSettings: React.FC = React.memo(() => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    daily: true,
    weekly: true,
    monthly: true,
    tasks: true,
    milestones: true,
    budgets: true,
    invoices: true,
    deliveryNotes: true,
    risks: true,
    emailAddress: '',
  });

  const handleToggleChange = useCallback((key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const handleEmailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setPreferences((prev) => ({
      ...prev,
      emailAddress: value,
    }));
  }, []);

  // Debounce save operation to prevent excessive API calls
  const debouncedSave = useMemo(
    () =>
      debounce((prefs: NotificationPreferences) => {
        // TODO: Implement save functionality to backend
        console.log('Saving preferences:', prefs);
      }, 500),
    []
  );

  const handleSave = useCallback(() => {
    debouncedSave(preferences);
  }, [preferences, debouncedSave]);

  const reportFrequencyControls = useMemo(() => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.daily}
              onChange={() => handleToggleChange('daily')}
            />
          }
          label="Daily Reports"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.weekly}
              onChange={() => handleToggleChange('weekly')}
            />
          }
          label="Weekly Reports"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.monthly}
              onChange={() => handleToggleChange('monthly')}
            />
          }
          label="Monthly Reports"
        />
      </Grid>
    </Grid>
  ), [preferences.daily, preferences.weekly, preferences.monthly, handleToggleChange]);

  const notificationTypeControls = useMemo(() => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.tasks}
              onChange={() => handleToggleChange('tasks')}
            />
          }
          label="Task Updates"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.milestones}
              onChange={() => handleToggleChange('milestones')}
            />
          }
          label="Milestone Updates"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.budgets}
              onChange={() => handleToggleChange('budgets')}
            />
          }
          label="Budget Updates"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.invoices}
              onChange={() => handleToggleChange('invoices')}
            />
          }
          label="Invoice Status"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.deliveryNotes}
              onChange={() => handleToggleChange('deliveryNotes')}
            />
          }
          label="Delivery Notes"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.risks}
              onChange={() => handleToggleChange('risks')}
            />
          }
          label="Risks & Issues"
        />
      </Grid>
    </Grid>
  ), [preferences.tasks, preferences.milestones, preferences.budgets, preferences.invoices, preferences.deliveryNotes, preferences.risks, handleToggleChange]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Notification Settings
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Report Frequency
          </Typography>
          {reportFrequencyControls}
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notification Types
          </Typography>
          {notificationTypeControls}
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Email Settings
          </Typography>
          <TextField
            fullWidth
            label="Email Address"
            value={preferences.emailAddress}
            onChange={handleEmailChange}
            type="email"
            sx={{ mb: 2 }}
          />
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save Settings
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
});

NotificationSettings.displayName = 'NotificationSettings';

export default NotificationSettings;
