import React, { memo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  NotificationsActive as NotificationsActiveIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Notification } from '../../hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem = memo(({ notification, onMarkAsRead }: NotificationItemProps) => {
  const theme = useTheme();

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'daily':
        return theme.palette.info.main;
      case 'weekly':
        return theme.palette.success.main;
      case 'monthly':
        return theme.palette.warning.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const formatTimestamp = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.1),
        },
        transition: 'background-color 0.2s ease',
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            variant="subtitle1"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: notification.read ? 'text.primary' : 'text.primary',
              fontWeight: notification.read ? 400 : 500,
            }}
          >
            <NotificationsActiveIcon 
              sx={{ 
                color: getNotificationColor(notification.type),
                transition: 'color 0.2s ease',
              }} 
            />
            {notification.title}
          </Typography>
          {!notification.read && (
            <IconButton
              onClick={() => onMarkAsRead(notification.id)}
              size="small"
              sx={{ 
                color: theme.palette.success.main,
                '&:hover': {
                  color: theme.palette.success.dark,
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                },
                transition: 'all 0.2s ease',
              }}
            >
              <CheckCircleIcon />
            </IconButton>
          )}
        </Stack>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {notification.message}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatTimestamp(notification.timestamp)}
        </Typography>
      </Stack>
    </Box>
  );
});

NotificationItem.displayName = 'NotificationItem';

export default NotificationItem;
