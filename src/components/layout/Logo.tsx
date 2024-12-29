import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

const LogoWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  padding: '20px 16px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
});

const LogoIcon = styled(AccountTreeIcon)({
  fontSize: '2rem',
  marginRight: '8px',
});

const LogoText = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  lineHeight: 1.2,
});

const SubText = styled(Typography)({
  fontSize: '0.75rem',
  opacity: 0.8,
});

const Logo = () => {
  return (
    <LogoWrapper>
      <LogoIcon />
      <Box>
        <LogoText variant="h6">CtrlPM</LogoText>
        <SubText>Platform</SubText>
      </Box>
    </LogoWrapper>
  );
};

export default Logo;
