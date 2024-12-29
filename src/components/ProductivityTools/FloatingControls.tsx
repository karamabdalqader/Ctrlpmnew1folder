import React from "react";
import { Box, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import StopIcon from "@mui/icons-material/Stop";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";

const ControlsContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: "20px",
  right: "20px",
  zIndex: 9999,
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  borderRadius: "8px",
  padding: "12px",
  display: "flex",
  gap: "8px",
  alignItems: "center",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  "& .MuiIconButton-root": {
    color: "white",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },
}));

interface FloatingControlsProps {
  onStopRecording: () => void;
  recordMicrophone: boolean;
  onToggleMicrophone: () => void;
}

export function FloatingControls({
  onStopRecording,
  recordMicrophone,
  onToggleMicrophone,
}: FloatingControlsProps) {
  return (
    <ControlsContainer>
      <IconButton onClick={onStopRecording} size="small" sx={{ color: "error.main" }}>
        <StopIcon />
      </IconButton>
      <IconButton onClick={onToggleMicrophone} size="small">
        {recordMicrophone ? <MicIcon /> : <MicOffIcon />}
      </IconButton>
    </ControlsContainer>
  );
}
