import React from 'react';
import { Container, Typography, Box, Paper, Grid, Card, CardContent } from '@mui/material';
import InvoiceList from '../components/InvoiceManagement/InvoiceList';
import { useParams } from 'react-router-dom';
import { getProjectData } from '../types/project';
import { useCurrency } from '../contexts/CurrencyContext';

const InvoiceManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectData = getProjectData(id || '');
  const invoices = projectData.invoices || [];
  const { convertAmount, formatAmount } = useCurrency();

  const totalAmount = invoices.reduce((sum, invoice) => sum + convertAmount(invoice.amount), 0);
  const clientInvoices = invoices.filter(invoice => invoice.invoiceType === 'client');
  const vendorInvoices = invoices.filter(invoice => invoice.invoiceType === 'vendor');

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Invoice Management
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Total Amount</Typography>
                <Typography variant="h4">{formatAmount(totalAmount)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ height: '100%', bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Client Invoices</Typography>
                <Typography variant="h4">{clientInvoices.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ height: '100%', bgcolor: 'info.light', color: 'info.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Vendor Invoices</Typography>
                <Typography variant="h4">{vendorInvoices.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper elevation={3}>
          <InvoiceList projectId={id || ''} />
        </Paper>
      </Box>
    </Container>
  );
};

export default InvoiceManagement;
