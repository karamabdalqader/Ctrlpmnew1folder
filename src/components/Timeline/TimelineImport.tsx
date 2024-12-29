import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { read, utils } from 'xlsx';
import Papa from 'papaparse';
import { TimelineEvent } from './ProjectTimeline';

interface TimelineImportProps {
  open: boolean;
  onClose: () => void;
  onImport: (events: TimelineEvent[]) => void;
}

// Common column patterns for automatic detection with more variations
const COLUMN_PATTERNS = {
  title: [
    /^title$/i,
    /^name$/i,
    /^task$/i,
    /^activity$/i,
    /^summary$/i,
    /^work item$/i,
    /^workitem$/i,
    /^subject$/i,
    /task.*name/i,
    /task.*title/i,
    /activity.*name/i,
    /item.*name/i,
    /project.*task/i,
    /task.*description/i,
  ],
  description: [
    /^description$/i,
    /^desc$/i,
    /^notes$/i,
    /^details$/i,
    /^comment$/i,
    /^remarks$/i,
    /additional.*info/i,
    /task.*details/i,
    /task.*notes/i,
    /work.*description/i,
    /item.*description/i,
  ],
  date: [
    /^date$/i,
    /^start.*date$/i,
    /^date.*start$/i,
    /^begin.*date$/i,
    /^date.*begin$/i,
    /^due.*date$/i,
    /^date.*due$/i,
    /^deadline$/i,
    /^target.*date$/i,
    /^end.*date$/i,
    /^date.*end$/i,
    /^finish.*date$/i,
    /^date.*finish$/i,
    /^planned.*start$/i,
    /^actual.*start$/i,
    /^baseline.*start$/i,
    /^planned.*finish$/i,
    /^actual.*finish$/i,
    /^baseline.*finish$/i,
    /^start$/i,
    /^finish$/i,
    /^due$/i,
  ],
  type: [
    /^type$/i,
    /^category$/i,
    /^kind$/i,
    /^class$/i,
    /^classification$/i,
    /^milestone$/i,
    /task.*type$/i,
    /activity.*type$/i,
    /item.*type$/i,
    /work.*type$/i,
    /event.*type$/i,
  ],
  status: [
    /^status$/i,
    /^state$/i,
    /^progress$/i,
    /^completion$/i,
    /^complete$/i,
    /^condition$/i,
    /^stage$/i,
    /^phase$/i,
    /task.*status$/i,
    /completion.*status$/i,
    /progress.*status$/i,
    /work.*status$/i,
    /item.*status$/i,
    /%.*complete/i,
    /percent.*complete/i,
  ]
};

