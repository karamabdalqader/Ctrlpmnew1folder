import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  InputAdornment,
  List,
  ListItem,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  StepContent,
  MobileStepper,
  Divider,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Cancel as CancelIcon,
  KeyboardArrowLeft, 
  KeyboardArrowRight,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { InfoOutlined as InfoIcon } from '@mui/icons-material';
import { Invoice as BaseInvoice, getProjectData, saveProjectData } from '../../types/project';
import { SelectChangeEvent } from '@mui/material';
import { useCurrency } from '../../contexts/CurrencyContext';

interface Invoice extends BaseInvoice {
  customStage?: 'pending' | 'inProgress' | 'completed';
  isVendorInvoice?: boolean;
}

interface InvoiceFormData extends Omit<Invoice, 'id'> {
  formType: 'basic' | 'advanced';
  amount: number;
}

interface EtimadStepperProps {
  currentStage?: Invoice['etimadStage'];
  onStageChange?: (newStage: Invoice['etimadStage']) => void;
  readOnly?: boolean;
}

interface CustomStepperProps {
  currentStage?: InvoiceFormData['customStage'];
  onStageChange?: (newStage: InvoiceFormData['customStage']) => void;
  readOnly?: boolean;
}

const EtimadStepper: React.FC<EtimadStepperProps> = ({ currentStage, onStageChange, readOnly }) => {
  const steps: NonNullable<Invoice['etimadStage']>[] = [
    'submitted',
    'underReview',
    'approved',
    'collected'
  ];

  const getStepLabel = (label: NonNullable<Invoice['etimadStage']>): string => {
    switch(label) {
      case 'submitted': return 'Submitted';
      case 'underReview': return 'Under Review';
      case 'approved': return 'Approved';
      case 'collected': return 'Collected';
      default: return label;
    }
  };

  const activeStep = currentStage ? steps.indexOf(currentStage) : 0;

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Stepper 
        activeStep={activeStep}
        alternativeLabel
      >
        {steps.map((label, index) => {
          const labelText = getStepLabel(label);
          return (
            <Step key={label}>
              <StepLabel>
                {labelText}
                {!readOnly && currentStage === steps[index - 1] && (
                  <Button
                    size="small"
                    onClick={() => onStageChange?.(label)}
                    sx={{ ml: 1 }}
                  >
                    Move to {labelText}
                  </Button>
                )}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};

const CustomStepper: React.FC<CustomStepperProps> = ({ currentStage, onStageChange, readOnly }) => {
  const steps: NonNullable<InvoiceFormData['customStage']>[] = [
    'pending',
    'inProgress',
    'completed'
  ];

  const getStepLabel = (label: NonNullable<InvoiceFormData['customStage']>): string => {
    switch(label) {
      case 'pending': return 'Pending';
      case 'inProgress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return label;
    }
  };

  const activeStep = currentStage ? steps.indexOf(currentStage) : 0;

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Stepper 
        activeStep={activeStep}
        alternativeLabel
      >
        {steps.map((label, index) => {
          const labelText = getStepLabel(label);
          return (
            <Step key={label}>
              <StepLabel>
                {labelText}
                {!readOnly && currentStage === steps[index - 1] && (
                  <Button
                    size="small"
                    onClick={() => onStageChange?.(label)}
                    sx={{ ml: 1 }}
                  >
                    Move to {labelText}
                  </Button>
                )}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};

const getStatusColor = (status: Invoice['status']) => {
  switch (status) {
    case 'draft':
      return 'default';
    case 'sent':
      return 'info';
    case 'pending':
      return 'warning';
    case 'collected':
      return 'success';
    case 'paid':
      return 'success';
    case 'received':
      return 'info';
    default:
      return 'default';
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};

const getNextStatus = (currentStatus: Invoice['status'], invoiceType: Invoice['invoiceType']): Invoice['status'] => {
  if (invoiceType === 'client') {
    switch (currentStatus) {
      case 'draft':
        return 'sent';
      case 'sent':
        return 'collected';
      default:
        return currentStatus;
    }
  } else { // vendor invoice
    switch (currentStatus) {
      case 'received':
        return 'paid';
      default:
        return currentStatus;
    }
  }
};

const getStatusActionButton = (status: Invoice['status'], invoiceType: Invoice['invoiceType'], deliveryMethod: Invoice['deliveryMethod']) => {
  // Don't show action buttons for custom or etimad delivery methods
  if (deliveryMethod === 'custom' || deliveryMethod === 'etimad') {
    return null;
  }

  if (invoiceType === 'client') {
    switch (status) {
      case 'draft':
        return 'Send Invoice';
      case 'sent':
        return 'Mark as Collected';
      default:
        return null;
    }
  } else {
    switch (status) {
      case 'received':
        return 'Mark as Paid';
      default:
        return null;
    }
  }
};

const handleEtimadStageChange = (invoice: Invoice, newStage: Invoice['etimadStage']) => {
  const now = new Date().toISOString();
  const updatedInvoice: Invoice = {
    ...invoice,
    etimadStage: newStage,
    // Update status based on Etimad stage
    status: (() => {
      switch (newStage) {
        case 'submitted':
          return 'sent';
        case 'collected':
          return 'collected';
        default:
          return invoice.status;
      }
    })(),
    dateSent: newStage === 'submitted' ? now : invoice.dateSent,
    dateCollected: newStage === 'collected' ? now : invoice.dateCollected,
  };

  return updatedInvoice;
};

const handleStatusChange = (invoice: Invoice) => {
  const nextStatus = getNextStatus(invoice.status, invoice.invoiceType);
  const now = new Date().toISOString();
  
  const updatedInvoice: Invoice = {
    ...invoice,
    status: nextStatus,
    dateSent: nextStatus === 'sent' ? now : invoice.dateSent,
    dateReceived: nextStatus === 'received' ? now : invoice.dateReceived,
    dateCollected: nextStatus === 'collected' ? now : invoice.dateCollected,
    datePaid: nextStatus === 'paid' ? now : invoice.datePaid,
  };
  
  return updatedInvoice;
};

const handleInvoiceTypeChange = (event: SelectChangeEvent<'client' | 'vendor'>, setNewInvoice: React.Dispatch<React.SetStateAction<InvoiceFormData>>) => {
  setNewInvoice((prev: InvoiceFormData) => ({
    ...prev,
    invoiceType: event.target.value as 'client' | 'vendor',
  }));
};

const handleDeliveryMethodChange = (event: SelectChangeEvent<Invoice['deliveryMethod']>, setNewInvoice: React.Dispatch<React.SetStateAction<InvoiceFormData>>) => {
  const method = event.target.value as Invoice['deliveryMethod'];
  setNewInvoice((prev: InvoiceFormData) => ({
    ...prev,
    deliveryMethod: method,
    // Initialize etimad stage when selecting etimad
    etimadStage: method === 'etimad' ? 'submitted' : undefined,
    // Reset custom delivery method when switching away from custom
    customDeliveryMethod: method === 'custom' ? prev.customDeliveryMethod : '',
    customStage: method === 'custom' ? 'pending' : undefined
  }));
};

const handleAddItem = (invoice: InvoiceFormData, setNewInvoice: React.Dispatch<React.SetStateAction<InvoiceFormData>>) => {
  setNewInvoice({
    ...invoice,
    items: [...invoice.items, { description: '', quantity: 0, unitPrice: 0, amount: 0 }],
  });
};

const handleRemoveItem = (index: number, invoice: InvoiceFormData, setNewInvoice: React.Dispatch<React.SetStateAction<InvoiceFormData>>) => {
  setNewInvoice({
    ...invoice,
    items: invoice.items.filter((_: any, i: number) => i !== index),
  });
};

const handleItemChange = (
  index: number,
  field: keyof InvoiceFormData['items'][0],
  value: number | string,
  invoice: InvoiceFormData,
  setNewInvoice: React.Dispatch<React.SetStateAction<InvoiceFormData>>
) => {
  const updatedItems = [...invoice.items];
  const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
  
  updatedItems[index] = {
    ...updatedItems[index],
    [field]: value,
    amount: field === 'quantity' || field === 'unitPrice' 
      ? (field === 'quantity' ? numericValue : updatedItems[index].quantity) * 
        (field === 'unitPrice' ? numericValue : updatedItems[index].unitPrice)
      : updatedItems[index].amount
  };
  
  setNewInvoice({
    ...invoice,
    items: updatedItems,
  });
};

const handleOpenDialog = (setOpenDialog: (open: boolean) => void, setSelectedInvoice: (invoice: Invoice | null) => void, setNewInvoice: (invoice: InvoiceFormData) => void) => {
  setSelectedInvoice(null);
  setNewInvoice(getInitialInvoiceState());
  setOpenDialog(true);
};

const handleCloseDialog = (setOpenDialog: (open: boolean) => void, setSelectedInvoice: (invoice: Invoice | null) => void, setNewInvoice: (invoice: InvoiceFormData) => void) => {
  setOpenDialog(false);
  setSelectedInvoice(null);
  setNewInvoice(getInitialInvoiceState());
};

const handleSaveInvoice = (newInvoice: InvoiceFormData, selectedInvoice: Invoice | null, invoices: Invoice[], setInvoices: (invoices: Invoice[]) => void, projectId: string, setOpenDialog: (open: boolean) => void) => {
  if (!newInvoice.invoiceNumber) return;

  const invoice: Invoice = {
    id: selectedInvoice?.id || Math.random().toString(36).substr(2, 9),
    ...newInvoice,
    // For vendor invoices, start with 'received' status instead of 'draft'
    // For Etimad and Custom, don't set draft status
    status: newInvoice.invoiceType === 'vendor' ? 'received' : 
            newInvoice.deliveryMethod === 'etimad' || newInvoice.deliveryMethod === 'custom' ? 'sent' : 
            'draft',
    dateReceived: newInvoice.invoiceType === 'vendor' ? new Date().toISOString() : undefined
  };

  let updatedInvoices: Invoice[];
  if (selectedInvoice) {
    updatedInvoices = invoices.map((inv) =>
      inv.id === selectedInvoice.id ? invoice : inv
    );
  } else {
    updatedInvoices = [...invoices, invoice];
  }

  setInvoices(updatedInvoices);
  const projectData = getProjectData(projectId);
  projectData.invoices = updatedInvoices;
  saveProjectData(projectId, projectData);
  
  setOpenDialog(false);
};

const handleDeleteInvoice = (invoiceId: string, invoices: Invoice[], setInvoices: (invoices: Invoice[]) => void, projectId: string) => {
  const updatedInvoices = invoices.filter((invoice) => invoice.id !== invoiceId);
  setInvoices(updatedInvoices);

  const projectData = getProjectData(projectId);
  projectData.invoices = updatedInvoices;
  saveProjectData(projectId, projectData);
};

const handleEditInvoice = (invoice: Invoice, setSelectedInvoice: (invoice: Invoice | null) => void, setNewInvoice: (invoice: InvoiceFormData) => void, setOpenDialog: (open: boolean) => void) => {
  setSelectedInvoice(invoice);
  setNewInvoice({
    invoiceNumber: invoice.invoiceNumber,
    description: invoice.description,
    status: invoice.status,
    invoiceType: invoice.invoiceType,
    deliveryMethod: invoice.deliveryMethod,
    customFields: invoice.customFields,
    items: invoice.items,
    dateSent: invoice.dateSent || '',
    dateCollected: invoice.dateCollected || '',
    datePaid: invoice.datePaid || '',
    etimadStage: invoice.etimadStage,
    etimadNotes: invoice.etimadNotes,
    customDeliveryMethod: invoice.customDeliveryMethod || '',
    formType: invoice.items.length > 1 ? 'advanced' : 'basic',
    amount: invoice.amount,
    customStage: invoice.customStage
  });
  setOpenDialog(true);
};

const handleCollectInvoice = (invoice: Invoice, invoices: Invoice[], setInvoices: (invoices: Invoice[]) => void, projectId: string) => {
  const updatedInvoice = {
    ...invoice,
    status: 'collected' as const,
    dateCollected: new Date().toISOString()
  };

  const updatedInvoices = invoices.map(inv => 
    inv.id === invoice.id ? updatedInvoice : inv
  );

  setInvoices(updatedInvoices);
  saveProjectData(projectId, { ...getProjectData(projectId), invoices: updatedInvoices });
};

const calculateSummaryData = (invoices: Invoice[]) => {
  const clientInvoices = invoices.filter(inv => inv.invoiceType === 'client');
  const vendorInvoices = invoices.filter(inv => inv.invoiceType === 'vendor');

  return {
    // Total collected from all delivery methods for client invoices
    collected: clientInvoices.filter(inv => 
      (inv.status === 'collected') || // For email delivery
      (inv.deliveryMethod === 'etimad' && inv.etimadStage === 'collected') || // For Etimad
      (inv.deliveryMethod === 'custom' && inv.customStage === 'completed') // For Custom
    ).reduce((sum, inv) => sum + inv.amount, 0),
    
    // Count of collected invoices
    collectedCount: clientInvoices.filter(inv => 
      (inv.status === 'collected') ||
      (inv.deliveryMethod === 'etimad' && inv.etimadStage === 'collected') ||
      (inv.deliveryMethod === 'custom' && inv.customStage === 'completed')
    ).length,

    // Vendor specific calculations
    vendor: vendorInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    vendorPaid: vendorInvoices.filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0),
    vendorCount: vendorInvoices.length,
    vendorPaidCount: vendorInvoices.filter(inv => inv.status === 'paid').length,

    // Client specific calculations
    client: clientInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    clientCollected: clientInvoices.filter(inv => 
      (inv.status === 'collected') ||
      (inv.deliveryMethod === 'etimad' && inv.etimadStage === 'collected') ||
      (inv.deliveryMethod === 'custom' && inv.customStage === 'completed')
    ).reduce((sum, inv) => sum + inv.amount, 0),
    clientCount: clientInvoices.length,
    clientCollectedCount: clientInvoices.filter(inv => 
      (inv.status === 'collected') ||
      (inv.deliveryMethod === 'etimad' && inv.etimadStage === 'collected') ||
      (inv.deliveryMethod === 'custom' && inv.customStage === 'completed')
    ).length,

    // Regular sent invoices (email only)
    sent: clientInvoices.filter(inv => 
      inv.status === 'sent' && inv.deliveryMethod === 'email'
    ).reduce((sum, inv) => sum + inv.amount, 0)
  };
};

const getInitialInvoiceState = (): InvoiceFormData => ({
  invoiceNumber: '',
  description: '',
  amount: 0,
  invoiceType: 'client',
  status: 'draft',
  formType: 'basic',
  items: [{ description: '', quantity: 0, unitPrice: 0, amount: 0 }],
  deliveryMethod: 'email',
  customStage: 'pending',
  customFields: [],
  dateSent: '',
  dateReceived: '',
  dateCollected: '',
  datePaid: '',
  customDeliveryMethod: '',
  etimadStage: undefined,
  etimadNotes: ''
});

const InvoiceList: React.FC<{ projectId: string }> = ({ projectId }) => {
  const theme = useTheme();
  const { convertAmount, formatAmount } = useCurrency();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [newInvoice, setNewInvoice] = useState<InvoiceFormData>(getInitialInvoiceState());
  const [rejectedInvoices, setRejectedInvoices] = useState<Set<string>>(new Set());

  useEffect(() => {
    const projectData = getProjectData(projectId);
    if (projectData?.invoices) {
      setInvoices(projectData.invoices);
      // Initialize rejected state from existing notes
      const rejected = new Set<string>();
      projectData.invoices.forEach(invoice => {
        if (invoice.etimadNotes?.toLowerCase().includes('rejected')) {
          rejected.add(invoice.id);
        }
      });
      setRejectedInvoices(rejected);
    }
  }, [projectId]);

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      {/* Financial Summary Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
            Financial Overview
          </Typography>
          <Tooltip title="Overview of all invoice amounts and their current status" arrow>
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        
        <Grid container spacing={4}>
          {/* Total Collected Card */}
          <Grid item xs={12} md={6}>
            <Box sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle1" color="success.main" fontWeight="medium">
                    Total Collected Amount
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Across all delivery methods
                  </Typography>
                </Stack>
                <Chip 
                  label={`${calculateSummaryData(invoices).collectedCount} invoices`}
                  size="small"
                  sx={{ 
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main
                  }}
                />
              </Stack>
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold', mb: 3 }}>
                {formatAmount(calculateSummaryData(invoices).collected)}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                  Collection Breakdown
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ 
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: 'rgba(255,255,255,0.5)'
                  }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">Email Delivery</Typography>
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        {formatAmount(invoices.filter(inv => inv.status === 'collected' && inv.deliveryMethod === 'email')
                          .reduce((sum, inv) => sum + convertAmount(inv.amount), 0))}
                      </Typography>
                    </Stack>
                  </Box>
                  
                  <Box sx={{ 
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: 'rgba(255,255,255,0.5)'
                  }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">Etimad System</Typography>
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        {formatAmount(calculateSummaryData(invoices).vendorPaid)}
                      </Typography>
                    </Stack>
                  </Box>
                  
                  <Box sx={{ 
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: 'rgba(255,255,255,0.5)'
                  }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">Custom Delivery</Typography>
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        {formatAmount(calculateSummaryData(invoices).clientCollected)}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Grid>

          {/* Client Invoices Card */}
          <Grid item xs={12} md={3}>
            <Box sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }
            }}>
              <Stack spacing={3}>
                <Stack spacing={0.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" color="info.main" fontWeight="medium">
                      Client Invoices
                    </Typography>
                    <Tooltip title="Invoices sent to clients - shows collected and pending amounts" arrow>
                      <IconButton size="small">
                        <InfoIcon fontSize="small" color="info" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Sent to clients
                  </Typography>
                </Stack>
                
                <Box>
                  <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formatAmount(invoices.filter(inv => inv.invoiceType === 'client').reduce((sum, inv) => sum + convertAmount(inv.amount), 0))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total value • {invoices.filter(inv => inv.invoiceType === 'client').length} invoices
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <Box sx={{ 
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.success.main, 0.1)
                  }}>
                    <Typography variant="body2" color="success.main" fontWeight="medium" sx={{ mb: 0.5 }}>
                      {formatAmount(invoices.filter(inv => inv.invoiceType === 'client' && inv.status === 'collected')
                          .reduce((sum, inv) => sum + convertAmount(inv.amount), 0))} collected
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {invoices.filter(inv => inv.invoiceType === 'client' && inv.status === 'collected').length} invoices collected
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.warning.main, 0.1)
                  }}>
                    <Typography variant="body2" color="warning.main" fontWeight="medium" sx={{ mb: 0.5 }}>
                      {formatAmount(invoices.filter(inv => inv.invoiceType === 'client' && inv.status === 'sent')
                          .reduce((sum, inv) => sum + convertAmount(inv.amount), 0))} pending
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {invoices.filter(inv => inv.invoiceType === 'client' && inv.status === 'sent').length} invoices awaiting collection
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Grid>

          {/* Vendor Invoices Card */}
          <Grid item xs={12} md={3}>
            <Box sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: alpha(theme.palette.secondary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }
            }}>
              <Stack spacing={3}>
                <Stack spacing={0.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" color="secondary.main" fontWeight="medium">
                      Vendor Invoices
                    </Typography>
                    <Tooltip title="Invoices received from vendors - shows paid and pending amounts" arrow>
                      <IconButton size="small">
                        <InfoIcon fontSize="small" color="secondary" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Received from vendors
                  </Typography>
                </Stack>
                
                <Box>
                  <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formatAmount(invoices.filter(inv => inv.invoiceType === 'vendor').reduce((sum, inv) => sum + convertAmount(inv.amount), 0))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total value • {invoices.filter(inv => inv.invoiceType === 'vendor').length} invoices
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <Box sx={{ 
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.success.main, 0.1)
                  }}>
                    <Typography variant="body2" color="success.main" fontWeight="medium" sx={{ mb: 0.5 }}>
                      {formatAmount(invoices.filter(inv => inv.invoiceType === 'vendor' && inv.status === 'paid')
                          .reduce((sum, inv) => sum + convertAmount(inv.amount), 0))} paid
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {invoices.filter(inv => inv.invoiceType === 'vendor' && inv.status === 'paid').length} invoices paid
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.warning.main, 0.1)
                  }}>
                    <Typography variant="body2" color="warning.main" fontWeight="medium" sx={{ mb: 0.5 }}>
                      {formatAmount(invoices.filter(inv => inv.invoiceType === 'vendor' && inv.status === 'pending')
                          .reduce((sum, inv) => sum + convertAmount(inv.amount), 0))} pending
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {invoices.filter(inv => inv.invoiceType === 'vendor' && inv.status === 'pending').length} invoices awaiting payment
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Invoices List Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
        }}
      >
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'background.default'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
            Invoices
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog(setOpenDialog, setSelectedInvoice, setNewInvoice)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              }
            }}
          >
            Create Invoice
          </Button>
        </Box>

        <List sx={{ p: 0 }}>
          {invoices.map((invoice) => (
            <ListItem
              key={invoice.id}
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none'
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.02)
                }
              }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  width: '100%',
                  p: 3,
                  backgroundColor: 'transparent'
                }}
              >
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {invoice.invoiceNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {invoice.description}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={invoice.invoiceType}
                          size="small"
                          sx={{
                            backgroundColor: invoice.invoiceType === 'client' 
                              ? alpha(theme.palette.primary.main, 0.1)
                              : alpha(theme.palette.secondary.main, 0.1),
                            color: invoice.invoiceType === 'client'
                              ? theme.palette.primary.main
                              : theme.palette.secondary.main,
                            fontWeight: 'medium'
                          }}
                        />
                        {invoice.deliveryMethod !== 'email' && (
                          <Chip
                            label={invoice.deliveryMethod === 'custom' 
                              ? `Custom: ${invoice.customDeliveryMethod}`
                              : invoice.deliveryMethod}
                            size="small"
                            sx={{
                              backgroundColor: invoice.deliveryMethod === 'etimad'
                                ? alpha(theme.palette.info.main, 0.1)
                                : alpha(theme.palette.warning.main, 0.1),
                              color: invoice.deliveryMethod === 'etimad'
                                ? theme.palette.info.main
                                : theme.palette.warning.main,
                              fontWeight: 'medium'
                            }}
                          />
                        )}
                        {/* Only show status chip for email delivery method */}
                        {invoice.deliveryMethod === 'email' && (
                          <Chip
                            label={invoice.status}
                            size="small"
                            sx={{
                              backgroundColor: (() => {
                                switch(invoice.status) {
                                  case 'collected':
                                    return alpha(theme.palette.success.main, 0.1);
                                  case 'sent':
                                    return alpha(theme.palette.warning.main, 0.1);
                                  case 'paid':
                                    return alpha(theme.palette.info.main, 0.1);
                                  default:
                                    return alpha(theme.palette.grey[500], 0.1);
                                }
                              })(),
                              color: (() => {
                                switch(invoice.status) {
                                  case 'collected':
                                    return theme.palette.success.main;
                                  case 'sent':
                                    return theme.palette.warning.main;
                                  case 'paid':
                                    return theme.palette.info.main;
                                  default:
                                    return theme.palette.grey[500];
                                }
                              })(),
                              fontWeight: 'medium'
                            }}
                          />
                        )}
                        {/* Show progress state for custom delivery method */}
                        {invoice.deliveryMethod === 'custom' && invoice.customStage && (
                          <Chip
                            label={invoice.customStage}
                            size="small"
                            sx={{
                              backgroundColor: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.main,
                              fontWeight: 'medium'
                            }}
                          />
                        )}
                      </Stack>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Amount
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        {formatAmount(invoice.amount)}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {getStatusActionButton(invoice.status, invoice.invoiceType, invoice.deliveryMethod) && (
                        <Button
                          variant={invoice.status === 'draft' ? 'outlined' : 'contained'}
                          color="primary"
                          onClick={() => {
                            const updatedInvoice = handleStatusChange(invoice);
                            setInvoices(prevInvoices =>
                              prevInvoices.map(inv =>
                                inv.id === invoice.id ? updatedInvoice : inv
                              )
                            );
                          }}
                          size="small"
                          startIcon={invoice.status === 'draft' ? <SendIcon /> : undefined}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none'
                          }}
                        >
                          {getStatusActionButton(invoice.status, invoice.invoiceType, invoice.deliveryMethod)}
                        </Button>
                      )}
                      <IconButton
                        onClick={() => handleEditInvoice(invoice, setSelectedInvoice, setNewInvoice, setOpenDialog)}
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.2)
                          }
                        }}
                      >
                        <EditIcon fontSize="small" color="primary" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteInvoice(invoice.id, invoices, setInvoices, projectId)}
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.2)
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Stack>
                  </Grid>

                  {invoice.deliveryMethod === 'etimad' && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        mt: 2,
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Etimad Progress
                        </Typography>
                        <EtimadStepper
                          currentStage={invoice.etimadStage}
                          onStageChange={(newStage) => {
                            const updatedInvoice = handleEtimadStageChange(invoice, newStage);
                            setInvoices(prevInvoices =>
                              prevInvoices.map(inv =>
                                inv.id === invoice.id ? updatedInvoice : inv
                              )
                            );
                          }}
                          readOnly={false}
                        />
                      </Box>
                    </Grid>
                  )}
                  {invoice.deliveryMethod === 'custom' && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        mt: 2,
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Custom Progress
                        </Typography>
                        <CustomStepper
                          currentStage={invoice.customStage}
                          onStageChange={(newStage) => {
                            const updatedInvoice: Invoice = {
                              ...invoice,
                              customStage: newStage
                            };
                            setInvoices(prevInvoices =>
                              prevInvoices.map(inv =>
                                inv.id === invoice.id ? updatedInvoice : inv
                              )
                            );
                          }}
                          readOnly={false}
                        />
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={() => handleCloseDialog(setOpenDialog, setSelectedInvoice, setNewInvoice)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedInvoice ? 'Edit Invoice' : 'Create New Invoice'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Invoice Number"
                  value={newInvoice.invoiceNumber}
                  onChange={(e) => setNewInvoice(prev => ({
                    ...prev,
                    invoiceNumber: e.target.value
                  }))}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Invoice Type</InputLabel>
                  <Select
                    value={newInvoice.invoiceType}
                    onChange={(e: SelectChangeEvent<'client' | 'vendor'>) => handleInvoiceTypeChange(e, setNewInvoice)}
                    label="Invoice Type"
                  >
                    <MenuItem value="client">Client Invoice</MenuItem>
                    <MenuItem value="vendor">Vendor Invoice</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Delivery Method</InputLabel>
                  <Select
                    value={newInvoice.deliveryMethod}
                    onChange={(e: SelectChangeEvent<Invoice['deliveryMethod']>) => handleDeliveryMethodChange(e, setNewInvoice)}
                    label="Delivery Method"
                  >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="etimad">Etimad</MenuItem>
                    <MenuItem value="custom">Custom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {newInvoice.deliveryMethod === 'etimad' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Etimad Progress
                    </Typography>
                    <EtimadStepper
                      currentStage={newInvoice.etimadStage}
                      onStageChange={(newStage) => setNewInvoice(prev => ({
                        ...prev,
                        etimadStage: newStage,
                        // Update status based on Etimad stage
                        status: newStage === 'submitted' ? 'sent' : 
                               newStage === 'collected' ? 'collected' : 
                               prev.status
                      }))}
                      readOnly={false}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Etimad Notes"
                      value={newInvoice.etimadNotes || ''}
                      onChange={(e) => setNewInvoice(prev => ({
                        ...prev,
                        etimadNotes: e.target.value
                      }))}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </>
              )}
              {newInvoice.deliveryMethod === 'custom' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Custom Progress
                    </Typography>
                    <CustomStepper
                      currentStage={newInvoice.customStage}
                      onStageChange={(newStage) => setNewInvoice(prev => ({
                        ...prev,
                        customStage: newStage
                      }))}
                      readOnly={false}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Custom Delivery Method"
                      value={newInvoice.customDeliveryMethod || ''}
                      onChange={(e) => setNewInvoice(prev => ({
                        ...prev,
                        customDeliveryMethod: e.target.value
                      }))}
                      required
                      placeholder="Enter custom delivery method"
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Form Type</InputLabel>
                  <Select
                    value={newInvoice.formType}
                    onChange={(e) => setNewInvoice(prev => ({
                      ...prev,
                      formType: e.target.value as 'basic' | 'advanced',
                      items: e.target.value === 'basic' 
                        ? [{ description: '', quantity: 0, unitPrice: 0, amount: 0 }]
                        : prev.items
                    }))}
                    label="Form Type"
                  >
                    <MenuItem value="basic">Basic (Single Amount)</MenuItem>
                    <MenuItem value="advanced">Advanced (Itemized Breakdown)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {newInvoice.formType === 'basic' ? (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice(prev => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0,
                      items: [{ description: '', quantity: 1, unitPrice: parseFloat(e.target.value) || 0, amount: parseFloat(e.target.value) || 0 }]
                    }))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
              ) : (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Items
                    </Typography>
                  </Grid>
                  {newInvoice.items.map((item, index) => (
                    <Grid item xs={12} key={index} container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value, newInvoice, setNewInvoice)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          fullWidth
                          label="Quantity"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value), newInvoice, setNewInvoice)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          label="Unit Price"
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value), newInvoice, setNewInvoice)}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          fullWidth
                          label="Amount"
                          type="number"
                          value={item.amount}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <IconButton
                          onClick={() => handleRemoveItem(index, newInvoice, setNewInvoice)}
                          color="error"
                          sx={{ mt: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => handleAddItem(newInvoice, setNewInvoice)}
                      variant="outlined"
                    >
                      Add Item
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => handleCloseDialog(setOpenDialog, setSelectedInvoice, setNewInvoice)}>
            Cancel
          </Button>
          <Button onClick={() => handleSaveInvoice(newInvoice, selectedInvoice, invoices, setInvoices, projectId, setOpenDialog)} variant="contained" color="primary">
            {selectedInvoice ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoiceList;
