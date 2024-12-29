import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { Risk } from './types';

type RiskLevel = 'Low' | 'Medium' | 'High';
type RiskStatus = 'Open' | 'Mitigated' | 'Closed';

export interface RiskMatrixProps {
  risks: Risk[];
  onRiskAdd: (risk: Risk) => void;
}

type RiskColors = {
  [P in RiskLevel]: {
    [I in RiskLevel]: string;
  };
};

const riskColors: RiskColors = {
  Low: {
    Low: '#4caf50',
    Medium: '#ffeb3b',
    High: '#ff9800',
  },
  Medium: {
    Low: '#ffeb3b',
    Medium: '#ff9800',
    High: '#f44336',
  },
  High: {
    Low: '#ff9800',
    Medium: '#f44336',
    High: '#d32f2f',
  },
};

const RiskMatrix: React.FC<RiskMatrixProps> = ({ risks, onRiskAdd }) => {
  const [open, setOpen] = useState(false);
  const [newRisk, setNewRisk] = useState<Partial<Risk>>({
    probability: 'Low',
    impact: 'Low',
    status: 'Open',
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewRisk({
      probability: 'Low',
      impact: 'Low',
      status: 'Open',
    });
  };

  const handleSubmit = () => {
    if (newRisk.title && newRisk.description) {
      onRiskAdd({
        id: `risk-${Date.now()}`,
        title: newRisk.title,
        description: newRisk.description,
        probability: newRisk.probability as RiskLevel,
        impact: newRisk.impact as RiskLevel,
        status: newRisk.status as RiskStatus,
        mitigation: newRisk.mitigation,
        owner: newRisk.owner,
      });
      handleClose();
    }
  };

  const getCellColor = (probability: RiskLevel, impact: RiskLevel): string => {
    return riskColors[probability][impact];
  };

  const riskLevels: RiskLevel[] = ['High', 'Medium', 'Low'];

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Risk Matrix</Typography>
        <Button variant="contained" color="primary" onClick={handleClickOpen}>
          Add Risk
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={1}>
          {riskLevels.map((probability) => (
            <Grid item xs={12} key={probability}>
              <Grid container spacing={1}>
                {riskLevels.map((impact) => (
                  <Grid item xs={4} key={`${probability}-${impact}`}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1,
                        height: '100px',
                        bgcolor: getCellColor(probability, impact),
                        color: 'white',
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        {probability} / {impact}
                      </Typography>
                      {risks
                        .filter(
                          (risk) =>
                            risk.probability === probability && risk.impact === impact
                        )
                        .map((risk) => (
                          <Typography key={risk.id} variant="caption" display="block">
                            {risk.title}
                          </Typography>
                        ))}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Risk</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={newRisk.title || ''}
              onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={newRisk.description || ''}
              onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="Probability"
                  value={newRisk.probability}
                  onChange={(e) => 
                    setNewRisk({ ...newRisk, probability: e.target.value as RiskLevel })
                  }
                >
                  {riskLevels.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="Impact"
                  value={newRisk.impact}
                  onChange={(e) => 
                    setNewRisk({ ...newRisk, impact: e.target.value as RiskLevel })
                  }
                >
                  {riskLevels.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Add Risk
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RiskMatrix;
