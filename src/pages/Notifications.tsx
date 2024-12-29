import React, { useState, useCallback, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  NotificationsActive as NotificationsActiveIcon,
} from '@mui/icons-material';
import { useNotifications, type Notification } from '../hooks/useNotifications';
import NotificationSettings from '../components/notifications/NotificationSettings';
import NotificationItem from '../components/notifications/NotificationItem';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const EmptyNotifications = React.memo(() => (
  <Card>
    <CardContent sx={{ textAlign: 'center', py: 6 }}>
      <NotificationsActiveIcon
        sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
      />
      <Typography variant="h6" color="text.secondary">
        No Notifications
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        You'll see your project updates and reports here
      </Typography>
    </CardContent>
  </Card>
));

EmptyNotifications.displayName = 'EmptyNotifications';

const NotificationsPage: React.FC = () => {
  const theme = useTheme();
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const handleMarkAsRead = useCallback((id: string) => {
    markAsRead(id);
  }, [markAsRead]);

  const notificationsList = useMemo(() => (
    <Box 
      sx={{ 
        maxHeight: 600, 
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '0.4em'
        },
        '&::-webkit-scrollbar-track': {
          background: theme.palette.background.paper
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.divider,
        },
      }}
    >
      {notifications.length === 0 ? (
        <EmptyNotifications />
      ) : (
        <List>
          {notifications.map((notification: Notification) => (
            <React.Fragment key={notification.id}>
              <NotificationItem
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  ), [notifications, handleMarkAsRead, theme.palette]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="All Notifications" />
              <Tab label="Settings" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              {notifications.length > 0 && (
                <Button
                  startIcon={<CheckCircleIcon />}
                  onClick={handleMarkAllRead}
                >
                  Mark all as read
                </Button>
              )}
            </Box>
            {notificationsList}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <NotificationSettings />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationsPage;
