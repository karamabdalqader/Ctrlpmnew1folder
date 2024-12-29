import React from 'react';
import { Badge, styled } from '@mui/material';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    fontSize: '0.75rem',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
  },
}));

interface NotificationBadgeProps {
  count: number;
  children: React.ReactNode;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, children }) => {
  return (
    <StyledBadge badgeContent={count} color="error" max={99}>
      {children}
    </StyledBadge>
  );
};

export default NotificationBadge;
