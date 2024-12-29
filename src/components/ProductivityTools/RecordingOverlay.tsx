import React, { useEffect, useRef } from "react";
import { Card } from "@mui/material";

interface RecordingOverlayProps {
  stream: MediaStream;
  stepCount: number;
  onScreenshot: (screenshot: string) => void;
}

export function RecordingOverlay({
  stream,
  stepCount,
  onScreenshot,
}: RecordingOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }

    // Take screenshot every 5 seconds
    const interval = setInterval(() => {
      if (videoRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          const screenshot = canvas.toDataURL("image/png");
          onScreenshot(screenshot);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [stream, onScreenshot]);

  return (
    <Card sx={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 9999,
      bgcolor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      p: 2,
      borderRadius: 2,
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p style={{ fontWeight: 500 }}>Recording in progress...</p>
        <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Steps captured: {stepCount}</p>
      </div>
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        muted
        playsInline
      />
    </Card>
  );
}
