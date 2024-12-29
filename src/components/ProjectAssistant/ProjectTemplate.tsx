import React from 'react';
import { Box, Paper, Typography, TextField, Button, Grid } from '@mui/material';
import { Phase, Template, TemplateSection, TemplateField } from './types';

interface ProjectTemplateProps {
  phase: Phase;
  onSubmit: (template: Template) => void;
}

const ProjectTemplate: React.FC<ProjectTemplateProps> = ({ phase, onSubmit }) => {
  const handleSubmit = (template: Template) => {
    onSubmit(template);
  };

  return (
    <Box>
      {phase.templates?.map((template: Template) => (
        <Paper
          key={template.id}
          elevation={0}
          sx={{
            p: 3,
            mb: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" gutterBottom>
            {template.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {template.description}
          </Typography>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(template);
          }}>
            {template.content.sections.map((section: TemplateSection) => (
              <Box key={section.title} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {section.title}
                </Typography>
                <Grid container spacing={2}>
                  {section.fields.map((field: TemplateField) => (
                    <Grid item xs={12} sm={6} key={field.id}>
                      <TextField
                        fullWidth
                        label={field.label}
                        multiline={field.type === 'textarea'}
                        rows={field.type === 'textarea' ? 4 : 1}
                        type={field.type === 'date' ? 'date' : 'text'}
                        select={field.type === 'select'}
                        required={field.required}
                        SelectProps={{
                          native: true,
                        }}
                      >
                        {field.type === 'select' && field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </TextField>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Save Template
            </Button>
          </form>
        </Paper>
      ))}
    </Box>
  );
};

export default ProjectTemplate;
