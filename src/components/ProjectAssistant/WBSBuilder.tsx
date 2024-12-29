import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  TreeView as MuiTreeView,
  TreeItem as MuiTreeItem,
  TreeItemProps,
  treeItemClasses,
} from '@mui/x-tree-view';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface WBSNode {
  id: string;
  name: string;
  description: string;
  owner: string;
  children: WBSNode[];
}

interface WBSBuilderProps {
  data: WBSNode;
  onChange: (data: WBSNode) => void;
  maxLevels?: number;
}

const WBSBuilder: React.FC<WBSBuilderProps> = ({ data, onChange, maxLevels = 5 }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [nodeData, setNodeData] = useState({
    name: '',
    description: '',
    owner: '',
  });

  const handleNodeSelect = (event: React.SyntheticEvent, nodeId: string) => {
    setSelectedNode(nodeId);
  };

  const findNode = (
    searchId: string,
    node: WBSNode
  ): { node: WBSNode; parent: WBSNode | null } | null => {
    if (node.id === searchId) {
      return { node, parent: null };
    }

    for (const child of node.children) {
      const result = findNode(searchId, child);
      if (result) {
        if (result.parent === null) {
          return { node: result.node, parent: node };
        }
        return result;
      }
    }

    return null;
  };

  const handleAddNode = () => {
    if (!selectedNode) return;

    const found = findNode(selectedNode, data);
    if (!found) return;

    const { node } = found;
    const level = getNodeLevel(selectedNode, data);

    if (level >= maxLevels) {
      // Show error or notification that max level is reached
      return;
    }

    setDialogMode('add');
    setNodeData({
      name: '',
      description: '',
      owner: '',
    });
    setOpenDialog(true);
  };

  const handleEditNode = () => {
    if (!selectedNode) return;

    const found = findNode(selectedNode, data);
    if (!found) return;

    const { node } = found;
    setDialogMode('edit');
    setNodeData({
      name: node.name,
      description: node.description,
      owner: node.owner,
    });
    setOpenDialog(true);
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;

    const found = findNode(selectedNode, data);
    if (!found || !found.parent) return;

    const newData = { ...data };
    const parent = findNode(found.parent.id, newData)?.node;
    if (!parent) return;

    parent.children = parent.children.filter((child) => child.id !== selectedNode);
    onChange(newData);
    setSelectedNode(null);
  };

  const handleDialogSave = () => {
    if (!selectedNode) return;

    const newData = { ...data };
    const found = findNode(selectedNode, newData);
    if (!found) return;

    if (dialogMode === 'add') {
      const newNode: WBSNode = {
        id: `${selectedNode}-${found.node.children.length + 1}`,
        ...nodeData,
        children: [],
      };
      found.node.children.push(newNode);
    } else {
      found.node.name = nodeData.name;
      found.node.description = nodeData.description;
      found.node.owner = nodeData.owner;
    }

    onChange(newData);
    setOpenDialog(false);
  };

  const getNodeLevel = (nodeId: string, root: WBSNode, level = 1): number => {
    if (root.id === nodeId) return level;

    for (const child of root.children) {
      const childLevel = getNodeLevel(nodeId, child, level + 1);
      if (childLevel > 0) return childLevel;
    }

    return 0;
  };

  const renderTree = (node: WBSNode) => (
    <MuiTreeItem
      key={node.id}
      nodeId={node.id}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5 }}>
          <Typography variant="body2">{node.name}</Typography>
          {selectedNode === node.id && (
            <Box sx={{ ml: 1 }}>
              <IconButton size="small" onClick={handleAddNode}>
                <AddIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleEditNode}>
                <EditIcon fontSize="small" />
              </IconButton>
              {node.id !== '1' && (
                <IconButton size="small" onClick={handleDeleteNode}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          )}
        </Box>
      }
    >
      {Array.isArray(node.children)
        ? node.children.map((child) => renderTree(child))
        : null}
    </MuiTreeItem>
  );

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Work Breakdown Structure
      </Typography>
      <MuiTreeView
        aria-label="work breakdown structure"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        selected={selectedNode || ''}
        onNodeSelect={handleNodeSelect}
        sx={{
          flexGrow: 1,
          [`& .${treeItemClasses.group}`]: {
            marginLeft: 2,
            paddingLeft: 1,
            borderLeft: `1px dashed grey`,
          },
        }}
      >
        {renderTree(data)}
      </MuiTreeView>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Work Package' : 'Edit Work Package'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={nodeData.name}
              onChange={(e) => setNodeData({ ...nodeData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={nodeData.description}
              onChange={(e) => setNodeData({ ...nodeData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Owner"
              value={nodeData.owner}
              onChange={(e) => setNodeData({ ...nodeData, owner: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDialogSave}
            variant="contained"
            disabled={!nodeData.name || !nodeData.description}
          >
            {dialogMode === 'add' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default WBSBuilder;
