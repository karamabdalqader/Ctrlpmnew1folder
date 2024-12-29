import React from 'react';
import { Box } from '@mui/material';
import { ProductivityToolsMenu } from '../components/ProductivityTools';

const ProductivityToolsPage: React.FC = () => {
  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <ProductivityToolsMenu />
    </Box>
  );
};

export default ProductivityToolsPage;
