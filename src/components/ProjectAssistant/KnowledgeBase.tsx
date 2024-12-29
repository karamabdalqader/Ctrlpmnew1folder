import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  InputBase,
  Paper,
  Collapse,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Phase } from './types';

interface KnowledgeBaseProps {
  methodology: 'pmp' | 'prince2' | 'agile';
  phase: Phase;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ methodology, phase }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Sample knowledge base data - in a real app, this would come from a backend
  const knowledgeItems = [
    {
      id: '1',
      title: 'Project Charter Template',
      category: 'Templates',
      content: 'A project charter is a formal document that officially starts a project...',
      methodology: 'pmp',
      phase: 'initiation',
    },
    {
      id: '2',
      title: 'Risk Assessment Guide',
      category: 'Guides',
      content: 'Risk assessment is a systematic process of evaluating potential risks...',
      methodology: 'all',
      phase: 'planning',
    },
    // Add more items as needed
  ];

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethodology = item.methodology === 'all' || item.methodology === methodology;
    const matchesPhase = item.phase === phase.id;
    return matchesSearch && matchesMethodology && matchesPhase;
  });

  const handleItemClick = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Knowledge Base
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <IconButton sx={{ p: '10px' }}>
            <SearchIcon />
          </IconButton>
        </Paper>
      </Box>

      {/* Content */}
      <List sx={{ flex: 1, overflow: 'auto', px: 2 }}>
        {filteredItems.map((item) => (
          <React.Fragment key={item.id}>
            <ListItem
              button
              onClick={() => handleItemClick(item.id)}
              sx={{
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>
                <ArticleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                secondary={item.category}
              />
              {expandedItem === item.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItem>
            <Collapse in={expandedItem === item.id}>
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 1 }}>
                <Typography variant="body2">
                  {item.content}
                </Typography>
              </Box>
            </Collapse>
            <Divider sx={{ my: 1 }} />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default KnowledgeBase;
