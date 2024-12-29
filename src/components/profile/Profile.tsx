import React from 'react';
import { Box, Typography, Paper, Avatar, Grid } from '@mui/material';

const Profile = () => {
  return (
    <Box p={3}>
      <Paper elevation={0} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ width: 80, height: 80 }}/>
            <Box>
              <Typography variant="h5">User Name</Typography>
              <Typography variant="body2" color="text.secondary">user@example.com</Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Profile Information</Typography>
            {/* Add profile details here */}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;
