import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import FileUpload from '../components/FileManagement/FileUpload';
import { useParams } from 'react-router-dom';

const FileManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          File Management
        </Typography>
        <FileUpload projectId={id || ''} />
      </Box>
    </Container>
  );
};

export default FileManagement;
