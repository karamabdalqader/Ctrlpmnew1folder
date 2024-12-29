import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  IconButton,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const StepCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  position: "relative",
}));

const StepImage = styled("img")({
  width: "100%",
  maxWidth: "800px",
  borderRadius: "8px",
  marginBottom: "16px",
});

interface Arrow {
  x: number;
  y: number;
  direction: "up" | "down" | "left" | "right";
}

interface Step {
  id: string;
  image: string;
  description: string;
  arrows: Arrow[];
}

interface GuideCreatorProps {
  screenshots: string[];
}

export function GuideCreator({ screenshots }: GuideCreatorProps) {
  const [steps, setSteps] = useState<Step[]>(() =>
    screenshots.map((screenshot, index) => ({
      id: `step-${index + 1}`,
      image: screenshot,
      description:
        index === 0
          ? "Initial state: This is how your screen looked when you started recording."
          : `Step ${index + 1}: Click to add a description for this step.`,
      arrows: [],
    }))
  );

  const [editingStepId, setEditingStepId] = useState<string | null>(null);

  const handleDescriptionChange = (stepId: string, newDescription: string) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, description: newDescription } : step
      )
    );
  };

  const handleAddArrow = (stepId: string, direction: Arrow["direction"]) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              arrows: [
                ...step.arrows,
                { x: 50, y: 50, direction },
              ],
            }
          : step
      )
    );
  };

  const handleRemoveArrow = (stepId: string, arrowIndex: number) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              arrows: step.arrows.filter((_, index) => index !== arrowIndex),
            }
          : step
      )
    );
  };

  const handleSaveGuide = () => {
    const guideData = {
      title: "Screen Recording Guide",
      createdAt: new Date().toISOString(),
      steps,
    };

    const blob = new Blob([JSON.stringify(guideData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "screen-recording-guide.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Interactive Guide Creator
      </Typography>
      <Typography color="text.secondary" paragraph>
        Edit the descriptions and add arrows to create an interactive guide from
        your recording.
      </Typography>

      {steps.map((step, index) => (
        <StepCard key={step.id}>
          <Box sx={{ position: "relative" }}>
            <StepImage src={step.image} alt={`Step ${index + 1}`} />
            {step.arrows.map((arrow, arrowIndex) => (
              <Box
                key={arrowIndex}
                sx={{
                  position: "absolute",
                  left: `${arrow.x}%`,
                  top: `${arrow.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {arrow.direction === "up" && <ArrowUpwardIcon color="primary" />}
                {arrow.direction === "down" && (
                  <ArrowDownwardIcon color="primary" />
                )}
                {arrow.direction === "left" && <ArrowBackIcon color="primary" />}
                {arrow.direction === "right" && (
                  <ArrowForwardIcon color="primary" />
                )}
                <IconButton
                  size="small"
                  onClick={() => handleRemoveArrow(step.id, arrowIndex)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>

          {editingStepId === step.id ? (
            <TextField
              fullWidth
              multiline
              value={step.description}
              onChange={(e) => handleDescriptionChange(step.id, e.target.value)}
              onBlur={() => setEditingStepId(null)}
              autoFocus
            />
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>{step.description}</Typography>
              <IconButton
                size="small"
                onClick={() => setEditingStepId(step.id)}
              >
                <EditIcon />
              </IconButton>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <IconButton onClick={() => handleAddArrow(step.id, "up")}>
              <ArrowUpwardIcon />
            </IconButton>
            <IconButton onClick={() => handleAddArrow(step.id, "down")}>
              <ArrowDownwardIcon />
            </IconButton>
            <IconButton onClick={() => handleAddArrow(step.id, "left")}>
              <ArrowBackIcon />
            </IconButton>
            <IconButton onClick={() => handleAddArrow(step.id, "right")}>
              <ArrowForwardIcon />
            </IconButton>
          </Box>
        </StepCard>
      ))}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveGuide}
        sx={{ mt: 2 }}
      >
        Save Guide
      </Button>
    </Box>
  );
}