const TimelineImport: React.FC<TimelineImportProps> = ({ open, onClose, onImport }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [mappingPreview, setMappingPreview] = useState<{ [key: string]: string | null }>({});

  const findBestColumnMatch = (headers: string[], patterns: RegExp[]): string | null => {
    // First try exact matches
    for (const pattern of patterns) {
      const exactMatch = headers.find(header => 
        header.toLowerCase() === pattern.source.replace(/[\^\$]/g, '').toLowerCase()
      );
      if (exactMatch) return exactMatch;
    }
    
    // Then try pattern matches
    for (const pattern of patterns) {
      const match = headers.find(header => pattern.test(header));
      if (match) return match;
    }

    // Finally try partial word matches
    for (const pattern of patterns) {
      const partialMatch = headers.find(header => {
        const headerWords = header.toLowerCase().split(/[^a-z0-9]+/);
        const patternWords = pattern.source.toLowerCase().replace(/[\^\$\\]/g, '').split(/[^a-z0-9]+/);
        return patternWords.some(word => headerWords.includes(word));
      });
      if (partialMatch) return partialMatch;
    }
    
    return null;
  };

  const guessColumnMapping = (headers: string[]) => {
    const mapping: { [key: string]: string | null } = {};
    
    for (const [field, patterns] of Object.entries(COLUMN_PATTERNS)) {
      mapping[field] = findBestColumnMatch(headers, patterns);
    }

    // If no title column found, try to use the first text column
    if (!mapping.title) {
      const firstTextColumn = headers.find(header => 
        previewData.some(row => typeof row[header] === 'string' && row[header].trim().length > 0)
      );
      if (firstTextColumn) {
        mapping.title = firstTextColumn;
      }
    }
    
    return mapping;
  };

  const normalizeDate = (value: any): string => {
    if (!value) return new Date().toISOString().split('T')[0];

    // Handle Excel date numbers
    if (typeof value === 'number') {
      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      return date.toISOString().split('T')[0];
    }

    // Try parsing various date formats
    const dateStr = String(value).trim();
    
    // Try direct Date parsing
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }

    // Try DD/MM/YYYY or MM/DD/YYYY
    const parts = dateStr.split(/[/\\-]/);
    if (parts.length === 3) {
      // Try both DD/MM/YYYY and MM/DD/YYYY
      const formats = [
        new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])),
        new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]))
      ];
      
      for (const format of formats) {
        if (!isNaN(format.getTime())) {
          return format.toISOString().split('T')[0];
        }
      }
    }

    return new Date().toISOString().split('T')[0];
  };

  const normalizeType = (value: any): 'milestone' | 'task' | 'event' => {
    const str = String(value).toLowerCase();
    if (str.includes('milestone') || str.includes('major') || str.includes('key')) return 'milestone';
    if (str.includes('event') || str.includes('meeting') || str.includes('review')) return 'event';
    return 'task';
  };

  const normalizeStatus = (value: any): 'completed' | 'in-progress' | 'planned' => {
    const str = String(value).toLowerCase();
    
    // Check for completion percentage
    const percentMatch = str.match(/(\d+)%/);
    if (percentMatch) {
      const percent = Number(percentMatch[1]);
      if (percent >= 100) return 'completed';
      if (percent > 0) return 'in-progress';
      return 'planned';
    }

    // Check for status keywords
    if (/^(100|done|complete|finished|closed|resolved)$/i.test(str)) return 'completed';
    if (/^(0|planned|new|open|pending|not started)$/i.test(str)) return 'planned';
    if (str.includes('complete') || str.includes('done') || str.includes('finish')) return 'completed';
    if (str.includes('progress') || str.includes('start') || str.includes('ongoing')) return 'in-progress';
    
    return 'planned';
  };

  const processData = (data: any[]): TimelineEvent[] => {
    if (data.length === 0) {
      throw new Error('No data found in the file');
    }

    const headers = Object.keys(data[0]);
    const mapping = guessColumnMapping(headers);
    setMappingPreview(mapping); // Store mapping for preview

    if (!mapping.title) {
      throw new Error('Could not find a suitable title column');
    }

    return data.map((row, index) => {
      // Get title (required)
      const title = row[mapping.title!]?.toString().trim();
      if (!title) {
        console.warn(`Row ${index + 1} skipped: No title found`);
        return null;
      }

      // Get description
      let description = '';
      if (mapping.description) {
        description = row[mapping.description]?.toString().trim() || '';
      }

      // Get date
      let date = new Date().toISOString().split('T')[0];
      if (mapping.date) {
        date = normalizeDate(row[mapping.date]);
      }

      // Get type
      let type: 'milestone' | 'task' | 'event' = 'task';
      if (mapping.type) {
        type = normalizeType(row[mapping.type]);
      } else {
        // Try to infer type from other columns
        const allValues = Object.values(row).join(' ').toLowerCase();
        if (allValues.includes('milestone') || allValues.includes('major') || allValues.includes('key')) {
          type = 'milestone';
        } else if (allValues.includes('event') || allValues.includes('meeting') || allValues.includes('review')) {
          type = 'event';
        }
      }

      // Get status
      let status: 'completed' | 'in-progress' | 'planned' = 'planned';
      if (mapping.status) {
        status = normalizeStatus(row[mapping.status]);
      } else {
        // Try to infer status from other columns
        const allValues = Object.values(row).join(' ').toLowerCase();
        if (allValues.includes('100%') || allValues.includes('complete') || allValues.includes('done')) {
          status = 'completed';
        } else if (allValues.includes('progress') || allValues.includes('started')) {
          status = 'in-progress';
        }
      }

      return {
        id: String(Date.now() + index),
        title,
        description,
        date,
        type,
        status,
      };
    }).filter((event): event is TimelineEvent => event !== null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    try {
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          complete: (results) => {
            try {
              setPreviewData(results.data);
              const events = processData(results.data);
              onImport(events);
              onClose();
            } catch (error: any) {
              setError(error.message || 'Failed to process CSV file');
            } finally {
              setLoading(false);
            }
          },
          header: true,
          error: (error) => {
            setError(`Failed to parse CSV: ${error.message}`);
            setLoading(false);
          },
        });
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = utils.sheet_to_json(firstSheet);
            setPreviewData(jsonData);
            const events = processData(jsonData);
            onImport(events);
            onClose();
          } catch (error: any) {
            setError(error.message || 'Failed to process Excel file');
          } finally {
            setLoading(false);
          }
        };
        reader.onerror = () => {
          setError('Failed to read Excel file');
          setLoading(false);
        };
        reader.readAsArrayBuffer(file);
      } else {
        setError('Please use a CSV or Excel file (.xlsx, .xls)');
        setLoading(false);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to process file');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import Timeline Data</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <Typography variant="body1" gutterBottom>
            Import timeline data from:
          </Typography>
          <ul>
            <li>Excel files (.xlsx, .xls)</li>
            <li>CSV files (.csv)</li>
          </ul>
          {Object.keys(mappingPreview).length > 0 && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Column Mapping Preview:
              </Typography>
              <List>
                {Object.entries(mappingPreview).map(([field, column]) => (
                  <ListItem key={field}>
                    <ListItemText primary={field} secondary={column || 'Not found'} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
        <Button variant="contained" component="label" disabled={loading}>
          Choose File
          <input type="file" hidden accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimelineImport;
