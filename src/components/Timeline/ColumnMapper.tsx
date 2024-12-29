import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  SelectChangeEvent,
} from '@mui/material';

interface ColumnMapperProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (mapping: ColumnMapping) => void;
  availableColumns: string[];
  sampleData: Record<string, any>;
}

export interface ColumnMapping {
  title: string;
  description: string;
  date: string;
  type: string;
  status: string;
}

const requiredFields = ['title'];

const ColumnMapper: React.FC<ColumnMapperProps> = ({
  open,
  onClose,
  onConfirm,
  availableColumns,
  sampleData,
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>({
    title: '',
    description: '',
    date: '',
    type: '',
    status: '',
  });

  // Try to automatically map columns on initial load
  useEffect(() => {
    const autoMapping: ColumnMapping = {
      title: '',
      description: '',
      date: '',
      type: '',
      status: '',
    };

    const findColumn = (keywords: string[]): string => {
      return availableColumns.find(col => 
        keywords.some(keyword => 
          col.toLowerCase().includes(keyword.toLowerCase())
        )
      ) || '';
    };

    // Auto-map based on common column names
    autoMapping.title = findColumn(['title', 'name', 'task', 'subject']);
    autoMapping.description = findColumn(['description', 'notes', 'details', 'comment']);
    autoMapping.date = findColumn(['date', 'start', 'deadline', 'due']);
    autoMapping.type = findColumn(['type', 'category', 'kind']);
    autoMapping.status = findColumn(['status', 'state', 'progress']);

    setMapping(autoMapping);
  }, [availableColumns]);

  const handleChange = (field: keyof ColumnMapping) => (
    event: SelectChangeEvent<string>
  ) => {
    setMapping(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const isValid = () => {
    return requiredFields.every(field => mapping[field as keyof ColumnMapping]);
  };

  const handleConfirm = () => {
    if (isValid()) {
      onConfirm(mapping);
    }
  };

  const renderSampleValue = (column: string) => {
    if (!column) return '-';
    const value = sampleData[column];
    return value !== undefined && value !== null ? String(value) : '-';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Map Columns</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Please map your file columns to the corresponding timeline fields. 
          Fields marked with * are required.
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Preview of First Row:
              </Typography>
              <Grid container spacing={1}>
                {availableColumns.map((col) => (
                  <Grid item xs={6} key={col}>
                    <Typography variant="caption" color="textSecondary">
                      {col}:
                    </Typography>
                    <Typography variant="body2">
                      {renderSampleValue(col)}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
          
          {/* Title Field */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Title Field *</InputLabel>
              <Select
                value={mapping.title}
                label="Title Field *"
                onChange={handleChange('title')}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {availableColumns.map((col) => (
                  <MenuItem key={col} value={col}>
                    {col} ({renderSampleValue(col)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Description Field */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Description Field</InputLabel>
              <Select
                value={mapping.description}
                label="Description Field"
                onChange={handleChange('description')}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {availableColumns.map((col) => (
                  <MenuItem key={col} value={col}>
                    {col} ({renderSampleValue(col)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Date Field */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Date Field</InputLabel>
              <Select
                value={mapping.date}
                label="Date Field"
                onChange={handleChange('date')}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {availableColumns.map((col) => (
                  <MenuItem key={col} value={col}>
                    {col} ({renderSampleValue(col)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Type Field */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Type Field</InputLabel>
              <Select
                value={mapping.type}
                label="Type Field"
                onChange={handleChange('type')}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {availableColumns.map((col) => (
                  <MenuItem key={col} value={col}>
                    {col} ({renderSampleValue(col)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status Field */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status Field</InputLabel>
              <Select
                value={mapping.status}
                label="Status Field"
                onChange={handleChange('status')}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {availableColumns.map((col) => (
                  <MenuItem key={col} value={col}>
                    {col} ({renderSampleValue(col)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!isValid()}
        >
          Import Data
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnMapper;
