import React, { useState } from 'react';
import {
  Box,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Paper,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Alert,
  alpha,
  useTheme,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  ContentCopy as ContentCopyIcon,
  NoteAdd as NoteAddIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';

interface ProjectChecklistProps {
  checklist: {
    title: string;
    description: string;
    items: Array<{
      id: string;
      text: string;
      description: string;
      completed: boolean;
      resources?: string[];
      note?: string;
    }>;
  };
  onChecklistUpdate: (updatedChecklist: any) => void;
}

interface ResourceDialogState {
  open: boolean;
  resource: TemplateKey | null;
  content?: string;
}

interface NoteDialogState {
  open: boolean;
  itemId: string;
  note: string;
}

type TemplateKey = 
  | 'Project Charter Template'
  | 'Business Case Guidelines'
  | 'Requirements Template'
  | 'Stakeholder Analysis Matrix';

const TEMPLATES: Record<TemplateKey, string> = {
  'Project Charter Template': `PROJECT CHARTER

Project Information
------------------
Project Name: [Enter a clear, memorable name for your project]
Example: "Customer Portal Modernization Project"

Project Sponsor: [Name and title of the project sponsor]
Example: "Jane Smith, VP of Customer Experience"

Project Manager: [Name and title of the project manager]
Example: "John Doe, Senior Project Manager"

Date: [Current date]
Example: "January 15, 2024"

Project Purpose
--------------
[Explain why this project exists in 2-3 sentences]
Example: "This project will modernize our customer portal to improve user experience and reduce customer support calls. The new portal will provide self-service capabilities and real-time information access."

Project Justification
-------------------
Business Benefits:
1. [List key benefit]
Example: "Reduce customer support calls by 40%"
2. [List key benefit]
Example: "Increase customer satisfaction scores by 25%"
3. [List key benefit]
Example: "Reduce operational costs by $500K annually"

Project Objectives
----------------
1. [Specific objective with measurable outcome]
Example: "Launch new self-service portal by Q3 2024"
2. [Specific objective with measurable outcome]
Example: "Migrate 100% of existing customers to new portal within 6 months"
3. [Specific objective with measurable outcome]
Example: "Achieve 95% positive user feedback in first 3 months"

Success Criteria
--------------
1. [Measurable criterion]
Example: "Portal uptime of 99.9% or higher"
2. [Measurable criterion]
Example: "Customer support call reduction of 40% or more"
3. [Measurable criterion]
Example: "User satisfaction rating of 4.5/5 or higher"

High-Level Requirements
--------------------
1. [Key requirement]
Example: "Single sign-on integration with existing systems"
2. [Key requirement]
Example: "Mobile-responsive design for all features"
3. [Key requirement]
Example: "Real-time data synchronization"

High-Level Risks
--------------
1. [Major risk and mitigation strategy]
Example: "Data migration delays - Mitigation: Detailed migration plan and dry runs"
2. [Major risk and mitigation strategy]
Example: "User adoption resistance - Mitigation: Early stakeholder engagement and training"
3. [Major risk and mitigation strategy]
Example: "Integration issues - Mitigation: Early technical proof of concept"

Budget Summary
------------
Total Approved Budget: [Total amount]
Example: "$750,000"

Key Cost Components:
- Development: [Amount]
Example: "$400,000"
- Infrastructure: [Amount]
Example: "$150,000"
- Training & Change Management: [Amount]
Example: "$200,000"

Project Timeline
--------------
Start Date: [Project start date]
Example: "February 1, 2024"

End Date: [Project end date]
Example: "December 31, 2024"

Key Milestones:
1. [Milestone and date]
Example: "Requirements Finalization - March 15, 2024"
2. [Milestone and date]
Example: "Beta Launch - September 1, 2024"
3. [Milestone and date]
Example: "Full Deployment - December 1, 2024"

Key Stakeholders
--------------
1. [Name - Role - Key Interest]
Example: "Sarah Johnson - Head of Customer Support - Reduce support workload"
2. [Name - Role - Key Interest]
Example: "Mike Chen - IT Director - System integration and security"
3. [Name - Role - Key Interest]
Example: "Lisa Park - Customer Experience Lead - User satisfaction"

Approval
-------
Project Sponsor: _________________ Date: _______
Project Manager: _________________ Date: _______`,

  'Business Case Guidelines': `BUSINESS CASE GUIDE

1. Executive Summary
------------------
Write a brief overview that captures:
- What the project will achieve
- Key benefits
- Required investment
- Expected returns

Example:
"The Customer Portal Modernization Project will transform our customer service capabilities through a $750K investment, delivering $2M in annual savings through reduced support costs and improved customer retention."

2. Strategic Context
------------------
Business Strategy Alignment:
- How does this project support company goals?
Example: "Aligns with our digital transformation strategy and customer-first approach"

Market Analysis:
- What market trends support this project?
Example: "85% of customers prefer self-service options according to recent surveys"

Problem/Opportunity:
- What specific issue are we solving?
Example: "Current portal generates 1000+ support tickets monthly due to poor user experience"

3. Economic Analysis
------------------
Costs:
- Initial Investment
Example: "Development costs: $400K"
- Operational Costs
Example: "Annual maintenance: $50K"
- Resource Costs
Example: "Training and support: $100K"

Benefits:
- Tangible Benefits
Example: "Reduce support costs by $500K annually"
- Intangible Benefits
Example: "Improved customer satisfaction and brand reputation"
- ROI Calculation
Example: "Expected ROI of 150% over 3 years"

4. Options Analysis
-----------------
Option 1: Do Nothing
- Current state implications
Example: "Continuing with current portal will result in increasing support costs"

Option 2: Proposed Solution
- Full implementation benefits
Example: "New portal reduces support costs by 40% and improves satisfaction"

Option 3: Alternative Approach
- Partial implementation or different solution
Example: "Upgrade existing portal with limited features"

5. Risk Assessment
----------------
Key Risks:
1. [Risk and mitigation]
Example: "Technical integration risks - Mitigate with POC phase"
2. [Risk and mitigation]
Example: "User adoption - Mitigate with training program"

6. Recommendation
---------------
Preferred Option:
[Clear statement of recommended approach]
Example: "Implement full portal modernization solution"

Rationale:
[Key reasons for recommendation]
Example: "Provides best ROI and aligns with strategic goals"

Implementation Approach:
[High-level implementation plan]
Example: "Phased approach over 12 months"`,

  'Requirements Template': `REQUIREMENTS DOCUMENT

1. Introduction
-------------
Purpose:
[Why this document exists]
Example: "Define requirements for the new customer portal"

Scope:
[What's included and excluded]
Example: "Includes all customer-facing features and admin backend"

Key Terms:
[Important definitions]
Example: "Portal: The customer-facing web application"

2. Functional Requirements
------------------------
User Management:
1. [Requirement]
Example: "Users must be able to reset passwords without contacting support"
2. [Requirement]
Example: "System must support multiple user roles (admin, user, viewer)"

Data Management:
1. [Requirement]
Example: "All data must be encrypted at rest and in transit"
2. [Requirement]
Example: "System must maintain audit logs of all user actions"

3. Non-Functional Requirements
---------------------------
Performance:
1. [Requirement]
Example: "Page load time must be under 2 seconds"
2. [Requirement]
Example: "System must support 10,000 concurrent users"

Security:
1. [Requirement]
Example: "Must comply with GDPR requirements"
2. [Requirement]
Example: "Must use MFA for admin access"

4. Constraints
------------
1. [Technical constraint]
Example: "Must integrate with existing SSO system"
2. [Business constraint]
Example: "Must be deployed within 6 months"

5. Assumptions
------------
1. [Assumption]
Example: "Existing database structure will not change"
2. [Assumption]
Example: "Users have modern web browsers"

6. Dependencies
-------------
1. [Dependency]
Example: "Requires updated API gateway"
2. [Dependency]
Example: "Depends on SSO system upgrade"

Sign-off
-------
Prepared By: _________________ Date: _______
Approved By: _________________ Date: _______`,

  'Stakeholder Analysis Matrix': `STAKEHOLDER ANALYSIS MATRIX

Stakeholder Register
------------------
Format: Name | Role | Interest Level | Influence Level | Impact | Strategy

Example Entries:
1. Sarah Johnson | Customer Support Lead | High | Medium | Direct user of system | Regular updates
2. Mike Chen | IT Director | High | High | Technical decision maker | Include in all technical decisions
3. Lisa Park | End User Representative | Medium | Low | System user | Monthly feedback sessions

Power/Interest Groups
-------------------
High Power, High Interest (Manage Closely):
- Who to include
Example: "IT Director - Include in all major decisions"
- How to manage
Example: "Weekly one-on-one meetings"

High Power, Low Interest (Keep Satisfied):
- Who to include
Example: "CFO - Monthly budget updates"
- How to manage
Example: "Regular email updates"

Low Power, High Interest (Keep Informed):
- Who to include
Example: "Support Team - Daily users"
- How to manage
Example: "Regular training sessions"

Low Power, Low Interest (Monitor):
- Who to include
Example: "External Vendors"
- How to manage
Example: "Quarterly reviews"

Communication Strategy
--------------------
Key Messages:
1. [Message]
Example: "Project will reduce workload"
2. [Message]
Example: "New features will improve efficiency"

Communication Channels:
1. [Channel - Audience]
Example: "Email Updates - All stakeholders"
2. [Channel - Audience]
Example: "Weekly Meetings - Core team"

Engagement Plan
-------------
Initial Phase:
- [Activity]
Example: "Stakeholder interviews"
- [Activity]
Example: "Requirements workshops"

Regular Updates:
- [Activity]
Example: "Monthly progress reports"
- [Activity]
Example: "Feedback sessions"

Success Tracking:
- [Metric]
Example: "Stakeholder satisfaction scores"
- [Metric]
Example: "Engagement levels in meetings"`
};

const ProjectChecklist: React.FC<ProjectChecklistProps> = ({
  checklist,
  onChecklistUpdate,
}) => {
  const theme = useTheme();
  const [resourceDialog, setResourceDialog] = useState<ResourceDialogState>({
    open: false,
    resource: null,
  });
  const [noteDialog, setNoteDialog] = useState<NoteDialogState>({
    open: false,
    itemId: '',
    note: '',
  });

  const handleToggle = (itemId: string) => {
    const updatedItems = checklist.items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onChecklistUpdate({ ...checklist, items: updatedItems });
  };

  const handleViewResource = (resource: TemplateKey) => {
    setResourceDialog({
      open: true,
      resource,
      content: TEMPLATES[resource],
    });
  };

  const handleNoteClick = (itemId: string, note: string = '') => {
    setNoteDialog({ open: true, itemId, note });
  };

  const handleNoteSave = () => {
    const updatedItems = checklist.items.map((item) =>
      item.id === noteDialog.itemId ? { ...item, note: noteDialog.note } : item
    );
    onChecklistUpdate({ ...checklist, items: updatedItems });
    setNoteDialog({ open: false, itemId: '', note: '' });
  };

  const progress = Math.round(
    (checklist.items.filter((item) => item.completed).length / checklist.items.length) * 100
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {checklist.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {checklist.description}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            mb: 2,
            height: 8,
            borderRadius: 4,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
            }
          }} 
        />
        <Typography variant="body2" color="text.secondary" align="right">
          {`${progress}% Complete`}
        </Typography>
      </Paper>

      <List>
        {checklist.items.map((item) => (
          <Card 
            key={item.id} 
            sx={{ 
              mb: 1,
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateX(4px)',
                boxShadow: theme.shadows[4],
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={item.completed}
                    onChange={() => handleToggle(item.id)}
                    icon={<RadioButtonUncheckedIcon />}
                    checkedIcon={<CheckCircleIcon color="success" />}
                  />
                </ListItemIcon>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        textDecoration: item.completed ? 'line-through' : 'none',
                        color: item.completed ? 'text.secondary' : 'text.primary',
                      }}
                    >
                      {item.text}
                    </Typography>
                    <Tooltip title={item.note ? "Edit note" : "Add note"}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleNoteClick(item.id, item.note)}
                        color={item.note ? "primary" : "default"}
                      >
                        {item.note ? <NotesIcon /> : <NoteAddIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  {item.note && (
                    <Alert
                      severity="info"
                      sx={{ 
                        mt: 1, 
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        '& .MuiAlert-message': {
                          width: '100%'
                        }
                      }}
                      action={
                        <IconButton
                          size="small"
                          onClick={() => handleNoteClick(item.id, item.note)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      {item.note}
                    </Alert>
                  )}
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {item.resources?.map((resource) => (
                      <Chip
                        key={resource}
                        label={resource}
                        size="small"
                        icon={<DescriptionIcon />}
                        onClick={() => handleViewResource(resource as TemplateKey)}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          }
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </List>

      <Dialog open={resourceDialog.open} onClose={() => setResourceDialog({ open: false, resource: null })}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {resourceDialog.resource}
            <IconButton
              onClick={() => {
                if (resourceDialog.content) {
                  navigator.clipboard.writeText(resourceDialog.content);
                }
              }}
              size="small"
            >
              <ContentCopyIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            component="pre"
            sx={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            }}
          >
            {resourceDialog.content}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResourceDialog({ open: false, resource: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={noteDialog.open} onClose={() => setNoteDialog({ open: false, itemId: '', note: '' })}>
        <DialogTitle>
          {noteDialog.note ? 'Edit Note' : 'Add Note'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            fullWidth
            multiline
            rows={4}
            value={noteDialog.note}
            onChange={(e) => setNoteDialog({ ...noteDialog, note: e.target.value })}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialog({ open: false, itemId: '', note: '' })}>Cancel</Button>
          <Button onClick={handleNoteSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectChecklist;
